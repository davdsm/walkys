import PocketBase from "pocketbase";

const getPbUrl = () => import.meta.env.VITE_API_ENDPOINT || "http://127.0.0.1:8090";

export function createPocketBase(request?: Request) {
    const url = getPbUrl();
    const pb = new PocketBase(url);

    // load the store data from the request cookie string
    if (request) {
        pb.authStore.loadFromCookie(request.headers.get("cookie") || "");
    } else if (typeof document !== "undefined") {
        pb.authStore.loadFromCookie(document.cookie);
    }

    return pb;
}

/**
 * Reads admin credentials from env. In server/loaders (Node), process.env is preferred
 * so .env is read correctly. Vite exposes API_* in import.meta.env at build time.
 * Use API_PB_ADMIN_EMAIL / API_PB_ADMIN_PASSWORD (or PB_ADMIN_* in .env).
 */
function getAdminCredentials(): { email: string; password: string } | null {
    const email =
        (typeof process !== "undefined" && process.env?.API_PB_ADMIN_EMAIL) ||
        (typeof process !== "undefined" && process.env?.PB_ADMIN_EMAIL) ||
        (typeof import.meta !== "undefined" && (import.meta.env?.API_PB_ADMIN_EMAIL as string));
    const password =
        (typeof process !== "undefined" && process.env?.API_PB_ADMIN_PASSWORD) ||
        (typeof process !== "undefined" && process.env?.PB_ADMIN_PASSWORD) ||
        (typeof import.meta !== "undefined" && (import.meta.env?.API_PB_ADMIN_PASSWORD as string));
    if (typeof email === "string" && email.length > 0 && typeof password === "string" && password.length > 0) {
        return { email, password };
    }
    return null;
}

/**
 * Creates a PocketBase client authenticated as the dashboard admin (superuser).
 * Use only server-side (e.g. in loaders). Set API_PB_ADMIN_EMAIL and API_PB_ADMIN_PASSWORD
 * in .env (Vite exposes API_* vars) — these must be your PocketBase Admin login (/_/),
 * not a user from the "users" collection. Superuser bypasses API rules so listing users works.
 * If this returns null, listing falls back to current user; then the users collection
 * List rule in PocketBase must allow admins (e.g. @request.auth.admin = true).
 */
export async function createPocketBaseAsAdmin(): Promise<PocketBase | null> {
    const creds = getAdminCredentials();
    if (!creds) return null;
    const url = getPbUrl();
    const pb = new PocketBase(url);
    try {
        await pb.admins.authWithPassword(creds.email, creds.password);
        return pb;
    } catch {
        return null;
    }
}
