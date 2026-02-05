import { useLoaderData, Form, useNavigation, useActionData } from "react-router";
import { BackofficeToast } from "~/components/Backoffice/BackofficeToast";
import { createPocketBase } from "~/lib/pocketbase";
import type { Route } from "./+types/backoffice.translations";
import { translations } from "~/lib/translations";

type FlattenEntry = { group: string; key: string; value_pt: string; value_en: string };

function collectStringKeys(lang: Record<string, Record<string, unknown>>): Set<string> {
  const set = new Set<string>();
  for (const group in lang) {
    const g = lang[group];
    if (typeof g !== "object" || g === null || Array.isArray(g)) continue;
    for (const key in g) {
      if (typeof g[key] === "string") set.add(group + "." + key);
    }
  }
  return set;
}

function flattenTranslationsFromCode(): FlattenEntry[] {
  const pt = translations.pt as Record<string, Record<string, unknown>>;
  const en = translations.en as Record<string, Record<string, unknown>>;
  const allKeys = new Set<string>([...collectStringKeys(pt), ...collectStringKeys(en)]);
  const entries: FlattenEntry[] = [];
  for (const groupKey of allKeys) {
    const [group, key] = groupKey.split(".", 2);
    if (!group || !key) continue;
    const vPt = pt[group]?.[key];
    const vEn = en[group]?.[key];
    entries.push({
      group,
      key,
      value_pt: typeof vPt === "string" ? vPt : "",
      value_en: typeof vEn === "string" ? vEn : "",
    });
  }
  entries.sort((a, b) => (a.group + "." + a.key).localeCompare(b.group + "." + b.key));
  return entries;
}

export async function loader({ request }: Route.LoaderArgs) {
  const pb = createPocketBase(request);
  if (!pb.authStore.isValid) return { merged: [], error: "auth" as const };
  const user = pb.authStore.model as { admin?: boolean } | null;
  if (!user?.admin) return { merged: [], error: "auth" as const };

  const codeEntries = flattenTranslationsFromCode();
  let pbRecords: { id: string; group: string; key: string; value_pt?: string; value_en?: string }[] = [];
  try {
    pbRecords = await pb.collection("translations").getFullList({ sort: "group,key" });
  } catch (e: any) {
    if (e?.status === 404 || e?.message?.includes("collection")) {
      return { merged: codeEntries.map((e) => ({ ...e, id: undefined })), error: "no_collection" as const };
    }
    return { merged: [], error: "load" as const };
  }

  const pbByGroupKey = new Map<string, { id: string; value_pt?: string; value_en?: string }>();
  for (const r of pbRecords) {
    pbByGroupKey.set(r.group + "." + r.key, { id: r.id, value_pt: r.value_pt, value_en: r.value_en });
  }

  const merged = codeEntries.map((e) => {
    const pbRec = pbByGroupKey.get(e.group + "." + e.key);
    if (pbRec) {
      return {
        id: pbRec.id,
        group: e.group,
        key: e.key,
        value_pt: pbRec.value_pt ?? e.value_pt,
        value_en: pbRec.value_en ?? e.value_en,
      };
    }
    return { id: undefined, group: e.group, key: e.key, value_pt: e.value_pt, value_en: e.value_en };
  });

  return { merged, error: null };
}

