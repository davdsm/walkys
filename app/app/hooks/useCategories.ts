import { useEffect, useState } from "react";
import { useLanguage, type Language } from "~/contexts";
import { usePageService } from "./usePageService";
import { getPocketBasePublicBaseUrl } from "~/lib/pocketbase";
import type { BaseRecord } from "~/lib/services/page.service";

/**
 * Category record interface for PocketBase category collection
 */
export interface CategoryRecord extends BaseRecord {
    name_en?: string;
    name_pt?: string;
    description_en?: string;
    description_pt?: string;
    slug: string;
    media?: string;
    hover?: string;
    enable?: boolean;
}

/**
 * Translated category interface returned by the hook
 */
export interface TranslatedCategory {
    name: string;
    description: string;
    link: string;
    media: string;
    hover: string;
}

/**
 * Helper function to get translated name from a category record
 * @param record - Category record with name_pt and name_en
 * @param language - Current language
 * @returns Translated name
 */
function getTranslatedName(record: CategoryRecord, language: Language): string {
    const key = language === "pt" ? "name_pt" : "name_en";
    return record[key] || "";
}

/**
 * Helper function to get translated description from a category record
 * @param record - Category record with description_pt and description_en
 * @param language - Current language
 * @returns Translated description
 */
function getTranslatedDescription(record: CategoryRecord, language: Language): string {
    const key = language === "pt" ? "description_pt" : "description_en";
    return record[key] || "";
}

/**
 * Helper function to build file URL for PocketBase files
 * @param recordId - The record ID
 * @param filename - The filename
 * @returns The full URL to the file or empty string if no filename
 */
function buildFileUrl(recordId: string, filename: string | undefined): string {
    if (!filename) return "";
    const baseUrl = getPocketBasePublicBaseUrl();
    return `${baseUrl}/api/files/category/${recordId}/${filename}`;
}

/**
 * Hook to fetch and manage categories with language support
 * @returns Object with categories data, loading state, and error handling
 */
export function useCategories() {
    const { language } = useLanguage();
    const categoryService = usePageService<CategoryRecord>("category");
    const [categories, setCategories] = useState<TranslatedCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch all categories, filtering by enabled ones
                const records = await categoryService.getAll({
                    filter: "enable = true",
                    sort: "created" // You can change this to sort by name or other field
                });

                // Transform records to include translated names and file URLs
                const translatedCategories: TranslatedCategory[] = records.map(record => ({
                    name: getTranslatedName(record, language),
                    description: getTranslatedDescription(record, language),
                    link: record.slug,
                    media: buildFileUrl(record.id, record.media),
                    hover: buildFileUrl(record.id, record.hover),
                }));

                setCategories(translatedCategories);
            } catch (err) {
                console.error("Error fetching categories:", err);
                setError(err instanceof Error ? err.message : "Failed to fetch categories");
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [categoryService, language]);

    /**
     * Get a category by its link (slug)
     * @param link - Category link/slug
     * @returns Category or undefined
     */
    const getCategoryBySlug = (link: string): TranslatedCategory | undefined => {
        return categories.find(category => category.link === link);
    };

    /**
     * Get categories filtered by a search term (searches in the translated names)
     * @param searchTerm - Term to search for
     * @returns Filtered categories array
     */
    const searchCategories = (searchTerm: string): TranslatedCategory[] => {
        const term = searchTerm.toLowerCase();
        return categories.filter(category =>
            category.name.toLowerCase().includes(term)
        );
    };

    return {
        categories,
        loading,
        error,
        getCategoryBySlug,
        searchCategories,
        language,
    };
}