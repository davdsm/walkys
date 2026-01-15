import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { AnimatePresence, motion } from "framer-motion";

interface PageTransitionProps {
  readonly children: React.ReactNode;
}

/**
 * A component that captures and freezes its children at mount time.
 * This prevents the exiting page from updating to the new route's content
 * during the exit animation, which is a common cause of "broken" transitions.
 */
function FrozenRoute({ children }: { readonly children: React.ReactNode }) {
  const [frozenChildren] = useState(children);

  useEffect(() => {
    // Scroll to top when the new route enters
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return <>{frozenChildren}</>;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  // Define excluded routes (auth, dashboard, etc.)
  const excludedPrefixes = [
    "/auth",
    "/dashboard",
    "/forgot-password",
    "/reset-password",
    "/logout",
    "/orders",
  ];

  const isExcluded = excludedPrefixes.some((prefix) =>
    location.pathname.startsWith(prefix)
  );

  if (isExcluded) {
    return <>{children}</>;
  }

  // Allow animations on homepage even on refresh
  // For other pages, use initial={false} to prevent animations on first load
  const isHomepage = location.pathname === "/";

  return (
    <AnimatePresence mode="wait" initial={isHomepage}>
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{
          duration: 0.3,
          // Smooth easeOutQuart-like curve for a premium feel
          ease: [0.22, 1, 0.36, 1],
        }}
        className="w-full flex flex-col flex-1 min-h-screen"
      >
        <FrozenRoute>{children}</FrozenRoute>
      </motion.main>
    </AnimatePresence>
  );
}
