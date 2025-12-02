import type PocketBase from "pocketbase";

/**
 * Generic record interface for PocketBase collections
 */
export interface PageRecord {
    id: string;
    collectionId: string;
    collectionName: string;
    created: string;
    updated: string;
    section_name: string;
    section_id: string;
    value_pt: string;
    value_en: string;
    media: string[];
}

/**
 * Generic service class for interacting with any PocketBase collection
 */
export class PageService<T extends PageRecord = PageRecord> {
    private pb: PocketBase;
    private collectionName: string;

    constructor(pb: PocketBase, collectionName: string) {
        this.pb = pb;
        this.collectionName = collectionName;
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
    }): Promise<T[]> {
        try {
            const records = await this.pb.collection(this.collectionName).getFullList<T>({
                ...options,
            });
            return records;
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
    }): Promise<T> {
        try {
            const record = await this.pb.collection(this.collectionName).getOne<T>(id, {
                ...options,
            });
            return record;
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
    }): Promise<T | null> {
        try {
            const record = await this.pb.collection(this.collectionName).getFirstListItem<T>("", {
                ...options,
            });
            return record;
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
                ...options,
            });
            return result;
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
    async create(data: Partial<T>): Promise<T> {
        try {
            const record = await this.pb.collection(this.collectionName).create<T>(data);
            return record;
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
    async update(id: string, data: Partial<T>): Promise<T> {
        try {
            const record = await this.pb.collection(this.collectionName).update<T>(id, data);
            return record;
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
 * @returns PageService instance
 */
export function createPageService<T extends PageRecord = PageRecord>(
    pb: PocketBase,
    collectionName: string
): PageService<T> {
    return new PageService<T>(pb, collectionName);
}
