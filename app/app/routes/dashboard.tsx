import { redirect, useLoaderData } from "react-router";
import type { Route } from "../+types/root";
import { createPocketBase, createPocketBaseAsAdmin } from "~/lib/pocketbase";
import { getOrderCountByUser } from "~/lib/services";
import BackofficePage from "~/components/Backoffice/BackofficePage";

function normalizeCatalogProductIds(raw: unknown): string[] {
    if (raw == null) return [];
    if (Array.isArray(raw)) {
        return raw
            .map((item) => (typeof item === "string" ? item : (item as { id?: string })?.id))
            .filter((id): id is string => typeof id === "string" && id.length > 0);
    }
    return [];
}

export async function loader({ request }: Route.LoaderArgs) {
    const pb = createPocketBase(request);
    if (!pb.authStore.isValid) {
        return redirect("/auth/login");
    }

    const user = pb.authStore.model as { id?: string } | null;
    let catalogCount = 0;
    let ordersCount = 0;

    if (user?.id) {
        try {
            const adminPb = await createPocketBaseAsAdmin();
            const client = adminPb ?? pb;
            const userRecord = await client.collection("users").getOne(user.id, { fields: "catalog_products" });
            const raw = (userRecord as { catalog_products?: unknown }).catalog_products;
            const ids = normalizeCatalogProductIds(raw);
            catalogCount = ids.length;
        } catch {
            catalogCount = 0;
        }
        try {
            const adminPb = await createPocketBaseAsAdmin();
            ordersCount = await getOrderCountByUser(adminPb ?? pb, user.id);
        } catch {
            ordersCount = 0;
        }
    }

    return { user, catalogCount, ordersCount };
}

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Walkys - Dashboard" },
    ];
}

export default function Dashboard() {
    const { user, catalogCount, ordersCount } = useLoaderData<typeof loader>();
    const displayName = user?.name || user?.username || "User";

    return (
        <div className="w-full h-screen bg-white flex flex-col items-center justify-center gap-8">
            <BackofficePage displayName={displayName} catalogCount={catalogCount} ordersCount={ordersCount} />
        </div>
    );
}