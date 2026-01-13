import type PocketBase from "pocketbase";
import { createCategoryService } from "./category.service";
import { createProductService } from "./product.service";
import { createCollectionService } from "./collection.service";

/**
 * Base record interface for PocketBase collections
 */
export interface BaseRecord {
    id: string;
    collectionId: string;
    collectionName: string;
    created: string;
    updated: string;
    expand?: any;
}

/**
 * Generic record interface for PocketBase collections
 */
export interface PageRecord extends BaseRecord {
    section_name: string;
    section_id: string;
    value_pt: string;
    value_en: string;
    media: string[];
    categories?: string[];
    products?: string[];
    collection?: string[];
}

export interface TranslatedPageRecord extends Omit<PageRecord, "value_pt" | "value_en"> {
    value: string;
    media: string[];
    // Translated expanded fields
    categories?: any[];
    products?: any[];
    collection?: any[];
}

/**
 * Generic service class for interacting with any PocketBase collection
 */
export class PageService<T extends BaseRecord = BaseRecord> {
    constructor(protected readonly pb: PocketBase, protected readonly collectionName: string, protected readonly language: "en" | "pt" = "en") {
        this.pb = pb;
        this.collectionName = collectionName;
        this.language = language;
    }

    /**
     * Build file URLs for media array
     */
    protected buildFileUrls(recordId: string, filenames: string[] | undefined, collectionId: string): string[] {
        if (!filenames || filenames.length === 0) return [];
        const baseUrl = this.pb.baseUrl.replace(/\/$/, "");
        return filenames.map((filename) => `${baseUrl}/api/files/${collectionId}/${recordId}/${filename}`);
    }

    /**
     * Transform record (can be overridden by subclasses)
     */
    /**
     * Transform record (can be overridden by subclasses)
     */
    /**
     * Transform record (can be overridden by subclasses)
     */
    protected transform(record: T): any {
        let transformed: any = { ...record };

        // If it's a PageRecord, transform it
        if ((record as any).value_en !== undefined || (record as any).value_pt !== undefined) {
            const pageRecord = record as unknown as PageRecord;
            transformed = {
                ...transformed,
                value: (this.language === "pt" ? pageRecord.value_pt : pageRecord.value_en) || "",
                media: this.buildFileUrls(pageRecord.id, pageRecord.media, pageRecord.collectionId),
            };
        }

        // Handle expanded relations
        if (record.expand) {
            const productService = createProductService(this.pb, this.language);
            const categoryService = createCategoryService(this.pb, this.language);
            const collectionService = createCollectionService(this.pb, this.language);

            // Dynamically map expanded items if they exist in record
            Object.keys(record.expand).forEach((key) => {
                const expandedData = record.expand[key];
                if (!expandedData) return;

                const items = Array.isArray(expandedData) ? expandedData : [expandedData];

                // Match expansion key to record field (handle common plural/singular mismatches)
                let targetKey = key;
                if (!record[key as keyof T]) {
                    if (key === "product" && (record as any).products) targetKey = "products";
                    else if (key === "products" && (record as any).product) targetKey = "product";
                    else if (key === "category" && (record as any).categories) targetKey = "categories";
                    else if (key === "categories" && (record as any).category) targetKey = "category";
                    else if (key === "collection" && (record as any).collections) targetKey = "collections";
                    else if (key === "collections" && (record as any).collection) targetKey = "collection";
                }

                // If we found a match, transform and replace
                if (record[targetKey as keyof T] || transformed[targetKey]) {
                    if (key.includes("product")) {
                        transformed[targetKey] = items.map((i: any) => productService.transform(i));
                    } else if (key.includes("categor")) {
                        transformed[targetKey] = items.map((i: any) => categoryService.transform(i));
                    } else if (key.includes("collection")) {
                        transformed[targetKey] = items.map((i: any) => collectionService.transform(i));
                    }
                }
            });
        }

        return transformed;
    }

