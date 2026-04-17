import { Link, redirect, useLoaderData, useSearchParams, Form } from "react-router";
import { BackofficeToast } from "~/components/Backoffice/BackofficeToast";
import { createPocketBase, buildPocketBasePublicFileUrl, getBrowserPocketBaseFileUrl } from "~/lib/pocketbase";
import type { Route } from "./+types/backoffice.products";
import { Plus, Image as ImageIcon, Pencil, Trash2 } from "lucide-react";
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
    return redirect("/backoffice/products?error=" + encodeURIComponent("Nenhum produto selecionado."));
  }

  try {
    for (const id of ids) {
      await pb.collection("products").delete(id);
    }
    return redirect("/backoffice/products?success=bulkDeleted");
  } catch (e) {
    return redirect("/backoffice/products?error=" + encodeURIComponent((e as Error)?.message ?? "Erro ao eliminar produtos"));
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const pb = createPocketBase(request);
  if (!pb.authStore.isValid) return { products: [] };
  const user = pb.authStore.model as { admin?: boolean } | null;
  if (!user?.admin) return { products: [] };

  try {
    const products = await pb.collection("products").getFullList({ sort: "-created", expand: "category,collection" });
    let fileToken: string | undefined;
    if (pb.authStore.isValid) {
      try {
        const t = await pb.files.getToken();
        if (typeof t === "string" && t.length > 0) fileToken = t;
      } catch {
        /* optional */
      }
    }
    const enriched = products.map((p: { id: string; collectionId?: string; media?: string | string[] }) => {
      const collectionId = p.collectionId ?? "products";
      const file = Array.isArray(p.media) ? p.media[0] : p.media;
      const _thumbUrl =
        file && p.id
          ? getBrowserPocketBaseFileUrl(
              pb,
              { id: p.id, collectionId, collectionName: "products" },
              String(file),
              fileToken
            )
          : null;
      return { ...p, _thumbUrl };
    });
    return { products: enriched };
  } catch {
    return { products: [] };
  }
}

export function meta() {
  return [{ title: "Produtos – Walkys Backoffice" }];
}

function ProductImage({
  collectionId,
  recordId,
  media,
  thumbUrl,
}: {
  collectionId: string;
  recordId: string;
  media?: string | string[];
  thumbUrl?: string | null;
}) {
  const file = Array.isArray(media) ? media[0] : media;
  if (!file || !recordId) return (
    <span className="flex items-center justify-center w-12 h-12 rounded-sm bg-slate-100 text-slate-400" aria-hidden>
      <ImageIcon className="w-6 h-6" />
    </span>
  );
  const src =
    thumbUrl ||
    buildPocketBasePublicFileUrl(collectionId, recordId, String(file));
  return (
    <img src={src} alt="" className="w-12 h-12 rounded-sm object-cover border border-slate-200" width={48} height={48} />
  );
}

export default function BackofficeProducts() {
  const { products } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const successParam = searchParams.get("success");
  const errorParam = searchParams.get("error");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  return (
    <div>
      <BackofficeToast successParam={successParam} errorParam={errorParam} successMessage={successParam === "bulkDeleted" ? "Produtos eliminados" : "Produto criado com sucesso"} />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Produtos</h1>
          <p className="text-slate-600 mt-1">Edite nomes, descrições, imagens, categoria e coleção (PT / EN).</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Form method="post" onSubmit={(e) => !confirm(`Eliminar ${selectedIds.size} produto(s) selecionado(s)?`) && e.preventDefault()}>
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
          <Link
            to="/backoffice/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-sm hover:bg-slate-900 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 font-medium text-sm shadow-sm"
          >
            <Plus className="w-5 h-5" aria-hidden />
            Novo produto
          </Link>
        </div>
      </div>
      <div className="bg-white rounded-sm border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left" role="table" aria-label="Lista de produtos">
          <caption className="sr-only">Lista de produtos com nomes em português e inglês</caption>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th scope="col" className="px-4 py-4 w-10">
                <label className="sr-only">Selecionar todos</label>
                <input
                  type="checkbox"
                  checked={products.length > 0 && products.every((p: { id: string }) => selectedIds.has(p.id))}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedIds(new Set(products.map((p: { id: string }) => p.id)));
                    else setSelectedIds(new Set());
                  }}
                  className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500"
                  aria-label="Selecionar todos"
                />
              </th>
              <th scope="col" className="px-6 py-4 text-sm font-semibold text-slate-900 w-14">Imagem</th>
              <th scope="col" className="px-6 py-4 text-sm font-semibold text-slate-900">Nome (PT)</th>
              <th scope="col" className="px-6 py-4 text-sm font-semibold text-slate-900">Nome (EN)</th>
              <th scope="col" className="px-6 py-4 text-sm font-semibold text-slate-900">Slug</th>
              <th scope="col" className="px-6 py-4 text-sm font-semibold text-slate-900">Ativo</th>
              <th scope="col" className="px-6 py-4 text-sm font-semibold text-slate-900">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  Ainda não há produtos. Crie a coleção &quot;products&quot; no PocketBase e adicione um produto, ou crie um novo.
                </td>
              </tr>
            ) : (
              products.map((p: any) => (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(p.id)}
                      onChange={(e) => {
                        setSelectedIds((prev) => {
                          const next = new Set(prev);
                          if (e.target.checked) next.add(p.id);
                          else next.delete(p.id);
                          return next;
                        });
                      }}
                      className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500"
                      aria-label={`Selecionar ${p.name_pt ?? p.name_en ?? p.id}`}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <ProductImage
                      collectionId={p.collectionId ?? "products"}
                      recordId={p.id}
                      media={p.media}
                      thumbUrl={(p as { _thumbUrl?: string | null })._thumbUrl}
                    />
                  </td>
                  <td className="px-6 py-4 text-slate-900 font-medium">{p.name_pt ?? "—"}</td>
                  <td className="px-6 py-4 text-slate-900">{p.name_en ?? "—"}</td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-sm">{p.slug ?? "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-sm text-xs font-medium ${p.enabled ? "bg-slate-200 text-slate-800" : "bg-slate-100 text-slate-600"}`}>
                      {p.enabled ? "Sim" : "Não"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/backoffice/products/${p.id}`}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-sm text-slate-500 hover:text-slate-800 hover:bg-slate-200 focus:ring-2 focus:ring-slate-500/50"
                      aria-label="Editar produto"
                    >
                      <Pencil className="w-4 h-4" aria-hidden />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
