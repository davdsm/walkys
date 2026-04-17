import { useLoaderData, useParams, Form, useNavigation, redirect, useActionData } from "react-router";
import { BackofficeToast } from "~/components/Backoffice/BackofficeToast";
import { createPocketBase, getPocketBasePublicBaseUrl } from "~/lib/pocketbase";
import type { Route } from "./+types/backoffice.categories.$id";
import { Link } from "react-router";

export async function loader({ request, params }: Route.LoaderArgs) {
  const pb = createPocketBase(request);
  if (!pb.authStore.isValid) return redirect("/auth/login");
  const user = pb.authStore.model as { admin?: boolean } | null;
  if (!user?.admin) return redirect("/dashboard");

  const id = params.id;
  if (!id) return redirect("/backoffice/categories");
  if (id === "new") {
    return { category: null, baseUrl: getPocketBasePublicBaseUrl(), isNew: true };
  }

  const category = await pb.collection("category").getOne(id).catch(() => null);
  if (!category) return redirect("/backoffice/categories");
  return { category, baseUrl: getPocketBasePublicBaseUrl(), isNew: false };
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
  const description_pt = (formData.get("description_pt") as string) ?? "";
  const description_en = (formData.get("description_en") as string) ?? "";
  const slug = (formData.get("slug") as string) ?? "";
  const enable = formData.get("enable") === "on";
  const imageFile = formData.get("image");
  const hoverFile = formData.get("hover");

  try {
    if (id === "new") {
      const data = new FormData();
      data.append("name_pt", name_pt);
      data.append("name_en", name_en);
      data.append("description_pt", description_pt);
      data.append("description_en", description_en);
      data.append("slug", slug);
      data.append("enable", String(enable));
      if (imageFile instanceof File && imageFile.size > 0) data.append("media", imageFile);
      if (hoverFile instanceof File && hoverFile.size > 0) data.append("hover", hoverFile);
      await pb.collection("category").create(data);
      return redirect("/backoffice/categories?success=1");
    }

    const hasFiles = (imageFile instanceof File && imageFile.size > 0) || (hoverFile instanceof File && hoverFile.size > 0);
    if (hasFiles) {
      const body = new FormData();
      body.append("name_pt", name_pt);
      body.append("name_en", name_en);
      body.append("description_pt", description_pt);
      body.append("description_en", description_en);
      body.append("slug", slug);
      body.append("enable", String(enable));
      if (imageFile instanceof File && imageFile.size > 0) body.append("media", imageFile);
      if (hoverFile instanceof File && hoverFile.size > 0) body.append("hover", hoverFile);
      await pb.collection("category").update(id, body);
    } else {
      await pb.collection("category").update(id, { name_pt, name_en, description_pt, description_en, slug, enable });
    }
    return { ok: true };
  } catch (e) {
    const msg = (e as Error)?.message ?? "Erro ao guardar categoria";
    if (id === "new") return redirect("/backoffice/categories?error=" + encodeURIComponent(msg));
    return { ok: false, error: msg };
  }
}

export function meta({ params }: Route.MetaArgs) {
  return [{ title: params.id === "new" ? "Nova categoria – Walkys Backoffice" : "Editar categoria – Walkys Backoffice" }];
}

