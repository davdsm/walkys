import type PocketBase from "pocketbase";
import type { BaseRecord } from "./page.service";
import type { CategoryRecord } from "./category.service";
import type { CollectionRecord } from "./collection.service";

export interface SizeRecord extends BaseRecord {
  number: string;
}

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
  category?: string[] | CategoryRecord[];
  collection?: string[] | CollectionRecord[];
  sizes?: string[] | SizeRecord[];
  enabled: boolean;
}

export interface TranslatedProduct extends Omit<ProductRecord, "name_en" | "name_pt" | "description_en" | "description_pt" | "details_en" | "details_pt"> {
  name: string;
  description: string;
  details: string;
  media: string[];
  media_hover: string;
}

export interface ProductServiceOptions {
  filter?: string;
  sort?: string;
  expand?: string;
  fields?: string;
}

/**
 * Service class for interacting with products collection
 */
export class ProductService {
  constructor(private readonly pb: PocketBase, private readonly language: "en" | "pt" = "en") {
    this.pb = pb;
    this.language = language;
  }

  /**
   * Build file URL for a product media file
   */
  private buildFileUrl(recordId: string, filename: string | undefined, collectionId: string): string {
    if (!filename) return "";
    const baseUrl = this.pb.baseUrl.replace(/\/$/, "");
    return `${baseUrl}/api/files/${collectionId}/${recordId}/${filename}`;
  }

  /**
   * Build file URLs for product media array
   */
  private buildFileUrls(recordId: string, filenames: string[] | undefined, collectionId: string): string[] {
    if (!filenames || filenames.length === 0) return [];
    const baseUrl = this.pb.baseUrl.replace(/\/$/, "");
    return filenames.map((filename) => `${baseUrl}/api/files/${collectionId}/${recordId}/${filename}`);
  }

  /**
   * Transform product record to include file URLs and translated fields
   */
  public transform(product: ProductRecord): TranslatedProduct {
    const lang = this.language;
    return {
      ...product,
      name: (lang === "pt" ? product.name_pt : product.name_en) || "",
      description: (lang === "pt" ? product.description_pt : product.description_en) || "",
      details: (lang === "pt" ? product.details_pt : product.details_en) || "",
      media: Array.isArray(product.media)
        ? this.buildFileUrls(product.id, product.media, product.collectionId)
        : [],
      media_hover: this.buildFileUrl(product.id, product.media_hover, product.collectionId),
    };
  }

  /**
   * Deprecated: Use transform() instead.
   */
  private transformProduct(product: ProductRecord): TranslatedProduct {
    return this.transform(product);
  }

