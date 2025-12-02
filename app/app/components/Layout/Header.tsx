import { Link } from "react-router";
import { LanguageSwitcher } from "~/components/Elements/LanguageSwitcher/LanguageSwitcher";
import { motion } from "framer-motion";

interface HeaderProps {
    variant?: "light" | "dark";
}

export function Header({ variant = "light" }: HeaderProps) {
    return (
        <motion.header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-end p-6 gap-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2, ease: "easeInOut" }}
        >
            <Link to="/" className={variant === "dark" ? "text-black" : "text-white"}>
                AskNicely
            </Link>
            <Link to="/about" className={variant === "dark" ? "text-black" : "text-white"}>
                About
            </Link>
            <LanguageSwitcher variant={variant} />
        </motion.header>
    );
}
