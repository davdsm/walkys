import { redirect } from "react-router";
import type { Route } from "../+types/root";
import { createPocketBase } from "~/lib/pocketbase";

export async function action({ request }: Route.ActionArgs) {
    const pb = createPocketBase(request);
    pb.authStore.clear();

    const formData = await request.formData();
    const redirectTo = formData.get("redirectTo") || "/auth/login";

    return redirect(redirectTo as string, {
        headers: {
            "set-cookie": pb.authStore.exportToCookie({ httpOnly: true, secure: import.meta.env.PROD }),
        },
    });
}

export async function loader() {
    return redirect("/");
}
