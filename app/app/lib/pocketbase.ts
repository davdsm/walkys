import PocketBase from "pocketbase";

export function createPocketBase(request?: Request) {
    const url = import.meta.env.VITE_API_ENDPOINT || "http://192.168.1.68:8090";
    // console.log("PocketBase URL:", url);
    const pb = new PocketBase(url);

    // load the store data from the request cookie string
    if (request) {
        pb.authStore.loadFromCookie(request.headers.get("cookie") || "");
    } else if (typeof document !== "undefined") {
        // load the store data from the document cookie string
        pb.authStore.loadFromCookie(document.cookie);
    }

    return pb;
}
