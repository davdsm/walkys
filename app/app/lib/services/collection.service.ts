import type PocketBase from "pocketbase";
import { getPocketBasePublicBaseUrl } from "../pocketbase";
import type { BaseRecord } from "./page.service";

export interface CollectionRecord extends BaseRecord {
  name_en?: string;
  name_pt?: string;
  image?: string;
  slug: string;
}

export interface TranslatedCollection extends Omit<CollectionRecord, "name_en" | "name_pt"> {
  name: string;
  image: string;
}

export interface CollectionServiceOptions {
  filter?: string;
  sort?: string;
  fields?: string;
}

/**
 * Service class for interacting with collections collection
 */
export class CollectionService {
  constructor(private readonly pb: PocketBase, private readonly language: "en" | "pt" = "en") {
    this.pb = pb;
    this.language = language;
  }

  /**
   * Build file URL for collection image
   */
  private buildImageUrl(collectionId: string, recordId: string, filename: string | undefined): string {
    if (!filename) return "";
    const baseUrl = getPocketBasePublicBaseUrl();
    return `${baseUrl}/api/files/collection/${recordId}/${filename}`;
  }

  /**
   * Transform collection record to include file URL and translated fields
   */
  public transform(collection: CollectionRecord): TranslatedCollection {
    const lang = this.language;
    return {
      ...collection,
      name: (lang === "pt" ? collection.name_pt : collection.name_en) || "",
      image: this.buildImageUrl(collection.collectionId, collection.id, collection.image),
    };
  }

  /**
   * Deprecated: Use transform() instead.
   */
  private transformCollection(collection: CollectionRecord): TranslatedCollection {
    return this.transform(collection);
  }

  /**
   * Get all collections
   */
  async getAll(options?: CollectionServiceOptions): Promise<TranslatedCollection[]> {
    try {
      const collections = await this.pb.collection("collection").getFullList<CollectionRecord>({
        filter: `enable=true && ${options?.filter}`,
        sort: options?.sort,
        fields: options?.fields,
      });

      return collections.map((collection) => this.transformCollection(collection));
    } catch (error) {
      console.error("Error fetching collections:", error);
      throw error;
    }
  }

  /**
   * Get a single collection by slug
   */
  async getBySlug(slug: string, options?: Omit<CollectionServiceOptions, "filter">): Promise<TranslatedCollection | null> {
    try {
      const collection = await this.pb.collection("collection").getFirstListItem<CollectionRecord>(
        `slug="${slug}"`,
        {
          fields: options?.fields,
        }
      );

      return this.transformCollection(collection);
    } catch (error) {
      if ((error as any)?.status === 404) {
        return null;
      }
      console.error("Error fetching collection by slug:", error);
      throw error;
    }
  }

  /**
   * Get a single collection by ID
   */
  async getById(id: string, options?: Omit<CollectionServiceOptions, "filter">): Promise<TranslatedCollection | null> {
    try {
      const collection = await this.pb.collection("collection").getOne<CollectionRecord>(id, {
        fields: options?.fields,
      });

      return this.transformCollection(collection);
    } catch (error) {
      if ((error as any)?.status === 404) {
        return null;
      }
      console.error("Error fetching collection by ID:", error);
      throw error;
    }
  }

  /**
   * Get featured collections (first N collections)
   */
  async getFeatured(count: number = 3, options?: CollectionServiceOptions): Promise<TranslatedCollection[]> {
    const collections = await this.getAll({ ...options, filter: "featured=true" });
    return collections.slice(0, count);
  }

  /**
   * Filter collections
   */
  async filter(filterString: string, options?: Omit<CollectionServiceOptions, "filter">): Promise<TranslatedCollection[]> {
    try {
      const collections = await this.pb.collection("collection").getFullList<CollectionRecord>({
        filter: filterString,
        sort: options?.sort,
        fields: options?.fields,
      });

      return collections.map((collection) => this.transformCollection(collection));
    } catch (error) {
      console.error("Error filtering collections:", error);
      throw error;
    }
  }

  /**
   * Search collections by name
   */
  async search(searchTerm: string, options?: Omit<CollectionServiceOptions, "filter">): Promise<TranslatedCollection[]> {
    try {
      const field = `name_${this.language}`;
      const collections = await this.pb.collection("collection").getFullList<CollectionRecord>({
        filter: `${field} ~ "${searchTerm}"`,
        sort: options?.sort,
        fields: options?.fields,
      });

      return collections.map((collection) => this.transformCollection(collection));
    } catch (error) {
      console.error("Error searching collections:", error);
      throw error;
    }
  }
}

/**
 * Factory function to create a CollectionService instance
 */
export function createCollectionService(pb: PocketBase, language: "en" | "pt" = "en"): CollectionService {
  return new CollectionService(pb, language);
}


