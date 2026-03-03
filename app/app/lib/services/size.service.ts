import type PocketBase from "pocketbase";

const SIZES_COLLECTION = "sizes";

/**
 * Ensures the PocketBase "sizes" collection has records for every integer from min to max (inclusive).
 * Creates only missing numbers; existing ones are left unchanged.
 * @returns The number of new size records created.
 */
export async function ensureSizesRange(
  pb: PocketBase,
  min: number,
  max: number
): Promise<number> {
  if (min > max) return 0;
  const existing = await pb
    .collection(SIZES_COLLECTION)
    .getFullList<{ number?: string }>({ fields: "number" });
  const existingNumbers = new Set(
    (existing || []).map((r) => r.number?.trim()).filter(Boolean)
  );
  let created = 0;
  for (let n = min; n <= max; n++) {
    const numStr = String(n);
    if (existingNumbers.has(numStr)) continue;
    await pb.collection(SIZES_COLLECTION).create({ number: numStr });
    existingNumbers.add(numStr);
    created++;
  }
  return created;
}
