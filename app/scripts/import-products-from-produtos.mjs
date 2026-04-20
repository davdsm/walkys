/**
 * Wipe the `products` collection locally and re-import every product folder
 * from `<repo>/produtos/<CATEGORY>/<product>/DSC*.jpg`.
 *
 * For each product folder:
 *   - The alphabetically-first JPG is uploaded as `media` (main image).
 *   - The alphabetically-second JPG is uploaded as `media_hover` (when present).
 *   - All JPGs are uploaded as `media_360` (the 360° sequence).
 *
 * Missing categories (`botim`, `mocassim`) are created on the fly. Existing
 * categories (`boots`, `casual`, `running`, `semi-formal`, `sneakers`) are reused.
 * Products are assigned to the `autmn-winter-26` collection, marked `enabled=true`,
 * and linked to all 13 sizes. `name_en`/`name_pt` match the folder name.
 *
 * From directory `app/`:
 *   npm run products:wipe-and-import
 *   DRY_RUN=1 npm run products:wipe-and-import
 *   LIMIT=3 npm run products:wipe-and-import
 *
 * Env (already in app/.env):
 *   POCKETBASE_URL | VITE_API_ENDPOINT    API base (default http://127.0.0.1:8090)
 *   API_PB_ADMIN_EMAIL / API_PB_ADMIN_PASSWORD
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PocketBase from "pocketbase";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const PRODUTOS_DIR = path.join(REPO_ROOT, "produtos");
const STORAGE_DIR = path.join(REPO_ROOT, "api", "data", "storage");

const PB_URL = (process.env.POCKETBASE_URL || process.env.VITE_API_ENDPOINT || "http://127.0.0.1:8090").replace(
    /\/$/,
    ""
);

const DRY = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";
const LIMIT = process.env.LIMIT ? Math.max(0, Number.parseInt(process.env.LIMIT, 10)) : 0;

const email = process.env.API_PB_ADMIN_EMAIL || process.env.PB_ADMIN_EMAIL || "";
const password = process.env.API_PB_ADMIN_PASSWORD || process.env.PB_ADMIN_PASSWORD || "";

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png"]);

const CATEGORY_MAP = {
    BOOTS: { slug: "boots", name_pt: "Botas", name_en: "Boots" },
    BOTIM: { slug: "botim", name_pt: "Botim", name_en: "Ankle Boots" },
    CASUAL: { slug: "casual", name_pt: "Casual", name_en: "Casual" },
    MOCASSIM: { slug: "mocassim", name_pt: "Mocassim", name_en: "Loafers" },
    RUNNING: { slug: "running", name_pt: "Running", name_en: "Running" },
    "SEMI-FORMAL": { slug: "semi-formal", name_pt: "Semi Formal", name_en: "Semi Formal" },
    SNEAKERS: { slug: "sneakers", name_pt: "Sneakers", name_en: "Sneakers" },
};

const TARGET_COLLECTION_SLUG = "autmn-winter-26";

function slugify(value) {
    return String(value)
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-{2,}/g, "-");
}

async function listSubdirs(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
        .filter((e) => e.isDirectory() && !e.name.startsWith("."))
        .map((e) => e.name)
        .sort((a, b) => a.localeCompare(b, "en", { numeric: true, sensitivity: "base" }));
}

async function listImages(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
        .filter((e) => e.isFile() && !e.name.startsWith(".") && IMAGE_EXT.has(path.extname(e.name).toLowerCase()))
        .map((e) => e.name)
        .sort((a, b) => a.localeCompare(b, "en", { numeric: true, sensitivity: "base" }));
}

function mimeFromName(name) {
    const ext = path.extname(name).toLowerCase();
    if (ext === ".png") return "image/png";
    return "image/jpeg";
}

async function readAsFile(absPath) {
    const buf = await fs.readFile(absPath);
    const name = path.basename(absPath);
    return new File([buf], name, { type: mimeFromName(name) });
}

async function adminAuth(pb) {
    if (typeof pb.admins?.authWithPassword === "function") {
        await pb.admins.authWithPassword(email, password);
    } else {
        await pb.collection("_superusers").authWithPassword(email, password);
    }
}

async function ensureCategory(pb, cat) {
    try {
        const rec = await pb.collection("category").getFirstListItem(`slug="${cat.slug}"`);
        return rec.id;
    } catch {
        if (DRY) {
            console.log(`  [dry] would create category ${cat.slug} (${cat.name_en})`);
            return `dry-${cat.slug}`;
        }
        const created = await pb.collection("category").create({
            slug: cat.slug,
            name_en: cat.name_en,
            name_pt: cat.name_pt,
            enable: true,
        });
        console.log(`  + created category: ${cat.slug} -> ${created.id}`);
        return created.id;
    }
}

async function wipeStorageFolder(collectionId) {
    const dir = path.join(STORAGE_DIR, collectionId);
    try {
        const stat = await fs.stat(dir);
        if (!stat.isDirectory()) return;
    } catch {
        return;
    }
    const entries = await fs.readdir(dir, { withFileTypes: true });
    let removed = 0;
    for (const entry of entries) {
        if (entry.name.startsWith(".")) continue;
        const full = path.join(dir, entry.name);
        // eslint-disable-next-line no-await-in-loop
        await fs.rm(full, { recursive: true, force: true });
        removed += 1;
    }
    console.log(`  - removed ${removed} leftover storage entr${removed === 1 ? "y" : "ies"} under ${dir}`);
}

async function main() {
    if (!email || !password) {
        console.error("Missing API_PB_ADMIN_EMAIL / API_PB_ADMIN_PASSWORD env.");
        process.exit(1);
    }

    try {
        await fs.access(PRODUTOS_DIR);
    } catch {
        console.error(`produtos/ not found at ${PRODUTOS_DIR}`);
        process.exit(1);
    }

    const pb = new PocketBase(PB_URL);
    pb.autoCancellation(false);

    console.log(`PB_URL: ${PB_URL}`);
    console.log(`produtos dir: ${PRODUTOS_DIR}`);
    console.log(`DRY_RUN=${DRY ? "yes" : "no"} LIMIT=${LIMIT || "none"}`);

    try {
        await adminAuth(pb);
    } catch (err) {
        console.error("Superuser auth failed:", err?.message || err);
        process.exit(1);
    }

    const productsMeta = await pb.collections.getOne("products");
    const productsCollectionId = productsMeta.id;
    console.log(`products collection id: ${productsCollectionId}`);

    const existing = await pb.collection("products").getList(1, 1, { fields: "id" });
    console.log(`existing products to wipe: ${existing.totalItems}`);

    if (!DRY && existing.totalItems > 0) {
        try {
            await pb.collections.truncate("products");
            console.log(`  - truncated products collection`);
        } catch (err) {
            console.warn(`  ! truncate failed (${err?.message || err}), falling back to per-record delete`);
            const all = await pb.collection("products").getFullList({ fields: "id", batch: 200 });
            for (const r of all) {
                // eslint-disable-next-line no-await-in-loop
                await pb.collection("products").delete(r.id);
            }
            console.log(`  - deleted ${all.length} records one-by-one`);
        }
        await wipeStorageFolder(productsCollectionId);
    }

    const collectionRec = await pb.collection("collection").getFirstListItem(`slug="${TARGET_COLLECTION_SLUG}"`);
    const collectionId = collectionRec.id;
    console.log(`target collection: ${collectionRec.slug} (${collectionId})`);

    const sizeRecords = await pb.collection("sizes").getFullList({ fields: "id,number" });
    const sizeIds = sizeRecords.map((s) => s.id);
    console.log(`sizes linked per product: ${sizeIds.length}`);

    const categoryFolders = await listSubdirs(PRODUTOS_DIR);
    const categoryIdByFolder = new Map();
    for (const folder of categoryFolders) {
        const cat = CATEGORY_MAP[folder.toUpperCase()] || CATEGORY_MAP[folder];
        if (!cat) {
            console.warn(`  ? unknown category folder "${folder}" — skipping`);
            continue;
        }
        // eslint-disable-next-line no-await-in-loop
        const id = await ensureCategory(pb, cat);
        categoryIdByFolder.set(folder, id);
    }

    const usedSlugs = new Set();
    const uniqueSlug = (base) => {
        let slug = base;
        let n = 2;
        while (usedSlugs.has(slug)) slug = `${base}-${n++}`;
        usedSlugs.add(slug);
        return slug;
    };

    const tasks = [];
    for (const catFolder of categoryFolders) {
        if (!categoryIdByFolder.has(catFolder)) continue;
        const catDir = path.join(PRODUTOS_DIR, catFolder);
        const productFolders = await listSubdirs(catDir);
        for (const productFolder of productFolders) {
            const productDir = path.join(catDir, productFolder);
            const frames = await listImages(productDir);
            if (frames.length === 0) {
                console.warn(`  ? [${catFolder}] ${productFolder}: no images, skipping`);
                continue;
            }
            tasks.push({
                categoryFolder: catFolder,
                categoryId: categoryIdByFolder.get(catFolder),
                productFolder,
                productDir,
                frames,
            });
        }
    }

    console.log(`\n${tasks.length} product folder(s) queued across ${categoryIdByFolder.size} categor(ies).`);

    const runList = LIMIT > 0 ? tasks.slice(0, LIMIT) : tasks;
    let created = 0;
    let failed = 0;
    const failures = [];

    for (const task of runList) {
        const { categoryFolder, categoryId, productFolder, productDir, frames } = task;
        const baseSlug = slugify(productFolder);
        const slug = uniqueSlug(baseSlug || `product-${created + failed + 1}`);
        const label = `[${categoryFolder}] ${productFolder} (${frames.length} frames) slug=${slug}`;

        if (DRY) {
            console.log(`  ~ would create: ${label}`);
            continue;
        }

        try {
            const form = new FormData();
            form.append("slug", slug);
            form.append("name_en", productFolder);
            form.append("name_pt", productFolder);
            form.append("enabled", "true");
            form.append("category", categoryId);
            form.append("collection", collectionId);
            for (const sid of sizeIds) form.append("sizes", sid);

            const mainFile = await readAsFile(path.join(productDir, frames[0]));
            form.append("media", mainFile);

            if (frames[1]) {
                const hoverFile = await readAsFile(path.join(productDir, frames[1]));
                form.append("media_hover", hoverFile);
            }

            for (const name of frames) {
                // eslint-disable-next-line no-await-in-loop
                const f = await readAsFile(path.join(productDir, name));
                form.append("media_360", f);
            }

            // eslint-disable-next-line no-await-in-loop
            const rec = await pb.collection("products").create(form);
            created += 1;
            console.log(`  + ${label} -> id=${rec.id}`);
        } catch (err) {
            failed += 1;
            const msg = err?.response?.data
                ? `${err.message} :: ${JSON.stringify(err.response.data)}`
                : err?.message || String(err);
            console.warn(`  ! failed: ${label} — ${msg}`);
            failures.push({ label, msg });
        }
    }

    console.log(
        `\nSummary: created=${created}, failed=${failed}, queued=${runList.length}, dry-run=${DRY}, limit=${LIMIT || "none"}`
    );
    if (failures.length > 0) {
        console.log("\nFailures:");
        for (const f of failures) console.log(`  - ${f.label} :: ${f.msg}`);
        process.exit(1);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
