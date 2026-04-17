import type PocketBase from "pocketbase";
import { getPocketBasePublicBaseUrl } from "../pocketbase";

export type LayoutSectionId = "header" | "footer" | "small_cta" | "favicon";

export interface LayoutMenuItem {
  label_pt: string;
  label_en: string;
  link: string;
}

export interface LayoutSocialItem {
  label: string;
  link: string;
}

export interface LayoutHeaderContent {
  menuItems?: LayoutMenuItem[];
  socialItems?: LayoutSocialItem[];
}

export interface LayoutFooterContent {
  logoText?: string;
  menuItems?: LayoutMenuItem[];
  address_pt?: string;
  address_en?: string;
  phone?: string;
  email?: string;
  schedule_pt?: string;
  schedule_en?: string;
  cta_link?: string;
  cta_text_pt?: string;
  cta_text_en?: string;
  explore_pt?: string;
  explore_en?: string;
  new_collection_pt?: string;
  new_collection_en?: string;
  copyright_pt?: string;
  copyright_en?: string;
}

export interface LayoutSmallCtaContent {
  heading_pt?: string;
  heading_en?: string;
  subtitle_pt?: string;
  subtitle_en?: string;
  button_text_pt?: string;
  button_text_en?: string;
  button_link?: string;
}

export interface LayoutRecord {
  id: string;
  section_id: LayoutSectionId;
  content: string | Record<string, unknown>;
  logo?: string;
  image?: string;
  image_cta?: string;
}

export interface LayoutHeaderData {
  id: string;
  content: LayoutHeaderContent;
  logoUrl: string | null;
}

export interface LayoutFooterData {
  id: string;
  content: LayoutFooterContent;
  logoUrl: string | null;
  imageUrl: string | null;
  imageCtaUrl: string | null;
}

export interface LayoutSmallCtaData {
  id: string;
  content: LayoutSmallCtaContent;
}

export interface LayoutFaviconData {
  id: string;
  faviconUrl: string | null;
}

export interface LayoutData {
  header: LayoutHeaderData | null;
  footer: LayoutFooterData | null;
  smallCta: LayoutSmallCtaData | null;
  favicon: LayoutFaviconData | null;
}

function buildFileUrl(recordId: string, filename: string | undefined, collectionName: string): string | null {
  if (!filename) return null;
  const baseUrl = getPocketBasePublicBaseUrl();
  return `${baseUrl}/api/files/${collectionName}/${recordId}/${filename}`;
}

export async function getLayoutData(pb: PocketBase): Promise<LayoutData> {
  const result: LayoutData = { header: null, footer: null, smallCta: null, favicon: null };
  try {
    const records = await pb.collection("layout").getFullList<LayoutRecord & { section_id?: string }>({ sort: "section_id" });
    const col = "layout";
    for (const rec of records) {
      const sectionId = (rec.section_id ?? "") as LayoutSectionId;
      let content: LayoutHeaderContent | LayoutFooterContent | LayoutSmallCtaContent = {};
      try {
        content = typeof rec.content === "string" ? JSON.parse(rec.content) : (rec.content || {});
      } catch {
        // keep empty
      }
      if (sectionId === "header") {
        result.header = {
          id: rec.id,
          content: content as LayoutHeaderContent,
          logoUrl: rec.logo ? buildFileUrl(rec.id, rec.logo, col) : null,
        };
      } else if (sectionId === "footer") {
        result.footer = {
          id: rec.id,
          content: content as LayoutFooterContent,
          logoUrl: rec.logo ? buildFileUrl(rec.id, rec.logo, col) : null,
          imageUrl: rec.image ? buildFileUrl(rec.id, rec.image, col) : null,
          imageCtaUrl: rec.image_cta ? buildFileUrl(rec.id, rec.image_cta, col) : null,
        };
      } else if (sectionId === "small_cta") {
        result.smallCta = { id: rec.id, content: content as LayoutSmallCtaContent };
      } else if (sectionId === "favicon") {
        result.favicon = {
          id: rec.id,
          faviconUrl: rec.logo ? buildFileUrl(rec.id, rec.logo, col) : null,
        };
      }
    }
  } catch {
    // no layout collection or error
  }
  return result;
}

const defaultHeaderMenuItems: LayoutMenuItem[] = [
  { label_pt: "Início", label_en: "Begin", link: "/" },
  { label_pt: "A Walkys", label_en: "Walkys", link: "/about" },
  { label_pt: "Outono / Inverno", label_en: "Autumn / Winter", link: "/collection/autmn-winter-25" },
  { label_pt: "Contactos", label_en: "Contacts", link: "/contact" },
];

const defaultHeaderSocialItems: LayoutSocialItem[] = [
  { label: "Instagram", link: "https://instagram.com" },
  { label: "Facebook", link: "https://facebook.com" },
  { label: "LinkedIn", link: "https://linkedin.com" },
];

const defaultFooterContent: LayoutFooterContent = {
  logoText: "WALKYS",
  menuItems: defaultHeaderMenuItems,
  address_pt: "V.N. Sande, Famalicão",
  address_en: "2972 Westheimer Rd. Santa Ana, Illinois 85486",
  phone: "+351 253 412 421",
  email: "",
  schedule_pt: "Seg—Sex",
  schedule_en: "Mon—Fri",
  cta_link: "/collections/new",
  cta_text_pt: "NOVA COLEÇÃO",
  cta_text_en: "NEW COLLECTION",
  explore_pt: "Explorar",
  explore_en: "Explore",
  new_collection_pt: "NOVA COLEÇÃO",
  new_collection_en: "NEW COLLECTION",
  copyright_pt: "© 2025 – Copyright",
  copyright_en: "© 2025 – Copyright",
};

const defaultSmallCtaContent: LayoutSmallCtaContent = {
  heading_pt: "SHINNING SINCE 1981",
  heading_en: "SHINNING SINCE 1981",
  subtitle_pt: "Um texto sobre a empresa, algo icónico, mas fixe e bonito, que tenha algumas linhas até.",
  subtitle_en: "A text about the company, something iconic, but cool and beautiful, that has a few lines to.",
  button_text_pt: "SHOP NOW",
  button_text_en: "SHOP NOW",
  button_link: "/",
};

/** Creates missing header, footer, small_cta, and favicon records with default content. Returns fresh layout data. */
export async function ensureLayoutDefaults(pb: PocketBase): Promise<LayoutData> {
  const current = await getLayoutData(pb);
  try {
    if (!current.header) {
      const content: LayoutHeaderContent = { menuItems: defaultHeaderMenuItems, socialItems: defaultHeaderSocialItems };
      await pb.collection("layout").create({ section_id: "header", content: JSON.stringify(content) });
    }
    if (!current.footer) {
      await pb.collection("layout").create({ section_id: "footer", content: JSON.stringify(defaultFooterContent) });
    }
    if (!current.smallCta) {
      await pb.collection("layout").create({ section_id: "small_cta", content: JSON.stringify(defaultSmallCtaContent) });
    }
    if (!current.favicon) {
      await pb.collection("layout").create({ section_id: "favicon", content: "{}" });
    }
  } catch {
    // collection may not exist or schema mismatch; return current
    return current;
  }
  return getLayoutData(pb);
}
