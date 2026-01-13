import { useEffect, useState } from "react";
import { useLocation } from "react-router";

/**
 * Hook to use useFooter in components
 * Automatically decides if footer appear based on route
 *
 * @returns boolean indicating if footer should be shown
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { shouldHideFooter, variant } = useFooter();
 *
 *  return <>{ shouldHideFooter && <Footer variant={variant} />}</>
 * }
 * ```
 */
export function useFooter(): {
  shouldHideFooter: boolean;
  variant: "light" | "dark";
} {
  const location = useLocation();
  const [shouldHideFooter, setShouldHideFooter] = useState(false);
  const [variant, setVariant] = useState<"light" | "dark">("light");

  // Routes where Footer should NOT be displayed
  const hideFooterRoutes = [
    "/auth/login",
    "/auth/signup",
    "/dashboard",
    "/forgot-password",
    "/logout",
  ];

  // Routes with white backgrounds need dark variant
  const darkVariantRoutes = ["/terms", "/privacy"];

  useEffect(() => {
    const shouldHideFooter = hideFooterRoutes.some((route) =>
      location?.pathname?.startsWith(route)
    );

    const useWhiteVariant = darkVariantRoutes.some((route) =>
      location?.pathname?.startsWith(route)
    );

    setShouldHideFooter(shouldHideFooter);
    setVariant(useWhiteVariant ? "dark" : "light");
  }, [location.pathname]);

  return { shouldHideFooter, variant };
}
