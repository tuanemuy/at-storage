import { AnyError } from "../lib/error";

export const MainProcessErrorCode = {
  BAD_REQUEST: "BAD_REQUEST",
  STORAGE_SERVICE_ERROR: "STORAGE_SERVICE_ERROR",
  STORE_SERVICE_ERROR: "STORE_SERVICE_ERROR",
  UNEXPECTED_ERROR: "UNEXPECTED_ERROR",
} as const;
export type MainProcessErrorCode =
  (typeof MainProcessErrorCode)[keyof typeof MainProcessErrorCode];

export class MainProcessError extends AnyError {
  public readonly name = "MainProcessError";
  public readonly code: MainProcessErrorCode;

  constructor(opts: {
    message: string;
    code: MainProcessErrorCode;
    cause?: unknown;
  }) {
    super({ message: opts.message, cause: opts.cause });
    this.code = opts.code;
  }
}
