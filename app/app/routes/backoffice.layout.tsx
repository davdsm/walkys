import { useLoaderData, Form, useNavigation, useActionData } from "react-router";
import { BackofficeToast } from "~/components/Backoffice/BackofficeToast";
import { createPocketBase } from "~/lib/pocketbase";
import { ensureLayoutDefaults, type LayoutData, type LayoutMenuItem, type LayoutSocialItem, type LayoutFooterContent, type LayoutSmallCtaContent } from "~/lib/services/layout.service";
import type { Route } from "./+types/backoffice.layout";
import { buildSeoMeta } from "~/lib/seo";

export async function loader({ request }: Route.LoaderArgs) {
  const pb = createPocketBase(request);
  if (!pb.authStore.isValid) return { layout: null as LayoutData | null, baseUrl: "", error: null as string | null };
  const user = pb.authStore.model as { admin?: boolean } | null;
  if (!user?.admin) return { layout: null, baseUrl: "", error: null };
  try {
    await pb.collection("layout").getFullList({ limit: 1 });
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string; data?: { message?: string } };
    if (err?.status === 404 || /collection|not found/i.test(err?.message ?? "") || /collection|not found/i.test(err?.data?.message ?? "")) {
      const baseUrl = pb.baseUrl.replace(/\/$/, "");
      return { layout: null, baseUrl, error: "no_collection" as const };
    }
    throw e;
  }
  const layout = await ensureLayoutDefaults(pb);
  const baseUrl = pb.baseUrl.replace(/\/$/, "");
  return { layout, baseUrl, error: null };
}

function collectMenuItems(formData: FormData, prefix: string): LayoutMenuItem[] {
  const items: LayoutMenuItem[] = [];
  for (let i = 0; i < 30; i++) {
    const label_pt = formData.get(`${prefix}_${i}_label_pt`) as string;
    const label_en = formData.get(`${prefix}_${i}_label_en`) as string;
    const link = formData.get(`${prefix}_${i}_link`) as string;
    if (!label_pt && !label_en && !link) continue;
    items.push({ label_pt: label_pt ?? "", label_en: label_en ?? "", link: link ?? "" });
  }
  return items;
}

function collectSocialItems(formData: FormData): LayoutSocialItem[] {
  const items: LayoutSocialItem[] = [];
  for (let i = 0; i < 10; i++) {
    const label = formData.get(`social_${i}_label`) as string;
    const link = formData.get(`social_${i}_link`) as string;
    if (!label && !link) continue;
    items.push({ label: label ?? "", link: link ?? "" });
  }
  return items;
}

