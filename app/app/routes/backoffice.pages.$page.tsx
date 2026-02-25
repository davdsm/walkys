import { useLoaderData, useParams, Form, useNavigation, useActionData } from "react-router";
import { BackofficeToast } from "~/components/Backoffice/BackofficeToast";
import { createPocketBase } from "~/lib/pocketbase";
import { translations } from "~/lib/translations";
import type { Route } from "./+types/backoffice.pages.$page";

/** Section IDs (or containing these substrings) that show media upload. Others are text-only. */
const SECTION_IDS_WITH_MEDIA = ["gallery", "image", "media", "photo", "picture", "img"];

/** Human-readable labels for Homepage section_id (display only). */
const HOMEPAGE_SECTION_LABELS: Record<string, string> = {
  "intro-title": "Título do hero",
  "intro-text": "Texto do hero",
  "intro-product": "Produto em destaque (hero)",
  "intro-categories": "Categorias do hero",
  "slider-products-title": "Título do slider de produtos",
  "slider-products-subtitle": "Subtítulo do slider",
  "slider-products-list": "Lista de produtos do slider",
  "slider-products-cta-text": "Botão CTA do slider (texto)",
  "slider-products-cta-link": "Botão CTA do slider (link)",
};

function sectionNeedsMedia(sectionId: string): boolean {
  const lower = sectionId.toLowerCase();
  return SECTION_IDS_WITH_MEDIA.some((term) => lower.includes(term));
}

function getHomepageSectionLabel(sectionId: string): string {
  return HOMEPAGE_SECTION_LABELS[sectionId] ?? sectionId;
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const pb = createPocketBase(request);
  if (!pb.authStore.isValid) return { records: [], collectionName: "", page: "", baseUrl: "", productsList: [], categoriesList: [] };
  const user = pb.authStore.model as { admin?: boolean } | null;
  if (!user?.admin) return { records: [], collectionName: "", page: "", baseUrl: "", productsList: [], categoriesList: [] };

  const page = params.page || "Homepage";
  const collectionName = page === "Homepage" ? "Homepage" : "AboutPage";
  const records = await pb.collection(collectionName).getFullList({ sort: "section_id" });
  const baseUrl = pb.baseUrl.replace(/\/$/, "");

  let productsList: { id: string; name_pt?: string; name_en?: string; slug?: string }[] = [];
  let categoriesList: { id: string; name_pt?: string; name_en?: string; slug?: string }[] = [];
  if (page === "Homepage") {
    try {
      [productsList, categoriesList] = await Promise.all([
        pb.collection("products").getFullList({ fields: "id,name_pt,name_en,slug", sort: "name_pt" }).catch(() => []),
        pb.collection("category").getFullList({ fields: "id,name_pt,name_en,slug", sort: "name_pt" }).catch(() => []),
      ]);
    } catch {
      // ignore
    }
  }

  return { records, collectionName, page, baseUrl, productsList, categoriesList };
}

