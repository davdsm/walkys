// Export generic page service
export { PageService, createPageService } from "./page.service";
export type { BaseRecord, PageRecord } from "./page.service";

// Export contact service
export { ContactService, createContactService } from "./contact.service";
export type { ContactRecord, ContactFormData } from "./contact.service";

// Export image service
export { ImageService, createImageService } from "./image.service";
export type { ImageRecord } from "./image.service";

// Export product service
export { ProductService, createProductService } from "./product.service";
export type { ProductServiceOptions } from "./product.service";

// Export collection service
export { CollectionService, createCollectionService } from "./collection.service";
export type { CollectionRecord, CollectionServiceOptions } from "./collection.service";

// Export category service
export { CategoryService, createCategoryService } from "./category.service";
export type { CategoryServiceOptions } from "./category.service";
