import React from "react";
import { useLocation } from "react-router";
import { AnimatePresence, motion } from "framer-motion";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  // Define excluded routes (auth, dashboard, etc.)
  // Using partial matching for flexibility
  const excludedPrefixes = [
    "/auth",
    "/dashboard",
    "/forgot-password",
    "/reset-password",
    "/logout",
  ];

  const isExcluded = excludedPrefixes.some((prefix) =>
    location.pathname.startsWith(prefix)
  );

  if (isExcluded) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full flex flex-col flex-1 min-h-full min-h-screen"
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}