export async function action({ request }: Route.ActionArgs) {
  const pb = createPocketBase(request);
  if (!pb.authStore.isValid) return { ok: false };
  const user = pb.authStore.model as { admin?: boolean } | null;
  if (!user?.admin) return { ok: false };

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  try {
    if (intent === "favicon") {
      const id = formData.get("id") as string;
      const faviconFile = formData.get("favicon");
      if (id) {
        if (faviconFile instanceof File && faviconFile.size > 0) {
          const body = new FormData();
          body.append("content", "{}");
          body.append("logo", faviconFile);
          await pb.collection("layout").update(id, body);
        }
      } else {
        const body = new FormData();
        body.append("section_id", "favicon");
        body.append("content", "{}");
        if (faviconFile instanceof File && faviconFile.size > 0) body.append("logo", faviconFile);
        await pb.collection("layout").create(body);
      }
      return { ok: true };
    }

    if (intent === "header") {
      const id = formData.get("id") as string;
      const menuItems = collectMenuItems(formData, "menu");
      const socialItems = collectSocialItems(formData);
      const content = JSON.stringify({ menuItems, socialItems });
      const logoFile = formData.get("logo");
      if (id) {
        if (logoFile instanceof File && logoFile.size > 0) {
          const body = new FormData();
          body.append("content", content);
          body.append("logo", logoFile);
          await pb.collection("layout").update(id, body);
        } else {
          await pb.collection("layout").update(id, { content });
        }
      } else {
        const body = new FormData();
        body.append("section_id", "header");
        body.append("content", content);
        if (logoFile instanceof File && logoFile.size > 0) body.append("logo", logoFile);
        await pb.collection("layout").create(body);
      }
      return { ok: true };
    }

    if (intent === "footer") {
      const id = formData.get("id") as string;
      const menuItems = collectMenuItems(formData, "footmenu");
      const content: LayoutFooterContent = {
        logoText: (formData.get("logoText") as string) ?? "",
        menuItems,
        address_pt: (formData.get("address_pt") as string) ?? "",
        address_en: (formData.get("address_en") as string) ?? "",
        phone: (formData.get("phone") as string) ?? "",
        email: (formData.get("email") as string) ?? "",
        schedule_pt: (formData.get("schedule_pt") as string) ?? "",
        schedule_en: (formData.get("schedule_en") as string) ?? "",
        cta_link: (formData.get("cta_link") as string) ?? "",
        cta_text_pt: (formData.get("cta_text_pt") as string) ?? "",
        cta_text_en: (formData.get("cta_text_en") as string) ?? "",
        explore_pt: (formData.get("explore_pt") as string) ?? "",
        explore_en: (formData.get("explore_en") as string) ?? "",
        new_collection_pt: (formData.get("new_collection_pt") as string) ?? "",
        new_collection_en: (formData.get("new_collection_en") as string) ?? "",
        copyright_pt: (formData.get("copyright_pt") as string) ?? "",
        copyright_en: (formData.get("copyright_en") as string) ?? "",
      };
      const body = new FormData();
      body.append("content", JSON.stringify(content));
      const logoFile = formData.get("logo");
      const imageFile = formData.get("image");
      const imageCtaFile = formData.get("image_cta");
      if (logoFile instanceof File && logoFile.size > 0) body.append("logo", logoFile);
      if (imageFile instanceof File && imageFile.size > 0) body.append("image", imageFile);
      if (imageCtaFile instanceof File && imageCtaFile.size > 0) body.append("image_cta", imageCtaFile);
      if (id) {
        await pb.collection("layout").update(id, body);
      } else {
        body.append("section_id", "footer");
        await pb.collection("layout").create(body);
      }
      return { ok: true };
    }

    if (intent === "small_cta") {
      const id = formData.get("id") as string;
      const content: LayoutSmallCtaContent = {
        heading_pt: (formData.get("heading_pt") as string) ?? "",
        heading_en: (formData.get("heading_en") as string) ?? "",
        subtitle_pt: (formData.get("subtitle_pt") as string) ?? "",
        subtitle_en: (formData.get("subtitle_en") as string) ?? "",
        button_text_pt: (formData.get("button_text_pt") as string) ?? "",
        button_text_en: (formData.get("button_text_en") as string) ?? "",
        button_link: (formData.get("button_link") as string) ?? "",
      };
      if (id) {
        await pb.collection("layout").update(id, { content: JSON.stringify(content) });
      } else {
        await pb.collection("layout").create({ section_id: "small_cta", content: JSON.stringify(content) });
      }
      return { ok: true };
    }
  } catch (e) {
    console.error(e);
    return { ok: false, error: (e as Error)?.message ?? "Erro ao guardar" };
  }
  return { ok: false, error: "Ação desconhecida" };
}

export function meta() {
  return buildSeoMeta({
    title: "Backoffice Layout",
    description: "Manage layout settings in the Walkys backoffice.",
    pathname: "/backoffice/layout",
    noIndex: true,
  });
}

const defaultMenuItems: LayoutMenuItem[] = [
  { label_pt: "Início", label_en: "Begin", link: "/" },
  { label_pt: "A Walkys", label_en: "Walkys", link: "/about" },
  { label_pt: "Outono / Inverno", label_en: "Autumn / Winter", link: "/collection/autmn-winter-25" },
  { label_pt: "Contactos", label_en: "Contacts", link: "/contact" },
];

const defaultSocialItems: LayoutSocialItem[] = [
  { label: "Instagram", link: "https://instagram.com" },
  { label: "Facebook", link: "https://facebook.com" },
  { label: "LinkedIn", link: "https://linkedin.com" },
];

