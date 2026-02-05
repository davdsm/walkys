import { Link, useLoaderData, useSearchParams } from "react-router";
import { BackofficeToast } from "~/components/Backoffice/BackofficeToast";
import { createPocketBase, createPocketBaseAsAdmin } from "~/lib/pocketbase";
import { createUserService } from "~/lib/services/user.service";
import type { UserRecord } from "~/lib/services/user.service";
import type { Route } from "./+types/backoffice.users";
import { Plus, Pencil, Trash2 } from "lucide-react";

export async function loader({ request }: Route.LoaderArgs) {
  const pb = createPocketBase(request);
  if (!pb.authStore.isValid) return { users: [] as UserRecord[], adminConfigured: false };
  const currentUser = pb.authStore.model as { admin?: boolean } | null;
  if (!currentUser?.admin) return { users: [] as UserRecord[], adminConfigured: false };

  try {
    // Use PocketBase dashboard admin so we bypass API rules and get all users with email.
    // Without admin client, listing uses current user auth and emails are often hidden.
    const adminPb = await createPocketBaseAsAdmin();
    if (!adminPb) {
      return { users: [] as UserRecord[], adminConfigured: false };
    }
    const userService = createUserService(adminPb);
    const users = await userService.getFullList();
    return { users, adminConfigured: true };
  } catch {
    return { users: [] as UserRecord[], adminConfigured: false };
  }
}

export function meta() {
  return [{ title: "Utilizadores – Walkys Backoffice" }];
}

export default function BackofficeUsers() {
  const { users, adminConfigured } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const successParam = searchParams.get("success");
  const errorParam = searchParams.get("error");

  return (
    <div>
      <BackofficeToast
        successParam={successParam}
        errorParam={errorParam}
        successMessage="Utilizador guardado com sucesso"
      />
      {!adminConfigured && (
        <div className="mb-6 rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Para listar utilizadores e ver os respetivos emails, configure no <code className="rounded bg-amber-100 px-1">.env</code> as
          variáveis <code className="rounded bg-amber-100 px-1">API_PB_ADMIN_EMAIL</code> e{" "}
          <code className="rounded bg-amber-100 px-1">API_PB_ADMIN_PASSWORD</code> com as credenciais do painel PocketBase (login em /_/), não de um utilizador da aplicação.
        </div>
      )}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Utilizadores</h1>
          <p className="text-slate-600 mt-1">
            Crie, edite e remova utilizadores. Marque como administrador para acesso ao backoffice.
          </p>
        </div>
        <Link
          to="/backoffice/users/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-sm hover:bg-slate-900 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 font-medium text-sm shadow-sm"
        >
          <Plus className="w-5 h-5" aria-hidden />
          Novo utilizador
        </Link>
      </div>
      <div className="bg-white rounded-sm border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left" role="table" aria-label="Lista de utilizadores">
          <caption className="sr-only">Lista de utilizadores com email e função</caption>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th scope="col" className="px-6 py-4 text-sm font-semibold text-slate-900">
                Email
              </th>
              <th scope="col" className="px-6 py-4 text-sm font-semibold text-slate-900">
                Nome
              </th>
              <th scope="col" className="px-6 py-4 text-sm font-semibold text-slate-900">
                Função
              </th>
              <th scope="col" className="px-6 py-4 text-sm font-semibold text-slate-900">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                  Ainda não há utilizadores. Crie um novo utilizador.
                </td>
              </tr>
            ) : (
              users.map((u: UserRecord) => (
                <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-900 font-medium">{u.email ?? "—"}</td>
                  <td className="px-6 py-4 text-slate-700">{u.name ?? "—"}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-sm text-xs font-medium ${
                        u.admin ? "bg-slate-800 text-white" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {u.admin ? "Administrador" : "Utilizador"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Link
                        to={`/backoffice/users/${u.id}`}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-sm text-slate-500 hover:text-slate-800 hover:bg-slate-200 focus:ring-2 focus:ring-slate-500/50"
                        aria-label="Editar utilizador"
                      >
                        <Pencil className="w-4 h-4" aria-hidden />
                      </Link>
                      <Link
                        to={`/backoffice/users/${u.id}?delete=1`}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-sm text-slate-500 hover:text-red-700 hover:bg-red-50 focus:ring-2 focus:ring-red-500/50"
                        aria-label="Remover utilizador"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden />
                      </Link>
                    </div>
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
