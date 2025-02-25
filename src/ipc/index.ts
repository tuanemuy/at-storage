import { ipcRenderer } from "electron";
import type {
  SaveAppearanceSchema,
  SaveSettingsSchema,
  UploadFileSchema,
  ListFilesSchema,
  DeleteFileSchema,
} from "./schema/main";

// Custom APIs for renderer
export const main = {
  writeToClipboard: (text: string) =>
    ipcRenderer.invoke("main:write-to-clipboard", text),
  getAppearance: () => ipcRenderer.invoke("main:get-appearance"),
  saveAppearance: (params: SaveAppearanceSchema) =>
    ipcRenderer.invoke("main:save-appearance", params),
  getSettings: () => ipcRenderer.invoke("main:get-settings"),
  saveSettings: (params: SaveSettingsSchema) =>
    ipcRenderer.invoke("main:save-settings", params),
  uploadFile: (params: UploadFileSchema) =>
    ipcRenderer.invoke("main:upload-file", params),
  listFiles: (params: ListFilesSchema) =>
    ipcRenderer.invoke("main:list-files", params),
  deleteFile: (params: DeleteFileSchema) =>
    ipcRenderer.invoke("main:delete-file", params),
};
