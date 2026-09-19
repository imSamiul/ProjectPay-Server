import { v4 as uuidv4 } from "uuid";

export function generateUUID(): string {
  return uuidv4().toString().substring(0, 8);
}

export function generateClientKey(): string {
  return uuidv4().replace(/-/g, "").substring(0, 10).toUpperCase();
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
