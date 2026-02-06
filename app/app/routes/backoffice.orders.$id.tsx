import { useLoaderData, useParams, Form, useNavigation, redirect, useActionData } from "react-router";
import { Link } from "react-router";
import { BackofficeToast } from "~/components/Backoffice/BackofficeToast";
import { createPocketBase, createPocketBaseAsAdmin } from "~/lib/pocketbase";
import {
  getOrderById,
  updateOrder,
  deleteOrder,
  ORDER_STATUSES,
  type OrderRecordWithUser,
  type OrderItem,
  type OrderStatus,
} from "~/lib/services";
import type { Route } from "./+types/backoffice.orders.$id";

export async function loader({ request, params }: Route.LoaderArgs) {
  const pb = createPocketBase(request);
  if (!pb.authStore.isValid) return redirect("/auth/login");
  const currentUser = pb.authStore.model as { admin?: boolean } | null;
  if (!currentUser?.admin) return redirect("/dashboard");

  const id = params.id;
  if (!id) return redirect("/backoffice/orders");

  try {
    const adminPb = await createPocketBaseAsAdmin();
    const client = adminPb ?? pb;
    const order = await getOrderById(client, id);
    if (!order) return redirect("/backoffice/orders");
    return { order };
  } catch {
    return redirect("/backoffice/orders");
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const pb = createPocketBase(request);
  if (!pb.authStore.isValid) return { ok: false, error: "Sessão inválida" };
  const currentUser = pb.authStore.model as { admin?: boolean } | null;
  if (!currentUser?.admin) return { ok: false, error: "Sem permissão" };

  const id = params.id;
  if (!id) return { ok: false, error: "ID em falta" };

  const formData = await request.formData();
  const intent = formData.get("intent");

  const adminPb = await createPocketBaseAsAdmin();
  const client = adminPb ?? pb;

  try {
    if (intent === "delete") {
      await deleteOrder(client, id);
      return redirect("/backoffice/orders?success=deleted");
    }

    if (intent === "updateStatus") {
      const status = formData.get("status") as OrderStatus | null;
      if (status && ORDER_STATUSES.includes(status)) {
        await updateOrder(client, id, { status });
      }
      return { ok: true };
    }

    if (intent === "update") {
      const status = formData.get("status") as OrderStatus | null;
      const itemsJson = formData.get("items") as string | null;
      const updates: { items?: OrderItem[]; status?: OrderStatus } = {};
      if (status && ORDER_STATUSES.includes(status)) {
        updates.status = status;
      }
      if (itemsJson) {
        let items: OrderItem[];
        try {
          items = JSON.parse(itemsJson) as OrderItem[];
        } catch {
          return { ok: false, error: "JSON dos itens inválido." };
        }
        if (!Array.isArray(items)) return { ok: false, error: "Itens devem ser uma lista." };
        const valid = items.every(
          (i) =>
            typeof i === "object" &&
            i !== null &&
            typeof (i as OrderItem).productId === "string" &&
            typeof (i as OrderItem).quantity === "number"
        );
        if (!valid) return { ok: false, error: "Cada item deve ter productId e quantity." };
        updates.items = items;
      }
      if (Object.keys(updates).length > 0) {
        await updateOrder(client, id, updates);
      }
      return { ok: true };
    }
  } catch (e) {
    const msg = (e as Error)?.message ?? "Erro ao guardar";
    return { ok: false, error: msg };
  }
  return { ok: false, error: "Ação desconhecida" };
}

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `Pedido #${params.id?.slice(0, 8) ?? ""} – Walkys Backoffice` }];
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
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return created;
  }
}

