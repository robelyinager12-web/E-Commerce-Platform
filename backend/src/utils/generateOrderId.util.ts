import { randomBytes } from "crypto";

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = randomBytes(4).toString("hex").toUpperCase().slice(0, 6);
  return `ORD-${year}-${random}`;
}