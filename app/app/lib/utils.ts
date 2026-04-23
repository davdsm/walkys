import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseCookies(cookieString: string | null) {
  if (!cookieString) return {};
  return Object.fromEntries(
    cookieString.split(";").map((cookie) => {
      const [key, ...value] = cookie.split("=");
      return [key.trim(), value.join("=")];
    })
  );
}

const VIDEO_EXTENSIONS = ["mp4", "webm", "ogg", "mov", "m4v"];

/** Returns "video" if URL looks like a video file (by extension), else "image". Handles query strings. */
export function getMediaType(url: string): "image" | "video" {
  if (!url || typeof url !== "string") return "image";
  const path = url.split("?")[0];
  const extension = path.split(".").pop()?.toLowerCase();
  return extension && VIDEO_EXTENSIONS.includes(extension) ? "video" : "image";
}

export function getLanguageFromRequest(request: Request): "en" | "pt" {
  const cookies = parseCookies(request.headers.get("cookie"));
  if (cookies.language === "en" || cookies.language === "pt") {
    return cookies.language;
  }

  // Always default to English unless user explicitly switches language.
  return "en";
}
