import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { translations } from "../lib/translations";

export type Language = "pt" | "en";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
    t: typeof translations.pt | typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
    children: ReactNode;
    defaultLanguage?: Language;
}

export function LanguageProvider({ children, defaultLanguage = "pt" }: LanguageProviderProps) {
    const [language, setLanguageState] = useState<Language>(defaultLanguage);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        // Optionally save to localStorage
        if (typeof window !== "undefined") {
            localStorage.setItem("language", lang);
        }
    }, []);

    const toggleLanguage = useCallback(() => {
        setLanguage(language === "pt" ? "en" : "pt");
    }, [language, setLanguage]);

    const t = translations[language];

    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

/**
 * Hook to access language context
 * @returns Language context with current language and setters
 */
export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
