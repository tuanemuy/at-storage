import { ulid } from "ulid";

export function generateId() {
  return ulid();
}
