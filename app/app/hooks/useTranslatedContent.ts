import { useLanguage, type Language } from "~/contexts";
import type { PageRecord } from "~/lib/services";

/**
 * Helper function to get translated value from a page record
 * @param record - Page record with value_pt and value_en
 * @param language - Current language
 * @returns Translated value
 */
export function getTranslatedValue(record: PageRecord | undefined, language: Language): string {
    if (!record) return "";

    const key = language === "pt" ? "value_pt" : "value_en";
    return record[key] || "";
}

/**
 * Hook to get translated content from homepage data
 * @param data - Array of page records
 * @returns Object with helper functions to get translated content
 */
export function useTranslatedContent(data: PageRecord[]) {
    const { language } = useLanguage();

    /**
     * Get translated value by section ID
     * @param sectionId - Section identifier
     * @returns Translated value
     */
    const getContent = (sectionId: string): string => {
        const record = data.find((page) => page.section_id === sectionId);
        return getTranslatedValue(record, language);
    };

    return {
        language,
        getContent,
    };
}