export default function BackofficeLayoutPage() {
  const { layout, baseUrl, error } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  const actionData = useActionData<typeof action>();

  if (error === "no_collection") {
    return (
      <div className="relative">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Layout</h1>
        <div className="bg-slate-800/10 border border-slate-700/30 rounded-sm p-6 sm:p-8 text-slate-800 shadow-sm mt-6">
          <p className="font-medium mb-2">Não existe a coleção &quot;layout&quot; no PocketBase</p>
          <p className="text-sm mb-4">
            Para editar o favicon, cabeçalho, rodapé e Small CTA a partir do backoffice, crie uma coleção no PocketBase com o nome <strong>layout</strong> e os campos:
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 mb-4">
            <li><strong>section_id</strong> (texto) – valores: <code className="bg-slate-200 px-1 rounded">header</code>, <code className="bg-slate-200 px-1 rounded">footer</code>, <code className="bg-slate-200 px-1 rounded">small_cta</code>, <code className="bg-slate-200 px-1 rounded">favicon</code></li>
            <li><strong>content</strong> (texto) – JSON com os textos da secção</li>
            <li><strong>logo</strong> (ficheiro, opcional) – logo do cabeçalho ou favicon</li>
            <li><strong>image</strong> (ficheiro, opcional) – imagem do rodapé</li>
            <li><strong>image_cta</strong> (ficheiro, opcional) – imagem do CTA do rodapé</li>
          </ul>
          <p className="text-sm text-neutral-600">
            Depois de criar a coleção, recarregue esta página. Os registos iniciais (header, footer, small_cta, favicon) serão criados automaticamente.
          </p>
        </div>
      </div>
    );
  }

  const header = layout?.header ?? null;
  const footer = layout?.footer ?? null;
  const smallCta = layout?.smallCta ?? null;
  const favicon = layout?.favicon ?? null;

  const headerMenuItems: LayoutMenuItem[] = header?.content?.menuItems?.length ? header.content.menuItems : defaultMenuItems;
  const headerSocialItems: LayoutSocialItem[] = header?.content?.socialItems?.length ? header.content.socialItems : defaultSocialItems;

  const footerMenuItems: LayoutMenuItem[] = footer?.content?.menuItems?.length ? footer.content.menuItems : defaultMenuItems;
  const footerContent = footer?.content;

  return (
    <div className="relative">
      <BackofficeToast actionData={actionData} />
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Layout</h1>
      <p className="text-slate-600 mt-1 mb-8">
        Edite o favicon, cabeçalho, rodapé e o bloco Small CTA. As alterações aplicam-se ao site.
      </p>

      <div className="space-y-8">
        {/* Favicon */}
        <section className="bg-white rounded-sm border border-slate-200 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Favicon</h2>
          <Form method="post" encType="multipart/form-data" className="space-y-5">
            <input type="hidden" name="intent" value="favicon" />
            {favicon && <input type="hidden" name="id" value={favicon.id} />}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Favicon (ícone do separador do browser)</label>
              <p className="text-sm text-slate-500 mb-2">Recomendado: ficheiro .ico ou .png, 32×32 ou 16×16 px.</p>
              {favicon?.faviconUrl && (
                <img src={favicon.faviconUrl} alt="Favicon atual" className="w-8 h-8 object-contain mb-2 border border-slate-200 rounded-sm" />
              )}
              <input type="file" name="favicon" accept="image/x-icon,image/png,image/svg+xml,.ico" className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-slate-700 file:text-slate-100" />
            </div>
            <button type="submit" disabled={navigation.state === "submitting"} className="px-4 py-2.5 bg-slate-800 text-white rounded-sm hover:bg-slate-900 font-medium text-sm disabled:opacity-50">
              {navigation.state === "submitting" ? "A guardar…" : "Guardar favicon"}
            </button>
          </Form>
        </section>

        {/* Header */}
        <section className="bg-white rounded-sm border border-slate-200/80 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Cabeçalho (Header)</h2>
          <Form method="post" encType="multipart/form-data" className="space-y-5">
            <input type="hidden" name="intent" value="header" />
            {header && <input type="hidden" name="id" value={header.id} />}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Logo</label>
              {header?.logoUrl && (
                <img src={header.logoUrl} alt="Logo" className="w-24 h-12 object-contain mb-2 border border-slate-200 rounded" />
              )}
              <input type="file" name="logo" accept="image/*" className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-slate-700 file:text-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Itens do menu (label PT, label EN, link)</label>
              {headerMenuItems.map((item, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2 p-2 rounded-sm bg-slate-50">
                  <input type="text" name={`menu_${i}_label_pt`} defaultValue={item.label_pt} placeholder="Label PT" className="px-3 py-2 border border-slate-200 rounded-sm text-sm" />
                  <input type="text" name={`menu_${i}_label_en`} defaultValue={item.label_en} placeholder="Label EN" className="px-3 py-2 border border-slate-200 rounded-sm text-sm" />
                  <input type="text" name={`menu_${i}_link`} defaultValue={item.link} placeholder="/path" className="px-3 py-2 border border-slate-200 rounded-sm text-sm" />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Redes sociais (label, link)</label>
              {headerSocialItems.map((item, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2 p-2 rounded-sm bg-slate-50">
                  <input type="text" name={`social_${i}_label`} defaultValue={item.label} placeholder="Label" className="px-3 py-2 border border-slate-200 rounded-sm text-sm" />
                  <input type="text" name={`social_${i}_link`} defaultValue={item.link} placeholder="https://..." className="px-3 py-2 border border-slate-200 rounded-sm text-sm" />
                </div>
              ))}
            </div>
            <button type="submit" disabled={navigation.state === "submitting"} className="px-4 py-2.5 bg-slate-800 text-white rounded-sm hover:bg-slate-900 font-medium text-sm disabled:opacity-50">
              {navigation.state === "submitting" ? "A guardar…" : "Guardar cabeçalho"}
            </button>
          </Form>
        </section>

        {/* Footer */}
        <section className="bg-white rounded-sm border border-slate-200/80 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Rodapé (Footer)</h2>
          <Form method="post" encType="multipart/form-data" className="space-y-5">
            <input type="hidden" name="intent" value="footer" />
            {footer && <input type="hidden" name="id" value={footer.id} />}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Texto do logo</label>
              <input type="text" name="logoText" defaultValue={footerContent?.logoText ?? "WALKYS"} className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Logo (imagem, opcional)</label>
              {footer?.logoUrl && <img src={footer.logoUrl} alt="Logo" className="w-24 h-12 object-contain mb-2 border border-slate-200 rounded" />}
              <input type="file" name="logo" accept="image/*" className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-slate-700 file:text-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Itens do menu rodapé</label>
              {footerMenuItems.map((item, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2 p-2 rounded-sm bg-slate-50">
                  <input type="text" name={`footmenu_${i}_label_pt`} defaultValue={item.label_pt} placeholder="Label PT" className="px-3 py-2 border border-slate-200 rounded-sm text-sm" />
                  <input type="text" name={`footmenu_${i}_label_en`} defaultValue={item.label_en} placeholder="Label EN" className="px-3 py-2 border border-slate-200 rounded-sm text-sm" />
                  <input type="text" name={`footmenu_${i}_link`} defaultValue={item.link} placeholder="/path" className="px-3 py-2 border border-slate-200 rounded-sm text-sm" />
                </div>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Morada (PT)</label>
                <input type="text" name="address_pt" defaultValue={footerContent?.address_pt ?? ""} className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Morada (EN)</label>
                <input type="text" name="address_en" defaultValue={footerContent?.address_en ?? ""} className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                <input type="text" name="phone" defaultValue={footerContent?.phone ?? ""} className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" name="email" defaultValue={footerContent?.email ?? ""} className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Horário (PT)</label>
                <input type="text" name="schedule_pt" defaultValue={footerContent?.schedule_pt ?? ""} className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Horário (EN)</label>
                <input type="text" name="schedule_en" defaultValue={footerContent?.schedule_en ?? ""} className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Imagem do rodapé (ex.: Portugal 2020)</label>
              {footer?.imageUrl && <img src={footer.imageUrl} alt="" className="w-32 h-12 object-contain mb-2 border border-slate-200 rounded" />}
              <input type="file" name="image" accept="image/*" className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-slate-700 file:text-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Imagem do CTA do rodapé (cartão Nova Coleção)</label>
              {footer?.imageCtaUrl && <img src={footer.imageCtaUrl} alt="" className="w-full max-w-md h-24 object-cover mb-2 border border-slate-200 rounded" />}
              <input type="file" name="image_cta" accept="image/*" className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-slate-700 file:text-slate-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Link do CTA do rodapé</label>
              <input type="text" name="cta_link" defaultValue={footerContent?.cta_link ?? "/collections/new"} className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Texto CTA pequeno (PT)</label>
                <input type="text" name="cta_text_pt" defaultValue={footerContent?.cta_text_pt ?? ""} className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Texto CTA pequeno (EN)</label>
                <input type="text" name="cta_text_en" defaultValue={footerContent?.cta_text_en ?? ""} className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Explorar (PT)</label>
                <input type="text" name="explore_pt" defaultValue={footerContent?.explore_pt ?? ""} className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Explorar (EN)</label>
                <input type="text" name="explore_en" defaultValue={footerContent?.explore_en ?? ""} className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nova coleção (PT)</label>
                <input type="text" name="new_collection_pt" defaultValue={footerContent?.new_collection_pt ?? ""} className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nova coleção (EN)</label>
                <input type="text" name="new_collection_en" defaultValue={footerContent?.new_collection_en ?? ""} className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Copyright (PT)</label>
                <input type="text" name="copyright_pt" defaultValue={footerContent?.copyright_pt ?? ""} className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Copyright (EN)</label>
                <input type="text" name="copyright_en" defaultValue={footerContent?.copyright_en ?? ""} className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm" />
              </div>
            </div>
            <button type="submit" disabled={navigation.state === "submitting"} className="px-4 py-2.5 bg-slate-800 text-white rounded-sm hover:bg-slate-900 font-medium text-sm disabled:opacity-50">
              {navigation.state === "submitting" ? "A guardar…" : "Guardar rodapé"}
            </button>
          </Form>
        </section>

        {/* Small CTA */}
        <section className="bg-white rounded-sm border border-slate-200/80 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Small CTA</h2>
          <Form method="post" className="space-y-5">
            <input type="hidden" name="intent" value="small_cta" />
            {smallCta && <input type="hidden" name="id" value={smallCta.id} />}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título (PT)</label>
                <input type="text" name="heading_pt" defaultValue={smallCta?.content?.heading_pt ?? ""} className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título (EN)</label>
                <input type="text" name="heading_en" defaultValue={smallCta?.content?.heading_en ?? ""} className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subtítulo (PT)</label>
                <textarea name="subtitle_pt" rows={3} defaultValue={smallCta?.content?.subtitle_pt ?? ""} className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subtítulo (EN)</label>
                <textarea name="subtitle_en" rows={3} defaultValue={smallCta?.content?.subtitle_en ?? ""} className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Texto do botão (PT)</label>
                <input type="text" name="button_text_pt" defaultValue={smallCta?.content?.button_text_pt ?? ""} className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Texto do botão (EN)</label>
                <input type="text" name="button_text_en" defaultValue={smallCta?.content?.button_text_en ?? ""} className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Link do botão</label>
              <input type="text" name="button_link" defaultValue={smallCta?.content?.button_link ?? ""} className="w-full px-3 py-2 border border-slate-200 rounded-sm text-sm" placeholder="/collection/..." />
            </div>
            <button type="submit" disabled={navigation.state === "submitting"} className="px-4 py-2.5 bg-slate-800 text-white rounded-sm hover:bg-slate-900 font-medium text-sm disabled:opacity-50">
              {navigation.state === "submitting" ? "A guardar…" : "Guardar Small CTA"}
            </button>
          </Form>
        </section>
      </div>
    </div>
  );
}
