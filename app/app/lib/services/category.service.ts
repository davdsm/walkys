import type PocketBase from "pocketbase";
import type { BaseRecord } from "./page.service";

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

export interface TranslatedCategory extends Omit<CategoryRecord, "name_en" | "name_pt" | "description_en" | "description_pt"> {
  name: string;
  description: string;
  media: string;
  hover: string;
}

export interface CategoryServiceOptions {
  filter?: string;
  sort?: string;
  fields?: string;
}

/**
 * Service class for interacting with category collection
 */
export class CategoryService {
  constructor(private readonly pb: PocketBase, private readonly language: "en" | "pt" = "en") {
    this.pb = pb;
    this.language = language;
  }

  /**
   * Build file URL for category media
   */
  private buildFileUrl(recordId: string, filename: string | string[] | undefined, collectionId: string): string {
    if (!filename) return "";
    const baseUrl = this.pb.baseUrl.replace(/\/$/, "");
    // Handle array media (take first item) or single string
    const actualFilename = Array.isArray(filename) ? filename[0] : filename;
    if (!actualFilename) return "";

    return `${baseUrl}/api/files/${collectionId}/${recordId}/${actualFilename}`;
  }

  /**
   * Transform category record to include file URLs and translated fields
   */
  public transform(category: CategoryRecord): TranslatedCategory {
    const lang = this.language;
    return {
      ...category,
      name: (lang === "pt" ? category.name_pt : category.name_en) || "",
      description: (lang === "pt" ? category.description_pt : category.description_en) || "",
      media: this.buildFileUrl(category.id, category.media, category.collectionId),
      hover: this.buildFileUrl(category.id, category.hover, category.collectionId),
    };
  }

  /**
   * Deprecated: Use transform() instead.
   */
  private transformCategory(category: CategoryRecord): TranslatedCategory {
    return this.transform(category);
  }

  /**
   * Get all categories
   */
  async getAll(options?: CategoryServiceOptions): Promise<TranslatedCategory[]> {
    try {
      const categories = await this.pb.collection("category").getFullList<CategoryRecord>({
        filter: `enable=true && ${options?.filter}`,
        sort: options?.sort,
        fields: options?.fields,
      });

      return categories.map((category) => this.transformCategory(category));
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  /**
   * Get a single category by slug
   */
  async getBySlug(slug: string, options?: Omit<CategoryServiceOptions, "filter">): Promise<TranslatedCategory | null> {
    try {
      const category = await this.pb.collection("category").getFirstListItem<CategoryRecord>(
        `slug="${slug}" && enable=true`,
        {
          fields: options?.fields,
        }
      );

      return this.transformCategory(category);
    } catch (error) {
      if ((error as any)?.status === 404) {
        return null;
      }
      console.error("Error fetching category by slug:", error);
      throw error;
    }
  }

  /**
   * Get a single category by ID
   */
  async getById(id: string, options?: Omit<CategoryServiceOptions, "filter">): Promise<TranslatedCategory | null> {
    try {
      const category = await this.pb.collection("category").getOne<CategoryRecord>(id, {
        fields: options?.fields,
      });

      return this.transformCategory(category);
    } catch (error) {
      if ((error as any)?.status === 404) {
        return null;
      }
      console.error("Error fetching category by ID:", error);
      throw error;
    }
  }

  /**
   * Get multiple categories by their IDs (preserves order)
   */
  async getByIds(ids: string[], options?: Omit<CategoryServiceOptions, "filter">): Promise<TranslatedCategory[]> {
    if (!ids || ids.length === 0) return [];
    try {
      const idFilters = ids.map((id) => `id="${id}"`).join(" || ");
      const categories = await this.pb.collection("category").getFullList<CategoryRecord>({
        filter: idFilters,
        sort: options?.sort,
        fields: options?.fields,
      });
      const transformed = categories.map((c) => this.transformCategory(c));
      return ids.map((id) => transformed.find((c) => c.id === id)).filter((c): c is TranslatedCategory => c != null);
    } catch (error) {
      console.error("Error fetching categories by IDs:", error);
      throw error;
    }
  }

  /**
   * Get featured categories (first N categories)
   */
  async getFeatured(count: number = 2, options?: CategoryServiceOptions): Promise<TranslatedCategory[]> {
    const categories = await this.getAll({ ...options, filter: "featured=true" });
    return categories.slice(0, count);
  }

  /**
   * Get categories from products (extract unique categories from product expand)
   */
  getCategoriesFromProducts(products: Array<any>): TranslatedCategory[] {
    const categoriesMap = new Map<string, CategoryRecord>();

    products.forEach((product) => {
      const cat = product.expand?.category;
      if (Array.isArray(cat)) {
        cat.forEach((c) => {
          if (c && c.id) {
            categoriesMap.set(c.id, c);
          }
        });
      } else if (cat && cat.id) {
        categoriesMap.set(cat.id, cat);
      }
    });

    return Array.from(categoriesMap.values()).map((category) => this.transformCategory(category));
  }

  /**
   * Filter categories
   */
  async filter(filterString: string, options?: Omit<CategoryServiceOptions, "filter">): Promise<TranslatedCategory[]> {
    try {
      const categories = await this.pb.collection("category").getFullList<CategoryRecord>({
        filter: filterString,
        sort: options?.sort,
        fields: options?.fields,
      });

      return categories.map((category) => this.transformCategory(category));
    } catch (error) {
      console.error("Error filtering categories:", error);
      throw error;
    }
  }

  /**
   * Search categories by name
   */
  async search(searchTerm: string, options?: Omit<CategoryServiceOptions, "filter">): Promise<TranslatedCategory[]> {
    try {
      const field = `name_${this.language}`;
      const categories = await this.pb.collection("category").getFullList<CategoryRecord>({
        filter: `${field} ~ "${searchTerm}" && enable = true`,
        sort: options?.sort,
        fields: options?.fields,
      });

      return categories.map((category) => this.transformCategory(category));
    } catch (error) {
      console.error("Error searching categories:", error);
      throw error;
    }
  }
}

/**
 * Factory function to create a CategoryService instance
 */
export function createCategoryService(pb: PocketBase, language: "en" | "pt" = "en"): CategoryService {
  return new CategoryService(pb, language);
}


