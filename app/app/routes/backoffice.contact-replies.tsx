import { Link, useLoaderData, useSearchParams } from "react-router";
import { BackofficeToast } from "~/components/Backoffice/BackofficeToast";
import { createPocketBase } from "~/lib/pocketbase";
import type { Route } from "./+types/backoffice.contact-replies";
import { MessageSquare, Mail, Calendar, Eye } from "lucide-react";

export async function loader({ request }: Route.LoaderArgs) {
  const pb = createPocketBase(request);
  if (!pb.authStore.isValid) return { replies: [] };
  const user = pb.authStore.model as { admin?: boolean } | null;
  if (!user?.admin) return { replies: [] };

  try {
    const replies = await pb.collection("ContactFormReplies").getFullList({
      sort: "-created",
    });
    return { replies };
  } catch {
    return { replies: [] };
  }
}

export function meta() {
  return [{ title: "Mensagens de contacto – Walkys Backoffice" }];
}

function formatDate(iso: string | undefined) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso ?? "—";
  }
}

export default function BackofficeContactReplies() {
  const { replies } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const deletedParam = searchParams.get("deleted");
  const errorParam = searchParams.get("error");

  return (
    <div>
      <BackofficeToast successParam={deletedParam} errorParam={errorParam} successMessage="Mensagem eliminada" />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Mensagens de contacto
          </h1>
          <p className="text-slate-600 mt-1">
            Mensagens enviadas pelo formulário de contacto do site.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-sm border border-slate-200/80 shadow-sm shadow-slate-200/50 overflow-hidden">
        <table className="w-full text-left" role="table" aria-label="Lista de mensagens de contacto">
          <caption className="sr-only">Mensagens do formulário de contacto</caption>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th scope="col" className="px-6 py-4 text-sm font-semibold text-slate-900">
                Nome
              </th>
              <th scope="col" className="px-6 py-4 text-sm font-semibold text-slate-900">
                Email
              </th>
              <th scope="col" className="px-6 py-4 text-sm font-semibold text-slate-900">
                Assunto
              </th>
              <th scope="col" className="px-6 py-4 text-sm font-semibold text-slate-900">
                Data
              </th>
              <th scope="col" className="px-6 py-4 text-sm font-semibold text-slate-900">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {replies.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  <MessageSquare className="w-10 h-10 mx-auto text-slate-300 mb-2" aria-hidden />
                  Ainda não há mensagens de contacto.
                </td>
              </tr>
            ) : (
              replies.map((r: { id: string; Name?: string; Email?: string; Subject?: string; created?: string }) => (
                <tr
                  key={r.id}
                  className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4 text-slate-900 font-medium">{r.Name ?? "—"}</td>
                  <td className="px-6 py-4 text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-slate-400" aria-hidden />
                      {r.Email ?? "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700 max-w-[200px] truncate" title={r.Subject ?? ""}>
                    {r.Subject ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" aria-hidden />
                    {formatDate(r.created)}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/backoffice/contact-replies/${r.id}`}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-sm text-slate-500 hover:text-slate-800 hover:bg-slate-200 focus:ring-2 focus:ring-slate-500/50"
                      aria-label="Ver mensagem"
                    >
                      <Eye className="w-4 h-4" aria-hidden />
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