  /**
   * Get all products
   */
  async getAll(options?: ProductServiceOptions): Promise<TranslatedProduct[]> {
    try {
      const products = await this.pb.collection("products").getFullList<ProductRecord>({
        filter: `enabled=true && ${options?.filter}`,
        sort: options?.sort,
        expand: options?.expand || "category,sizes",
        fields: options?.fields,
      });

      return products.map((product) => this.transformProduct(product));
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }

  /**
   * Get products by collection ID
   */
  async getByCollection(collectionId: string, options?: Omit<ProductServiceOptions, "filter">): Promise<TranslatedProduct[]> {
    try {
      const products = await this.pb.collection("products").getFullList<ProductRecord>({
        filter: `collection ?~ "${collectionId}" && enabled=true`,
        sort: options?.sort,
        expand: options?.expand || "category,sizes",
        fields: options?.fields,
      });

      return products.map((product) => this.transformProduct(product));
    } catch (error) {
      console.error("Error fetching products by collection:", error);
      throw error;
    }
  }

  /**
   * Get products by category ID
   */
  async getByCategory(categoryId: string, options?: Omit<ProductServiceOptions, "filter">): Promise<TranslatedProduct[]> {
    try {
      const products = await this.pb.collection("products").getFullList<ProductRecord>({
        filter: `category ?~ "${categoryId}" && enabled=true`,
        sort: options?.sort,
        expand: options?.expand || "category,sizes",
        fields: options?.fields,
      });

      return products.map((product) => this.transformProduct(product));
    } catch (error) {
      console.error("Error fetching products by category:", error);
      throw error;
    }
  }

  /**
   * Get a single product by slug
   */
  async getBySlug(slug: string, options?: Omit<ProductServiceOptions, "filter">): Promise<TranslatedProduct | null> {
    try {
      const product = await this.pb.collection("products").getFirstListItem<ProductRecord>(
        `slug="${slug}" && enabled=true`,
        {
          expand: options?.expand || "category,sizes,collection",
          fields: options?.fields,
        }
      );

      return this.transformProduct(product);
    } catch (error) {
      if ((error as any)?.status === 404) {
        return null;
      }
      console.error("Error fetching product by slug:", error);
      throw error;
    }
  }

  /**
   * Get a single product by ID
   */
  async getById(id: string, options?: Omit<ProductServiceOptions, "filter">): Promise<TranslatedProduct | null> {
    try {
      const product = await this.pb.collection("products").getOne<ProductRecord>(id, {
        expand: options?.expand || "category,sizes,collection",
        fields: options?.fields,
      });

      return this.transformProduct(product);
    } catch (error) {
      if ((error as any)?.status === 404) {
        return null;
      }
      console.error("Error fetching product by ID:", error);
      throw error;
    }
  }

  /**
   * Get multiple products by their IDs
   */
  async getByIds(ids: string[], options?: Omit<ProductServiceOptions, "filter">): Promise<TranslatedProduct[]> {
    if (!ids || ids.length === 0) return [];
    
    try {
      // Build filter string for multiple IDs
      const idFilters = ids.map(id => `id="${id}"`).join(" || ");
      const products = await this.pb.collection("products").getFullList<ProductRecord>({
        filter: `(${idFilters}) && enabled=true`,
        sort: options?.sort,
        expand: options?.expand || "category,sizes,collection",
        fields: options?.fields,
      });

      // Transform and maintain the order from the IDs array
      const transformedProducts = products.map((product) => this.transformProduct(product));
      
      // Sort by the order of IDs in the input array
      return ids
        .map(id => transformedProducts.find(p => p.id === id))
        .filter((p): p is TranslatedProduct => p !== undefined);
    } catch (error) {
      console.error("Error fetching products by IDs:", error);
      throw error;
    }
  }

  /**
   * Get featured products (first N products)
   */
  async getFeatured(count: number = 6, options?: ProductServiceOptions): Promise<TranslatedProduct[]> {
    const products = await this.getAll({ ...options, filter: "featured=true" });
    return products.slice(0, count);
  }

  /**
   * Filter products
   */
  async filter(filterString: string, options?: Omit<ProductServiceOptions, "filter">): Promise<TranslatedProduct[]> {
    try {
      const products = await this.pb.collection("products").getFullList<ProductRecord>({
        filter: filterString,
        sort: options?.sort,
        expand: options?.expand || "category,sizes",
        fields: options?.fields,
      });

      return products.map((product) => this.transformProduct(product));
    } catch (error) {
      console.error("Error filtering products:", error);
      throw error;
    }
  }

  /**
   * Search products by name or description
   */
  async search(searchTerm: string, options?: Omit<ProductServiceOptions, "filter">): Promise<TranslatedProduct[]> {
    try {
      const field = `name_${this.language}`;
      const products = await this.pb.collection("products").getFullList<ProductRecord>({
        filter: `${field} ~ "${searchTerm}" && enabled=true`,
        sort: options?.sort,
        expand: options?.expand || "category,sizes",
        fields: options?.fields,
      });

      return products.map((product) => this.transformProduct(product));
    } catch (error) {
      console.error("Error searching products:", error);
      throw error;
    }
  }
}

/**
 * Factory function to create a ProductService instance
 */
export function createProductService(pb: PocketBase, language: "en" | "pt" = "en"): ProductService {
  return new ProductService(pb, language);
}


