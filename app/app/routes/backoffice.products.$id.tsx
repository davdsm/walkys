import { useLoaderData, useParams, Form, useNavigation, redirect, useActionData } from "react-router";
import { BackofficeToast } from "~/components/Backoffice/BackofficeToast";
import { createPocketBase } from "~/lib/pocketbase";
import type { Route } from "./+types/backoffice.products.$id";
import { Link } from "react-router";

export async function loader({ request, params }: Route.LoaderArgs) {
  const pb = createPocketBase(request);
  if (!pb.authStore.isValid) return redirect("/auth/login");
  const user = pb.authStore.model as { admin?: boolean } | null;
  if (!user?.admin) return redirect("/dashboard");

  const id = params.id;
  const [categories, collections, sizesRaw] = await Promise.all([
    pb.collection("category").getFullList({ sort: "name_pt" }).catch(() => []),
    pb.collection("collection").getFullList({ sort: "name_pt" }).catch(() => []),
    pb.collection("sizes").getFullList({ sort: "number" }).catch(() => []),
  ]);
  // Only show shoe sizes 35–47 in the product form
  const sizesList = (sizesRaw || []).filter((s: { number?: string }) => {
    const n = parseInt(String(s?.number ?? ""), 10);
    return !Number.isNaN(n) && n >= 35 && n <= 47;
  });
  const baseUrl = pb.baseUrl.replace(/\/$/, "");

  if (!id || id === "new") {
    return { product: null, categories, collections, sizesList, baseUrl, isNew: true };
  }

  try {
    const product = await pb.collection("products").getOne(id, { expand: "category,collection,sizes" });
    return { product, categories, collections, sizesList, baseUrl, isNew: false };
  } catch {
    return redirect("/backoffice/products");
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const pb = createPocketBase(request);
  if (!pb.authStore.isValid) return null;
  const user = pb.authStore.model as { admin?: boolean } | null;
  if (!user?.admin) return null;

  const id = params.id;
  const formData = await request.formData();
  const intent = formData.get("intent");

  const categoryId = formData.get("category") as string;
  const collectionId = formData.get("collection") as string;
  const sizesRaw = formData.getAll("sizes");
  const sizesIds = sizesRaw.filter((v): v is string => typeof v === "string" && v.length > 0);
  const data: Record<string, string | boolean | File | string[]> = {
    name_pt: (formData.get("name_pt") as string) ?? "",
    name_en: (formData.get("name_en") as string) ?? "",
    description_pt: (formData.get("description_pt") as string) ?? "",
    description_en: (formData.get("description_en") as string) ?? "",
    details_pt: (formData.get("details_pt") as string) ?? "",
    details_en: (formData.get("details_en") as string) ?? "",
    slug: (formData.get("slug") as string) ?? "",
    enabled: formData.get("enabled") === "on",
  };
  if (categoryId) data.category = categoryId;
  if (collectionId) data.collection = collectionId;
  data.sizes = sizesIds;
  const mediaFile = formData.get("media");
  const hasMediaFile = mediaFile instanceof File && mediaFile.size > 0;
  if (hasMediaFile) data.media = mediaFile as File;
  const mediaHoverFile = formData.get("media_hover");
  const hasMediaHoverFile = mediaHoverFile instanceof File && mediaHoverFile.size > 0;
  if (hasMediaHoverFile) data.media_hover = mediaHoverFile as File;
  const media360Files = formData.getAll("media_360").filter((f): f is File => f instanceof File && f.size > 0);
  const mediaGalleryFiles = formData.getAll("media_gallery").filter((f): f is File => f instanceof File && f.size > 0);

  const removeMedia = formData.get("remove_media") === "1";
  const removeMediaHover = formData.get("remove_media_hover") === "1";
  const removeMedia360Filenames = formData.getAll("remove_media_360").filter((v): v is string => typeof v === "string" && v.length > 0);
  const removeMediaGalleryFilenames = formData.getAll("remove_media_gallery").filter((v): v is string => typeof v === "string" && v.length > 0);

  const hasAnyFiles = hasMediaFile || hasMediaHoverFile || media360Files.length > 0 || mediaGalleryFiles.length > 0;
  const hasAnyRemovals = removeMedia || removeMediaHover || removeMedia360Filenames.length > 0 || removeMediaGalleryFilenames.length > 0;

  const buildPayload = (): Record<string, unknown> | FormData => {
    if (!hasAnyFiles && !hasAnyRemovals) return data as Record<string, unknown>;
    const fd = new FormData();
    fd.append("name_pt", data.name_pt as string);
    fd.append("name_en", data.name_en as string);
    fd.append("description_pt", data.description_pt as string);
    fd.append("description_en", data.description_en as string);
    fd.append("details_pt", data.details_pt as string);
    fd.append("details_en", data.details_en as string);
    fd.append("slug", data.slug as string);
    fd.append("enabled", data.enabled ? "true" : "false");
    if (categoryId) fd.append("category", categoryId);
    if (collectionId) fd.append("collection", collectionId);
    sizesIds.forEach((s) => fd.append("sizes", s));
    if (removeMedia) fd.append("media", "");
    else if (hasMediaFile) fd.append("media", data.media as File);
    if (removeMediaHover) fd.append("media_hover", "");
    else if (hasMediaHoverFile) fd.append("media_hover", data.media_hover as File);
    removeMedia360Filenames.forEach((filename) => fd.append("media_360-", filename));
    media360Files.forEach((f) => fd.append("media_360", f));
    removeMediaGalleryFilenames.forEach((filename) => fd.append("media_gallery-", filename));
    mediaGalleryFiles.forEach((f) => fd.append("media_gallery", f));
    return fd;
  };

  try {
    if (intent === "create" && (!id || id === "new")) {
      const payload = buildPayload();
      await pb.collection("products").create(payload);
      return redirect("/backoffice/products?success=1");
    }
    if (intent === "update" && id && id !== "new") {
      const payload = buildPayload();
      await pb.collection("products").update(id, payload);
      return { ok: true };
    }
  } catch (e) {
    const msg = (e as Error)?.message ?? "Erro ao guardar produto";
    if (intent === "create") return redirect("/backoffice/products?error=" + encodeURIComponent(msg));
    return { ok: false, error: msg };
  }
  return { ok: false, error: "Ação desconhecida" };
}

export function meta({ params }: Route.MetaArgs) {
  return [{ title: params.id === "new" ? "Novo produto – Walkys Backoffice" : "Editar produto – Walkys Backoffice" }];
}

export default function BackofficeProductEdit() {
  const { product, categories, collections, sizesList, baseUrl, isNew } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const p = product as { category?: string; collection?: string; media?: string | string[]; media_hover?: string; media_360?: string[]; media_gallery?: string[]; sizes?: string[] | { id: string; number?: string }[] } | null;
  const categoryId = typeof p?.category === "string" ? p.category : (Array.isArray(p?.category) ? (p?.category as any)?.[0] : (p?.category as any)?.id) ?? "";
  const collectionId = typeof p?.collection === "string" ? p.collection : (Array.isArray(p?.collection) ? (p?.collection as any)?.[0] : (p?.collection as any)?.id) ?? "";
  const mediaFile = p?.media ? (Array.isArray(p.media) ? p.media[0] : p.media) : null;
  const mediaUrl = baseUrl && product?.id && mediaFile ? `${baseUrl}/api/files/products/${product.id}/${mediaFile}` : null;
  const mediaHoverFile = p?.media_hover ?? null;
  const mediaHoverUrl = baseUrl && product?.id && mediaHoverFile ? `${baseUrl}/api/files/products/${product.id}/${mediaHoverFile}` : null;
  const media360List = Array.isArray(p?.media_360) ? p.media_360 : [];
  const media360Urls = baseUrl && product?.id ? media360List.map((f: string) => `${baseUrl}/api/files/products/${product.id}/${f}`) : [];
  const mediaGalleryList = Array.isArray(p?.media_gallery) ? p.media_gallery : [];
  const mediaGalleryUrls = baseUrl && product?.id ? mediaGalleryList.map((f: string) => `${baseUrl}/api/files/products/${product.id}/${f}`) : [];
  const productSizeIds = Array.isArray(p?.sizes)
    ? (p.sizes as { id?: string }[]).map((s) => (typeof s === "string" ? s : s?.id)).filter(Boolean) as string[]
    : [];

  return (
    <div>
      <BackofficeToast actionData={actionData} />
      <div className="mb-8">
        <Link to="/backoffice/products" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
          ← Voltar aos produtos
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-2">
          {isNew ? "Novo produto" : "Editar produto"}
        </h1>
        <p className="text-slate-600 mt-1">
          Edite nomes, descrições, imagem, categoria e coleção (PT / EN).
        </p>
      </div>

      <Form method="post" encType="multipart/form-data" className="space-y-8 max-w-4xl">
        <input type="hidden" name="intent" value={isNew ? "create" : "update"} />
        <div className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">Nomes</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="name_pt" className="block text-sm font-medium text-slate-700 mb-1">Nome (PT)</label>
              <input
                id="name_pt"
                name="name_pt"
                type="text"
                defaultValue={product?.name_pt ?? ""}
                className="w-full px-3 py-2 border border-slate-200 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50"
              />
            </div>
            <div>
              <label htmlFor="name_en" className="block text-sm font-medium text-slate-700 mb-1">Nome (EN)</label>
              <input
                id="name_en"
                name="name_en"
                type="text"
                defaultValue={product?.name_en ?? ""}
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
              defaultValue={product?.slug ?? ""}
              className="w-full px-3 py-2 border border-slate-200 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 font-mono"
            />
          </div>
          {categories?.length > 0 && (
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
              <select
                id="category"
                name="category"
                defaultValue={categoryId}
                className="w-full px-3 py-2 border border-slate-200 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50"
              >
                <option value="">— Nenhuma —</option>
                {categories.map((cat: { id: string; name_pt?: string; name_en?: string }) => (
                  <option key={cat.id} value={cat.id}>{cat.name_pt ?? cat.name_en ?? cat.id}</option>
                ))}
              </select>
            </div>
          )}
          {collections?.length > 0 && (
            <div>
              <label htmlFor="collection" className="block text-sm font-medium text-slate-700 mb-1">Coleção</label>
              <select
                id="collection"
                name="collection"
                defaultValue={collectionId}
                className="w-full px-3 py-2 border border-slate-200 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50"
              >
                <option value="">— Nenhuma —</option>
                {collections.map((col: { id: string; name_pt?: string; name_en?: string }) => (
                  <option key={col.id} value={col.id}>{col.name_pt ?? col.name_en ?? col.id}</option>
                ))}
              </select>
            </div>
          )}
          {sizesList && sizesList.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tamanhos (calçado)</label>
              <p className="text-xs text-slate-500 mb-2">Selecione os tamanhos disponíveis para este produto.</p>
              <div className="flex flex-wrap gap-3">
                {sizesList.map((sz: { id: string; number?: string }) => (
                  <label key={sz.id} className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="sizes"
                      value={sz.id}
                      defaultChecked={isNew || productSizeIds.length === 0 || productSizeIds.includes(sz.id)}
                      className="w-4 h-4 rounded border-slate-200 text-slate-800 focus:ring-slate-500"
                    />
                    <span className="text-sm font-medium text-slate-700">{sz.number ?? sz.id}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">Imagem principal</h2>
          <p className="text-sm text-slate-600">Imagem destacada do produto (listagens e primeira vista na página do produto).</p>
          {mediaUrl && (
            <>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100">
                <img src={mediaUrl} alt="" className="w-28 h-28 rounded-lg object-cover border border-slate-200 shadow-sm" width={112} height={112} />
                <p className="text-sm text-slate-500">Substitua enviando um novo ficheiro abaixo ou remova.</p>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="remove_media" value="1" className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
                <span className="text-sm font-medium text-slate-700">Remover imagem principal</span>
              </label>
            </>
          )}
          <div>
            <label htmlFor="media" className="block text-sm font-medium text-slate-700 mb-1">Ficheiro de imagem</label>
            <input
              id="media"
              name="media"
              type="file"
              accept="image/*"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-800 file:text-white file:font-medium file:cursor-pointer hover:file:bg-slate-900 transition-colors"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">Hover media (imagem ou vídeo)</h2>
          <p className="text-sm text-slate-600">Mostrado ao passar o rato sobre o produto em listagens.</p>
          {mediaHoverUrl && (
            <>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100">
                {mediaHoverFile && /\.(webm|mp4|ogg|mov)$/i.test(mediaHoverFile) ? (
                  <video src={mediaHoverUrl} className="w-28 h-28 rounded-lg object-cover border border-slate-200 shadow-sm" muted playsInline />
                ) : (
                  <img src={mediaHoverUrl} alt="" className="w-28 h-28 rounded-lg object-cover border border-slate-200 shadow-sm" width={112} height={112} />
                )}
                <p className="text-sm text-slate-500">Envie um novo ficheiro para substituir ou remova.</p>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="remove_media_hover" value="1" className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500" />
                <span className="text-sm font-medium text-slate-700">Remover hover media</span>
              </label>
            </>
          )}
          <div>
            <label htmlFor="media_hover" className="block text-sm font-medium text-slate-700 mb-1">Ficheiro (imagem ou vídeo)</label>
            <input
              id="media_hover"
              name="media_hover"
              type="file"
              accept="image/*,video/*"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-800 file:text-white file:font-medium file:cursor-pointer hover:file:bg-slate-900 transition-colors"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">360° fotos</h2>
          <p className="text-sm text-slate-600">Sequência de imagens para o visualizador 360° na página do produto. A ordem dos ficheiros define a rotação. Enviar um novo conjunto substitui o anterior.</p>
          {media360Urls.length > 0 && (
            <div className="rounded-lg bg-slate-50 border border-slate-100 p-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Marque as fotos 360° que deseja apagar</p>
              <div className="flex flex-wrap gap-4">
                {media360List.map((filename, i) => (
                  <label key={filename} className="relative flex flex-col items-center gap-1.5 cursor-pointer group">
                    <img src={media360Urls[i]} alt={`Frame ${i + 1}`} className="w-16 h-16 rounded-md object-cover border-2 border-slate-200 shadow-sm group-hover:border-red-300 transition-colors" width={64} height={64} />
                    <span className="text-xs text-slate-600">Frame {i + 1}</span>
                    <input type="checkbox" name="remove_media_360" value={filename} className="absolute top-0 right-0 w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500" title="Remover esta foto" />
                  </label>
                ))}
              </div>
            </div>
          )}
          <div>
            <label htmlFor="media_360" className="block text-sm font-medium text-slate-700 mb-1">Ficheiros 360° (múltiplos)</label>
            <input
              id="media_360"
              name="media_360"
              type="file"
              accept="image/*"
              multiple
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-800 file:text-white file:font-medium file:cursor-pointer hover:file:bg-slate-900 transition-colors"
            />
            <p className="mt-1.5 text-xs text-slate-500">Seleccione várias imagens de uma vez. A ordem no explorador de ficheiros pode definir a ordem da rotação.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">Galeria</h2>
          <p className="text-sm text-slate-600">Imagens adicionais do produto (mostradas na página do produto após a imagem principal e o 360°). Enviar novos ficheiros substitui a galeria atual.</p>
          {mediaGalleryUrls.length > 0 && (
            <div className="rounded-lg bg-slate-50 border border-slate-100 p-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Marque as imagens da galeria que deseja apagar</p>
              <div className="flex flex-wrap gap-4">
                {mediaGalleryList.map((filename, i) => (
                  <label key={filename} className="relative flex flex-col items-center gap-1.5 cursor-pointer group">
                    <img src={mediaGalleryUrls[i]} alt={`Galeria ${i + 1}`} className="w-20 h-20 rounded-md object-cover border-2 border-slate-200 shadow-sm group-hover:border-red-300 transition-colors" width={80} height={80} />
                    <span className="text-xs text-slate-600">Imagem {i + 1}</span>
                    <input type="checkbox" name="remove_media_gallery" value={filename} className="absolute top-0 right-0 w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500" title="Remover esta imagem" />
                  </label>
                ))}
              </div>
            </div>
          )}
          <div>
            <label htmlFor="media_gallery" className="block text-sm font-medium text-slate-700 mb-1">Ficheiros da galeria (múltiplos)</label>
            <input
              id="media_gallery"
              name="media_gallery"
              type="file"
              accept="image/*,video/*"
              multiple
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-800 file:text-white file:font-medium file:cursor-pointer hover:file:bg-slate-900 transition-colors"
            />
            <p className="mt-1.5 text-xs text-slate-500">Seleccione várias imagens (ou vídeos). A ordem de seleção define a ordem na página.</p>
          </div>
        </div>

        <div className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">Descrições</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="description_pt" className="block text-sm font-medium text-slate-700 mb-1">Descrição (PT)</label>
              <textarea
                id="description_pt"
                name="description_pt"
                rows={4}
                defaultValue={product?.description_pt ?? ""}
                className="w-full px-3 py-2 border border-slate-200 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50"
              />
            </div>
            <div>
              <label htmlFor="description_en" className="block text-sm font-medium text-slate-700 mb-1">Descrição (EN)</label>
              <textarea
                id="description_en"
                name="description_en"
                rows={4}
                defaultValue={product?.description_en ?? ""}
                className="w-full px-3 py-2 border border-slate-200 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">Detalhes (HTML)</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="details_pt" className="block text-sm font-medium text-slate-700 mb-1">Detalhes (PT)</label>
              <textarea
                id="details_pt"
                name="details_pt"
                rows={6}
                defaultValue={product?.details_pt ?? ""}
                className="w-full px-3 py-2 border border-slate-200 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 font-mono text-sm"
              />
            </div>
            <div>
              <label htmlFor="details_en" className="block text-sm font-medium text-slate-700 mb-1">Detalhes (EN)</label>
              <textarea
                id="details_en"
                name="details_en"
                rows={6}
                defaultValue={product?.details_en ?? ""}
                className="w-full px-3 py-2 border border-slate-200 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 font-mono text-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <input
              id="enabled"
              name="enabled"
              type="checkbox"
              defaultChecked={product?.enabled ?? true}
              className="w-4 h-4 rounded border-slate-200 text-slate-900 focus:ring-neutral-900"
            />
            <label htmlFor="enabled" className="text-sm font-medium text-slate-700">Ativo (visível no site)</label>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={navigation.state === "submitting"}
            className="px-6 py-2.5 bg-slate-800 text-white rounded-sm hover:bg-slate-900 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 font-medium"
          >
            {navigation.state === "submitting" ? "A guardar…" : isNew ? "Criar produto" : "Guardar produto"}
          </button>
          <Link
            to="/backoffice/products"
            className="px-6 py-2 border border-slate-300 rounded-sm text-slate-700 hover:bg-slate-50 focus:ring-2 focus:ring-slate-500/50 focus:ring-offset-2"
          >
            Cancelar
          </Link>
        </div>
      </Form>

    </div>
  );
}
