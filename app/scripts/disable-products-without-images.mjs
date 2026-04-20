/**
 * Disable products whose primary image (`media`) is missing or unreachable.
 *
 * A product is disabled (`enabled: false`) when:
 *   - `media` is empty/undefined, OR
 *   - none of the filenames in `media` can be fetched (HTTP != 2xx) from
 *     the PocketBase API at /api/files/<collection>/<record>/<filename>.
 *
 * Already-disabled products are left untouched. A dry run lists what would change
 * without writing.
 *
 * From directory `app/`:
 *   node --env-file=.env ./scripts/disable-products-without-images.mjs
 *   DRY_RUN=1 node --env-file=.env ./scripts/disable-products-without-images.mjs
 *
 * Env:
 *   POCKETBASE_URL | VITE_API_ENDPOINT    API base (default http://127.0.0.1:8090)
 *   API_PB_ADMIN_EMAIL / API_PB_ADMIN_PASSWORD (or PB_ADMIN_*)
 */

import PocketBase from "pocketbase";

const PB_URL = (process.env.POCKETBASE_URL || process.env.VITE_API_ENDPOINT || "http://127.0.0.1:8090").replace(
    /\/$/,
    ""
);

const DRY = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";

const email = process.env.API_PB_ADMIN_EMAIL || process.env.PB_ADMIN_EMAIL || "";
const password = process.env.API_PB_ADMIN_PASSWORD || process.env.PB_ADMIN_PASSWORD || "";

function normalizeFilenames(raw) {
    if (raw == null) return [];
    if (Array.isArray(raw)) return raw.filter((f) => typeof f === "string" && f.length > 0);
    if (typeof raw === "string") {
        const t = raw.trim();
        if (!t) return [];
        if (t.startsWith("[")) {
            try {
                const p = JSON.parse(t);
                return Array.isArray(p) ? p.filter((x) => typeof x === "string" && x.length > 0) : [t];
            } catch {
                return [t];
            }
        }
        return [t];
    }
    return [];
}

async function fileExists(pb, record, filename, token) {
    const url = pb.files.getURL(record, filename, token ? { token } : undefined);
    try {
        const res = await fetch(url, { method: "GET", headers: { Range: "bytes=0-0" } });
        return res.ok || res.status === 206;
    } catch {
        return false;
    }
}

async function main() {
    if (!email || !password) {
        console.error("Missing API_PB_ADMIN_EMAIL / API_PB_ADMIN_PASSWORD env.");
        process.exit(1);
    }

    const pb = new PocketBase(PB_URL);
    pb.autoCancellation(false);

    try {
        if (typeof pb.admins?.authWithPassword === "function") {
            await pb.admins.authWithPassword(email, password);
        } else {
            await pb.collection("_superusers").authWithPassword(email, password);
        }
    } catch (err) {
        console.error("Superuser auth failed:", err?.message || err);
        process.exit(1);
    }

    let fileToken;
    try {
        fileToken = await pb.files.getToken();
    } catch {
        fileToken = undefined;
    }

    const all = await pb.collection("products").getFullList({
        fields: "id,slug,name_en,name_pt,collectionId,collectionName,media,enabled",
        batch: 200,
        sort: "+slug",
    });

    console.log(`PB_URL: ${PB_URL}`);
    console.log(`Found ${all.length} product record(s). DRY_RUN=${DRY ? "yes" : "no"}`);

    const toDisable = [];
    const kept = [];

    for (const rec of all) {
        const media = normalizeFilenames(rec.media);
        if (media.length === 0) {
            toDisable.push({ rec, reason: "no media field" });
            continue;
        }
        let anyOk = false;
        for (const filename of media) {
            // eslint-disable-next-line no-await-in-loop
            const ok = await fileExists(pb, rec, filename, fileToken);
            if (ok) {
                anyOk = true;
                break;
            }
        }
        if (!anyOk) toDisable.push({ rec, reason: `no reachable media file (${media.length} listed)` });
        else kept.push(rec);
    }

    console.log(`OK    (has image): ${kept.length}`);
    console.log(`BROKEN           : ${toDisable.length}`);

    let changed = 0;
    let skipped = 0;
    for (const { rec, reason } of toDisable) {
        const label = `${rec.slug || rec.id} (${rec.name_en || rec.name_pt || "-"})`;
        if (rec.enabled === false) {
            console.log(`  = already disabled: ${label}  [${reason}]`);
            skipped += 1;
            continue;
        }
        if (DRY) {
            console.log(`  ~ would disable    : ${label}  [${reason}]`);
            continue;
        }
        try {
            await pb.collection("products").update(rec.id, { enabled: false });
            console.log(`  - disabled         : ${label}  [${reason}]`);
            changed += 1;
        } catch (err) {
            console.warn(`  ! update failed    : ${label} — ${err?.message || err}`);
        }
    }

    console.log(
        `\nSummary: disabled=${changed}, already-disabled=${skipped}, kept-enabled=${kept.length}, dry-run=${DRY}`
    );
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
