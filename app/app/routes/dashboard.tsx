import { redirect, useLoaderData } from "react-router";
import type { Route } from "../+types/root";
import { createPocketBase, createPocketBaseAsAdmin, canAccessUserBackoffice, getUserBlockedStatus } from "~/lib/pocketbase";
import { getOrderCountByUser, getUserNotifications, markNotificationsAsRead, type NotificationRecord } from "~/lib/services";
import BackofficePage from "~/components/Backoffice/BackofficePage";
import { buildSeoMeta } from "~/lib/seo";

export async function action({ request }: Route.ActionArgs) {
    const pb = createPocketBase(request);
    if (!pb.authStore.isValid) return null;
    const user = pb.authStore.model as { id?: string } | null;
    if (!user?.id) return null;

    const formData = await request.formData();
    if (formData.get("intent") !== "markRead") return null;
    const ids = formData.getAll("ids").filter((v): v is string => typeof v === "string" && v.length > 0);
    if (ids.length === 0) return null;

    try {
        const adminPb = await createPocketBaseAsAdmin();
        const client = adminPb ?? pb;
        await markNotificationsAsRead(client, ids);
        return null;
    } catch {
        return null;
    }
}

export async function loader({ request }: Route.LoaderArgs) {
    const pb = createPocketBase(request);
    if (!pb.authStore.isValid) {
        return redirect("/auth/login");
    }

    const user = pb.authStore.model as { id?: string; admin?: boolean } | null;
    if (user?.id && (await getUserBlockedStatus(pb, user))) return redirect("/blocked");
    if (user?.id && !(await canAccessUserBackoffice(pb, user))) return redirect("/pending-approval");

    let ordersCount = 0;
    let userNotifications: NotificationRecord[] = [];

    if (user?.id) {
        try {
            const adminPb = await createPocketBaseAsAdmin();
            ordersCount = await getOrderCountByUser(adminPb ?? pb, user.id);
        } catch {
            ordersCount = 0;
        }

        try {
            const adminPb = await createPocketBaseAsAdmin();
            userNotifications = await getUserNotifications(adminPb ?? pb, user.id);
        } catch {
            userNotifications = [];
        }
    }

    return { user, ordersCount, userNotifications };
}

export function meta({ }: Route.MetaArgs) {
    return buildSeoMeta({
        title: "Dashboard",
        description: "Manage your Walkys account, notifications, and recent activity.",
        pathname: "/dashboard",
        noIndex: true,
    });
}

export default function Dashboard() {
    const { user, ordersCount, userNotifications } = useLoaderData<typeof loader>();
    const displayName = user?.name || user?.username || "User";

    const statusLabels: Record<string, string> = {
        new: "Novo",
        processing: "Em processamento",
        sended: "Enviado",
        completed: "Concluído",
    };

    const notifications = (userNotifications ?? []).map((n: NotificationRecord) => {
        if (n.type === "order_status_changed") {
            const payload = n.payload as Record<string, string> | undefined;
            const orderId: string = payload?.orderId ?? "";
            const newStatus: string = payload?.newStatus ?? "";
            const statusLabel = statusLabels[newStatus] ?? newStatus;
            return {
                id: n.id,
                title: "Atualização de pedido",
                message:
                    orderId && newStatus
                        ? `O estado do pedido #${orderId.slice(0, 8)} foi alterado para ${statusLabel}.`
                        : "O estado de um pedido foi atualizado.",
                read: n.read,
                created: n.created,
                href: "/orders",
            };
        }
        return {
            id: n.id,
            title: "Notificação",
            message: "",
            read: n.read,
            created: n.created,
        };
    });

    return (
        <div className="backoffice-layout w-full h-screen bg-white flex flex-col items-center justify-center gap-8">
            <BackofficePage
                displayName={displayName}
                ordersCount={ordersCount}
                notifications={notifications}
                markReadAction="/dashboard"
            />
        </div>
    );
}