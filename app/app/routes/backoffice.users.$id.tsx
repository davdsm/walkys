import { useLoaderData, useParams, Form, useNavigation, redirect, useActionData } from "react-router";
import { Link } from "react-router";
import { BackofficeToast } from "~/components/Backoffice/BackofficeToast";
import { createPocketBase } from "~/lib/pocketbase";
import { createUserService } from "~/lib/services/user.service";
import type { UserRecord } from "~/lib/services/user.service";
import type { Route } from "./+types/backoffice.users.$id";

function parseCatalogProductIds(record: UserRecord): string[] {
  const raw = record.catalog_products;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => (typeof item === "string" ? item : (item as { id?: string })?.id))
    .filter((id): id is string => typeof id === "string" && id.length > 0);
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const pb = createPocketBase(request);
  if (!pb.authStore.isValid) return redirect("/auth/login");
  const currentUser = pb.authStore.model as { admin?: boolean } | null;
  if (!currentUser?.admin) return redirect("/dashboard");

  const id = params.id;
  if (!id || id === "new") {
    return { user: null, isNew: true, products: [], catalogProductIds: [] };
  }

  try {
    const userService = createUserService(pb);
    const userRecord = await userService.getOne(id);
    const catalogProductIds = parseCatalogProductIds(userRecord);

    let products: { id: string; name_pt?: string; name_en?: string }[] = [];
    try {
      products = await pb.collection("products").getFullList({ fields: "id,name_pt,name_en", sort: "name_pt" });
    } catch {
      // products collection may be missing
    }
    return { user: userRecord, isNew: false, products, catalogProductIds };
  } catch {
    return redirect("/backoffice/users");
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const pb = createPocketBase(request);
  if (!pb.authStore.isValid) return { ok: false, error: "Sessão inválida" };
  const currentUser = pb.authStore.model as { admin?: boolean; id?: string } | null;
  if (!currentUser?.admin) return { ok: false, error: "Sem permissão" };

  const id = params.id;
  const formData = await request.formData();
  const intent = formData.get("intent");
  const userService = createUserService(pb);

  try {
    if (intent === "delete" && id && id !== "new") {
      if (id === currentUser.id) {
        return { ok: false, error: "Não pode remover a sua própria conta." };
      }
      await userService.delete(id);
      return redirect("/backoffice/users?success=deleted");
    }

    const email = (formData.get("email") as string)?.trim() ?? "";
    const name = (formData.get("name") as string)?.trim() ?? "";
    const admin = formData.get("admin") === "on";
    const password = formData.get("password") as string;
    const passwordConfirm = formData.get("passwordConfirm") as string;

    if (intent === "create" && (!id || id === "new")) {
      if (!email) return { ok: false, error: "Email é obrigatório." };
      if (!password || password.length < 8) return { ok: false, error: "Palavra-passe deve ter pelo menos 8 caracteres." };
      if (password !== passwordConfirm) return { ok: false, error: "As palavras-passe não coincidem." };
      await userService.create({
        email,
        password,
        passwordConfirm,
        name: name || undefined,
        admin,
      });
      return redirect("/backoffice/users?success=1");
    }

    if (intent === "update" && id && id !== "new") {
      const catalogProductIds = formData.getAll("catalog_products").filter((v): v is string => typeof v === "string" && v.length > 0);
      await userService.update(id, {
        email,
        name: name || "",
        admin,
        catalog_products: catalogProductIds,
        ...(password && password.length >= 8 && passwordConfirm
          ? { password, passwordConfirm }
          : {}),
      });
      return { ok: true };
    }
  } catch (e) {
    const msg = (e as Error)?.message ?? "Erro ao guardar";
    return { ok: false, error: msg };
  }
  return { ok: false, error: "Ação desconhecida" };
}

export function meta({ params }: Route.MetaArgs) {
  return [{ title: params.id === "new" ? "Novo utilizador – Walkys Backoffice" : "Editar utilizador – Walkys Backoffice" }];
}

