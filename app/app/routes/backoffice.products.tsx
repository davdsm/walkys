import { Link, useLoaderData, useSearchParams } from "react-router";
import { BackofficeToast } from "~/components/Backoffice/BackofficeToast";
import { createPocketBase } from "~/lib/pocketbase";
import type { Route } from "./+types/backoffice.products";
import { Plus, Image as ImageIcon, Pencil } from "lucide-react";

export async function loader({ request }: Route.LoaderArgs) {
  const pb = createPocketBase(request);
  if (!pb.authStore.isValid) return { products: [], baseUrl: "" };
  const user = pb.authStore.model as { admin?: boolean } | null;
  if (!user?.admin) return { products: [], baseUrl: "" };

  try {
    const products = await pb.collection("products").getFullList({ sort: "-created", expand: "category,collection" });
    const baseUrl = pb.baseUrl.replace(/\/$/, "");
    return { products, baseUrl };
  } catch {
    return { products: [], baseUrl: pb.baseUrl.replace(/\/$/, "") };
  }
}

export function meta() {
  return [{ title: "Produtos – Walkys Backoffice" }];
}

function ProductImage({ baseUrl, recordId, media }: { baseUrl: string; recordId: string; media?: string | string[] }) {
  const file = Array.isArray(media) ? media[0] : media;
  if (!file || !recordId || !baseUrl) return (
    <span className="flex items-center justify-center w-12 h-12 rounded-sm bg-slate-100 text-slate-400" aria-hidden>
      <ImageIcon className="w-6 h-6" />
    </span>
  );
  const src = `${baseUrl}/api/files/products/${recordId}/${file}`;
  return (
    <img src={src} alt="" className="w-12 h-12 rounded-sm object-cover border border-slate-200" width={48} height={48} />
  );
}

export default function BackofficeProducts() {
  const { products, baseUrl } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const successParam = searchParams.get("success");
  const errorParam = searchParams.get("error");

  return (
    <div>
      <BackofficeToast successParam={successParam} errorParam={errorParam} successMessage="Produto criado com sucesso" />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Produtos</h1>
          <p className="text-slate-600 mt-1">Edite nomes, descrições, imagens, categoria e coleção (PT / EN).</p>
        </div>
        <Link
          to="/backoffice/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-sm hover:bg-slate-900 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 font-medium text-sm shadow-sm"
        >
          <Plus className="w-5 h-5" aria-hidden />
          Novo produto
        </Link>
      </div>
      <div className="bg-white rounded-sm border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left" role="table" aria-label="Lista de produtos">
          <caption className="sr-only">Lista de produtos com nomes em português e inglês</caption>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
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
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  Ainda não há produtos. Crie a coleção &quot;products&quot; no PocketBase e adicione um produto, ou crie um novo.
                </td>
              </tr>
            ) : (
              products.map((p: any) => (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <ProductImage baseUrl={baseUrl || ""} recordId={p.id} media={p.media} />
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
