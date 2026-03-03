import type PocketBase from "pocketbase";

/** User record from PocketBase users collection (auth users). */
export interface UserRecord {
  id: string;
  email?: string;
  name?: string;
  admin?: boolean;
  /** When false, user cannot access dashboard until admin approves. */
  approved?: boolean;
  /** When true, user is blocked and cannot access the app. */
  blocked?: boolean;
  created?: string;
  updated?: string;
  catalog_products?: string[] | { id: string }[];
  /** Checkout / profile fields (stored for prefill). */
  address?: string;
  postal_code?: string;
  nif?: string;
  city?: string;
  country?: string;
}

/** Payload to create a new user. */
export interface CreateUserData {
  email: string;
  password: string;
  passwordConfirm: string;
  name?: string;
  admin?: boolean;
  approved?: boolean;
  blocked?: boolean;
}

/** Payload to update an existing user. */
export interface UpdateUserData {
  email?: string;
  name?: string;
  admin?: boolean;
  approved?: boolean;
  blocked?: boolean;
  password?: string;
  passwordConfirm?: string;
  catalog_products?: string[];
  address?: string;
  postal_code?: string;
  nif?: string;
  city?: string;
  country?: string;
}

const USERS_COLLECTION = "users";
const DEFAULT_FIELDS = "id,email,name,admin,approved,created";
const LIST_FIELDS = "id,email,name,admin,approved,blocked,created";
const EDIT_FIELDS = "id,email,name,admin,approved,blocked,catalog_products,address,postal_code,nif,city,country";

/**
 * User service: CRUD for PocketBase users collection.
 * Use with createPocketBase(request) for current user auth, or createPocketBaseAsAdmin() to list all users.
 */
export class UserService {
  constructor(private readonly pb: PocketBase) {}

  /** List all users (admin client recommended so List rule doesn't filter). */
  async getFullList(options?: { sort?: string; fields?: string }): Promise<UserRecord[]> {
    const list = await this.pb.collection(USERS_COLLECTION).getFullList<UserRecord>({
      sort: options?.sort ?? "-created",
      fields: options?.fields ?? LIST_FIELDS,
    });
    return list;
  }

  /** Get one user by id. */
  async getOne(id: string, options?: { fields?: string }): Promise<UserRecord> {
    const record = await this.pb.collection(USERS_COLLECTION).getOne<UserRecord>(id, {
      fields: options?.fields ?? EDIT_FIELDS,
    });
    return record;
  }

  /** Create a new user. */
  async create(data: CreateUserData): Promise<UserRecord> {
    const record = await this.pb.collection(USERS_COLLECTION).create<UserRecord>({
      email: data.email,
      password: data.password,
      passwordConfirm: data.passwordConfirm,
      name: data.name ?? "",
      admin: data.admin ?? false,
      approved: data.approved ?? true,
      blocked: data.blocked ?? false,
    });
    return record;
  }

  /** Update an existing user. Only sends fields that are present in data to avoid overwriting with empty values (e.g. partial approve/block). */
  async update(id: string, data: UpdateUserData): Promise<UserRecord> {
    const payload: Record<string, unknown> = {};
    if (data.email !== undefined) payload.email = data.email;
    if (data.name !== undefined) payload.name = data.name;
    if (data.admin !== undefined) payload.admin = data.admin;
    if (data.approved !== undefined) payload.approved = data.approved;
    if (data.blocked !== undefined) payload.blocked = data.blocked;
    if (data.catalog_products !== undefined) {
      payload.catalog_products = data.catalog_products;
    }
    if (data.password && data.password.length >= 8 && data.passwordConfirm) {
      payload.password = data.password;
      payload.passwordConfirm = data.passwordConfirm;
    }
    if (data.address !== undefined) payload.address = data.address;
    if (data.postal_code !== undefined) payload.postal_code = data.postal_code;
    if (data.nif !== undefined) payload.nif = data.nif;
    if (data.city !== undefined) payload.city = data.city;
    if (data.country !== undefined) payload.country = data.country;
    const record = await this.pb.collection(USERS_COLLECTION).update<UserRecord>(id, payload);
    return record;
  }

  /** Delete a user. */
  async delete(id: string): Promise<void> {
    await this.pb.collection(USERS_COLLECTION).delete(id);
  }
}

export function createUserService(pb: PocketBase): UserService {
  return new UserService(pb);
}
