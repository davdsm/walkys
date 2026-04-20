import { redirect } from "react-router";
import type { Route } from "../+types/root";
import { createPocketBase, buildAuthCookie } from "~/lib/pocketbase";

export async function action({ request }: Route.ActionArgs) {
    const pb = createPocketBase(request);
    pb.authStore.clear();

    const formData = await request.formData();
    const redirectTo = formData.get("redirectTo") || "/auth/login";

    return redirect(redirectTo as string, {
        headers: {
            "set-cookie": buildAuthCookie(pb, request),
        },
    });
}

export async function loader() {
    return redirect("/");
}