    /**
     * Get all records from the collection
     * @param options - Optional query parameters (filter, sort, expand, etc.)
     * @returns Promise with array of records
     */
    async getAll(options?: {
        filter?: string;
        sort?: string;
        expand?: string;
        fields?: string;
    }): Promise<any[]> {
        try {
            const records = await this.pb.collection(this.collectionName).getFullList<T>({
                expand: options?.expand || "categories,products,collection,product,category,collections,*",
                ...options,
            });
            return records.map(record => this.transform(record));
        } catch (error) {
            console.error(`Error fetching ${this.collectionName} records:`, error);
            throw error;
        }
    }

    /**
     * Get a single record by ID
     * @param id - Record ID
     * @param options - Optional query parameters (expand, fields)
     * @returns Promise with record
     */
    async getById(id: string, options?: {
        expand?: string;
        fields?: string;
    }): Promise<any> {
        try {
            const record = await this.pb.collection(this.collectionName).getOne<T>(id, {
                expand: options?.expand || "categories,products,collection,product,category,collections,*",
                ...options,
            });
            return this.transform(record);
        } catch (error) {
            console.error(`Error fetching ${this.collectionName} record ${id}:`, error);
            throw error;
        }
    }

    /**
     * Get the first record from the collection
     * @param options - Optional query parameters
     * @returns Promise with record or null
     */
    async getFirst(options?: {
        filter?: string;
        expand?: string;
        fields?: string;
    }): Promise<any> {
        try {
            const record = await this.pb.collection(this.collectionName).getFirstListItem<T>("", {
                expand: options?.expand || "categories,products,collection,product,category,collections,*",
                ...options,
            });
            return this.transform(record);
        } catch (error) {
            // Return null if no record found
            if ((error as any)?.status === 404) {
                return null;
            }
            console.error(`Error fetching first ${this.collectionName} record:`, error);
            throw error;
        }
    }

    /**
     * Get paginated records
     * @param page - Page number (1-indexed)
     * @param perPage - Records per page
     * @param options - Optional query parameters
     * @returns Promise with paginated result
     */
    async getList(
        page: number = 1,
        perPage: number = 30,
        options?: {
            filter?: string;
            sort?: string;
            expand?: string;
            fields?: string;
        }
    ) {
        try {
            const result = await this.pb.collection(this.collectionName).getList<T>(page, perPage, {
                expand: options?.expand || "categories,products,collection,product,category,collections,*",
                ...options,
            });
            return {
                ...result,
                items: result.items.map(item => this.transform(item))
            };
        } catch (error) {
            console.error(`Error fetching ${this.collectionName} list:`, error);
            throw error;
        }
    }

    /**
     * Create a new record
     * @param data - Record data
     * @returns Promise with created record
     */
    async create(data: Partial<T>): Promise<any> {
        try {
            const record = await this.pb.collection(this.collectionName).create<T>(data);
            return this.transform(record);
        } catch (error) {
            console.error(`Error creating ${this.collectionName} record:`, error);
            throw error;
        }
    }

    /**
     * Update an existing record
     * @param id - Record ID
     * @param data - Updated data
     * @returns Promise with updated record
     */
    async update(id: string, data: Partial<T>): Promise<any> {
        try {
            const record = await this.pb.collection(this.collectionName).update<T>(id, data);
            return this.transform(record);
        } catch (error) {
            console.error(`Error updating ${this.collectionName} record ${id}:`, error);
            throw error;
        }
    }

    /**
     * Delete a record
     * @param id - Record ID
     * @returns Promise with boolean indicating success
     */
    async delete(id: string): Promise<boolean> {
        try {
            await this.pb.collection(this.collectionName).delete(id);
            return true;
        } catch (error) {
            console.error(`Error deleting ${this.collectionName} record ${id}:`, error);
            throw error;
        }
    }
}

/**
 * Factory function to create a PageService instance
 * @param pb - PocketBase instance
 * @param collectionName - Name of the collection
 * @param language - Active language
 * @returns PageService instance
 */
export function createPageService<T extends BaseRecord = BaseRecord>(
    pb: PocketBase,
    collectionName: string,
    language: "en" | "pt" = "en"
): PageService<T> {
    return new PageService<T>(pb, collectionName, language);
}

