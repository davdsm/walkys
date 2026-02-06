import { Link, redirect, useLoaderData, useSearchParams } from "react-router";
import { BackofficeToast } from "~/components/Backoffice/BackofficeToast";
import { createPocketBase, createPocketBaseAsAdmin } from "~/lib/pocketbase";
import { getAllOrders, type OrderRecordWithUser } from "~/lib/services";
import type { Route } from "./+types/backoffice.orders";
import { Pencil } from "lucide-react";

export async function loader({ request }: Route.LoaderArgs) {
  const pb = createPocketBase(request);
  if (!pb.authStore.isValid) return redirect("/auth/login");
  const user = pb.authStore.model as { admin?: boolean } | null;
  if (!user?.admin) return redirect("/dashboard");

  try {
    const adminPb = await createPocketBaseAsAdmin();
    const client = adminPb ?? pb;
    const orders = await getAllOrders(client);
    return { orders };
  } catch {
    return { orders: [] as OrderRecordWithUser[] };
  }
}

export function meta() {
  return [{ title: "Pedidos – Walkys Backoffice" }];
}

const ADMIN_STATUS_LABELS: Record<string, string> = {
  new: "Novo",
  processing: "Em processamento",
  sended: "Enviado",
  completed: "Concluído",
};

function formatDate(created: string | undefined): string {
  if (!created) return "—";
  try {
    return new Date(created).toLocaleDateString("pt-PT", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return created;
  }
}

export default function BackofficeOrders() {
  const { orders } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const successParam = searchParams.get("success");

  return (
    <div>
      <BackofficeToast
        successParam={successParam}
        successMessage={successParam === "deleted" ? "Pedido eliminado" : "Pedido guardado com sucesso"}
      />
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Pedidos</h1>
        <p className="text-slate-600 mt-1">
          Ver e gerir pedidos. Clique num pedido para ver detalhes, utilizador e editar ou eliminar.
        </p>
      </div>
      <div className="bg-white rounded-sm border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left" role="table" aria-label="Lista de pedidos">
          <caption className="sr-only">Lista de pedidos com data, utilizador e ações</caption>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th scope="col" className="px-6 py-4 text-sm font-semibold text-slate-900">
                Pedido
              </th>
              <th scope="col" className="px-6 py-4 text-sm font-semibold text-slate-900">
                Data
              </th>
              <th scope="col" className="px-6 py-4 text-sm font-semibold text-slate-900">
                Estado
              </th>
              <th scope="col" className="px-6 py-4 text-sm font-semibold text-slate-900">
                Utilizador
              </th>
              <th scope="col" className="px-6 py-4 text-sm font-semibold text-slate-900">
                Itens
              </th>
              <th scope="col" className="px-6 py-4 text-sm font-semibold text-slate-900">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  Ainda não há pedidos.
                </td>
              </tr>
            ) : (
              orders.map((order: OrderRecordWithUser) => {
                const user = order.expand?.user;
                const userName = user?.name ?? user?.email ?? "—";
                const itemCount = Array.isArray(order.items) ? order.items.length : 0;
                const status = order.status ?? "new";
                const statusLabel = ADMIN_STATUS_LABELS[status] ?? status;
                return (
                  <tr
                    key={order.id}
                    className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-slate-800">
                        #{order.id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 text-sm">
                      {formatDate(order.created)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-sm text-xs font-medium bg-slate-200 text-slate-700">
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-900 font-medium">{userName}</span>
                      {user?.email && userName !== user.email && (
                        <span className="block text-xs text-slate-500">{user.email}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-700 text-sm">
                      {itemCount} {itemCount === 1 ? "item" : "itens"}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/backoffice/orders/${order.id}`}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-sm text-slate-500 hover:text-slate-800 hover:bg-slate-200 focus:ring-2 focus:ring-slate-500/50"
                        aria-label="Ver e editar pedido"
                      >
                        <Pencil className="w-4 h-4" aria-hidden />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
