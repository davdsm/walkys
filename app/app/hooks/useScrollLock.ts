import { useCallback } from "react";

/**
 * Hook to lock/unlock scroll on the document body
 * Useful for when modals or menus are open
 */
export function useScrollLock() {
  const lock = useCallback(() => {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.overflow = "hidden";
  }, []);

  const unlock = useCallback(() => {
    const scrollY = parseInt(document.body.style.top || "0", 10);
    document.body.style.position = "";
    document.body.style.width = "";
    document.body.style.top = "";
    document.body.style.overflow = "";
    window.scrollTo(0, -scrollY);
  }, []);

  return { lock, unlock };
}
