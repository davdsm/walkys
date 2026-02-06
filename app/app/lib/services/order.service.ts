import type PocketBase from "pocketbase";

export interface OrderItem {
  productId: string;
  productName: string;
  size: string | null;
  quantity: number;
}

/** Order status: new → processing → sended → completed */
export type OrderStatus = "new" | "processing" | "sended" | "completed";

export const ORDER_STATUSES: OrderStatus[] = ["new", "processing", "sended", "completed"];

export interface OrderRecord {
  id: string;
  user: string;
  items: OrderItem[];
  created: string;
  /** Optional: defaults to "new" if missing (e.g. old records). */
  status?: OrderStatus;
}

const ORDERS_COLLECTION = "orders";
const DEFAULT_STATUS: OrderStatus = "new";

/**
 * Create an order for a user with the given line items.
 */
export async function createOrder(
  pb: PocketBase,
  userId: string,
  items: OrderItem[]
): Promise<OrderRecord> {
  const record = await pb.collection(ORDERS_COLLECTION).create<OrderRecord>({
    user: userId,
    items,
    status: DEFAULT_STATUS,
  });
  return record;
}

/**
 * Get all orders for a user, newest first.
 */
export async function getOrdersByUser(
  pb: PocketBase,
  userId: string
): Promise<OrderRecord[]> {
  const list = await pb.collection(ORDERS_COLLECTION).getFullList<OrderRecord>({
    filter: `user = "${userId}"`,
    sort: "-created",
  });
  return list;
}

/**
 * Get total order count for a user (for dashboard card).
 */
export async function getOrderCountByUser(
  pb: PocketBase,
  userId: string
): Promise<number> {
  const result = await pb.collection(ORDERS_COLLECTION).getList(1, 1, {
    filter: `user = "${userId}"`,
  });
  return result.totalItems ?? 0;
}

/** Order record with expanded user (for admin list/detail). */
export interface OrderRecordWithUser extends OrderRecord {
  expand?: {
    user?: {
      id: string;
      email?: string;
      name?: string;
      address?: string;
      postal_code?: string;
      nif?: string;
      city?: string;
      country?: string;
    };
  };
}

/**
 * Get all orders (admin), newest first, with user expanded.
 */
export async function getAllOrders(pb: PocketBase): Promise<OrderRecordWithUser[]> {
  const list = await pb.collection(ORDERS_COLLECTION).getFullList<OrderRecordWithUser>({
    sort: "-created",
    expand: "user",
  });
  return list;
}

/**
 * Get one order by id with user expanded.
 */
export async function getOrderById(
  pb: PocketBase,
  orderId: string
): Promise<OrderRecordWithUser | null> {
  try {
    const record = await pb.collection(ORDERS_COLLECTION).getOne<OrderRecordWithUser>(orderId, {
      expand: "user",
    });
    return record;
  } catch {
    return null;
  }
}

/**
 * Update an order (e.g. items, status). Admin only.
 */
export async function updateOrder(
  pb: PocketBase,
  orderId: string,
  data: { items?: OrderItem[]; status?: OrderStatus }
): Promise<OrderRecord> {
  const record = await pb.collection(ORDERS_COLLECTION).update<OrderRecord>(orderId, data);
  return record;
}

/**
 * Delete an order. Admin only.
 */
export async function deleteOrder(pb: PocketBase, orderId: string): Promise<void> {
  await pb.collection(ORDERS_COLLECTION).delete(orderId);
}
