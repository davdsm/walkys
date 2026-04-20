import PocketBase from "pocketbase";

const defaultPbUrl = "http://127.0.0.1:8090";

/**
 * URL the PocketBase client uses for HTTP (SSR in Docker: POCKETBASE_URL → walkys-api).
 */
function getPocketBaseRequestUrl(): string {
    const fromVite = import.meta.env.VITE_API_ENDPOINT as string | undefined;
    if (typeof window !== "undefined") {
        return fromVite || defaultPbUrl;
    }
    const fromProcess =
        (typeof process !== "undefined" && process.env.POCKETBASE_URL) ||
        (typeof process !== "undefined" && process.env.VITE_API_ENDPOINT);
    return fromProcess || fromVite || defaultPbUrl;
}

/**
 * Origin for /api/files/... links shown in HTML. Must resolve in the user's browser, not only inside Docker
 * (never use walkys-api here). On the server, set PUBLIC_POCKETBASE_URL when POCKETBASE_URL is internal.
 */
export function getPocketBasePublicBaseUrl(): string {
    const vitePublic = import.meta.env.VITE_PUBLIC_POCKETBASE_URL as string | undefined;
    const fromVite = import.meta.env.VITE_API_ENDPOINT as string | undefined;
    if (typeof window !== "undefined") {
        return (vitePublic || fromVite || defaultPbUrl).replace(/\/$/, "");
    }
    const fromProcess =
        (typeof process !== "undefined" && process.env.PUBLIC_POCKETBASE_URL) ||
        (typeof process !== "undefined" && process.env.VITE_PUBLIC_POCKETBASE_URL) ||
        (typeof process !== "undefined" && process.env.VITE_API_ENDPOINT);
    const raw = fromProcess || fromVite || defaultPbUrl;
    return String(raw).replace(/\/$/, "");
}

/**
 * Same path rules as PocketBase's pb.files.getURL (encodeURIComponent per segment).
 * Shoe / product uploads often include spaces or "(" in filenames; unencoded paths break in img src.
 */
export function buildPocketBasePublicFileUrl(collectionIdOrName: string, recordId: string, filename: string): string {
    if (!filename) return "";
    if (filename.startsWith("http://") || filename.startsWith("https://")) {
        return rewritePocketBaseAssetOriginForBrowser(filename);
    }
    const base = getPocketBasePublicBaseUrl();
    const path = ["api", "files", encodeURIComponent(collectionIdOrName), encodeURIComponent(recordId), encodeURIComponent(filename)].join("/");
    return `${base}/${path}`;
}

/** Appends a short-lived file token for PocketBase *protected* file fields (`pb.files.getToken()`). */
export function appendPocketBaseFileToken(url: string, token: string): string {
    if (!url || !token) return url;
    try {
        const u = new URL(url);
        u.searchParams.set("token", token);
        return u.toString();
    } catch {
        const sep = url.includes("?") ? "&" : "?";
        return `${url}${sep}token=${encodeURIComponent(token)}`;
    }
}

/** If a URL was built against the internal Docker PB origin, swap it to the public origin for the browser. */
function rewritePocketBaseAssetOriginForBrowser(absoluteUrl: string): string {
    const publicBase = getPocketBasePublicBaseUrl();
    const internalRaw = typeof process !== "undefined" ? process.env.POCKETBASE_URL?.replace(/\/$/, "") : "";
    try {
        if (internalRaw && absoluteUrl.startsWith(internalRaw)) {
            return `${publicBase}${absoluteUrl.slice(internalRaw.length)}`;
        }
        const u = new URL(absoluteUrl);
        if (u.hostname === "walkys-api") {
            const pub = new URL(publicBase.includes("://") ? publicBase : `http://${publicBase}`);
            u.protocol = pub.protocol;
            u.hostname = pub.hostname;
            u.port = pub.port;
            return u.toString();
        }
    } catch {
        return absoluteUrl;
    }
    return absoluteUrl;
}

/**
 * Build a browser-loadable file URL using the PocketBase SDK (same encoding as the server)
 * and rewrite an internal Docker origin (e.g. walkys-api) to PUBLIC_POCKETBASE_URL.
 * Pass `fileToken` from `pb.files.getToken()` when the file field is protected (img tags cannot send Authorization).
 */
