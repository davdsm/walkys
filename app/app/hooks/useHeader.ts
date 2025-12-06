import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";

/**
 * Hook to use useHeader in components
 * Automatically decides if header appear based on route, and indicates if dark variant should be used
 *
 * @returns { shouldHideHeader: boolean, variant: "light" | "dark" }
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { shouldHideHeader, variant } = useHeader();
 *
 *  return <>{shouldHideHeader && <Header variant={variant} />}</>
 * }
 * ```
 */
export function useHeader(): { shouldHideHeader: boolean; variant: "light" | "dark" } {
  const location = useLocation();
  const [isOverFooter, setIsOverFooter] = useState(false);

  // Routes where Header should NOT be displayed
  const hideHeaderRoutes = [
    "/auth/login",
    "/auth/signup",
    "/dashboard",
    "/forgot-password",
    "/logout",
  ];

  // Routes with white backgrounds need dark variant
  const darkVariantRoutes = [
    "/contact",
  ];

  const shouldHideHeader = useMemo(() => {
    return hideHeaderRoutes.some((route) =>
      location?.pathname?.startsWith(route)
    );
  }, [location.pathname]);

  const routeVariant = useMemo(() => {
    const useDarkVariant = darkVariantRoutes.some((route) =>
      location?.pathname?.startsWith(route)
    );
    return useDarkVariant ? "dark" : "light";
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.getElementById("main-footer");
      const header = document.getElementById("main-header");

      if (footer && header) {
        const footerRect = footer.getBoundingClientRect();
        const headerRect = header.getBoundingClientRect();

        // Check if footer is overlapping with header
        // We use a small buffer (e.g. header height / 2) to make the transition smoother if needed
        // But strict overlap is footerRect.top <= headerRect.bottom
        if (footerRect.top <= headerRect.bottom) {
          setIsOverFooter(true);
        } else {
          setIsOverFooter(false);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const variant = isOverFooter ? "light" : routeVariant;

  return { shouldHideHeader, variant };
}
