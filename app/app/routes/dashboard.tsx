import { redirect, useLoaderData } from "react-router";
import type { Route } from "../+types/root";
import { createPocketBase } from "~/lib/pocketbase";
import BackofficePage from "~/components/Backoffice/BackofficePage";

// export async function loader({ request }: Route.LoaderArgs) {
//     const pb = createPocketBase(request);
//     if (!pb.authStore.isValid) {
//         return redirect("/auth/login");
//     }
//     return {user: pb.authStore.model};
// }

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Walkys - Dashboard" },
    ];
}

export default function Dashboard() {
    // const {user} = useLoaderData<typeof loader>();
    // const displayName = user?.name || user?.username || "User";

    return (
        <div className="w-full h-screen bg-white flex flex-col items-center justify-center gap-8">
            <BackofficePage displayName="Rita Matias" />
        </div>
    );
}