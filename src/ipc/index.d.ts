import type { ElectronAPI } from "@electron-toolkit/preload";
import type { Result } from "../lib/result";
import type {
  GetAppearanceResponseSchema,
  SaveAppearanceSchema,
  SaveAppearanceResponseSchema,
  GetSettingsResponseSchema,
  SaveSettingsSchema,
  SaveSettingsResponseSchema,
  UploadFileSchema,
  UploadFileResponseSchema,
  ListFilesSchema,
  ListFilesResponseSchema,
  DeleteFileSchema,
} from "./schema/main";

declare global {
  interface Window {
    electron: ElectronAPI;
    main: {
      writeToClipboard: (text: string) => Promise<void>;
      getAppearance: () => Promise<Result<GetAppearanceResponseSchema>>;
      saveAppearance: (
        params: SaveAppearanceSchema,
      ) => Promise<Result<SaveAppearanceResponseSchema>>;
      getSettings: () => Promise<Result<GetSettingsResponseSchema>>;
      saveSettings: (
        params: SaveSettingsSchema,
      ) => Promise<Result<SaveSettingsResponseSchema>>;
      uploadFile: (
        params: UploadFileSchema,
      ) => Promise<Result<UploadFileResponseSchema>>;
      listFiles: (
        params: ListFilesSchema,
      ) => Promise<Result<ListFilesResponseSchema>>;
      deleteFile: (params: DeleteFileSchema) => Promise<Result<string>>;
    };
  }
}
