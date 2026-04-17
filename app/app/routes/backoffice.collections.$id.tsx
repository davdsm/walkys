import { useLoaderData, useParams, Form, useNavigation, redirect, useActionData } from "react-router";
import { BackofficeToast } from "~/components/Backoffice/BackofficeToast";
import { createPocketBase, getPocketBasePublicBaseUrl } from "~/lib/pocketbase";
import type { Route } from "./+types/backoffice.collections.$id";
import { Link } from "react-router";

export async function loader({ request, params }: Route.LoaderArgs) {
  const pb = createPocketBase(request);
  if (!pb.authStore.isValid) return redirect("/auth/login");
  const user = pb.authStore.model as { admin?: boolean } | null;
  if (!user?.admin) return redirect("/dashboard");

  const id = params.id;
  if (!id) return redirect("/backoffice/collections");
  if (id === "new") {
    return { collection: null, baseUrl: getPocketBasePublicBaseUrl(), isNew: true };
  }

  const collection = await pb.collection("collection").getOne(id).catch(() => null);
  if (!collection) return redirect("/backoffice/collections");
  return { collection, baseUrl: getPocketBasePublicBaseUrl(), isNew: false };
}

export async function action({ request, params }: Route.ActionArgs) {
  const pb = createPocketBase(request);
  if (!pb.authStore.isValid) return null;
  const user = pb.authStore.model as { admin?: boolean } | null;
  if (!user?.admin) return null;

  const id = params.id;
  if (!id) return null;

  const formData = await request.formData();
  const name_pt = (formData.get("name_pt") as string) ?? "";
  const name_en = (formData.get("name_en") as string) ?? "";
  const slug = (formData.get("slug") as string) ?? "";
  const imageFile = formData.get("image");

  try {
    if (id === "new") {
      const data = new FormData();
      data.append("name_pt", name_pt);
      data.append("name_en", name_en);
      data.append("slug", slug);
      if (imageFile instanceof File && imageFile.size > 0) data.append("image", imageFile);
      await pb.collection("collection").create(data);
      return redirect("/backoffice/collections?success=1");
    }

    const data: Record<string, string | File> = { name_pt, name_en, slug };
    if (imageFile instanceof File && imageFile.size > 0) data.image = imageFile;
    await pb.collection("collection").update(id, data);
    return { ok: true };
  } catch (e) {
    const msg = (e as Error)?.message ?? "Erro ao guardar coleção";
    if (id === "new") return redirect("/backoffice/collections?error=" + encodeURIComponent(msg));
    return { ok: false, error: msg };
  }
}

export function meta({ params }: Route.MetaArgs) {
  return [{ title: params.id === "new" ? "Nova coleção – Walkys Backoffice" : "Editar coleção – Walkys Backoffice" }];
}

export default function BackofficeCollectionEdit() {
  const { collection, baseUrl, isNew } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const c = collection as { id?: string; name_pt?: string; name_en?: string; slug?: string; image?: string | string[] } | null;

  const imageFile = c?.image ? (Array.isArray(c.image) ? c.image[0] : c.image) : null;
  const imageUrl = baseUrl && c?.id && imageFile ? `${baseUrl}/api/files/collection/${c.id}/${imageFile}` : null;

  return (
    <div>
      <BackofficeToast actionData={actionData} />
      <div className="mb-8">
        <Link to="/backoffice/collections" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
          ← Voltar às coleções
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-2">
          {isNew ? "Nova coleção" : "Editar coleção"}
        </h1>
        <p className="text-slate-600 mt-1">
          Campos da coleção PocketBase: nome (PT/EN), slug, imagem.
        </p>
      </div>

      <Form method="post" encType="multipart/form-data" className="space-y-8 max-w-4xl">
        <div className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">Nomes e slug</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="name_pt" className="block text-sm font-medium text-slate-700 mb-1">Nome (PT)</label>
              <input
                id="name_pt"
                name="name_pt"
                type="text"
                defaultValue={c?.name_pt ?? ""}
                className="w-full px-3 py-2 border border-slate-200 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50"
              />
            </div>
            <div>
              <label htmlFor="name_en" className="block text-sm font-medium text-slate-700 mb-1">Nome (EN)</label>
              <input
                id="name_en"
                name="name_en"
                type="text"
                defaultValue={c?.name_en ?? ""}
                className="w-full px-3 py-2 border border-slate-200 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50"
              />
            </div>
          </div>
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-slate-700 mb-1">Slug (URL)</label>
            <input
              id="slug"
              name="slug"
              type="text"
              defaultValue={c?.slug ?? ""}
              className="w-full px-3 py-2 border border-slate-200 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 font-mono"
            />
          </div>
        </div>

        <div className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">Imagem</h2>
          {imageUrl && (
            <div className="flex items-center gap-4">
              <img src={imageUrl} alt="" className="w-24 h-24 rounded-sm object-cover border border-slate-200" width={96} height={96} />
              <p className="text-sm text-slate-500">Imagem atual. Envie uma nova para substituir.</p>
            </div>
          )}
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-slate-700 mb-1">Ficheiro de imagem</label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              className="w-full px-3 py-2 border border-slate-200 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-slate-700 file:text-slate-100 file:font-medium"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={navigation.state === "submitting"}
            className="px-6 py-2.5 bg-slate-800 text-white rounded-sm hover:bg-slate-900 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 font-medium"
          >
            {navigation.state === "submitting" ? "A guardar…" : isNew ? "Criar coleção" : "Guardar coleção"}
          </button>
          <Link
            to="/backoffice/collections"
            className="px-6 py-2.5 border border-slate-300 rounded-sm text-slate-700 hover:bg-slate-50 focus:ring-2 focus:ring-slate-500/50 focus:ring-offset-2"
          >
            Cancelar
          </Link>
        </div>
      </Form>
    </div>
  );
}
