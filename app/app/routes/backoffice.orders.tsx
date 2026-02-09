import { Link, redirect, useLoaderData, useSearchParams, Form } from "react-router";
import { BackofficeToast } from "~/components/Backoffice/BackofficeToast";
import { createPocketBase, createPocketBaseAsAdmin } from "~/lib/pocketbase";
import { getAllOrders, deleteOrder, type OrderRecordWithUser } from "~/lib/services";
import type { Route } from "./+types/backoffice.orders";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

export async function action({ request }: Route.ActionArgs) {
  const pb = createPocketBase(request);
  if (!pb.authStore.isValid) return redirect("/auth/login");
  const user = pb.authStore.model as { admin?: boolean } | null;
  if (!user?.admin) return redirect("/dashboard");

  const formData = await request.formData();
  if (formData.get("intent") !== "bulkDelete") return null;

  const ids = formData.getAll("ids").filter((v): v is string => typeof v === "string" && v.length > 0);
  if (ids.length === 0) {
    return redirect("/backoffice/orders?error=" + encodeURIComponent("Nenhum pedido selecionado."));
  }

  try {
    const adminPb = await createPocketBaseAsAdmin();
    const client = adminPb ?? pb;
    for (const id of ids) {
      await deleteOrder(client, id);
    }
    return redirect("/backoffice/orders?success=bulkDeleted");
  } catch (e) {
    return redirect("/backoffice/orders?error=" + encodeURIComponent((e as Error)?.message ?? "Erro ao eliminar pedidos"));
  }
}

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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  return (
    <div>
      <BackofficeToast
        successParam={successParam}
        successMessage={
          successParam === "bulkDeleted"
            ? "Pedidos eliminados"
            : successParam === "deleted"
              ? "Pedido eliminado"
              : "Pedido guardado com sucesso"
        }
      />
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Pedidos</h1>
          <p className="text-slate-600 mt-1">
            Ver e gerir pedidos. Clique num pedido para ver detalhes, utilizador e editar ou eliminar.
          </p>
        </div>
        {selectedIds.size > 0 && (
          <Form method="post" onSubmit={(e) => !confirm(`Eliminar ${selectedIds.size} pedido(s) selecionado(s)?`) && e.preventDefault()}>
            <input type="hidden" name="intent" value="bulkDelete" />
            {Array.from(selectedIds).map((id) => (
              <input key={id} type="hidden" name="ids" value={id} />
            ))}
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-medium text-sm"
            >
              <Trash2 className="w-4 h-4" aria-hidden />
              Eliminar selecionados ({selectedIds.size})
            </button>
          </Form>
        )}
      </div>
      <div className="bg-white rounded-sm border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left" role="table" aria-label="Lista de pedidos">
          <caption className="sr-only">Lista de pedidos com data, utilizador e ações</caption>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th scope="col" className="px-4 py-4 w-10">
                <label className="sr-only">Selecionar todos</label>
                <input
                  type="checkbox"
                  checked={orders.length > 0 && orders.every((o: OrderRecordWithUser) => selectedIds.has(o.id))}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedIds(new Set(orders.map((o: OrderRecordWithUser) => o.id)));
                    else setSelectedIds(new Set());
                  }}
                  className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500"
                  aria-label="Selecionar todos"
                />
              </th>
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
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
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
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(order.id)}
                        onChange={(e) => {
                          setSelectedIds((prev) => {
                            const next = new Set(prev);
                            if (e.target.checked) next.add(order.id);
                            else next.delete(order.id);
                            return next;
                          });
                        }}
                        className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500"
                        aria-label={`Selecionar pedido #${order.id.slice(0, 8)}`}
                      />
                    </td>
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
