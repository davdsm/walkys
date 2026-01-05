import type PocketBase from "pocketbase";

export interface CollectionRecord {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  name_en?: string;
  name_pt?: string;
  image?: string;
  slug: string;
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
  private pb: PocketBase;

  constructor(pb: PocketBase) {
    this.pb = pb;
  }

  /**
   * Build file URL for collection image
   */
  private buildImageUrl(collectionId: string, recordId: string, filename: string | undefined): string {
    if (!filename) return "";
    const baseUrl = this.pb.baseUrl.replace(/\/$/, "");
    return `${baseUrl}/api/files/collection/${recordId}/${filename}`;
  }

  /**
   * Transform collection record to include file URL
   */
  private transformCollection(collection: CollectionRecord): CollectionRecord {
    return {
      ...collection,
      image: this.buildImageUrl(collection.collectionId, collection.id, collection.image),
    };
  }

  /**
   * Get all collections
   */
  async getAll(options?: CollectionServiceOptions): Promise<CollectionRecord[]> {
    try {
      const collections = await this.pb.collection("collection").getFullList<CollectionRecord>({
        filter: options?.filter,
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
  async getBySlug(slug: string, options?: Omit<CollectionServiceOptions, "filter">): Promise<CollectionRecord | null> {
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
  async getById(id: string, options?: Omit<CollectionServiceOptions, "filter">): Promise<CollectionRecord | null> {
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
  async getFeatured(count: number = 3, options?: CollectionServiceOptions): Promise<CollectionRecord[]> {
    const collections = await this.getAll(options);
    return collections.slice(0, count);
  }

  /**
   * Filter collections
   */
  async filter(filterString: string, options?: Omit<CollectionServiceOptions, "filter">): Promise<CollectionRecord[]> {
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
  async search(searchTerm: string, language: "en" | "pt" = "en", options?: Omit<CollectionServiceOptions, "filter">): Promise<CollectionRecord[]> {
    try {
      const field = `name_${language}`;
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
export function createCollectionService(pb: PocketBase): CollectionService {
  return new CollectionService(pb);
}

