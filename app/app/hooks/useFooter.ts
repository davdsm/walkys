import { useMemo } from "react";
import { useLocation } from "react-router";

/**
 * Hook to determine footer visibility and variant from the current route.
 * Uses current pathname synchronously so the footer always shows/hides correctly
 * without depending on useEffect (avoids hydration or timing issues).
 */
export function useFooter(): {
  shouldHideFooter: boolean;
  variant: "light" | "dark";
} {
  const location = useLocation();
  const pathname = location?.pathname ?? "/";

  return useMemo(() => {
    const hideFooterRoutes = [
      "/auth",
      "/dashboard",
      "/backoffice",
      "/forgot-password",
      "/logout",
      "/orders",
      "/checkout",
      "/pending-approval",
      "/blocked",
      "/registration-success",
    ];
    const darkVariantRoutes = ["/terms", "/privacy"];

    const shouldHideFooter = hideFooterRoutes.some((route) =>
      pathname.startsWith(route)
    );
    const variant = darkVariantRoutes.some((route) => pathname.startsWith(route))
      ? "dark"
      : "light";

    return { shouldHideFooter, variant };
  }, [pathname]);
}
