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

export function getLanguageFromRequest(request: Request): "en" | "pt" {
  const cookies = parseCookies(request.headers.get("cookie"));
  if (cookies.language === "en" || cookies.language === "pt") {
    return cookies.language;
  }

  // Fallback to Accept-Language header
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage?.includes("pt")) {
    return "pt";
  }

  return "en"; // Default
}
