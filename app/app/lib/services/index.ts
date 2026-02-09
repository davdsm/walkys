// Export generic page service
export { PageService, createPageService } from "./page.service";
export type { BaseRecord, PageRecord, TranslatedPageRecord } from "./page.service";

// Export contact service
export { ContactService, createContactService } from "./contact.service";
export type { ContactRecord, ContactFormData } from "./contact.service";

// Export image service
export { ImageService, createImageService } from "./image.service";
export type { ImageRecord } from "./image.service";

// Export product service
export { ProductService, createProductService } from "./product.service";
export type { ProductServiceOptions, TranslatedProduct, ProductRecord } from "./product.service";

// Export collection service
export { CollectionService, createCollectionService } from "./collection.service";
export type { CollectionRecord, CollectionServiceOptions, TranslatedCollection } from "./collection.service";

// Export category service
export { CategoryService, createCategoryService } from "./category.service";
export type { CategoryServiceOptions, TranslatedCategory, CategoryRecord } from "./category.service";

// Export user service
export { UserService, createUserService } from "./user.service";
export type { UserRecord, CreateUserData, UpdateUserData } from "./user.service";

// Export order service
export {
  createOrder,
  getOrdersByUser,
  getOrderCountByUser,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} from "./order.service";
export type { OrderRecord, OrderItem, OrderRecordWithUser, OrderStatus } from "./order.service";
export { ORDER_STATUSES } from "./order.service";

// Export notifications service
export type { NotificationRecord, NotificationType, CreateNotificationData } from "./notification.service";
export { getAdminNotifications, getUserNotifications, createNotification, markNotificationsAsRead } from "./notification.service";

