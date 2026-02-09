import { Link, redirect, useLoaderData, useSearchParams, Form } from "react-router";
import { BackofficeToast } from "~/components/Backoffice/BackofficeToast";
import { createPocketBase } from "~/lib/pocketbase";
import type { Route } from "./+types/backoffice.contact-replies";
import { MessageSquare, Mail, Calendar, Eye, Trash2 } from "lucide-react";
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
    return redirect("/backoffice/contact-replies?error=" + encodeURIComponent("Nenhuma mensagem selecionada."));
  }

  try {
    for (const id of ids) {
      await pb.collection("ContactFormReplies").delete(id);
    }
    return redirect("/backoffice/contact-replies?deleted=bulk");
  } catch (e) {
    return redirect("/backoffice/contact-replies?error=" + encodeURIComponent((e as Error)?.message ?? "Erro ao eliminar mensagens"));
  }
}

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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  return (
    <div>
      <BackofficeToast successParam={deletedParam} errorParam={errorParam} successMessage={deletedParam === "bulk" ? "Mensagens eliminadas" : "Mensagem eliminada"} />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Mensagens de contacto
          </h1>
          <p className="text-slate-600 mt-1">
            Mensagens enviadas pelo formulário de contacto do site.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Form method="post" onSubmit={(e) => !confirm(`Eliminar ${selectedIds.size} mensagem(ns) selecionada(s)?`) && e.preventDefault()}>
              <input type="hidden" name="intent" value="bulkDelete" />
              {Array.from(selectedIds).map((id) => (
                <input key={id} type="hidden" name="ids" value={id} />
              ))}
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-medium text-sm"
              >
                <Trash2 className="w-4 h-4" aria-hidden />
                Eliminar selecionadas ({selectedIds.size})
              </button>
            </Form>
          )}
        </div>
      </div>

      <div className="bg-white rounded-sm border border-slate-200/80 shadow-sm shadow-slate-200/50 overflow-hidden">
        <table className="w-full text-left" role="table" aria-label="Lista de mensagens de contacto">
          <caption className="sr-only">Mensagens do formulário de contacto</caption>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th scope="col" className="px-4 py-4 w-10">
                <label className="sr-only">Selecionar todas</label>
                <input
                  type="checkbox"
                  checked={replies.length > 0 && replies.every((r: { id: string }) => selectedIds.has(r.id))}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedIds(new Set(replies.map((r: { id: string }) => r.id)));
                    else setSelectedIds(new Set());
                  }}
                  className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500"
                  aria-label="Selecionar todas"
                />
              </th>
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
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
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
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(r.id)}
                      onChange={(e) => {
                        setSelectedIds((prev) => {
                          const next = new Set(prev);
                          if (e.target.checked) next.add(r.id);
                          else next.delete(r.id);
                          return next;
                        });
                      }}
                      className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500"
                      aria-label={`Selecionar ${r.Name ?? r.Email ?? r.id}`}
                    />
                  </td>
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
