import { useMemo } from "react";
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
 *   const showFooter = useFooter();
 *
 *  return <>{ showFooter && <Footer />}</>
 * }
 * ```
 */
export function useFooter() {
  const location = useLocation();

  return useMemo(() => {
    // Routes where Footer should NOT be displayed
    const hideFooterRoutes = [
      "/auth/login",
      "/auth/signup",
      "/dashboard",
      "/forgot-password",
      "/logout",
    ];
    const shouldHideFooter = hideFooterRoutes.some((route) =>
      location?.pathname?.startsWith(route)
    );

    return shouldHideFooter;
  }, [location.pathname]);
}
