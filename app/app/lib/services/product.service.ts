import type PocketBase from "pocketbase";
import type { ProductRecord } from "~/hooks/useProducts";

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
  private pb: PocketBase;

  constructor(pb: PocketBase) {
    this.pb = pb;
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
   * Transform product record to include file URLs
   */
  private transformProduct(product: ProductRecord): ProductRecord {
    return {
      ...product,
      media: Array.isArray(product.media)
        ? this.buildFileUrls(product.id, product.media, product.collectionId)
        : [],
      media_hover: this.buildFileUrl(product.id, product.media_hover, product.collectionId),
    };
  }

  /**
   * Get all products
   */
  async getAll(options?: ProductServiceOptions): Promise<ProductRecord[]> {
    try {
      const products = await this.pb.collection("products").getFullList<ProductRecord>({
        filter: options?.filter,
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
  async getByCollection(collectionId: string, options?: Omit<ProductServiceOptions, "filter">): Promise<ProductRecord[]> {
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
  async getByCategory(categoryId: string, options?: Omit<ProductServiceOptions, "filter">): Promise<ProductRecord[]> {
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
  async getBySlug(slug: string, options?: Omit<ProductServiceOptions, "filter">): Promise<ProductRecord | null> {
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
  async getById(id: string, options?: Omit<ProductServiceOptions, "filter">): Promise<ProductRecord | null> {
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
   * Get featured products (first N products)
   */
  async getFeatured(count: number = 6, options?: ProductServiceOptions): Promise<ProductRecord[]> {
    const products = await this.getAll(options);
    return products.slice(0, count);
  }

  /**
   * Filter products
   */
  async filter(filterString: string, options?: Omit<ProductServiceOptions, "filter">): Promise<ProductRecord[]> {
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
  async search(searchTerm: string, language: "en" | "pt" = "en", options?: Omit<ProductServiceOptions, "filter">): Promise<ProductRecord[]> {
    try {
      const field = `name_${language}`;
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
export function createProductService(pb: PocketBase): ProductService {
  return new ProductService(pb);
}

