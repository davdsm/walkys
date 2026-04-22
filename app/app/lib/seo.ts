import type { MetaDescriptor } from "react-router";

const SITE_URL = "https://walkys.com";
const SITE_NAME = "Walkys";
const BRAND_NAME = "Walkys - By Shoe Me";
const DEFAULT_IMAGE = "/cover.png";
const DEFAULT_DESCRIPTION =
  "Walkys creates elegant and comfortable shoes made in Portugal, combining design, craftsmanship, and everyday wearability.";

type SeoOptions = {
  title?: string;
  description?: string;
  pathname?: string;
  image?: string;
  imageAlt?: string;
  noIndex?: boolean;
  type?: "website" | "article" | "product";
  keywords?: string[];
};

function normalizeText(value?: string) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}...`;
}

function toAbsoluteUrl(value: string) {
  if (/^https?:\/\//i.test(value)) return value;
  return new URL(value.startsWith("/") ? value : `/${value}`, SITE_URL).toString();
}

export function buildPageTitle(title?: string) {
  const cleanTitle = normalizeText(title);
  return cleanTitle ? `${cleanTitle} | ${SITE_NAME}` : BRAND_NAME;
}

export function buildSeoMeta({
  title,
  description,
  pathname = "/",
  image = DEFAULT_IMAGE,
  imageAlt,
  noIndex = false,
  type = "website",
  keywords = [],
}: SeoOptions = {}): MetaDescriptor[] {
  const finalTitle = buildPageTitle(title);
  const finalDescription = truncateText(
    normalizeText(description) || DEFAULT_DESCRIPTION,
    160,
  );
  const finalUrl = toAbsoluteUrl(pathname);
  const finalImage = toAbsoluteUrl(image);
  const finalImageAlt = normalizeText(imageAlt) || finalTitle;
  const finalKeywords = keywords.map(normalizeText).filter(Boolean);

  const tags: MetaDescriptor[] = [
    { title: finalTitle },
    { name: "description", content: finalDescription },
    { name: "author", content: SITE_NAME },
    { name: "format-detection", content: "telephone=no" },
    { name: "robots", content: noIndex ? "noindex, nofollow" : "index, follow" },
    { name: "googlebot", content: noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:type", content: type },
    { property: "og:url", content: finalUrl },
    { property: "og:title", content: finalTitle },
    { property: "og:description", content: finalDescription },
    { property: "og:image", content: finalImage },
    { property: "og:image:alt", content: finalImageAlt },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "twitter:card", content: "summary_large_image" },
    { property: "twitter:site", content: "@walkys" },
    { property: "twitter:url", content: finalUrl },
    { property: "twitter:title", content: finalTitle },
    { property: "twitter:description", content: finalDescription },
    { property: "twitter:image", content: finalImage },
    { property: "twitter:image:alt", content: finalImageAlt },
    { tagName: "link", rel: "canonical", href: finalUrl },
  ];

  if (finalKeywords.length > 0) {
    tags.push({ name: "keywords", content: finalKeywords.join(", ") });
  }

  return tags;
}

export { BRAND_NAME, DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL };
