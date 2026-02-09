import type PocketBase from "pocketbase";

/**
 * Notification record from PocketBase `notifications` collection.
 *
 * Example shape:
 * {
 *   id: "test",
 *   user: "RELATION_RECORD_ID" | null,
 *   type: "order_new" | "message_new" | "user_registered" | "order_status_changed",
 *   payload: any,
 *   read: boolean,
 *   created: string,
 *   updated: string
 * }
 */
export interface NotificationRecord {
  id: string;
  user?: string | null;
  type: string;
  payload?: any;
  read?: boolean;
  created?: string;
  updated?: string;
}

const NOTIFICATIONS_COLLECTION = "notifications";

/**
 * Get latest notifications for admin view (no user filter).
 */
export async function getAdminNotifications(
  pb: PocketBase,
  limit = 10
): Promise<NotificationRecord[]> {
  const list = await pb
    .collection(NOTIFICATIONS_COLLECTION)
    .getFullList<NotificationRecord>({
      sort: "-created",
      perPage: limit,
    });
  return list;
}

/**
 * Get unread notifications for a specific user.
 */
export async function getUserNotifications(
  pb: PocketBase,
  userId: string,
  limit = 10
): Promise<NotificationRecord[]> {
  const list = await pb
    .collection(NOTIFICATIONS_COLLECTION)
    .getFullList<NotificationRecord>({
      filter: `user = "${userId}"`,
      sort: "-created",
      perPage: limit,
    });
  return list;
}

export type NotificationType =
  | "order_new"
  | "message_new"
  | "user_registered"
  | "order_status_changed";

export interface CreateNotificationData {
  type: NotificationType;
  user?: string | null;
  payload?: Record<string, unknown>;
}

/**
 * Mark notifications as read. Use admin PocketBase client.
 */
export async function markNotificationsAsRead(
  pb: PocketBase,
  ids: string[]
): Promise<void> {
  for (const id of ids) {
    await pb.collection(NOTIFICATIONS_COLLECTION).update(id, { read: true });
  }
}

/**
 * Create a notification. Use admin PocketBase client.
 */
export async function createNotification(
  pb: PocketBase,
  data: CreateNotificationData
): Promise<NotificationRecord> {
  const record = await pb.collection(NOTIFICATIONS_COLLECTION).create<NotificationRecord>({
    type: data.type,
    user: data.user ?? null,
    payload: data.payload ?? {},
    read: false,
  });
  return record;
}

