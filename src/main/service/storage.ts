import path from "node:path";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  S3ServiceException,
  waitUntilObjectNotExists,
} from "@aws-sdk/client-s3";
import sharp from "sharp";
import mime from "mime";
import { format } from "date-fns";
import { AnyError } from "../../lib/error";

export type Connection = {
  endpoint?: string | null;
  region: string;
  bucketName: string;
  basePath?: string | null;
  accessKey: string;
  secretKey: string;
};

export type ProcessingOptions = {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  webp: boolean;
};

export type UploadedImage = {
  path: string;
  width: number;
  height: number;
  mimeType: string;
};

export type UploadImageParams = {
  connection: Connection;
  processingOptions: ProcessingOptions;
  name: string;
  input:
    | Buffer
    | ArrayBuffer
    | Uint8Array
    | Uint8ClampedArray
    | Int8Array
    | Uint16Array
    | Int16Array
    | Uint32Array
    | Int32Array
    | Float32Array
    | Float64Array;
};

export type ListedImage = {
  key: string;
  lastModified: Date;
  size: number;
  url: string;
};

export type ListImagesParams = {
  connection: Connection;
  dateString: string;
  // pageSize: number;
  // nextToken?: string | null;
};

export type DownloadImageParams = {
  connection: Connection;
  path: string;
};

export type DeleteImageParams = {
  connection: Connection;
  key: string;
};

export type IStorageService = {
  upload(params: UploadImageParams): Promise<{
    path: string;
    webpPath: string | null;
  }>;
  list(
    params: ListImagesParams,
  ): Promise<{ images: ListedImage[]; nextToken?: string }>;
  download(params: DownloadImageParams): Promise<ReadableStream>;
  delete(params: DeleteImageParams): Promise<string>;
};

export class StorageService implements IStorageService {
  async upload({
    connection,
    processingOptions,
    name,
    input,
  }: UploadImageParams): Promise<{
    path: string;
    webpPath: string | null;
  }> {
    type BufferObject = {
      data: Buffer;
      info: sharp.OutputInfo;
    };
    let buffer: BufferObject;
    let webpBuffer: BufferObject | null = null;
    try {
      buffer = await sharp(input)
        .rotate()
        .resize({
          width: processingOptions.maxWidth,
          height: processingOptions.maxHeight,
          fit: "inside",
          withoutEnlargement: true,
        })
        .toBuffer({ resolveWithObject: true });

      if (["jpeg", "jpg"].includes(buffer.info.format)) {
        buffer = await sharp(buffer.data)
          .jpeg({ quality: processingOptions.quality })
          .toBuffer({ resolveWithObject: true });
      }

      if (["png"].includes(buffer.info.format)) {
        buffer = await sharp(buffer.data)
          .png({ quality: processingOptions.quality })
          .toBuffer({ resolveWithObject: true });
      }

      if (buffer.info.format !== "webp" && processingOptions.webp) {
        webpBuffer = await sharp(buffer.data)
          .webp()
          .toBuffer({ resolveWithObject: true });
      }
    } catch (e) {
      throw new StorageServiceError({
        code: StorageServiceErrorCode.IMAGE_CONVERSION_ERROR,
        cause: e,
        message: "Failed to convert images with Sharp.",
      });
    }

    const uploads = [buffer, webpBuffer]
      .filter((b): b is BufferObject => b !== null)
      .map((b) => {
        return {
          Bucket: connection.bucketName,
          Key: getKey(name, b.info.format, connection.basePath),
          Body: b.data,
          // ContentLength: b.data.length,
          ContentType: mime.getType(b.info.format) || undefined,
        };
      });

    try {
      const client = createClient(connection);
      await Promise.all(
        uploads.map((upload) => client.send(new PutObjectCommand(upload))),
      );
    } catch (e) {
      throw new StorageServiceError({
        code: StorageServiceErrorCode.IMAGE_CONVERSION_ERROR,
        cause: e,
        message: "Failed to upload images to Storage.",
      });
    }

    return {
      path: uploads[0].Key,
      webpPath: uploads[1]?.Key || null,
    };
  }

  async list({ connection, dateString }) {
    const client = createClient(connection);
    const command = new ListObjectsV2Command({
      Bucket: connection.bucketName,
      Prefix: path.join(connection.basePath, dateString),
      // MaxKeys: pageSize,
      // ContinuationToken: nextToken,
    });

    try {
      const response = await client.send(command);
      return {
        images:
          response.Contents?.map((content) =>
            content.Key
              ? {
                  key: content.Key,
                  lastModified: content.LastModified,
                  size: content.Size,
                  url: getUrl(connection, content.Key),
                }
              : null,
          ).filter((content): content is ListedImage => !!content) || [],
        nextToken: response.NextContinuationToken,
      };
    } catch (e) {
      throw new StorageServiceError({
        code: StorageServiceErrorCode.STORAGE_ERROR,
        message: "Failed to list Objects.",
        cause: e,
      });
    }
  }

