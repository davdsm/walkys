import type PocketBase from "pocketbase";
import type { CategoryRecord } from "~/hooks/useCategories";

export interface CategoryServiceOptions {
  filter?: string;
  sort?: string;
  fields?: string;
}

/**
 * Service class for interacting with category collection
 */
export class CategoryService {
  private pb: PocketBase;

  constructor(pb: PocketBase) {
    this.pb = pb;
  }

  /**
   * Build file URL for category media
   */
  private buildFileUrl(recordId: string, filename: string | string[] | undefined, collectionId: string): string {
    if (!filename) return "";
    const baseUrl = this.pb.baseUrl.replace(/\/$/, "");
    // Handle array media (take first item) or single string
    if (Array.isArray(filename)) {
      return filename.length > 0
        ? `${baseUrl}/api/files/${collectionId}/${recordId}/${filename[0]}`
        : "";
    }
    return `${baseUrl}/api/files/${collectionId}/${recordId}/${filename}`;
  }

  /**
   * Transform category record to include file URLs
   */
  private transformCategory(category: CategoryRecord): CategoryRecord {
    return {
      ...category,
      media: this.buildFileUrl(category.id, category.media, category.collectionId),
      hover: this.buildFileUrl(category.id, category.hover, category.collectionId),
    };
  }

  /**
   * Get all categories
   */
  async getAll(options?: CategoryServiceOptions): Promise<CategoryRecord[]> {
    try {
      const categories = await this.pb.collection("category").getFullList<CategoryRecord>({
        filter: options?.filter || "enable = true",
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
  async getBySlug(slug: string, options?: Omit<CategoryServiceOptions, "filter">): Promise<CategoryRecord | null> {
    try {
      const category = await this.pb.collection("category").getFirstListItem<CategoryRecord>(
        `slug="${slug}" && enable = true`,
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
  async getById(id: string, options?: Omit<CategoryServiceOptions, "filter">): Promise<CategoryRecord | null> {
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
   * Get featured categories (first N categories)
   */
  async getFeatured(count: number = 2, options?: CategoryServiceOptions): Promise<CategoryRecord[]> {
    const categories = await this.getAll(options);
    return categories.slice(0, count);
  }

  /**
   * Get categories from products (extract unique categories from product expand)
   */
  getCategoriesFromProducts(products: Array<{ expand?: { category?: CategoryRecord | CategoryRecord[] } }>): CategoryRecord[] {
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
  async filter(filterString: string, options?: Omit<CategoryServiceOptions, "filter">): Promise<CategoryRecord[]> {
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
  async search(searchTerm: string, language: "en" | "pt" = "en", options?: Omit<CategoryServiceOptions, "filter">): Promise<CategoryRecord[]> {
    try {
      const field = `name_${language}`;
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
export function createCategoryService(pb: PocketBase): CategoryService {
  return new CategoryService(pb);
}

