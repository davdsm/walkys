import type PocketBase from "pocketbase";
import { getBrowserPocketBaseFileUrl } from "../pocketbase";
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
  /** 360° viewer frame filenames (order matters) */
  media_360?: string[];
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
  media_360: string[];
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

  /** For PageService / homepage expanded products — same token as product list/detail. */
  getProductFileAccessToken(): Promise<string | undefined> {
    return this.getOptionalFileToken();
  }

  /** PocketBase protected file fields need `?token=`; img tags cannot send Authorization. */
  private async getOptionalFileToken(): Promise<string | undefined> {
    if (!this.pb.authStore.isValid) return undefined;
    try {
      const token = await this.pb.files.getToken();
      return typeof token === "string" && token.length > 0 ? token : undefined;
    } catch {
      return undefined;
    }
  }

  /** Normalize PocketBase file field (array, single string, or JSON array string). */
  private normalizeFilenames(raw: unknown): string[] | undefined {
    if (raw == null) return undefined;
    if (Array.isArray(raw)) {
      return raw.filter((f): f is string => typeof f === "string" && f.length > 0);
    }
    if (typeof raw === "string") {
      const t = raw.trim();
      if (!t) return undefined;
      if (t.startsWith("[")) {
        try {
          const p = JSON.parse(t) as unknown;
          return Array.isArray(p) ? p.filter((x): x is string => typeof x === "string" && x.length > 0) : [t];
        } catch {
          return [raw];
        }
      }
      return [raw];
    }
    return undefined;
  }

  /**
   * Build file URL for a product media file
   */
  private buildFileUrl(recordId: string, filename: string | undefined, collectionId: string, fileToken?: string): string {
    if (!filename) return "";
    return getBrowserPocketBaseFileUrl(
      this.pb,
      { id: recordId, collectionId, collectionName: "products" },
      filename,
      fileToken
    );
  }

  /**
   * Build file URLs for product media array
   */
  private buildFileUrls(recordId: string, filenames: string[] | undefined, collectionId: string, fileToken?: string): string[] {
    if (!filenames || filenames.length === 0) return [];
    return filenames.map((filename) => this.buildFileUrl(recordId, filename, collectionId, fileToken));
  }

  /**
   * Transform product record to include file URLs and translated fields
   */
  public transform(product: ProductRecord, fileToken?: string): TranslatedProduct {
    const lang = this.language;
    const collectionId = product.collectionId ?? "products";
    const mediaFiles = this.normalizeFilenames(product.media);
    const media360Files = this.normalizeFilenames(product.media_360);
    return {
      ...product,
      name: (lang === "pt" ? product.name_pt : product.name_en) || "",
      description: (lang === "pt" ? product.description_pt : product.description_en) || "",
      details: (lang === "pt" ? product.details_pt : product.details_en) || "",
      media: mediaFiles?.length ? this.buildFileUrls(product.id, mediaFiles, collectionId, fileToken) : [],
      media_hover: this.buildFileUrl(product.id, product.media_hover, collectionId, fileToken),
      media_360: media360Files?.length ? this.buildFileUrls(product.id, media360Files, collectionId, fileToken) : [],
    };
  }

  /**
   * Deprecated: Use transform() instead.
   */
  private transformProduct(product: ProductRecord, fileToken?: string): TranslatedProduct {
    return this.transform(product, fileToken);
  }

  /**
   * Get all products
   */
  async getAll(options?: ProductServiceOptions): Promise<TranslatedProduct[]> {
    try {
      const filter =
        options?.filter && options.filter.trim().length > 0
          ? `enabled=true && (${options.filter})`
          : "enabled=true";

      const products = await this.pb.collection("products").getFullList<ProductRecord>({
        filter,
        sort: options?.sort,
        expand: options?.expand || "category,sizes",
        fields: options?.fields,
      });

      const fileToken = await this.getOptionalFileToken();
      return products.map((product) => this.transformProduct(product, fileToken));
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

      const fileToken = await this.getOptionalFileToken();
      return products.map((product) => this.transformProduct(product, fileToken));
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

      const fileToken = await this.getOptionalFileToken();
      return products.map((product) => this.transformProduct(product, fileToken));
    } catch (error) {
      console.error("Error fetching products by category:", error);
      throw error;
    }
  }

  /**
   * Get products that belong to any of the given category IDs (single request)
   */
  async getByCategoryIds(categoryIds: string[], options?: Omit<ProductServiceOptions, "filter">): Promise<TranslatedProduct[]> {
    if (!categoryIds || categoryIds.length === 0) return [];
    try {
      const filterParts = categoryIds.map((id) => `category ?~ "${id}"`).join(" || ");
      const products = await this.pb.collection("products").getFullList<ProductRecord>({
        filter: `(${filterParts}) && enabled=true`,
        sort: options?.sort,
        expand: options?.expand || "category,sizes",
        fields: options?.fields,
      });
      const fileToken = await this.getOptionalFileToken();
      return products.map((product) => this.transformProduct(product, fileToken));
    } catch (error) {
      console.error("Error fetching products by category IDs:", error);
      throw error;
    }
  }

  /**
   * Get products by a list of record IDs (e.g. user's catalog_products).
   * Preserves the order of the input ids.
   */
  async getByIds(ids: string[], options?: Omit<ProductServiceOptions, "filter">): Promise<TranslatedProduct[]> {
    if (!ids || ids.length === 0) return [];
    const safeIds = ids.filter((id) => typeof id === "string" && id.trim().length > 0);
    if (safeIds.length === 0) return [];
    try {
      const filterParts = safeIds.map((id) => `id = "${String(id).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`).join(" || ");
      const products = await this.pb.collection("products").getFullList<ProductRecord>({
        filter: `(${filterParts}) && enabled=true`,
        sort: options?.sort,
        expand: options?.expand || "category,sizes,collection",
        fields: options?.fields,
      });
      const fileToken = await this.getOptionalFileToken();
      const transformed = products.map((product) => this.transformProduct(product, fileToken));
      return safeIds
        .map((id) => transformed.find((p) => p.id === id))
        .filter((p): p is TranslatedProduct => p !== undefined);
    } catch (error) {
      console.error("Error fetching products by IDs:", error);
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

      const fileToken = await this.getOptionalFileToken();
      return this.transformProduct(product, fileToken);
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

      const fileToken = await this.getOptionalFileToken();
      return this.transformProduct(product, fileToken);
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

      const fileToken = await this.getOptionalFileToken();
      return products.map((product) => this.transformProduct(product, fileToken));
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

      const fileToken = await this.getOptionalFileToken();
      return products.map((product) => this.transformProduct(product, fileToken));
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


