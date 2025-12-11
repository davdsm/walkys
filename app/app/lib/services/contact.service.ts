import type PocketBase from "pocketbase";

export interface ContactRecord {
    id?: string;
    Name: string;
    Subject: string;
    Company: string;
    Email: string;
    Message: string;
    created?: string;
    updated?: string;
}

export type ContactFormData = Omit<ContactRecord, "id" | "created" | "updated">;

export class ContactService {
    private pb: PocketBase;
    private collectionName = "ContactFormReplies";

    constructor(pb: PocketBase) {
        this.pb = pb;
    }

    /**
     * Submit a contact form
     * @param data - The contact data to submit
     * @returns Promise with the created record
     */
    async submitContactForm(data: ContactFormData): Promise<ContactRecord> {
        try {
            const record = await this.pb.collection(this.collectionName).create<ContactRecord>(data);
            return record;
        } catch (error) {
            console.error("Error submitting contact form:", error);
            throw error;
        }
    }
}

/**
 * Factory function to create a ContactService instance
 * @param pb - PocketBase instance
 * @returns ContactService instance
 */
export function createContactService(pb: PocketBase): ContactService {
    return new ContactService(pb);
}