export default function BackofficeOrderDetail() {
  const { order } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const orderRecord = order as OrderRecordWithUser;
  const user = orderRecord.expand?.user;
  const items = Array.isArray(orderRecord.items) ? orderRecord.items : [];

  return (
    <div>
      <BackofficeToast actionData={actionData} successMessage="Pedido guardado com sucesso" />
      <div className="mb-8">
        <Link
          to="/backoffice/orders"
          className="text-slate-600 hover:text-slate-900 text-sm font-medium"
        >
          ← Voltar aos pedidos
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-2">
          Pedido #{orderRecord.id.slice(0, 8)}
        </h1>
        <p className="text-slate-600 mt-1">Data: {formatDate(orderRecord.created)}</p>
      </div>

      {/* Order status */}
      <div className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Estado do pedido</h2>
        <Form method="post" className="flex flex-wrap items-center gap-3">
          <input type="hidden" name="intent" value="updateStatus" />
          <label htmlFor="order-status" className="sr-only">
            Estado
          </label>
          <select
            id="order-status"
            name="status"
            defaultValue={orderRecord.status ?? "new"}
            className="px-3 py-2 border border-slate-300 rounded-sm text-sm font-medium bg-white text-slate-900 focus:ring-2 focus:ring-slate-400 focus:border-slate-500"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ADMIN_STATUS_LABELS[s] ?? s}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={navigation.state === "submitting"}
            className="px-4 py-2 bg-slate-800 text-white rounded-sm hover:bg-slate-900 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 font-medium text-sm"
          >
            {navigation.state === "submitting" ? "A guardar…" : "Guardar estado"}
          </button>
        </Form>
      </div>

      {/* User details */}
      <div className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Utilizador</h2>
        {user ? (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div>
              <dt className="text-slate-500 font-medium">Nome</dt>
              <dd className="text-slate-900">{user.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-500 font-medium">Email</dt>
              <dd className="text-slate-900">{user.email ?? "—"}</dd>
            </div>
            {user.address && (
              <div className="sm:col-span-2">
                <dt className="text-slate-500 font-medium">Morada</dt>
                <dd className="text-slate-900">{user.address}</dd>
              </div>
            )}
            {(user.postal_code || user.city) && (
              <div>
                <dt className="text-slate-500 font-medium">Código postal / Cidade</dt>
                <dd className="text-slate-900">
                  {[user.postal_code, user.city].filter(Boolean).join(" — ")}
                </dd>
              </div>
            )}
            {user.country && (
              <div>
                <dt className="text-slate-500 font-medium">País</dt>
                <dd className="text-slate-900">{user.country}</dd>
              </div>
            )}
            {user.nif && (
              <div>
                <dt className="text-slate-500 font-medium">NIF</dt>
                <dd className="text-slate-900">{user.nif}</dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="text-slate-500 text-sm">Utilizador não disponível (ID: {orderRecord.user})</p>
        )}
      </div>

      {/* Order items */}
      <div className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Itens do pedido</h2>
        {items.length === 0 ? (
          <p className="text-slate-500 text-sm">Nenhum item.</p>
        ) : (
          <table className="w-full text-left text-sm" role="table">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600">
                <th className="py-2 pr-4 font-medium">Produto</th>
                <th className="py-2 pr-4 font-medium">Tamanho</th>
                <th className="py-2 pr-4 font-medium">Qtd</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: OrderItem, idx: number) => (
                <tr key={idx} className="border-b border-slate-100">
                  <td className="py-2 pr-4 text-slate-900">
                    {(item as OrderItem & { product_name?: string }).productName ??
                      (item as OrderItem & { product_name?: string }).product_name ??
                      "—"}
                  </td>
                  <td className="py-2 pr-4 text-slate-700">{item.size ?? "—"}</td>
                  <td className="py-2 pr-4 text-slate-700">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit form: items as JSON */}
      <div className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Editar itens</h2>
        <p className="text-slate-600 text-sm mb-4">
          Pode alterar os itens em formato JSON. Cada item deve ter:{" "}
          <code className="bg-slate-100 px-1 rounded">productId</code>,{" "}
          <code className="bg-slate-100 px-1 rounded">productName</code>,{" "}
          <code className="bg-slate-100 px-1 rounded">size</code> (ou null),{" "}
          <code className="bg-slate-100 px-1 rounded">quantity</code>.
        </p>
        <Form method="post" className="space-y-4">
          <input type="hidden" name="intent" value="update" />
          <textarea
            name="items"
            rows={8}
            className="w-full px-3 py-2 border border-slate-300 rounded-sm font-mono text-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900"
            defaultValue={JSON.stringify(items, null, 2)}
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={navigation.state === "submitting"}
            className="px-4 py-2.5 bg-slate-800 text-white rounded-sm hover:bg-slate-900 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 font-medium text-sm"
          >
            {navigation.state === "submitting" ? "A guardar…" : "Guardar itens"}
          </button>
        </Form>
      </div>

      {/* Delete */}
      <div className="pt-8 border-t border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Zona de perigo</h2>
        <p className="text-slate-600 text-sm mb-4">
          Eliminar este pedido é permanente. O histórico do utilizador deixará de incluir este pedido.
        </p>
        <Form
          method="post"
          onSubmit={(e) =>
            !confirm("Tem a certeza que deseja eliminar este pedido?") && e.preventDefault()
          }
        >
          <input type="hidden" name="intent" value="delete" />
          <button
            type="submit"
            disabled={navigation.state === "submitting"}
            className="px-4 py-2.5 bg-red-600 text-white rounded-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 font-medium text-sm"
          >
            Eliminar pedido
          </button>
        </Form>
      </div>
    </div>
  );
}
