import { z } from "zod";
import { themes } from "../../lib/theme";

export const getAppearanceResponseSchema = z.object({
  theme: z.enum(themes),
});
export type GetAppearanceResponseSchema = z.infer<
  typeof getAppearanceResponseSchema
>;

export const saveAppearanceSchema = z.object({
  theme: z.enum(themes),
});
export type SaveAppearanceSchema = z.infer<typeof saveAppearanceSchema>;

export const saveAppearanceResponseSchema = z.object({
  data: saveAppearanceSchema,
  isDarkMode: z.boolean(),
});
export type SaveAppearanceResponseSchema = z.infer<
  typeof saveAppearanceResponseSchema
>;

export const connectionStoreSchema = z.object({
  region: z.string().nullish(),
  bucketName: z.string().nullish(),
  basePath: z.string().nullish(),
  accessKey: z.string().nullish(),
  secretKey: z.string().nullish(),
  endpoint: z.string().nullish(),
});
export type ConnectionStore = z.infer<typeof connectionStoreSchema>;

export const imageProcessingStoreSchema = z.object({
  maxWidth: z.number().min(1),
  maxHeight: z.number().min(1),
  quality: z.number().min(1),
  webp: z.boolean(),
});
export type ImageProcessingStore = z.infer<typeof imageProcessingStoreSchema>;

export const getSettingsResponseSchema = z.object({
  connection: connectionStoreSchema,
  imageProcessing: imageProcessingStoreSchema,
});
export type GetSettingsResponseSchema = z.infer<
  typeof getSettingsResponseSchema
>;

export const saveSettingsSchema = z.object({
  connection: connectionStoreSchema,
  imageProcessing: imageProcessingStoreSchema,
});
export type SaveSettingsSchema = z.infer<typeof saveSettingsSchema>;

export const saveSettingsResponseSchema = z.object({
  data: saveSettingsSchema,
});
export type SaveSettingsResponseSchema = z.infer<
  typeof saveSettingsResponseSchema
>;

export const connectionSchema = z.object({
  region: z.string(),
  bucketName: z.string(),
  basePath: z.string().nullish(),
  accessKey: z.string(),
  secretKey: z.string(),
  endpoint: z.string().nullish(),
});
export type Connection = z.infer<typeof connectionSchema>;

export const imageProcessingSchema = z.object({
  maxWidth: z.number().min(1),
  maxHeight: z.number().min(1),
  quality: z.number().min(1),
  webp: z.boolean(),
});
export type ImageProcessing = z.infer<typeof imageProcessingSchema>;

export const uploadFileSchema = z.object({
  connection: connectionSchema,
  imageProcessing: imageProcessingSchema,
  name: z.string().min(1),
  arrayBuffer: z.any(),
});
export type UploadFileSchema = z.infer<typeof uploadFileSchema>;

export const uploadFileResponseSchema = z.object({
  path: z.string().min(1),
  webpPath: z.string().min(1).nullish(),
});
export type UploadFileResponseSchema = z.infer<typeof uploadFileResponseSchema>;

export const listFilesSchema = z.object({
  connection: connectionSchema,
  dateString: z.string().min(1),
});
export type ListFilesSchema = z.infer<typeof listFilesSchema>;

export const listedFile = z.object({
  key: z.string().min(1),
  lastModified: z.date(),
  size: z.number(),
  url: z.string().min(1),
});
export type ListedFile = z.infer<typeof listedFile>;

export const listFilesResponseSchema = z.object({
  files: z.array(listedFile),
  nextToken: z.string().nullish(),
});
export type ListFilesResponseSchema = z.infer<typeof listFilesResponseSchema>;

export const deleteFileSchema = z.object({
  connection: connectionSchema,
  key: z.string().min(1),
});
export type DeleteFileSchema = z.infer<typeof deleteFileSchema>;