export function getBrowserPocketBaseFileUrl(
    pb: PocketBase,
    record: { id: string; collectionId?: string; collectionName?: string },
    filename: string,
    fileToken?: string
): string {
    if (!filename) return "";
    if (filename.startsWith("http://") || filename.startsWith("https://")) {
        return rewritePocketBaseAssetOriginForBrowser(filename);
    }
    const query = fileToken ? ({ token: fileToken } as Record<string, string>) : undefined;
    const raw = pb.files.getURL(record as { id: string; collectionId?: string; collectionName?: string }, filename, query);
    return rewritePocketBaseAssetOriginForBrowser(raw);
}

/**
 * True when the incoming request is served over HTTPS (directly or via a reverse proxy
 * that sets `x-forwarded-proto`). Used to decide whether to mark the auth cookie `Secure`:
 * over plain HTTP the browser silently drops `Secure` cookies and the user appears logged out.
 */
export function isRequestSecure(request?: Request): boolean {
    if (!request) return false;
    try {
        const xfProto = request.headers.get("x-forwarded-proto");
        if (xfProto) return xfProto.split(",")[0].trim().toLowerCase() === "https";
        const url = new URL(request.url);
        return url.protocol === "https:";
    } catch {
        return false;
    }
}

/**
 * Build a Set-Cookie value for the current pb.authStore that is `Secure` only when the
 * request itself is HTTPS. Keep SSR/HTTP dev and HTTP-only VPS deploys working without
 * losing HTTPS hardening in production.
 */
export function buildAuthCookie(pb: PocketBase, request?: Request): string {
    return pb.authStore.exportToCookie({
        httpOnly: true,
        secure: isRequestSecure(request),
    });
}

export function createPocketBase(request?: Request) {
    const url = getPocketBaseRequestUrl();
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
    const url = getPocketBaseRequestUrl();
    const pb = new PocketBase(url);
    try {
        await pb.admins.authWithPassword(creds.email, creds.password);
        return pb;
    } catch {
        return null;
    }
}

/**
 * Returns true if the user can access the user backoffice (dashboard). Admins always can.
 * Non-admins need approved === true and blocked !== true. Fetches from API since auth model may not include custom fields.
 */
export async function canAccessUserBackoffice(
    pb: PocketBase,
    user: { id?: string; admin?: boolean } | null
): Promise<boolean> {
    if (!user?.id) return false;
    if (user.admin === true) return true;
    try {
        const adminPb = await createPocketBaseAsAdmin();
        const client = adminPb ?? pb;
        const rec = await client.collection("users").getOne(user.id, { fields: "approved,blocked" });
        const r = rec as { approved?: boolean; blocked?: boolean };
        if (r.blocked === true) return false;
        return r.approved === true;
    } catch {
        return false;
    }
}

/** Returns "blocked" if user is blocked, for redirect to blocked page. */
export async function getUserBlockedStatus(
    pb: PocketBase,
    user: { id?: string; admin?: boolean } | null
): Promise<boolean> {
    if (!user?.id || user.admin === true) return false;
    try {
        const adminPb = await createPocketBaseAsAdmin();
        const client = adminPb ?? pb;
        const rec = await client.collection("users").getOne(user.id, { fields: "blocked" });
        return (rec as { blocked?: boolean }).blocked === true;
    } catch {
        return false;
    }
}
function normalizeCatalogProductIds(raw: unknown): string[] {
    if (raw == null) return [];
    if (Array.isArray(raw)) {
        return raw
            .map((item) => (typeof item === "string" ? item : (item as { id?: string })?.id))
            .filter((id): id is string => typeof id === "string" && id.length > 0);
    }
    return [];
}
/**
 * Returns the list of product IDs this user is restricted to, or null if they can see all products.
 * When non-null and non-empty, the whole site (home, collection, category, product) should only show those products.
 */
export async function getUserAllowedProductIds(
    pb: PocketBase,
    user: { id?: string; admin?: boolean } | null
): Promise<string[] | null> {
    if (!user?.id) return null;
    try {
        const adminPb = await createPocketBaseAsAdmin();
        const client = adminPb ?? pb;
        const rec = await client.collection("users").getOne(user.id, { fields: "catalog_products" });
        const raw = (rec as { catalog_products?: unknown }).catalog_products;
        const ids = normalizeCatalogProductIds(raw);
        return ids.length === 0 ? null : ids;
    } catch {
        return null;
    }
}
