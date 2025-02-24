import type { AnyError } from "./error";

export type Result<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: AnyError;
    };
