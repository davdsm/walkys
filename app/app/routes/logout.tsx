import { redirect } from "react-router";
import type { Route } from "../+types/root";
import { createPocketBase } from "~/lib/pocketbase";

export async function action({ request }: Route.ActionArgs) {
    const pb = createPocketBase(request);
    pb.authStore.clear();

    return redirect("/auth/login", {
        headers: {
            "set-cookie": pb.authStore.exportToCookie({ httpOnly: false }),
        },
    });
}

export async function loader() {
    return redirect("/");
}