export async function action({ request, params }: Route.ActionArgs) {
  const pb = createPocketBase(request);
  if (!pb.authStore.isValid) return { ok: false, error: "Sessão inválida" };
  const user = pb.authStore.model as { admin?: boolean } | null;
  if (!user?.admin) return { ok: false, error: "Sem permissão" };

  const page = params.page || "Homepage";
  const collectionName = page === "Homepage" ? "Homepage" : "AboutPage";
  const formData = await request.formData();
  const intent = formData.get("intent");
  const id = formData.get("id") as string;

  try {
  if (page === "AboutPage" && collectionName === "AboutPage" && intent === "import_about_from_code") {
    const pt = translations.pt.about as Record<string, string>;
    const en = translations.en.about as Record<string, string>;
    const empty = { value_pt: "", value_en: "", media: [], categories: [], products: [] };
    const sections: { section_id: string; section_name: string; value_pt: string; value_en: string }[] = [
      { section_id: "intro_title", section_name: "Título Intro", value_pt: pt.title ?? "", value_en: en.title ?? "" },
      { section_id: "intro_text", section_name: "Texto Intro", value_pt: "", value_en: "" },
      { section_id: "intro_eyebrow", section_name: "Eyebrow Hero (ex: A nossa história)", value_pt: pt.our_story ?? "", value_en: en.our_story ?? "" },
      { section_id: "what_about_section_title", section_name: "Título da secção (ex: Sobre nós)", value_pt: pt.what_about_title ?? "", value_en: en.what_about_title ?? "" },
      { section_id: "what_about_card_1_title", section_name: "Cartão 1 – Título", value_pt: "", value_en: "" },
      { section_id: "what_about_card_1_text", section_name: "Cartão 1 – Texto", value_pt: "", value_en: "" },
      { section_id: "what_about_card_2_title", section_name: "Cartão 2 – Título", value_pt: "", value_en: "" },
      { section_id: "what_about_card_2_text", section_name: "Cartão 2 – Texto", value_pt: "", value_en: "" },
      { section_id: "gallery_section_title", section_name: "Título da secção Processo (ex: Como tudo começa)", value_pt: pt.gallery_title ?? "", value_en: en.gallery_title ?? "" },
      { section_id: "mold_title", section_name: "Passo 1 – Título (Molde)", value_pt: pt.mold_title ?? "", value_en: en.mold_title ?? "" },
      { section_id: "shapping_title", section_name: "Passo 2 – Título (Forma)", value_pt: pt.shapping_title ?? "", value_en: en.shapping_title ?? "" },
      { section_id: "tabulated_title", section_name: "Passo 3 – Título (Tabelado)", value_pt: pt.tabulated_title ?? "", value_en: en.tabulated_title ?? "" },
      { section_id: "quality_title", section_name: "Passo 4 – Título (Qualidade)", value_pt: pt.quality_title ?? "", value_en: en.quality_title ?? "" },
      { section_id: "mold", section_name: "Passo 1 – Mold", value_pt: "", value_en: "" },
      { section_id: "shapping", section_name: "Passo 2 – Shapping", value_pt: "", value_en: "" },
      { section_id: "tabulated", section_name: "Passo 3 – Tabulated", value_pt: "", value_en: "" },
      { section_id: "quality", section_name: "Passo 4 – Quality", value_pt: "", value_en: "" },
    ];
    const existing = await pb.collection(collectionName).getFullList({ sort: "section_id" });
    const bySectionId = new Map<string, { id: string }>();
    for (const r of existing) {
      const sid = (r as { section_id?: string }).section_id ?? "";
      if (sid) bySectionId.set(sid, { id: (r as { id: string }).id });
    }
    for (const sec of sections) {
      const rec = bySectionId.get(sec.section_id);
      const payload = { ...empty, section_id: sec.section_id, section_name: sec.section_name, value_pt: sec.value_pt, value_en: sec.value_en };
      if (rec) {
        await pb.collection(collectionName).update(rec.id, { value_pt: sec.value_pt, value_en: sec.value_en, section_name: sec.section_name });
      } else {
        await pb.collection(collectionName).create(payload);
      }
    }
    return { ok: true };
  }

  if (page === "Homepage" && collectionName === "Homepage") {
    if (intent === "update_hero") {
      const idTitle = formData.get("id_title") as string;
      const idSubtitle = formData.get("id_subtitle") as string;
      const idProduct = formData.get("id_product") as string;
      const idCategories = formData.get("id_categories") as string;
      const titlePt = (formData.get("title_pt") as string) ?? "";
      const titleEn = (formData.get("title_en") as string) ?? "";
      const subtitlePt = (formData.get("subtitle_pt") as string) ?? "";
      const subtitleEn = (formData.get("subtitle_en") as string) ?? "";
      const productId = (formData.get("product") as string) ?? "";
      const categoriesIds = formData.getAll("categories").filter((v): v is string => typeof v === "string" && v.length > 0);
      if (idTitle) await pb.collection(collectionName).update(idTitle, { value_pt: titlePt, value_en: titleEn });
      if (idSubtitle) await pb.collection(collectionName).update(idSubtitle, { value_pt: subtitlePt, value_en: subtitleEn });
      if (idProduct) await pb.collection(collectionName).update(idProduct, { products: productId ? [productId] : [] });
      if (idCategories) await pb.collection(collectionName).update(idCategories, { categories: categoriesIds });
      return { ok: true };
    }
    if (intent === "update_slider") {
      const idTitle = formData.get("id_title") as string;
      const idSubtitle = formData.get("id_subtitle") as string;
      const idList = formData.get("id_list") as string;
      const idCtaText = (formData.get("id_cta_text") as string) || "";
      const idCtaLink = (formData.get("id_cta_link") as string) || "";
      const titlePt = (formData.get("title_pt") as string) ?? "";
      const titleEn = (formData.get("title_en") as string) ?? "";
      const subtitlePt = (formData.get("subtitle_pt") as string) ?? "";
      const subtitleEn = (formData.get("subtitle_en") as string) ?? "";
      const ctaTextPt = (formData.get("cta_text_pt") as string) ?? "";
      const ctaTextEn = (formData.get("cta_text_en") as string) ?? "";
      const ctaLink = (formData.get("cta_link") as string) ?? "";
      const productsIds = formData.getAll("products").filter((v): v is string => typeof v === "string" && v.length > 0);
      if (idTitle) await pb.collection(collectionName).update(idTitle, { value_pt: titlePt, value_en: titleEn });
      if (idSubtitle) await pb.collection(collectionName).update(idSubtitle, { value_pt: subtitlePt, value_en: subtitleEn });
      if (idList) await pb.collection(collectionName).update(idList, { products: productsIds });
      if (idCtaText) {
        await pb.collection(collectionName).update(idCtaText, { value_pt: ctaTextPt, value_en: ctaTextEn });
      } else if (ctaTextPt || ctaTextEn) {
        await pb.collection(collectionName).create({ section_id: "slider-products-cta-text", section_name: "Botão CTA do slider (texto)", value_pt: ctaTextPt, value_en: ctaTextEn, media: [], categories: [], products: [] });
      }
      if (idCtaLink) {
        await pb.collection(collectionName).update(idCtaLink, { value_pt: ctaLink, value_en: ctaLink });
      } else if (ctaLink) {
        await pb.collection(collectionName).create({ section_id: "slider-products-cta-link", section_name: "Botão CTA do slider (link)", value_pt: ctaLink, value_en: ctaLink, media: [], categories: [], products: [] });
      }
      return { ok: true };
    }
    if (intent === "update_categories_section") {
      const idTitle = (formData.get("id_title") as string) || "";
      const idSubtitle = (formData.get("id_subtitle") as string) || "";
      const idList = (formData.get("id_list") as string) || "";
      const idHighlighted = (formData.get("id_highlighted") as string) || "";
      const titlePt = (formData.get("title_pt") as string) ?? "";
      const titleEn = (formData.get("title_en") as string) ?? "";
      const subtitlePt = (formData.get("subtitle_pt") as string) ?? "";
      const subtitleEn = (formData.get("subtitle_en") as string) ?? "";
      const highlightedIds = formData.getAll("highlighted_categories").filter((v): v is string => typeof v === "string" && v.length > 0);
      const listIds = formData.getAll("list_categories").filter((v): v is string => typeof v === "string" && v.length > 0);
      if (idTitle) {
        await pb.collection(collectionName).update(idTitle, { value_pt: titlePt, value_en: titleEn });
      } else {
        await pb.collection(collectionName).create({ section_id: "categories-section-title", section_name: "Título da secção de categorias", value_pt: titlePt, value_en: titleEn, categories: [], products: [] });
      }
      if (idSubtitle) {
        await pb.collection(collectionName).update(idSubtitle, { value_pt: subtitlePt, value_en: subtitleEn });
      } else {
        await pb.collection(collectionName).create({ section_id: "categories-section-subtitle", section_name: "Subtítulo da secção de categorias", value_pt: subtitlePt, value_en: subtitleEn, categories: [], products: [] });
      }
      if (idHighlighted) {
        await pb.collection(collectionName).update(idHighlighted, { categories: highlightedIds });
      } else if (highlightedIds.length > 0) {
        await pb.collection(collectionName).create({ section_id: "categories-section-highlighted", section_name: "Categorias em destaque", categories: highlightedIds, value_pt: "", value_en: "", products: [] });
      }
      if (idList) {
        await pb.collection(collectionName).update(idList, { categories: listIds, products: [] });
      } else {
        await pb.collection(collectionName).create({ section_id: "categories-section-list", section_name: "Categorias na lista", categories: listIds, value_pt: "", value_en: "", products: [] });
      }
      return { ok: true };
    }
  }

  if (page === "AboutPage" && collectionName === "AboutPage" && intent === "update_about_hero") {
    const idTitle = (formData.get("id_title") as string) || "";
    const idText = (formData.get("id_text") as string) || "";
    const idEyebrow = (formData.get("id_eyebrow") as string) || "";
    const idImg = (formData.get("id_img") as string) || "";
    const titlePt = (formData.get("title_pt") as string) ?? "";
    const titleEn = (formData.get("title_en") as string) ?? "";
    const descriptionPt = (formData.get("description_pt") as string) ?? "";
    const descriptionEn = (formData.get("description_en") as string) ?? "";
    const eyebrowPt = (formData.get("eyebrow_pt") as string) ?? "";
    const eyebrowEn = (formData.get("eyebrow_en") as string) ?? "";
    const mediaFile = formData.get("media") instanceof File ? (formData.get("media") as File) : null;

    if (idTitle) {
      await pb.collection(collectionName).update(idTitle, { value_pt: titlePt, value_en: titleEn });
    } else if (titlePt || titleEn) {
      await pb.collection(collectionName).create({ section_id: "intro_title", section_name: "Título Intro", value_pt: titlePt, value_en: titleEn, media: [], categories: [], products: [] });
    }
    if (idText) {
      await pb.collection(collectionName).update(idText, { value_pt: descriptionPt, value_en: descriptionEn });
    } else if (descriptionPt || descriptionEn) {
      await pb.collection(collectionName).create({ section_id: "intro_text", section_name: "Texto Intro", value_pt: descriptionPt, value_en: descriptionEn, media: [], categories: [], products: [] });
    }
    if (idEyebrow) {
      await pb.collection(collectionName).update(idEyebrow, { value_pt: eyebrowPt, value_en: eyebrowEn });
    } else if (eyebrowPt || eyebrowEn) {
      await pb.collection(collectionName).create({ section_id: "intro_eyebrow", section_name: "Eyebrow Hero (ex: A nossa história)", value_pt: eyebrowPt, value_en: eyebrowEn, media: [], categories: [], products: [] });
    }
    if (idImg && mediaFile?.size) {
      const body = new FormData();
      body.append("section_id", "intro_img");
      body.append("section_name", "Imagem Intro");
      body.append("value_pt", "");
      body.append("value_en", "");
      body.append("media", mediaFile);
      await pb.collection(collectionName).update(idImg, body);
    } else if (!idImg && mediaFile?.size) {
      const body = new FormData();
      body.append("section_id", "intro_img");
      body.append("section_name", "Imagem Intro");
      body.append("value_pt", "");
      body.append("value_en", "");
      body.append("media", mediaFile);
      await pb.collection(collectionName).create(body);
    }
    return { ok: true };
  }

  if (page === "AboutPage" && collectionName === "AboutPage" && intent === "update_about_whatabout") {
    const updateOrCreate = async (
      idKey: string,
      sectionId: string,
      sectionName: string,
      valuePt: string,
      valueEn: string,
      mediaFile: File | null
    ) => {
      const id = (formData.get(idKey) as string) || "";
      if (id && mediaFile?.size) {
        const body = new FormData();
        body.append("section_id", sectionId);
        body.append("section_name", sectionName);
        body.append("value_pt", valuePt);
        body.append("value_en", valueEn);
        body.append("media", mediaFile);
        await pb.collection(collectionName).update(id, body);
      } else if (id) {
        await pb.collection(collectionName).update(id, { value_pt: valuePt, value_en: valueEn });
      } else if (valuePt || valueEn || mediaFile?.size) {
        if (mediaFile?.size) {
          const body = new FormData();
          body.append("section_id", sectionId);
          body.append("section_name", sectionName);
          body.append("value_pt", valuePt);
          body.append("value_en", valueEn);
          body.append("media", mediaFile);
          await pb.collection(collectionName).create(body);
        } else {
          await pb.collection(collectionName).create({ section_id: sectionId, section_name: sectionName, value_pt: valuePt, value_en: valueEn, media: [], categories: [], products: [] });
        }
      }
    };
    const c1TitlePt = (formData.get("card1_title_pt") as string) ?? "";
    const c1TitleEn = (formData.get("card1_title_en") as string) ?? "";
    const c1TextPt = (formData.get("card1_text_pt") as string) ?? "";
    const c1TextEn = (formData.get("card1_text_en") as string) ?? "";
    const c1Media = formData.get("card1_media") instanceof File ? (formData.get("card1_media") as File) : null;
    const c2TitlePt = (formData.get("card2_title_pt") as string) ?? "";
    const c2TitleEn = (formData.get("card2_title_en") as string) ?? "";
    const c2TextPt = (formData.get("card2_text_pt") as string) ?? "";
    const c2TextEn = (formData.get("card2_text_en") as string) ?? "";
    const c2Media = formData.get("card2_media") instanceof File ? (formData.get("card2_media") as File) : null;
    await updateOrCreate("id_card1_title", "what_about_card_1_title", "Cartão 1 – Título", c1TitlePt, c1TitleEn, null);
    await updateOrCreate("id_card1_text", "what_about_card_1_text", "Cartão 1 – Texto", c1TextPt, c1TextEn, null);
    await updateOrCreate("id_card1_image", "what_about_card_1_image", "Cartão 1 – Imagem", "", "", c1Media);
    await updateOrCreate("id_card2_title", "what_about_card_2_title", "Cartão 2 – Título", c2TitlePt, c2TitleEn, null);
    await updateOrCreate("id_card2_text", "what_about_card_2_text", "Cartão 2 – Texto", c2TextPt, c2TextEn, null);
    await updateOrCreate("id_card2_image", "what_about_card_2_image", "Cartão 2 – Imagem", "", "", c2Media);
    const idSectionTitle = (formData.get("id_what_about_section_title") as string) || "";
    const sectionTitlePt = (formData.get("what_about_section_title_pt") as string) ?? "";
    const sectionTitleEn = (formData.get("what_about_section_title_en") as string) ?? "";
    if (idSectionTitle) {
      await pb.collection(collectionName).update(idSectionTitle, { value_pt: sectionTitlePt, value_en: sectionTitleEn });
    } else if (sectionTitlePt || sectionTitleEn) {
      await pb.collection(collectionName).create({ section_id: "what_about_section_title", section_name: "Título da secção (ex: Sobre nós)", value_pt: sectionTitlePt, value_en: sectionTitleEn, media: [], categories: [], products: [] });
    }
    return { ok: true };
  }

  if (page === "AboutPage" && collectionName === "AboutPage" && intent === "update_about_gallery") {
    const galleryMediaFiles = formData.getAll("gallery_media").filter((f): f is File => f instanceof File && f.size > 0);
    const idAboutGallery = (formData.get("id_about_gallery") as string) || "";
    if (idAboutGallery && galleryMediaFiles.length > 0) {
      const body = new FormData();
      body.append("section_id", "about_gallery");
      body.append("section_name", "Galeria About");
      body.append("value_pt", "");
      body.append("value_en", "");
      galleryMediaFiles.forEach((f) => body.append("media", f));
      await pb.collection(collectionName).update(idAboutGallery, body);
    } else if (!idAboutGallery && galleryMediaFiles.length > 0) {
      const body = new FormData();
      body.append("section_id", "about_gallery");
      body.append("section_name", "Galeria About");
      body.append("value_pt", "");
      body.append("value_en", "");
      galleryMediaFiles.forEach((f) => body.append("media", f));
      await pb.collection(collectionName).create(body);
    }
    const idGalleryTitle = (formData.get("id_gallery_section_title") as string) || "";
    const galleryTitlePt = (formData.get("gallery_section_title_pt") as string) ?? "";
    const galleryTitleEn = (formData.get("gallery_section_title_en") as string) ?? "";
    if (idGalleryTitle) {
      await pb.collection(collectionName).update(idGalleryTitle, { value_pt: galleryTitlePt, value_en: galleryTitleEn });
    } else if (galleryTitlePt || galleryTitleEn) {
      await pb.collection(collectionName).create({ section_id: "gallery_section_title", section_name: "Título da secção Processo (ex: Como tudo começa)", value_pt: galleryTitlePt, value_en: galleryTitleEn, media: [], categories: [], products: [] });
    }
    return { ok: true };
  }

  if (page === "AboutPage" && collectionName === "AboutPage" && intent === "update_about_passos") {
    const updateOrCreateStep = async (
      idKey: string,
      sectionId: string,
      sectionName: string,
      valuePt: string,
      valueEn: string,
      mediaFile: File | null
    ) => {
      const id = (formData.get(idKey) as string) || "";
      if (id && mediaFile?.size) {
        const body = new FormData();
        body.append("section_id", sectionId);
        body.append("section_name", sectionName);
        body.append("value_pt", valuePt);
        body.append("value_en", valueEn);
        body.append("media", mediaFile);
        await pb.collection(collectionName).update(id, body);
      } else if (id) {
        await pb.collection(collectionName).update(id, { value_pt: valuePt, value_en: valueEn });
      } else if (valuePt || valueEn || mediaFile?.size) {
        if (mediaFile?.size) {
          const body = new FormData();
          body.append("section_id", sectionId);
          body.append("section_name", sectionName);
          body.append("value_pt", valuePt);
          body.append("value_en", valueEn);
          body.append("media", mediaFile);
          await pb.collection(collectionName).create(body);
        } else {
          await pb.collection(collectionName).create({ section_id: sectionId, section_name: sectionName, value_pt: valuePt, value_en: valueEn, media: [], categories: [], products: [] });
        }
      }
    };
    const updateOrCreateTitle = async (idKey: string, sectionId: string, sectionName: string, valuePt: string, valueEn: string) => {
      const id = (formData.get(idKey) as string) || "";
      if (id) {
        await pb.collection(collectionName).update(id, { value_pt: valuePt, value_en: valueEn });
      } else if (valuePt || valueEn) {
        await pb.collection(collectionName).create({ section_id: sectionId, section_name: sectionName, value_pt: valuePt, value_en: valueEn, media: [], categories: [], products: [] });
      }
    };
    const moldPt = (formData.get("mold_pt") as string) ?? "";
    const moldEn = (formData.get("mold_en") as string) ?? "";
    const moldMedia = formData.get("mold_media") instanceof File ? (formData.get("mold_media") as File) : null;
    const shappingPt = (formData.get("shapping_pt") as string) ?? "";
    const shappingEn = (formData.get("shapping_en") as string) ?? "";
    const shappingMedia = formData.get("shapping_media") instanceof File ? (formData.get("shapping_media") as File) : null;
    const tabulatedPt = (formData.get("tabulated_pt") as string) ?? "";
    const tabulatedEn = (formData.get("tabulated_en") as string) ?? "";
    const tabulatedMedia = formData.get("tabulated_media") instanceof File ? (formData.get("tabulated_media") as File) : null;
    const qualityPt = (formData.get("quality_pt") as string) ?? "";
    const qualityEn = (formData.get("quality_en") as string) ?? "";
    const qualityMedia = formData.get("quality_media") instanceof File ? (formData.get("quality_media") as File) : null;
    await updateOrCreateStep("id_mold", "mold", "Passo 1 – Mold", moldPt, moldEn, moldMedia);
    await updateOrCreateStep("id_shapping", "shapping", "Passo 2 – Shapping", shappingPt, shappingEn, shappingMedia);
    await updateOrCreateStep("id_tabulated", "tabulated", "Passo 3 – Tabulated", tabulatedPt, tabulatedEn, tabulatedMedia);
    await updateOrCreateStep("id_quality", "quality", "Passo 4 – Quality", qualityPt, qualityEn, qualityMedia);
    await updateOrCreateTitle("id_mold_title", "mold_title", "Passo 1 – Título (Molde)", (formData.get("mold_title_pt") as string) ?? "", (formData.get("mold_title_en") as string) ?? "");
    await updateOrCreateTitle("id_shapping_title", "shapping_title", "Passo 2 – Título (Forma)", (formData.get("shapping_title_pt") as string) ?? "", (formData.get("shapping_title_en") as string) ?? "");
    await updateOrCreateTitle("id_tabulated_title", "tabulated_title", "Passo 3 – Título (Tabelado)", (formData.get("tabulated_title_pt") as string) ?? "", (formData.get("tabulated_title_en") as string) ?? "");
    await updateOrCreateTitle("id_quality_title", "quality_title", "Passo 4 – Título (Qualidade)", (formData.get("quality_title_pt") as string) ?? "", (formData.get("quality_title_en") as string) ?? "");
    return { ok: true };
  }

  if (intent === "update" && id) {
    const value_pt = (formData.get("value_pt") as string) ?? "";
    const value_en = (formData.get("value_en") as string) ?? "";
    const section_id = (formData.get("section_id") as string) ?? "";
    const section_name = (formData.get("section_name") as string) ?? "";
    const productsIds = formData.getAll("products").filter((v): v is string => typeof v === "string" && v.length > 0);
    const categoriesIds = formData.getAll("categories").filter((v): v is string => typeof v === "string" && v.length > 0);

    const updatePayload: Record<string, string | string[]> = {
      value_pt,
      value_en,
      section_id,
      section_name,
    };
    if (collectionName === "Homepage") {
      updatePayload.products = productsIds;
      updatePayload.categories = categoriesIds;
    }

    const mediaFile = formData.get("media");
    if (mediaFile instanceof File && mediaFile.size > 0) {
      const body = new FormData();
      body.append("value_pt", value_pt);
      body.append("value_en", value_en);
      body.append("section_id", section_id);
      body.append("section_name", section_name);
      body.append("media", mediaFile);
      if (Array.isArray(updatePayload.products)) updatePayload.products.forEach((pid) => body.append("products", pid));
      if (Array.isArray(updatePayload.categories)) updatePayload.categories.forEach((cid) => body.append("categories", cid));
      await pb.collection(collectionName).update(id, body);
    } else {
      await pb.collection(collectionName).update(id, updatePayload);
    }
  }
  return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error)?.message ?? "Erro ao guardar" };
  }
}

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `${params.page || "Página"} – Walkys Backoffice` }];
}

