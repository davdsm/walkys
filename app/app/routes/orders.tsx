import { redirect, useLoaderData } from "react-router";
import type { Route } from "../+types/root";
import { createPocketBase } from "~/lib/pocketbase";
import OrdersPage from "~/components/Backoffice/OrdersPage/OrdersPage";

<<<<<<< HEAD
export async function loader({ request }: Route.LoaderArgs) {
    const pb = createPocketBase(request);
    if (!pb.authStore.isValid) {
        return redirect("/auth/login");
    }
    return {user: pb.authStore.model};
}

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Walkys - Orders" },
=======
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
>>>>>>> fa7a8c9 (Orders Page)
    ];
}

export default function Orders() {
    return (
        <div className="w-full h-screen bg-white flex flex-col items-center justify-center gap-8">
            <OrdersPage />
        </div>
    );
}