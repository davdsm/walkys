import { useEffect, useState } from "react";
import type PocketBase from "pocketbase";
import { useLanguage, type Language } from "~/contexts";
import { usePageService } from "./usePageService";
import { createPocketBase, getBrowserPocketBaseFileUrl } from "~/lib/pocketbase";
import type { BaseRecord } from "~/lib/services/page.service";
import type { CategoryRecord } from "./useCategories";

/**
 * Collection record interface for PocketBase collection collection
 */
export interface CollectionRecord extends BaseRecord {
  name_en?: string;
  name_pt?: string;
  image?: string;
  slug: string;
}

/**
 * Size record interface for PocketBase sizes collection
 */
export interface SizeRecord extends BaseRecord {
  number: string;
}

/**
 * Product record interface for PocketBase products collection
 */
export interface ProductRecord extends BaseRecord {
  name_en?: string;
  name_pt?: string;
  description_en?: string;
  description_pt?: string;
  details_en?: string;
  details_pt?: string;
  slug: string;
  media?: string[];
  media_hover?: string;
  /** 360° viewer frame filenames (order matters) */
  media_360?: string[];
  category?: string[] | CategoryRecord[];
  collection?: string[] | CollectionRecord[];
  sizes?: string[] | SizeRecord[];
  expand: any;
}

/**
 * Translated product interface returned by the hook
 */
export interface TranslatedProduct {
  id: string;
  name: string;
  description: string;
  details: string;
  slug: string;
  media: string[];
  media_hover: string;
  media_360: string[];
  category: string[]; // Array of translated category names
  collection: string[]; // Array of translated collection names
  sizes: string[]; // Array of size numbers
}

/**
 * Helper function to get translated text from a product record
 * @param record - Product record
 * @param field - Field name (name, description, details)
 * @param language - Current language
 * @returns Translated text
 */
function getTranslatedField(
  record: ProductRecord,
  field: "name" | "description" | "details",
  language: Language
): string {
  const key =
    `${field}_${language === "pt" ? "pt" : "en"}` as keyof ProductRecord;
  return (record[key] as string) || "";
}

/**
 * Helper function to build file URL for a single PocketBase file
 * @param recordId - The record ID
 * @param filename - Single filename
 * @returns Full URL to the file or empty string if no filename
 */
function buildFileUrl(
  pb: PocketBase,
  recordId: string,
  filename: string | undefined,
  collectionId: string,
  fileToken?: string
): string {
  if (!filename) return "";
  return getBrowserPocketBaseFileUrl(pb, { id: recordId, collectionId, collectionName: "products" }, filename, fileToken);
}

/**
 * Helper function to build file URLs for PocketBase files
 * @param recordId - The record ID
 * @param filenames - Array of filenames
 * @returns Array of full URLs to the files
 */
function buildFileUrls(
  pb: PocketBase,
  recordId: string,
  filenames: string[] | undefined,
  collectionId: string,
  fileToken?: string
): string[] {
  if (!filenames || filenames.length === 0) return [];
  return filenames.map((filename) => buildFileUrl(pb, recordId, filename, collectionId, fileToken));
}

/**
 * Hook to fetch and manage products with language support
 * @returns Object with products data, loading state, and helper functions
 */
export function useProducts() {
  const { language } = useLanguage();
  const productService = usePageService<ProductRecord>("products");

  const [products, setProducts] = useState<TranslatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const records = await productService.getAll({
          sort: "created", // You can change this to sort by name or other field
          expand: "sizes,category,collection", // Expand all relations to get full data
        });

        const pb = createPocketBase();
        let fileToken: string | undefined;
        if (pb.authStore.isValid) {
          try {
            const t = await pb.files.getToken();
            if (typeof t === "string" && t.length > 0) fileToken = t;
          } catch {
            /* protected files need token; public fields still load */
          }
        }

        // Transform records to include translated content and file URLs
        const translatedProducts: TranslatedProduct[] = records.map(
          (record) => {
            // PocketBase stores expanded relations in the 'expand' property
            const expand = (record as any).expand || {};

            // Extract only the needed values from expanded relations
            const langKey = language === "pt" ? "pt" : "en";

            const categories: string[] = (expand.category || []).map(
              (cat: any) => cat[`name_${langKey}`] || ""
            );

            const collections: string[] = (expand.collection || []).map(
              (col: any) => col[`name_${langKey}`] || ""
            );

            const sizes: string[] = (expand.sizes || [])
              .map((size: any) => size.number || "")
              .sort((a: string, b: string) => parseFloat(a) - parseFloat(b));

            const collectionId = record.collectionId ?? "products";

            return {
              id: record.id,
              name: getTranslatedField(record, "name", language),
              description: getTranslatedField(record, "description", language),
              details: getTranslatedField(record, "details", language),
              slug: record.slug,
              media: buildFileUrls(pb, record.id, record.media, collectionId, fileToken),
              media_hover: buildFileUrl(pb, record.id, record.media_hover, collectionId, fileToken),
              media_360: buildFileUrls(pb, record.id, record.media_360, collectionId, fileToken),
              category: categories,
              collection: collections,
              sizes: sizes,
            };
          }
        );

        setProducts(translatedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch products"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [productService, language]);

  /**
   * Get a product by its slug
   * @param slug - Product slug
   * @returns Product or undefined
   */
  const getProductBySlug = (slug: string): TranslatedProduct | undefined => {
    return products.find((product) => product.slug === slug);
  };

  /**
   * Get products by category ID
   * @param categoryId - Category ID to filter by
   * @returns Array of products in the specified category
   */
  const getProductsByCategory = (categoryName: string): TranslatedProduct[] => {
    return products.filter((product) =>
      product.category.includes(categoryName)
    );
  };

  /**
   * Get all products
   * @returns Array of all products
   */
  const getAllProducts = (): TranslatedProduct[] => {
    return products;
  };

  /**
   * Get products filtered by a search term (searches in names and descriptions)
   * @param searchTerm - Term to search for
   * @returns Filtered products array
   */
  const searchProducts = (searchTerm: string): TranslatedProduct[] => {
    const term = searchTerm.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term)
    );
  };

  return {
    products,
    loading,
    error,
    getProductBySlug,
    getProductsByCategory,
    getAllProducts,
    searchProducts,
    language,
  };
}
