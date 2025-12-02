import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router";
import { Footer } from "./Footer";

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

    // Footer visibility logic
    // Hide on specific routes
    const hideFooterPrefixes = [
        "/auth",
        "/dashboard",
        "/forgot-password",
        "/reset-password",
        "/logout",
    ];

    // Also hide on specific exact paths if needed (e.g. About as requested)
    const hideFooterExact = ["/about"];

    const shouldHideFooter =
        hideFooterPrefixes.some(prefix => location.pathname.startsWith(prefix)) ||
        hideFooterExact.includes(location.pathname);

    if (isExcluded) {
        return <>{children}</>;
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="w-full flex flex-col flex-1 min-h-full min-h-screen"
            >
                {children}
                {!shouldHideFooter && <Footer />}
            </motion.div>
        </AnimatePresence>
    );
}