export default function BackofficeUserEdit() {
  const { user, isNew, products = [], catalogProductIds = [] } = useLoaderData<typeof loader>();
  const params = useParams();
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const id = params.id;
  const showDelete = !isNew && id && id !== "new";

  const record = user as UserRecord | null;
  const email = record?.email ?? "";
  const name = record?.name ?? "";
  const isAdmin = record?.admin ?? false;

  return (
    <div>
      <BackofficeToast actionData={actionData} />
      <div className="mb-8">
        <Link to="/backoffice/users" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
          ← Voltar aos utilizadores
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-2">
          {isNew ? "Novo utilizador" : "Editar utilizador"}
        </h1>
        <p className="text-slate-600 mt-1">
          {isNew ? "Crie um novo utilizador (email e palavra-passe obrigatórios)." : "Altere email, nome, palavra-passe ou função. Deixe a palavra-passe em branco para manter a atual."}
        </p>
      </div>

      <Form method="post" className="space-y-8 max-w-xl" key={record?.id ?? "new"}>
        <input type="hidden" name="intent" value={isNew ? "create" : "update"} />
        <div className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={email}
              className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900"
              placeholder="utilizador@exemplo.pt"
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              Nome
            </label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={name}
              className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900"
              placeholder="Nome completo"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Palavra-passe {isNew ? <span className="text-red-600">*</span> : "(deixe em branco para manter)"}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isNew ? "new-password" : "new-password"}
              minLength={isNew ? 8 : 0}
              className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900"
              placeholder={isNew ? "Mínimo 8 caracteres" : "Nova palavra-passe (opcional)"}
            />
          </div>
          {isNew && (
            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-slate-700 mb-1">
                Confirmar palavra-passe <span className="text-red-600">*</span>
              </label>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                autoComplete="new-password"
                minLength={8}
                className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900"
                placeholder="Repita a palavra-passe"
              />
            </div>
          )}
          {!isNew && (
            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-slate-700 mb-1">
                Confirmar nova palavra-passe
              </label>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                autoComplete="new-password"
                className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900"
                placeholder="Só se alterar a palavra-passe acima"
              />
            </div>
          )}
          <div className="flex items-center gap-3">
            <input
              id="admin"
              name="admin"
              type="checkbox"
              defaultChecked={isAdmin}
              className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500"
            />
            <label htmlFor="admin" className="text-sm font-medium text-slate-700">
              Administrador (acesso ao backoffice)
            </label>
          </div>
        </div>

        {!isNew && products.length > 0 && (
          <div className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Produtos no catálogo</h2>
            <p className="text-sm text-slate-600 mb-4">
              Escolha quais produtos este utilizador vê na página Catálogo (/catalog). Se não selecionar nenhum, será mostrada a mensagem &quot;Nenhum produto atribuído&quot;.
            </p>
            <div className="max-h-60 overflow-y-auto p-2 border border-slate-200 rounded-sm bg-slate-50 space-y-2">
              {products.map((p: { id: string; name_pt?: string; name_en?: string }) => (
                <label key={p.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-2 rounded-sm">
                  <input
                    type="checkbox"
                    name="catalog_products"
                    value={p.id}
                    defaultChecked={catalogProductIds.includes(p.id)}
                    className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500"
                  />
                  <span className="text-sm text-slate-700">{p.name_pt ?? p.name_en ?? p.id}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={navigation.state === "submitting"}
            className="px-4 py-2.5 bg-slate-800 text-white rounded-sm hover:bg-slate-900 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 font-medium text-sm"
          >
            {navigation.state === "submitting" ? "A guardar…" : isNew ? "Criar utilizador" : "Guardar alterações"}
          </button>
          {showDelete && (
            <Link
              to="/backoffice/users"
              className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-sm hover:bg-slate-50 font-medium text-sm"
            >
              Cancelar
            </Link>
          )}
        </div>
      </Form>

      {showDelete && (
        <div className="mt-12 pt-8 border-t border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Zona de perigo</h2>
          <p className="text-slate-600 text-sm mb-4">
            Remover este utilizador é permanente. O utilizador deixará de poder iniciar sessão.
          </p>
          <Form method="post" onSubmit={(e) => !confirm("Tem a certeza que deseja remover este utilizador?") && e.preventDefault()}>
            <input type="hidden" name="intent" value="delete" />
            <button
              type="submit"
              disabled={navigation.state === "submitting"}
              className="px-4 py-2.5 bg-red-600 text-white rounded-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 font-medium text-sm"
            >
              Remover utilizador
            </button>
          </Form>
        </div>
      )}
    </div>
  );
}