function getRecordBySectionId(records: any[], sectionId: string) {
  return records.find((r: any) => (r.section_id ?? "") === sectionId);
}

function getRecordIds(record: any) {
  const products = record?.products ?? [];
  const categories = record?.categories ?? [];
  return {
    productIds: Array.isArray(products) ? products.map((p: any) => (typeof p === "string" ? p : p?.id)).filter(Boolean) : [],
    categoryIds: Array.isArray(categories) ? categories.map((c: any) => (typeof c === "string" ? c : c?.id)).filter(Boolean) : [],
  };
}

export default function BackofficePagesPage() {
  const data = useLoaderData<typeof loader>();
  const params = useParams();
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();

  const pageName = params.page || "Homepage";
  const records = data?.records ?? [];
  const collectionName = data?.collectionName ?? "";
  const page = data?.page ?? "";
  const baseUrl = data?.baseUrl ?? "";
  const productsList = data?.productsList ?? [];
  const categoriesList = data?.categoriesList ?? [];
  const isHomepage = page === "Homepage";


  if (!records.length && pageName !== "AboutPage") {
    return (
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{pageName}</h1>
        <p className="text-slate-600 mt-1">Nenhuma secção encontrada para esta página.</p>
      </div>
    );
  }

  if (isHomepage) {
    const heroTitle = getRecordBySectionId(records, "intro-title");
    const heroSubtitle = getRecordBySectionId(records, "intro-text");
    const heroProduct = getRecordBySectionId(records, "intro-product");
    const heroCategories = getRecordBySectionId(records, "intro-categories");
    const sliderTitle = getRecordBySectionId(records, "slider-products-title");
    const sliderSubtitle = getRecordBySectionId(records, "slider-products-subtitle");
    const sliderList = getRecordBySectionId(records, "slider-products-list");
    const sliderCtaText = getRecordBySectionId(records, "slider-products-cta-text");
    const sliderCtaLink = getRecordBySectionId(records, "slider-products-cta-link");
    const catSectionTitle = getRecordBySectionId(records, "categories-section-title");
    const catSectionSubtitle = getRecordBySectionId(records, "categories-section-subtitle");
    const catSectionList = getRecordBySectionId(records, "categories-section-list");
    const catSectionHighlighted = getRecordBySectionId(records, "categories-section-highlighted");

    const heroProductId = heroProduct ? (getRecordIds(heroProduct).productIds[0] ?? "") : "";
    const heroCategoryIds = heroCategories ? getRecordIds(heroCategories).categoryIds : [];
    const sliderProductIds = sliderList ? getRecordIds(sliderList).productIds : [];
    const catListIds = catSectionList ? getRecordIds(catSectionList) : { productIds: [], categoryIds: [] };
    const highlightedCategoryIds = catSectionHighlighted ? getRecordIds(catSectionHighlighted).categoryIds : [];
    // Always show categories section on Homepage so admins can edit; missing records are created on first save
    const hasCategoriesSection = true;

    return (
      <div className="relative">
        <BackofficeToast actionData={actionData} />
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{pageName}</h1>
        <p className="text-slate-600 mt-1 mb-6 text-sm">
          Edite o conteúdo por secção (Hero → Slider → Categorias). As alterações aplicam-se ao site em direto.
        </p>
        <div className="space-y-6">
          <section className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 sm:p-8" aria-labelledby="hero-heading">
            <h2 id="hero-heading" className="text-lg font-bold text-slate-900 mb-4">Hero</h2>
            <Form method="post" className="space-y-5">
              <input type="hidden" name="intent" value="update_hero" />
              {heroTitle && <input type="hidden" name="id_title" value={heroTitle.id} />}
              {heroSubtitle && <input type="hidden" name="id_subtitle" value={heroSubtitle.id} />}
              {heroProduct && <input type="hidden" name="id_product" value={heroProduct.id} />}
              {heroCategories && <input type="hidden" name="id_categories" value={heroCategories.id} />}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="block text-sm font-semibold text-slate-800 mb-2">{getHomepageSectionLabel("intro-title")}</span>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Título (PT)</label>
                  <input type="text" name="title_pt" defaultValue={heroTitle?.value_pt ?? ""} className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900" />
                </div>
                <div>
                  <span className="block text-sm font-semibold text-slate-800 mb-2 sr-only">{getHomepageSectionLabel("intro-title")}</span>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Título (EN)</label>
                  <input type="text" name="title_en" defaultValue={heroTitle?.value_en ?? ""} className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="block text-sm font-semibold text-slate-800 mb-2">{getHomepageSectionLabel("intro-text")}</span>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subtítulo (PT)</label>
                  <input type="text" name="subtitle_pt" defaultValue={heroSubtitle?.value_pt ?? ""} className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900" />
                </div>
                <div>
                  <span className="block text-sm font-semibold text-slate-800 mb-2 sr-only">{getHomepageSectionLabel("intro-text")}</span>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subtítulo (EN)</label>
                  <input type="text" name="subtitle_en" defaultValue={heroSubtitle?.value_en ?? ""} className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900" />
                </div>
              </div>
              <div>
                <span className="block text-sm font-semibold text-slate-800 mb-2">{getHomepageSectionLabel("intro-product")}</span>
                <select name="product" defaultValue={heroProductId} className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900">
                  <option value="">— Nenhum —</option>
                  {productsList.map((p: { id: string; name_pt?: string; name_en?: string }) => (
                    <option key={p.id} value={p.id}>{p.name_pt ?? p.name_en ?? p.id}</option>
                  ))}
                </select>
              </div>
              <div>
                <span className="block text-sm font-semibold text-slate-800 mb-2">{getHomepageSectionLabel("intro-categories")}</span>
                <div className="flex flex-wrap gap-3 max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-sm bg-slate-50">
                  {categoriesList.map((c: { id: string; name_pt?: string; name_en?: string }) => (
                    <label key={c.id} className="inline-flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name="categories" value={c.id} defaultChecked={heroCategoryIds.includes(c.id)} className="w-4 h-4 rounded border-slate-200 text-slate-800 focus:ring-slate-500" />
                      <span className="text-sm text-slate-700">{c.name_pt ?? c.name_en ?? c.id}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={navigation.state === "submitting"} className="px-4 py-2.5 bg-slate-800 text-white rounded-sm hover:bg-slate-900 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 font-medium text-sm">
                {navigation.state === "submitting" ? "A guardar…" : "Guardar hero"}
              </button>
            </Form>
          </section>

          <section className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 sm:p-8" aria-labelledby="slider-heading">
            <h2 id="slider-heading" className="text-lg font-bold text-slate-900 mb-4">Slider de produtos</h2>
            <Form method="post" className="space-y-5">
              <input type="hidden" name="intent" value="update_slider" />
              {sliderTitle && <input type="hidden" name="id_title" value={sliderTitle.id} />}
              {sliderSubtitle && <input type="hidden" name="id_subtitle" value={sliderSubtitle.id} />}
              {sliderList && <input type="hidden" name="id_list" value={sliderList.id} />}
              {sliderCtaText && <input type="hidden" name="id_cta_text" value={sliderCtaText.id} />}
              {sliderCtaLink && <input type="hidden" name="id_cta_link" value={sliderCtaLink.id} />}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="block text-sm font-semibold text-slate-800 mb-2">{getHomepageSectionLabel("slider-products-title")}</span>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Título (PT)</label>
                  <input type="text" name="title_pt" defaultValue={sliderTitle?.value_pt ?? ""} className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900" />
                </div>
                <div>
                  <span className="block text-sm font-semibold text-slate-800 mb-2 sr-only">{getHomepageSectionLabel("slider-products-title")}</span>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Título (EN)</label>
                  <input type="text" name="title_en" defaultValue={sliderTitle?.value_en ?? ""} className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="block text-sm font-semibold text-slate-800 mb-2">{getHomepageSectionLabel("slider-products-subtitle")}</span>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subtítulo (PT)</label>
                  <input type="text" name="subtitle_pt" defaultValue={sliderSubtitle?.value_pt ?? ""} className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900" />
                </div>
                <div>
                  <span className="block text-sm font-semibold text-slate-800 mb-2 sr-only">{getHomepageSectionLabel("slider-products-subtitle")}</span>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subtítulo (EN)</label>
                  <input type="text" name="subtitle_en" defaultValue={sliderSubtitle?.value_en ?? ""} className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900" />
                </div>
              </div>
              <div>
                <span className="block text-sm font-semibold text-slate-800 mb-2">{getHomepageSectionLabel("slider-products-list")}</span>
                <label className="block text-sm font-medium text-slate-700 mb-2">Produtos</label>
                <div className="flex flex-wrap gap-3 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-sm bg-slate-50">
                  {productsList.map((p: { id: string; name_pt?: string; name_en?: string }) => (
                    <label key={p.id} className="inline-flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name="products" value={p.id} defaultChecked={sliderProductIds.includes(p.id)} className="w-4 h-4 rounded border-slate-200 text-slate-800 focus:ring-slate-500" />
                      <span className="text-sm text-slate-700">{p.name_pt ?? p.name_en ?? p.id}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="border-t border-slate-200 pt-4">
                <span className="block text-sm font-semibold text-slate-800 mb-2">{getHomepageSectionLabel("slider-products-cta-text")}</span>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Texto do botão (PT)</label>
                    <input type="text" name="cta_text_pt" defaultValue={sliderCtaText?.value_pt ?? ""} placeholder="ex: Ver mais" className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Texto do botão (EN)</label>
                    <input type="text" name="cta_text_en" defaultValue={sliderCtaText?.value_en ?? ""} placeholder="ex: Explore more" className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="block text-sm font-semibold text-slate-800 mb-2">{getHomepageSectionLabel("slider-products-cta-link")}</span>
                  <label className="block text-sm font-medium text-slate-700 mb-1">URL do botão</label>
                  <input type="text" name="cta_link" defaultValue={sliderCtaLink?.value_pt ?? sliderCtaLink?.value_en ?? ""} placeholder="ex: /collection/autmn-winter-25" className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900" />
                </div>
              </div>
              <button type="submit" disabled={navigation.state === "submitting"} className="px-4 py-2.5 bg-slate-800 text-white rounded-sm hover:bg-slate-900 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 font-medium text-sm">
                {navigation.state === "submitting" ? "A guardar…" : "Guardar slider"}
              </button>
            </Form>
          </section>

          {hasCategoriesSection && (
            <section className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 sm:p-8" aria-labelledby="categories-section-heading">
              <h2 id="categories-section-heading" className="text-lg font-bold text-slate-900 mb-4">Secção de categorias</h2>
              <Form method="post" className="space-y-5">
                <input type="hidden" name="intent" value="update_categories_section" />
                {catSectionTitle && <input type="hidden" name="id_title" value={catSectionTitle.id} />}
                {catSectionSubtitle && <input type="hidden" name="id_subtitle" value={catSectionSubtitle.id} />}
                {catSectionList && <input type="hidden" name="id_list" value={catSectionList.id} />}
                {catSectionHighlighted && <input type="hidden" name="id_highlighted" value={catSectionHighlighted.id} />}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Título (PT)</label>
                    <input type="text" name="title_pt" defaultValue={catSectionTitle?.value_pt ?? ""} placeholder="Título da secção" className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Título (EN)</label>
                    <input type="text" name="title_en" defaultValue={catSectionTitle?.value_en ?? ""} placeholder="Section title" className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Subtítulo (PT)</label>
                    <input type="text" name="subtitle_pt" defaultValue={catSectionSubtitle?.value_pt ?? ""} placeholder="Subtítulo" className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Subtítulo (EN)</label>
                    <input type="text" name="subtitle_en" defaultValue={catSectionSubtitle?.value_en ?? ""} placeholder="Subtitle" className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Categorias em destaque (cartões)</label>
                  <p className="text-sm text-slate-500 mb-2">Estas categorias aparecem como cartões grandes na página inicial.</p>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border border-slate-300 rounded-sm bg-slate-50">
                    {categoriesList.map((c: { id: string; name_pt?: string; name_en?: string }) => (
                      <label key={c.id} className="inline-flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="highlighted_categories" value={c.id} defaultChecked={highlightedCategoryIds.includes(c.id)} className="w-4 h-4 rounded-sm border-slate-300 text-slate-800 focus:ring-slate-500" />
                        <span className="text-sm text-slate-700">{c.name_pt ?? c.name_en ?? c.id}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Categorias na lista (abaixo)</label>
                  <p className="text-sm text-slate-500 mb-2">Estas categorias aparecem em lista com produtos, por baixo dos cartões.</p>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border border-slate-300 rounded-sm bg-slate-50">
                    {categoriesList.map((c: { id: string; name_pt?: string; name_en?: string }) => (
                      <label key={c.id} className="inline-flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="list_categories" value={c.id} defaultChecked={catListIds.categoryIds.includes(c.id)} className="w-4 h-4 rounded-sm border-slate-300 text-slate-800 focus:ring-slate-500" />
                        <span className="text-sm text-slate-700">{c.name_pt ?? c.name_en ?? c.id}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={navigation.state === "submitting"} className="px-4 py-2.5 bg-slate-800 text-white rounded-sm hover:bg-slate-900 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 font-medium text-sm">
                  {navigation.state === "submitting" ? "A guardar…" : "Guardar secção de categorias"}
                </button>
              </Form>
            </section>
          )}
        </div>
      </div>
    );
  }

  const isAboutPage = pageName === "AboutPage";
  const introTitle = isAboutPage ? getRecordBySectionId(records, "intro_title") : null;
  const introText = isAboutPage ? getRecordBySectionId(records, "intro_text") : null;
  const introEyebrow = isAboutPage ? getRecordBySectionId(records, "intro_eyebrow") : null;
  const introImg = isAboutPage ? getRecordBySectionId(records, "intro_img") : null;
  const card1Title = isAboutPage ? getRecordBySectionId(records, "what_about_card_1_title") : null;
  const card1Text = isAboutPage ? getRecordBySectionId(records, "what_about_card_1_text") : null;
  const card1Image = isAboutPage ? getRecordBySectionId(records, "what_about_card_1_image") : null;
  const card2Title = isAboutPage ? getRecordBySectionId(records, "what_about_card_2_title") : null;
  const card2Text = isAboutPage ? getRecordBySectionId(records, "what_about_card_2_text") : null;
  const card2Image = isAboutPage ? getRecordBySectionId(records, "what_about_card_2_image") : null;
  const whatAboutSectionTitle = isAboutPage ? getRecordBySectionId(records, "what_about_section_title") : null;
  const aboutGallery = isAboutPage ? getRecordBySectionId(records, "about_gallery") : null;
  const gallerySectionTitle = isAboutPage ? getRecordBySectionId(records, "gallery_section_title") : null;
  const moldRecord = isAboutPage ? getRecordBySectionId(records, "mold") : null;
  const shappingRecord = isAboutPage ? getRecordBySectionId(records, "shapping") : null;
  const tabulatedRecord = isAboutPage ? getRecordBySectionId(records, "tabulated") : null;
  const qualityRecord = isAboutPage ? getRecordBySectionId(records, "quality") : null;
  const moldTitleRecord = isAboutPage ? getRecordBySectionId(records, "mold_title") : null;
  const shappingTitleRecord = isAboutPage ? getRecordBySectionId(records, "shapping_title") : null;
  const tabulatedTitleRecord = isAboutPage ? getRecordBySectionId(records, "tabulated_title") : null;
  const qualityTitleRecord = isAboutPage ? getRecordBySectionId(records, "quality_title") : null;
  const recordsToShow = isAboutPage ? [] : records;

  return (
    <div className="relative">
      <BackofficeToast actionData={actionData} />
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{pageName}</h1>
      <p className="text-slate-600 mt-1 mb-4">
        Edite o conteúdo em português (PT) e inglês (EN). As alterações aplicam-se ao site em direto.
      </p>
      {isAboutPage && (
        <Form method="post" className="mb-8">
          <input type="hidden" name="intent" value="import_about_from_code" />
          <button
            type="submit"
            disabled={navigation.state === "submitting"}
            className="px-4 py-2.5 border border-slate-200 rounded-sm text-slate-700 hover:bg-slate-50 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 text-sm font-medium"
          >
            {navigation.state === "submitting" ? "A importar…" : "Importar textos da página Sobre a partir do código"}
          </button>
          <span className="ml-2 text-sm text-slate-500">Preenche todos os campos com os textos de ~/lib/translations (about).</span>
        </Form>
      )}
      <div className="space-y-6" role="list">
        {isAboutPage && (
          <>
            <section className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 sm:p-8" aria-labelledby="about-hero-heading">
              <h2 id="about-hero-heading" className="text-lg font-bold text-slate-900 mb-4">Hero</h2>
              <Form method="post" encType="multipart/form-data" className="space-y-5">
                <input type="hidden" name="intent" value="update_about_hero" />
                {introTitle && <input type="hidden" name="id_title" value={introTitle.id} />}
                {introText && <input type="hidden" name="id_text" value={introText.id} />}
                {introEyebrow && <input type="hidden" name="id_eyebrow" value={introEyebrow.id} />}
                {introImg && <input type="hidden" name="id_img" value={introImg.id} />}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Eyebrow (PT)</label>
                    <input type="text" name="eyebrow_pt" defaultValue={introEyebrow?.value_pt ?? ""} className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900" placeholder="ex: A nossa história" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Eyebrow (EN)</label>
                    <input type="text" name="eyebrow_en" defaultValue={introEyebrow?.value_en ?? ""} className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900" placeholder="ex: Our story" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Título (PT)</label>
                    <input type="text" name="title_pt" defaultValue={introTitle?.value_pt ?? ""} className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900" placeholder="Título do hero" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Título (EN)</label>
                    <input type="text" name="title_en" defaultValue={introTitle?.value_en ?? ""} className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900" placeholder="Hero title" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Descrição (PT)</label>
                    <textarea name="description_pt" rows={4} defaultValue={introText?.value_pt ?? ""} className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900" placeholder="Descrição do hero" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Descrição (EN)</label>
                    <textarea name="description_en" rows={4} defaultValue={introText?.value_en ?? ""} className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900" placeholder="Hero description" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Imagem</label>
                  {introImg?.media && Array.isArray(introImg.media) && introImg.media.length > 0 && baseUrl && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {introImg.media.slice(0, 3).map((f: string) => (
                        <img key={f} src={`${baseUrl}/api/files/${collectionName}/${introImg.id}/${f}`} alt="" className="w-20 h-20 rounded-sm object-cover border border-slate-200" width={80} height={80} />
                      ))}
                    </div>
                  )}
                  <input type="file" name="media" accept="image/*" className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-slate-700 file:text-slate-100 file:font-medium text-sm" />
                  <p className="text-xs text-slate-500 mt-1">Para alterar a imagem do hero, envie um novo ficheiro.</p>
                </div>
                <button type="submit" disabled={navigation.state === "submitting"} className="px-4 py-2.5 bg-slate-800 text-white rounded-sm hover:bg-slate-900 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 font-medium text-sm">
                  {navigation.state === "submitting" ? "A guardar…" : "Guardar Hero"}
                </button>
              </Form>
            </section>

            <section className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 sm:p-8" aria-labelledby="about-whatabout-heading">
              <h2 id="about-whatabout-heading" className="text-lg font-bold text-slate-900 mb-4">WhatAbout (Valores)</h2>
              <Form method="post" encType="multipart/form-data" className="space-y-6">
                <input type="hidden" name="intent" value="update_about_whatabout" />
                {whatAboutSectionTitle && <input type="hidden" name="id_what_about_section_title" value={whatAboutSectionTitle.id} />}
                <div className="grid gap-4 sm:grid-cols-2 border-b border-slate-200 pb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Título da secção (PT)</label>
                    <input type="text" name="what_about_section_title_pt" defaultValue={whatAboutSectionTitle?.value_pt ?? ""} className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900" placeholder="ex: Sobre nós" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Título da secção (EN)</label>
                    <input type="text" name="what_about_section_title_en" defaultValue={whatAboutSectionTitle?.value_en ?? ""} className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900" placeholder="ex: What we stand for" />
                  </div>
                </div>
                {card1Title && <input type="hidden" name="id_card1_title" value={card1Title.id} />}
                {card1Text && <input type="hidden" name="id_card1_text" value={card1Text.id} />}
                {card1Image && <input type="hidden" name="id_card1_image" value={card1Image.id} />}
                {card2Title && <input type="hidden" name="id_card2_title" value={card2Title.id} />}
                {card2Text && <input type="hidden" name="id_card2_text" value={card2Text.id} />}
                {card2Image && <input type="hidden" name="id_card2_image" value={card2Image.id} />}
                <div className="border-b border-slate-200 pb-6">
                  <h3 className="text-sm font-semibold text-slate-800 mb-3">Cartão 1</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Título (PT)</label>
                      <input type="text" name="card1_title_pt" defaultValue={card1Title?.value_pt ?? ""} className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Título (EN)</label>
                      <input type="text" name="card1_title_en" defaultValue={card1Title?.value_en ?? ""} className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900" />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 mt-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Texto (PT)</label>
                      <textarea name="card1_text_pt" rows={3} defaultValue={card1Text?.value_pt ?? ""} className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Texto (EN)</label>
                      <textarea name="card1_text_en" rows={3} defaultValue={card1Text?.value_en ?? ""} className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Imagem cartão 1</label>
                    {card1Image?.media && Array.isArray(card1Image.media) && card1Image.media.length > 0 && baseUrl && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {card1Image.media.slice(0, 2).map((f: string) => (
                          <img key={f} src={`${baseUrl}/api/files/${collectionName}/${card1Image.id}/${f}`} alt="" className="w-16 h-16 rounded-sm object-cover border border-slate-200" width={64} height={64} />
                        ))}
                      </div>
                    )}
                    <input type="file" name="card1_media" accept="image/*" className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-slate-700 file:text-slate-100 file:font-medium text-sm" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-3">Cartão 2</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Título (PT)</label>
                      <input type="text" name="card2_title_pt" defaultValue={card2Title?.value_pt ?? ""} className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Título (EN)</label>
                      <input type="text" name="card2_title_en" defaultValue={card2Title?.value_en ?? ""} className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900" />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 mt-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Texto (PT)</label>
                      <textarea name="card2_text_pt" rows={3} defaultValue={card2Text?.value_pt ?? ""} className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Texto (EN)</label>
                      <textarea name="card2_text_en" rows={3} defaultValue={card2Text?.value_en ?? ""} className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Imagem cartão 2</label>
                    {card2Image?.media && Array.isArray(card2Image.media) && card2Image.media.length > 0 && baseUrl && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {card2Image.media.slice(0, 2).map((f: string) => (
                          <img key={f} src={`${baseUrl}/api/files/${collectionName}/${card2Image.id}/${f}`} alt="" className="w-16 h-16 rounded-sm object-cover border border-slate-200" width={64} height={64} />
                        ))}
                      </div>
                    )}
                    <input type="file" name="card2_media" accept="image/*" className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-slate-700 file:text-slate-100 file:font-medium text-sm" />
                  </div>
                </div>
                <button type="submit" disabled={navigation.state === "submitting"} className="px-4 py-2.5 bg-slate-800 text-white rounded-sm hover:bg-slate-900 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 font-medium text-sm">
                  {navigation.state === "submitting" ? "A guardar…" : "Guardar WhatAbout"}
                </button>
              </Form>
            </section>

            <section className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 sm:p-8" aria-labelledby="about-gallery-heading">
              <h2 id="about-gallery-heading" className="text-lg font-bold text-slate-900 mb-4">Processo (título e galeria)</h2>
              <Form method="post" encType="multipart/form-data" className="space-y-6">
                <input type="hidden" name="intent" value="update_about_gallery" />
                {gallerySectionTitle && <input type="hidden" name="id_gallery_section_title" value={gallerySectionTitle.id} />}
                {aboutGallery && <input type="hidden" name="id_about_gallery" value={aboutGallery.id} />}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Título da secção (PT)</label>
                    <input type="text" name="gallery_section_title_pt" defaultValue={gallerySectionTitle?.value_pt ?? ""} className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900" placeholder="ex: Como tudo começa" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Título da secção (EN)</label>
                    <input type="text" name="gallery_section_title_en" defaultValue={gallerySectionTitle?.value_en ?? ""} className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900" placeholder="ex: How it all starts" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Imagens da galeria</label>
                  {aboutGallery?.media && Array.isArray(aboutGallery.media) && aboutGallery.media.length > 0 && baseUrl && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {aboutGallery.media.slice(0, 6).map((f: string) => (
                        <img key={f} src={`${baseUrl}/api/files/${collectionName}/${aboutGallery.id}/${f}`} alt="" className="w-16 h-16 rounded-sm object-cover border border-slate-200" width={64} height={64} />
                      ))}
                    </div>
                  )}
                  <input type="file" name="gallery_media" accept="image/*" multiple className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-slate-700 file:text-slate-100 file:font-medium text-sm" />
                  <p className="text-xs text-slate-500 mt-1">Pode selecionar vários ficheiros. Novas imagens substituem as existentes.</p>
                </div>
                <button type="submit" disabled={navigation.state === "submitting"} className="px-4 py-2.5 bg-slate-800 text-white rounded-sm hover:bg-slate-900 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 font-medium text-sm">
                  {navigation.state === "submitting" ? "A guardar…" : "Guardar Processo"}
                </button>
              </Form>
            </section>

            <section className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 sm:p-8" aria-labelledby="about-passos-heading">
              <h2 id="about-passos-heading" className="text-lg font-bold text-slate-900 mb-1">Passos</h2>
              <p className="text-sm text-slate-600 mb-6">Os 4 passos exibidos na página Sobre (Molde, Forma, Tabelado, Qualidade). Edite título, descrição e imagem de cada passo.</p>
              <Form method="post" encType="multipart/form-data" className="space-y-6">
                <input type="hidden" name="intent" value="update_about_passos" />
                {moldRecord && <input type="hidden" name="id_mold" value={moldRecord.id} />}
                {shappingRecord && <input type="hidden" name="id_shapping" value={shappingRecord.id} />}
                {tabulatedRecord && <input type="hidden" name="id_tabulated" value={tabulatedRecord.id} />}
                {qualityRecord && <input type="hidden" name="id_quality" value={qualityRecord.id} />}
                {moldTitleRecord && <input type="hidden" name="id_mold_title" value={moldTitleRecord.id} />}
                {shappingTitleRecord && <input type="hidden" name="id_shapping_title" value={shappingTitleRecord.id} />}
                {tabulatedTitleRecord && <input type="hidden" name="id_tabulated_title" value={tabulatedTitleRecord.id} />}
                {qualityTitleRecord && <input type="hidden" name="id_quality_title" value={qualityTitleRecord.id} />}
                {[
                  { key: "mold", label: "Passo 1 – Mold", record: moldRecord, titleRecord: moldTitleRecord },
                  { key: "shapping", label: "Passo 2 – Shapping (Forma)", record: shappingRecord, titleRecord: shappingTitleRecord },
                  { key: "tabulated", label: "Passo 3 – Tabulated (Tabelado)", record: tabulatedRecord, titleRecord: tabulatedTitleRecord },
                  { key: "quality", label: "Passo 4 – Quality (Qualidade)", record: qualityRecord, titleRecord: qualityTitleRecord },
                ].map(({ key, label, record, titleRecord }) => (
                  <div key={key} className="grid gap-4 sm:grid-cols-2 border border-slate-200 rounded-sm p-4 bg-slate-50/50">
                    <div className="sm:col-span-2 font-medium text-slate-800">{label}</div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Título (PT)</label>
                      <input type="text" name={`${key}_title_pt`} defaultValue={titleRecord?.value_pt ?? ""} className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-white text-slate-900" placeholder="ex: Molde" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Título (EN)</label>
                      <input type="text" name={`${key}_title_en`} defaultValue={titleRecord?.value_en ?? ""} className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-white text-slate-900" placeholder="ex: Mold" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Descrição (PT)</label>
                      <textarea name={`${key}_pt`} rows={3} defaultValue={record?.value_pt ?? ""} className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-white text-slate-900" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Descrição (EN)</label>
                      <textarea name={`${key}_en`} rows={3} defaultValue={record?.value_en ?? ""} className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-white text-slate-900" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Imagem</label>
                      {record?.media && Array.isArray(record.media) && record.media.length > 0 && baseUrl && (
                        <div className="flex gap-2 mb-2">
                          {record.media.slice(0, 1).map((f: string) => (
                            <img key={f} src={`${baseUrl}/api/files/${collectionName}/${record.id}/${f}`} alt="" className="w-20 h-20 rounded-sm object-cover border border-slate-200" width={80} height={80} />
                          ))}
                        </div>
                      )}
                      <input type="file" name={`${key}_media`} accept="image/*" className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-slate-700 file:text-slate-100 file:font-medium text-sm" />
                      <p className="text-xs text-slate-500 mt-1">Enviar novo ficheiro substitui a imagem atual.</p>
                    </div>
                  </div>
                ))}
                <button type="submit" disabled={navigation.state === "submitting"} className="px-4 py-2.5 bg-slate-800 text-white rounded-sm hover:bg-slate-900 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 font-medium text-sm">
                  {navigation.state === "submitting" ? "A guardar…" : "Guardar Passos"}
                </button>
              </Form>
            </section>
          </>
        )}
        {recordsToShow.map((record: any) => {
          const sectionId = record.section_id ?? "";
          const sectionLabel =
            (pageName === "Homepage" ? getHomepageSectionLabel(sectionId) : null) ||
            record.section_name ||
            sectionId ||
            record.id;
          const isProductSection = false;
          const isCategorySection = false;
          const isRelationSection = false;
          const recordProducts = record.products ?? [];
          const recordProductIds = Array.isArray(recordProducts) ? recordProducts.map((p: any) => (typeof p === "string" ? p : p?.id)).filter(Boolean) : [];
          const recordCategories = record.categories ?? [];
          const recordCategoryIds = Array.isArray(recordCategories) ? recordCategories.map((c: any) => (typeof c === "string" ? c : c?.id)).filter(Boolean) : [];

          return (
          <section
            key={record.id}
            className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 sm:p-8"
            aria-labelledby={`section-${record.id}`}
          >
            <h2 id={`section-${record.id}`} className="text-lg font-bold text-slate-900 mb-1">
              {sectionLabel}
            </h2>
            {sectionId && (
              <p className="text-xs text-slate-500 font-mono mb-4">ID: {sectionId}</p>
            )}
            <Form method="post" encType="multipart/form-data" className="space-y-5">
              <input type="hidden" name="intent" value="update" />
              <input type="hidden" name="id" value={record.id} />
              <input type="hidden" name="section_id" value={record.section_id ?? ""} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="block text-sm font-medium text-slate-700 mb-1">
                    ID da secção
                  </span>
                  <p
                    id={`section_id-${record.id}`}
                    className="w-full px-3 py-2 border border-slate-300 rounded-sm bg-slate-100 text-slate-600 font-mono text-sm"
                    aria-readonly="true"
                  >
                    {record.section_id ?? "—"}
                  </p>
                </div>
                <div>
                  <label htmlFor={`section_name-${record.id}`} className="block text-sm font-medium text-slate-700 mb-1">
                    Nome da secção
                  </label>
                  <input
                    id={`section_name-${record.id}`}
                    name="section_name"
                    type="text"
                    defaultValue={record.section_name ?? ""}
                    className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900"
                    placeholder="ex: Título do hero"
                  />
                </div>
              </div>

              {isProductSection && productsList.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {sectionId === "intro-product" ? "Produto em destaque" : "Produtos do slider"}
                  </label>
                  {sectionId === "intro-product" ? (
                    <select
                      name="products"
                      defaultValue={recordProductIds[0] ?? ""}
                      className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900"
                    >
                      <option value="">— Nenhum —</option>
                      {productsList.map((prod: { id: string; name_pt?: string; name_en?: string }) => (
                        <option key={prod.id} value={prod.id}>{prod.name_pt ?? prod.name_en ?? prod.id}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex flex-wrap gap-3 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-sm bg-slate-50">
                      {productsList.map((prod: { id: string; name_pt?: string; name_en?: string }) => (
                        <label key={prod.id} className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="products"
                            value={prod.id}
                            defaultChecked={recordProductIds.includes(prod.id)}
                            className="w-4 h-4 rounded border-slate-200 text-slate-800 focus:ring-slate-500"
                          />
                          <span className="text-sm text-slate-700">{prod.name_pt ?? prod.name_en ?? prod.id}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {isCategorySection && categoriesList.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Categorias do hero</label>
                  <div className="flex flex-wrap gap-3 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-sm bg-slate-50">
                    {categoriesList.map((cat: { id: string; name_pt?: string; name_en?: string }) => (
                      <label key={cat.id} className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="categories"
                          value={cat.id}
                          defaultChecked={recordCategoryIds.includes(cat.id)}
                          className="w-4 h-4 rounded border-slate-200 text-slate-800 focus:ring-slate-500"
                        />
                        <span className="text-sm text-slate-700">{cat.name_pt ?? cat.name_en ?? cat.id}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {!isRelationSection && (
                <>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor={`value_pt-${record.id}`} className="block text-sm font-medium text-slate-700 mb-1">
                    Português (PT)
                  </label>
                  <textarea
                    id={`value_pt-${record.id}`}
                    name="value_pt"
                    rows={4}
                    defaultValue={record.value_pt ?? ""}
                    className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900"
                    aria-describedby={`value_pt-desc-${record.id}`}
                  />
                  <span id={`value_pt-desc-${record.id}`} className="sr-only">
                    Conteúdo em português para esta secção
                  </span>
                </div>
                <div>
                  <label htmlFor={`value_en-${record.id}`} className="block text-sm font-medium text-slate-700 mb-1">
                    Inglês (EN)
                  </label>
                  <textarea
                    id={`value_en-${record.id}`}
                    name="value_en"
                    rows={4}
                    defaultValue={record.value_en ?? ""}
                    className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 text-slate-900"
                    aria-describedby={`value_en-desc-${record.id}`}
                  />
                  <span id={`value_en-desc-${record.id}`} className="sr-only">
                    Conteúdo em inglês para esta secção
                  </span>
                </div>
              </div>
              {sectionNeedsMedia(sectionId) && record.media && Array.isArray(record.media) && record.media.length > 0 && baseUrl && (
                <div className="flex flex-wrap gap-2">
                  {record.media.slice(0, 5).map((f: string) => (
                    <img
                      key={f}
                      src={`${baseUrl}/api/files/${collectionName}/${record.id}/${f}`}
                      alt=""
                      className="w-16 h-16 rounded-sm object-cover border border-slate-200"
                      width={64}
                      height={64}
                    />
                  ))}
                  {record.media.length > 5 && (
                    <span className="text-sm text-slate-500 self-center">+{record.media.length - 5} mais</span>
                  )}
                </div>
              )}
              {sectionNeedsMedia(sectionId) && (
                <div>
                  <label htmlFor={`media-${record.id}`} className="block text-sm font-medium text-slate-700 mb-1">
                    Media (ficheiros)
                  </label>
                  <input
                    id={`media-${record.id}`}
                    name="media"
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="w-full px-3 py-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-500 bg-slate-50 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-slate-700 file:text-slate-100 file:font-medium text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Para alterar media, envie novos ficheiros. Em PocketBase, media é um campo multi-ficheiro.
                  </p>
                </div>
              )}
                </>
              )}

              {isRelationSection && (
                <input type="hidden" name="value_pt" value={record.value_pt ?? ""} />
              )}
              {isRelationSection && (
                <input type="hidden" name="value_en" value={record.value_en ?? ""} />
              )}

              <button
                type="submit"
                disabled={navigation.state === "submitting"}
                className="px-4 py-2.5 bg-slate-800 text-white rounded-sm hover:bg-slate-900 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 font-medium text-sm"
              >
                {navigation.state === "submitting" ? "A guardar…" : "Guardar secção"}
              </button>
            </Form>
          </section>
          );
        })}
      </div>
    </div>
  );
}
