import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
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
  uploadFile: (
    params: UploadFileSchema,
    name: string,
    arrayBuffer: ArrayBuffer,
  ) => ipcRenderer.invoke("main:upload-file", params, name, arrayBuffer),
  listFiles: (params: ListFilesSchema) =>
    ipcRenderer.invoke("main:list-files", params),
  deleteFile: (params: DeleteFileSchema) =>
    ipcRenderer.invoke("main:delete-file", params),
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("main", main);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.main = main;
}
