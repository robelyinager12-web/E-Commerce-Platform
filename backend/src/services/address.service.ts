import { query, withTransaction } from "../config/database";
import { ApiError } from "../utils/apiError.util";

export interface AddressRow {
  id: string;
  user_id: string;
  label: string | null;
  street: string;
  city: string;
  state: string | null;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
}

export async function listAddresses(userId: string): Promise<AddressRow[]> {
  const result = await query<AddressRow>(
    `SELECT id, user_id, label, street, city, state, postal_code, country, is_default, created_at
     FROM addresses WHERE user_id = $1
     ORDER BY is_default DESC, created_at DESC`,
    [userId]
  );
  return result.rows;
}

async function assertOwnership(userId: string, addressId: string): Promise<void> {
  const result = await query("SELECT id FROM addresses WHERE id = $1 AND user_id = $2", [
    addressId,
    userId,
  ]);
  if (result.rows.length === 0) {
    throw ApiError.notFound("Address not found");
  }
}

export async function createAddress(
  userId: string,
  input: {
    label?: string;
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    isDefault?: boolean;
  }
): Promise<AddressRow> {
  return withTransaction(async (client) => {
    // If this is the user's first address, or explicitly requested, make it default.
    const existingCount = await client.query<{ count: string }>(
      "SELECT COUNT(*)::text as count FROM addresses WHERE user_id = $1",
      [userId]
    );
    const shouldBeDefault = input.isDefault || parseInt(existingCount.rows[0].count, 10) === 0;

    if (shouldBeDefault) {
      await client.query("UPDATE addresses SET is_default = false WHERE user_id = $1", [userId]);
    }

    const result = await client.query<AddressRow>(
      `INSERT INTO addresses (user_id, label, street, city, state, postal_code, country, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, user_id, label, street, city, state, postal_code, country, is_default, created_at`,
      [
        userId,
        input.label ?? null,
        input.street,
        input.city,
        input.state ?? null,
        input.postalCode,
        input.country,
        shouldBeDefault,
      ]
    );
    return result.rows[0];
  });
}

export async function updateAddress(
  userId: string,
  addressId: string,
  input: {
    label?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    isDefault?: boolean;
  }
): Promise<AddressRow> {
  await assertOwnership(userId, addressId);

  return withTransaction(async (client) => {
    if (input.isDefault) {
      await client.query("UPDATE addresses SET is_default = false WHERE user_id = $1", [userId]);
    }

    const result = await client.query<AddressRow>(
      `UPDATE addresses SET
         label = COALESCE($1, label),
         street = COALESCE($2, street),
         city = COALESCE($3, city),
         state = COALESCE($4, state),
         postal_code = COALESCE($5, postal_code),
         country = COALESCE($6, country),
         is_default = COALESCE($7, is_default)
       WHERE id = $8
       RETURNING id, user_id, label, street, city, state, postal_code, country, is_default, created_at`,
      [
        input.label,
        input.street,
        input.city,
        input.state,
        input.postalCode,
        input.country,
        input.isDefault,
        addressId,
      ]
    );
    return result.rows[0];
  });
}

export async function deleteAddress(userId: string, addressId: string): Promise<void> {
  await assertOwnership(userId, addressId);

  try {
    await query("DELETE FROM addresses WHERE id = $1", [addressId]);
  } catch (err) {
    // Postgres foreign_key_violation: this address is referenced by one or
    // more past orders (shipping_address_id / billing_address_id), so it
    // can't be hard-deleted without breaking order history.
    if ((err as { code?: string }).code === "23503") {
      throw ApiError.conflict(
        "This address can't be deleted because it's used on a past order"
      );
    }
    throw err;
  }
}