export default function BackofficeCategoryEdit() {
  const { category, baseUrl, isNew } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const c = category as { id?: string; name_pt?: string; name_en?: string; description_pt?: string; description_en?: string; slug?: string; enable?: boolean; media?: string | string[]; image?: string | string[]; hover?: string } | null;

  const imageFilename = c?.media ?? c?.image;
  const imageFile = imageFilename ? (Array.isArray(imageFilename) ? imageFilename[0] : imageFilename) : null;
  const imageUrl = baseUrl && c?.id && imageFile ? `${baseUrl}/api/files/category/${c.id}/${encodeURIComponent(String(imageFile))}` : null;
  const hoverFile = c?.hover ?? null;
  const hoverUrl = baseUrl && c?.id && hoverFile ? `${baseUrl}/api/files/category/${c.id}/${hoverFile}` : null;

  return (
    <div>
      <BackofficeToast actionData={actionData} />
      <div className="mb-8">
        <Link to="/backoffice/categories" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
          ← Voltar às categorias
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-2">
          {isNew ? "Nova categoria" : "Editar categoria"}
        </h1>
        <p className="text-slate-600 mt-1">
          Campos da coleção PocketBase: nome (PT/EN), descrição (PT/EN), slug, imagem, ativo.
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
                className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50"
              />
            </div>
            <div>
              <label htmlFor="name_en" className="block text-sm font-medium text-slate-700 mb-1">Nome (EN)</label>
              <input
                id="name_en"
                name="name_en"
                type="text"
                defaultValue={c?.name_en ?? ""}
                className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50"
              />
            </div>
          </div>
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-slate-700 mb-1">Slug (URL, obrigatório)</label>
            <input
              id="slug"
              name="slug"
              type="text"
              defaultValue={c?.slug ?? ""}
              className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 font-mono"
              required
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="description_pt" className="block text-sm font-medium text-slate-700 mb-1">Descrição (PT)</label>
              <textarea
                id="description_pt"
                name="description_pt"
                rows={3}
                defaultValue={c?.description_pt ?? ""}
                className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50"
                placeholder="Breve descrição da categoria"
              />
            </div>
            <div>
              <label htmlFor="description_en" className="block text-sm font-medium text-slate-700 mb-1">Descrição (EN)</label>
              <textarea
                id="description_en"
                name="description_en"
                rows={3}
                defaultValue={c?.description_en ?? ""}
                className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50"
                placeholder="Short category description"
              />
            </div>
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
              className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-slate-700 file:text-slate-100 file:font-medium"
            />
          </div>
        </div>

        <div className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">Hover (imagem ou vídeo)</h2>
          <p className="text-sm text-slate-500">Mostrado ao passar o rato sobre a categoria. Pode ser imagem ou vídeo.</p>
          {hoverUrl && (
            <div className="flex items-center gap-4">
              {hoverFile && /\.(webm|mp4|ogg|mov)$/i.test(hoverFile) ? (
                <video src={hoverUrl} className="w-24 h-24 rounded-sm object-cover border border-slate-200" muted playsInline />
              ) : (
                <img src={hoverUrl} alt="" className="w-24 h-24 rounded-sm object-cover border border-slate-200" width={96} height={96} />
              )}
              <p className="text-sm text-slate-500">Hover atual. Envie um novo ficheiro para substituir.</p>
            </div>
          )}
          <div>
            <label htmlFor="hover" className="block text-sm font-medium text-slate-700 mb-1">Ficheiro (imagem ou vídeo)</label>
            <input
              id="hover"
              name="hover"
              type="file"
              accept="image/*,video/*"
              className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-slate-700 file:text-slate-100 file:font-medium"
            />
          </div>
        </div>

        <div className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <input
              id="enable"
              name="enable"
              type="checkbox"
              defaultChecked={c?.enable ?? true}
              className="w-4 h-4 rounded border-slate-200 text-slate-800 focus:ring-slate-500"
            />
            <label htmlFor="enable" className="text-sm font-medium text-slate-700">Ativo (visível no site)</label>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={navigation.state === "submitting"}
            className="px-6 py-2.5 bg-slate-800 text-white rounded-sm hover:bg-slate-900 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 font-medium"
          >
            {navigation.state === "submitting" ? "A guardar…" : isNew ? "Criar categoria" : "Guardar categoria"}
          </button>
          <Link
            to="/backoffice/categories"
            className="px-6 py-2.5 border border-slate-300 rounded-sm text-slate-700 hover:bg-slate-50 focus:ring-2 focus:ring-slate-500/50 focus:ring-offset-2"
          >
            Cancelar
          </Link>
        </div>
      </Form>
    </div>
  );
}
