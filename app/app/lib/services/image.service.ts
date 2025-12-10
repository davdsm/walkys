import type PocketBase from "pocketbase";
import type { PageRecord } from "./page.service";

export interface ImageRecord {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  section_id: string;
  filename?: string;
  media?: string[];
  url?: string;
}

export class ImageService {
  private pb: PocketBase;
  private collectionName: string;
  private collection: PageRecord[];

  constructor(
    pb: PocketBase,
    collectionName: string,
    collection: PageRecord[]
  ) {
    this.pb = pb;
    this.collectionName = collectionName;
    this.collection = collection;
  }

  /**
   * Build image URL without API call
   * @param recordId - The record ID
   * @param fileName - The filename of the image
   * @returns The full URL to the image
   */
  buildImageUrl(recordId: string, fileName: string): string {
    const baseUrl = this.pb.baseUrl.replace(/\/$/, ""); // Remove trailing slash if present
    return `${baseUrl}/api/files/${this.collectionName}/${recordId}/${fileName}`;
  }

  /**
   * Get image URLs by section ID without API call
   * @param sectionId - The section ID to filter by
   * @returns Array of full image URLs for the section
   */
  getImageBySectionName = ({ sectionId }: { sectionId: string }): string[] => {
    const sectionData = this.collection.find(
      (item) => item.section_id === sectionId
    );

    if (!sectionData?.media || sectionData.media.length === 0) {
      return [];
    }

    const baseUrl = "http://192.168.1.68:8090";
    return sectionData.media.map(
      (filename) =>
        `${baseUrl}/api/files/${this.collectionName}/${sectionData.id}/${filename}`
    );
  };
}

/**
 * Factory function to create an ImageService instance
 * @param pb - PocketBase instance
 * @param collectionName - Name of the collection to use for images
 * @returns ImageService instance
 */
export function createImageService(
  pb: PocketBase,
  collectionName: string,
  collection: PageRecord[]
): ImageService {
  return new ImageService(pb, collectionName, collection);
}
