import { useLoaderData, useParams, Link, Form, useNavigation, redirect } from "react-router";
import { createPocketBase } from "~/lib/pocketbase";
import type { Route } from "./+types/backoffice.contact-replies.$id";
import { MessageSquare, Mail, User, Building, Calendar, Trash2, ArrowLeft } from "lucide-react";

export async function loader({ request, params }: Route.LoaderArgs) {
  const pb = createPocketBase(request);
  if (!pb.authStore.isValid) return redirect("/auth/login");
  const user = pb.authStore.model as { admin?: boolean } | null;
  if (!user?.admin) return redirect("/dashboard");

  const id = params.id;
  if (!id) return redirect("/backoffice/contact-replies");

  try {
    const reply = await pb.collection("ContactFormReplies").getOne(id);
    return { reply };
  } catch {
    return redirect("/backoffice/contact-replies");
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const pb = createPocketBase(request);
  if (!pb.authStore.isValid) return null;
  const user = pb.authStore.model as { admin?: boolean } | null;
  if (!user?.admin) return null;

  try {
    const intent = (await request.formData()).get("intent");
    if (intent === "delete" && params.id) {
      await pb.collection("ContactFormReplies").delete(params.id);
      return redirect("/backoffice/contact-replies?deleted=1");
    }
  } catch (e) {
    return redirect("/backoffice/contact-replies?error=" + encodeURIComponent((e as Error)?.message ?? "Erro ao eliminar"));
  }
  return null;
}

export function meta() {
  return [{ title: "Mensagem – Walkys Backoffice" }];
}

function formatDate(iso: string | undefined) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-PT", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso ?? "—";
  }
}

export default function BackofficeContactReplyDetail() {
  const { reply } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const r = reply as {
    id: string;
    Name?: string;
    Email?: string;
    Subject?: string;
    Message?: string;
    Company?: string;
    created?: string;
    updated?: string;
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            to="/backoffice/contact-replies"
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden />
            Voltar às mensagens
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-2">
            Mensagem de contacto
          </h1>
          <p className="text-slate-600 mt-1">
            {r.Subject ? `Assunto: ${r.Subject}` : "Detalhe da mensagem"}
          </p>
        </div>
        <Form method="post" onSubmit={(e) => !confirm("Tem a certeza que deseja eliminar esta mensagem?") && e.preventDefault()}>
          <input type="hidden" name="intent" value="delete" />
          <button
            type="submit"
            disabled={navigation.state === "submitting"}
            className="inline-flex items-center justify-center w-9 h-9 rounded-sm border border-red-200 text-red-600 hover:bg-red-50 focus:ring-2 focus:ring-red-500/50 disabled:opacity-50"
            aria-label={navigation.state === "submitting" ? "A eliminar…" : "Eliminar mensagem"}
            title="Eliminar mensagem"
          >
            <Trash2 className="w-4 h-4" aria-hidden />
          </button>
        </Form>
      </div>

      <div className="space-y-6 max-w-3xl">
        <section
          className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 sm:p-8"
          aria-labelledby="reply-meta"
        >
          <h2 id="reply-meta" className="sr-only">
            Remetente e data
          </h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-sm bg-slate-200 text-slate-800 shrink-0" aria-hidden>
                <User className="w-5 h-5" />
              </span>
              <div>
                <dt className="text-sm font-medium text-slate-500">Nome</dt>
                <dd className="text-slate-900 font-medium mt-0.5">{r.Name ?? "—"}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-sm bg-slate-100 text-slate-600 shrink-0" aria-hidden>
                <Mail className="w-5 h-5" />
              </span>
              <div>
                <dt className="text-sm font-medium text-slate-500">Email</dt>
                <dd className="text-slate-900 mt-0.5 break-all">{r.Email ?? "—"}</dd>
              </div>
            </div>
            {r.Company ? (
              <div className="flex items-start gap-3 sm:col-span-2">
                <span className="flex items-center justify-center w-10 h-10 rounded-sm bg-slate-100 text-slate-600 shrink-0" aria-hidden>
                  <Building className="w-5 h-5" />
                </span>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Empresa</dt>
                  <dd className="text-slate-900 mt-0.5">{r.Company}</dd>
                </div>
              </div>
            ) : null}
            <div className="flex items-start gap-3 sm:col-span-2">
              <span className="flex items-center justify-center w-10 h-10 rounded-sm bg-slate-100 text-slate-600 shrink-0" aria-hidden>
                <Calendar className="w-5 h-5" />
              </span>
              <div>
                <dt className="text-sm font-medium text-slate-500">Data</dt>
                <dd className="text-slate-900 mt-0.5">{formatDate(r.created)}</dd>
              </div>
            </div>
          </dl>
        </section>

        <section
          className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 sm:p-8"
          aria-labelledby="reply-content"
        >
          <h2 id="reply-content" className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4">
            <MessageSquare className="w-5 h-5 text-slate-700" aria-hidden />
            Assunto e mensagem
          </h2>
          <p className="text-slate-700 font-medium mb-3">{r.Subject ?? "—"}</p>
          <div className="rounded-sm bg-slate-50 border border-slate-200 p-4 text-slate-700 whitespace-pre-wrap leading-relaxed">
            {r.Message ?? "—"}
          </div>
        </section>
      </div>
    </div>
  );
}