  async download({
    connection,
    path,
  }: DownloadImageParams): Promise<ReadableStream> {
    const client = createClient(connection);
    const command = new GetObjectCommand({
      Bucket: connection.bucketName,
      Key: path,
    });

    try {
      const response = await client.send(command);
      if (response.Body) {
        return response.Body.transformToWebStream();
      }

      throw new StorageServiceError({
        code: StorageServiceErrorCode.STORAGE_ERROR,
        message: `Failed to download ${path}.`,
      });
    } catch (e) {
      throw new StorageServiceError({
        code: StorageServiceErrorCode.STORAGE_ERROR,
        cause: e,
        message: `Failed to download ${path}.`,
      });
    }
  }

  async delete({ connection, key }: DeleteImageParams): Promise<string> {
    const client = createClient(connection);
    const command = new DeleteObjectCommand({
      Bucket: connection.bucketName,
      Key: key,
    });

    try {
      await client.send(command);
      await waitUntilObjectNotExists(
        { client: client, maxWaitTime: 60 },
        { Bucket: connection.bucketName, Key: key },
      );
    } catch (e) {
      throw new StorageServiceError({
        code: StorageServiceErrorCode.STORAGE_ERROR,
        cause:
          e instanceof Error || e instanceof S3ServiceException ? e : undefined,
        message: `Failed to delete ${path}.`,
      });
    }

    return key;
  }
}

export class MockStorageService implements IStorageService {
  constructor(public readonly expect: "success" | "error") {}

  async upload(_params: UploadImageParams): Promise<{
    path: string;
    webpPath: string | null;
  }> {
    if (this.expect === "success") {
      return {
        path: "uploaded.jpg",
        webpPath: "uploaded.webp",
      };
    }

    throw new StorageServiceError({
      code: StorageServiceErrorCode.UNEXPECTED_ERROR,
      message: "Error",
    });
  }

  async list(_params: ListImagesParams): Promise<{
    images: ListedImage[];
    nextToken?: string;
  }> {
    if (this.expect === "error") {
      throw new StorageServiceError({
        code: StorageServiceErrorCode.UNEXPECTED_ERROR,
        message: "Error",
      });
    }

    return {
      images: [],
      nextToken: "token",
    };
  }

  async download(_params: DownloadImageParams): Promise<ReadableStream> {
    if (this.expect === "error") {
      throw new StorageServiceError({
        code: StorageServiceErrorCode.UNEXPECTED_ERROR,
        message: "Error",
      });
    }

    return new ReadableStream();
  }

  async delete({ key }: DeleteImageParams): Promise<string> {
    if (this.expect === "error") {
      throw new StorageServiceError({
        code: StorageServiceErrorCode.UNEXPECTED_ERROR,
        message: "Error",
      });
    }

    return key;
  }
}

function createClient(connection: Connection) {
  return new S3Client({
    region: connection.region,
    endpoint: connection.endpoint || undefined,
    credentials: {
      accessKeyId: connection.accessKey,
      secretAccessKey: connection.secretKey,
    },
  });
}

function getUrl(connection: Connection, key: string) {
  const endpoint =
    connection.endpoint || `https://s3.${connection.region}.amazonaws.com`;
  const host = new URL(endpoint).host;
  return `https://${connection.bucketName}.${host}/${key}`;
}

function getSafeName(name: string) {
  return name.replace(/[&$@=:;\/\\+\s,?{}\^%`\[\]"'<>~#|]/g, "*");
}

function getKey(name: string, ext: string, basePath?: string | null) {
  const safeName = getSafeName(name);
  const date = format(new Date(), "yyyy-MM-dd");
  return `${path.join(basePath || "", date, safeName)}.${ext}`;
}

export const StorageServiceErrorCode = {
  IMAGE_CONVERSION_ERROR: "IMAGE_CONVERSION_ERROR",
  STORAGE_ERROR: "STORAGE_ERROR",
  UNEXPECTED_ERROR: "UNEXPECTED_ERROR",
} as const;
export type StorageServiceErrorCode =
  (typeof StorageServiceErrorCode)[keyof typeof StorageServiceErrorCode];

export class StorageServiceError extends AnyError {
  public readonly name = "StorageServiceError";
  public readonly code: StorageServiceErrorCode;

  constructor(opts: {
    message: string;
    code: StorageServiceErrorCode;
    cause?: unknown;
  }) {
    super({ message: opts.message, cause: opts.cause });
    this.code = opts.code;
  }
}
