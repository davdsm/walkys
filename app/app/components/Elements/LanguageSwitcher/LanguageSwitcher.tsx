import { motion } from "motion/react";
import { useLanguage, type Language } from "~/contexts";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
    variant?: "light" | "dark";
    className?: string;
}

export function LanguageSwitcher({ variant = "light", className }: LanguageSwitcherProps) {
    const { language, setLanguage } = useLanguage();

    const languages: { code: Language; label: string }[] = [
        { code: "pt", label: "PT" },
        { code: "en", label: "EN" },
    ];

    const isDark = variant === "dark";

    return (
        <div className={`z-50 flex items-center gap-2 rounded-full p-2 border ${isDark
            ? "bg-white/10 backdrop-blur-md border-white/10"
            : "bg-white/10 backdrop-blur-md border-white/20"
            } ${className}`}>
            <Globe className={`w-4 h-4 ml-2 ${isDark ? "text-black/70" : "text-white/70"}`} />
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`
                        px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                        ${language === lang.code
                            ? isDark
                                ? "bg-black text-white"
                                : "bg-white text-black"
                            : isDark
                                ? "text-black/70 hover:text-black hover:bg-black/10"
                                : "text-white/70 hover:text-white hover:bg-white/10"
                        }
                    `}
                >
                    {lang.label}
                </button>
            ))}
        </div>
    );
}