export async function action({ request }: Route.ActionArgs) {
  const pb = createPocketBase(request);
  if (!pb.authStore.isValid) return null;
  const user = pb.authStore.model as { admin?: boolean } | null;
  if (!user?.admin) return null;

  const formData = await request.formData();
  const intent = formData.get("intent");
  const id = formData.get("id") as string;
  const key = formData.get("key") as string;
  const group = formData.get("group") as string;
  const value_pt = formData.get("value_pt") as string;
  const value_en = formData.get("value_en") as string;

  try {
    if (intent === "update" && id) {
      await pb.collection("translations").update(id, { value_pt: value_pt ?? "", value_en: value_en ?? "" });
    }
    if (intent === "create" && key && group) {
      await pb.collection("translations").create({ key, group, value_pt: value_pt ?? "", value_en: value_en ?? "" });
    }
    if (intent === "sync_from_code") {
      const codeEntries = flattenTranslationsFromCode();
      let pbRecords: { id: string; group: string; key: string }[] = [];
      try {
        pbRecords = await pb.collection("translations").getFullList({ fields: "id,group,key" });
      } catch {
        // collection may not exist
      }
      const pbByGroupKey = new Map<string, { id: string }>();
      for (const r of pbRecords) {
        pbByGroupKey.set(r.group + "." + r.key, { id: r.id });
      }
      for (const e of codeEntries) {
        const existing = pbByGroupKey.get(e.group + "." + e.key);
        if (existing) {
          await pb.collection("translations").update(existing.id, { value_pt: e.value_pt, value_en: e.value_en });
        } else {
          await pb.collection("translations").create({ group: e.group, key: e.key, value_pt: e.value_pt, value_en: e.value_en });
        }
      }
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export function meta() {
  return [{ title: "Traduções – Walkys Backoffice" }];
}

export default function BackofficeTranslations() {
  const { merged, error } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();

  if (error === "no_collection") {
    return (
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Traduções</h1>
        <div className="bg-slate-800/10 border border-slate-700/30 rounded-sm p-6 sm:p-8 text-slate-800 shadow-sm mt-6">
          <p className="font-medium mb-2">Não existe a coleção &quot;translations&quot; no PocketBase</p>
          <p className="text-sm mb-4">
            Para editar os textos da interface (cabeçalho, rodapé, botões, etc.) a partir do backoffice, crie uma coleção no PocketBase com o nome <strong>translations</strong> e os campos:
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 mb-4">
            <li><strong>key</strong> (texto) – ex.: &quot;header.begin&quot;</li>
            <li><strong>group</strong> (texto) – ex.: &quot;header&quot;, &quot;footer&quot;</li>
            <li><strong>value_pt</strong> (texto) – português</li>
            <li><strong>value_en</strong> (texto) – inglês</li>
          </ul>
          <p className="text-sm text-neutral-600">
            O site usa atualmente traduções estáticas no código. Depois de criar a coleção, pode adicionar registos e, se quiser, alterar a aplicação para carregar da API.
          </p>
        </div>
      </div>
    );
  }

  if (error === "auth" || error === "load") {
    return (
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Traduções</h1>
        <p className="text-slate-600 mt-1">{error === "auth" ? "Tem de iniciar sessão como administrador." : "Erro ao carregar as traduções."}</p>
      </div>
    );
  }

  const hasMerged = merged && merged.length > 0;

  return (
    <div>
      <BackofficeToast actionData={actionData} successMessage="Traduções guardadas com sucesso" />
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Traduções</h1>
      <p className="text-slate-600 mt-1 mb-4">
        Todas as chaves do código (PT/EN). Edite e guarde; novos registos são criados no PocketBase quando não existem.
      </p>
      <Form method="post" className="mb-8">
        <input type="hidden" name="intent" value="sync_from_code" />
        <button
          type="submit"
          disabled={navigation.state === "submitting"}
          className="px-4 py-2.5 border border-slate-200 rounded-sm text-slate-700 hover:bg-slate-50 focus:ring-2 focus:ring-slate-500/50 focus:ring-offset-2 text-sm font-medium"
        >
          {navigation.state === "submitting" ? "A sincronizar…" : "Sincronizar a partir do código"}
        </button>
        <span className="ml-2 text-sm text-slate-500">Substitui valores no PocketBase pelos valores do código.</span>
      </Form>

      {!hasMerged ? (
        <div className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 sm:p-8 text-slate-600">
          <p>Nenhuma chave de tradução encontrada no código.</p>
        </div>
      ) : (
        <div className="space-y-6" role="list">
          {merged.map((r: { id?: string; group: string; key: string; value_pt?: string; value_en?: string }) => {
            const rowId = r.id ?? `${r.group}.${r.key}`;
            return (
              <section
                key={rowId}
                className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 sm:p-8"
                aria-labelledby={`translation-${rowId}`}
              >
                <h2 id={`translation-${rowId}`} className="text-lg font-semibold text-neutral-900 mb-2 font-mono">
                  {r.group}.{r.key}
                </h2>
                <Form method="post" className="space-y-4">
                  <input type="hidden" name="intent" value={r.id ? "update" : "create"} />
                  {r.id && <input type="hidden" name="id" value={r.id} />}
                  {!r.id && (
                    <>
                      <input type="hidden" name="group" value={r.group} />
                      <input type="hidden" name="key" value={r.key} />
                    </>
                  )}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label htmlFor={`value_pt-${rowId}`} className="block text-sm font-medium text-slate-700 mb-1">Português (PT)</label>
                      <input
                        id={`value_pt-${rowId}`}
                        name="value_pt"
                        type="text"
                        defaultValue={r.value_pt ?? ""}
                        className="w-full px-3 py-2 border border-slate-200 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label htmlFor={`value_en-${rowId}`} className="block text-sm font-medium text-slate-700 mb-1">Inglês (EN)</label>
                      <input
                        id={`value_en-${rowId}`}
                        name="value_en"
                        type="text"
                        defaultValue={r.value_en ?? ""}
                        className="w-full px-3 py-2 border border-slate-200 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={navigation.state === "submitting"}
                    className="px-4 py-2.5 bg-slate-700 text-white rounded-sm hover:bg-slate-800 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 text-sm font-medium"
                  >
                    {navigation.state === "submitting" ? "A guardar…" : "Guardar"}
                  </button>
                </Form>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
