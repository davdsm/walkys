import { useMemo } from "react";
import { useLocation } from "react-router";

/**
 * Hook to use useHeader in components
 * Automatically decides if header appear based on route
 *
 * @returns boolean indicating if header should be shown
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const showHeader = useHeader();
 *
 *  return <>{showHeader && <Header />}</>
 * }
 * ```
 */
export function useHeader() {
  const location = useLocation();

  return useMemo(() => {
    // Routes where Header should NOT be displayed
    const hideHeaderRoutes = [
      "/auth/login",
      "/auth/signup",
      "/dashboard",
      "/forgot-password",
      "/logout",
    ];
    const shouldHideHeader = hideHeaderRoutes.some((route) =>
      location?.pathname?.startsWith(route)
    );

    return shouldHideHeader;
  }, [location.pathname]);
}
