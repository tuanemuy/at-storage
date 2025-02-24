export class AnyError extends Error {
  public readonly name: string = "AnyError";
  public readonly cause?: Error;

  constructor(opts: {
    message: string;
    cause?: unknown;
  }) {
    super(opts.message);

    if (!opts.cause) {
      return;
    }

    if (opts.cause instanceof Error) {
      this.cause = opts.cause;
    }

    if (
      typeof opts.cause === "object" &&
      "message" in opts.cause &&
      typeof opts.cause.message === "string"
    ) {
      this.cause = new Error(opts.cause.message);
    }
  }
}
