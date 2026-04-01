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
  noIndex?: boolean;
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
  noIndex = false,
}: SeoOptions = {}): MetaDescriptor[] {
  const finalTitle = buildPageTitle(title);
  const finalDescription = truncateText(
    normalizeText(description) || DEFAULT_DESCRIPTION,
    160,
  );
  const finalUrl = toAbsoluteUrl(pathname);
  const finalImage = toAbsoluteUrl(image);

  return [
    { title: finalTitle },
    { name: "description", content: finalDescription },
    { name: "robots", content: noIndex ? "noindex, nofollow" : "index, follow" },
    { property: "og:type", content: "website" },
    { property: "og:url", content: finalUrl },
    { property: "og:title", content: finalTitle },
    { property: "og:description", content: finalDescription },
    { property: "og:image", content: finalImage },
    { property: "twitter:card", content: "summary_large_image" },
    { property: "twitter:url", content: finalUrl },
    { property: "twitter:title", content: finalTitle },
    { property: "twitter:description", content: finalDescription },
    { property: "twitter:image", content: finalImage },
  ];
}

export { BRAND_NAME, DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL };
