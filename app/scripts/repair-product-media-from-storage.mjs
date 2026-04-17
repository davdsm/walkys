/**
 * Fixes product images when the DB points at filenames that are not on disk (404).
 * Re-uploads files from `api/data/storage/<collectionId>/<recordId>/` via PocketBase
 * multipart update (PB does not allow PATCHing file fields to arbitrary names).
 *
 * Admin credentials (same as PocketBase dashboard / app backoffice admin):
 *   API_PB_ADMIN_EMAIL + API_PB_ADMIN_PASSWORD (or PB_ADMIN_*)
 *
 * From directory `app/`:
 *   npm run repair:product-media
 *   REPAIR_DRY_RUN=1 npm run repair:product-media
 *
 * Env:
 *   POCKETBASE_URL | VITE_API_ENDPOINT — API (default http://127.0.0.1:8090)
 *   REPAIR_STORAGE_ROOT — path to the `storage` folder (default: ../../api/data/storage from this script)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PocketBase from "pocketbase";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PB_URL = (process.env.POCKETBASE_URL || process.env.VITE_API_ENDPOINT || "http://127.0.0.1:8090").replace(
  /\/$/,
  ""
);

const defaultStorage = path.resolve(__dirname, "..", "..", "api", "data", "storage");
const STORAGE_ROOT = process.env.REPAIR_STORAGE_ROOT ? path.resolve(process.env.REPAIR_STORAGE_ROOT) : defaultStorage;

const DRY = process.env.REPAIR_DRY_RUN === "1" || process.env.REPAIR_DRY_RUN === "true";

const email = process.env.API_PB_ADMIN_EMAIL || process.env.PB_ADMIN_EMAIL || "";
const password = process.env.API_PB_ADMIN_PASSWORD || process.env.PB_ADMIN_PASSWORD || "";

const IMAGE_RE = /\.(jpe?g|png|webp|gif)$/i;

/** Legacy uploads: one underscore before random id (e.g. dsc03733_af3kx606z8.jpg). PB re-uploads add a second block. */
function isLegacyPhysicalFile(name) {
  const base = name.replace(/\.[^.]+$/i, "");
  const n = (base.match(/_/g) || []).length;
  return n === 1;
}

function listImageFilenames(dir) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];
  const names = fs
    .readdirSync(dir)
    .filter((f) => IMAGE_RE.test(f) && !f.endsWith(".attrs"));
  return [...new Set(names)].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

/** Prefer legacy on-disk names when present so we do not pick PB-duplicated files first. */
function listRepairCandidates(dir) {
  const all = listImageFilenames(dir);
  const legacy = all.filter(isLegacyPhysicalFile);
  return legacy.length > 0 ? legacy : all;
}

function toFile(absPath) {
  const buf = fs.readFileSync(absPath);
  const n = path.basename(absPath);
  const lower = n.toLowerCase();
  const type = lower.endsWith(".png")
    ? "image/png"
    : lower.endsWith(".webp")
      ? "image/webp"
      : lower.endsWith(".gif")
        ? "image/gif"
        : "image/jpeg";
  return new File([buf], n, { type });
}

function recordBrokenOnDisk(p, dir) {
  const main = Array.isArray(p.media) ? p.media[0] : p.media;
  const hover = p.media_hover;
  const m360 = Array.isArray(p.media_360) ? p.media_360 : p.media_360 ? [p.media_360] : [];

  const missing = (fn) => !fn || !fs.existsSync(path.join(dir, String(fn)));

  if (missing(main) && listRepairCandidates(dir).length > 0) return true;
  if (m360.length > 0 && m360.some((fn) => missing(fn))) return true;
  if (hover && missing(hover)) return true;
  return false;
}

async function main() {
  if (!email || !password) {
    console.error(
      "Set API_PB_ADMIN_EMAIL and API_PB_ADMIN_PASSWORD (or PB_ADMIN_*) in app/.env, then:\n  npm run repair:product-media"
    );
    process.exit(1);
  }

  if (!fs.existsSync(STORAGE_ROOT)) {
    console.error(`Storage not found: ${STORAGE_ROOT}`);
    process.exit(1);
  }

  const pb = new PocketBase(PB_URL);
  await pb.admins.authWithPassword(email, password);

  const products = await pb.collection("products").getFullList({
    batch: 200,
    fields: "id,collectionId,media,media_hover,media_360",
  });

  let updated = 0;
  let skipped = 0;
  let unchanged = 0;

  for (const p of products) {
    const cid = p.collectionId || "products";
    const dir = path.join(STORAGE_ROOT, cid, p.id);
    const files = listRepairCandidates(dir);

    if (files.length === 0) {
      if (!recordBrokenOnDisk(p, dir)) unchanged++;
      else {
        skipped++;
        console.log(`skip ${p.id}: broken DB but no image files in ${dir}`);
      }
      continue;
    }

    if (!recordBrokenOnDisk(p, dir)) {
      unchanged++;
      continue;
    }

    const fd = new FormData();
    fd.append("media", toFile(path.join(dir, files[0])));
    fd.append("media_hover", toFile(path.join(dir, files[1] || files[0])));
    for (const f of files) {
      fd.append("media_360", toFile(path.join(dir, f)));
    }

    console.log(
      `${DRY ? "[dry-run] " : ""}repair ${p.id}: upload ${files.length} file(s) from disk → media, media_hover, media_360`
    );

    if (!DRY) {
      await pb.collection("products").update(p.id, fd);
      updated++;
    }
  }

  console.log(
    `\n${DRY ? "Dry run (no writes)." : `Updated ${updated} product(s).`} Unchanged: ${unchanged}, skipped: ${skipped}, total: ${products.length}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
