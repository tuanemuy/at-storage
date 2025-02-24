import { join } from "node:path";
import { BrowserWindow, shell, nativeTheme, clipboard } from "electron";
import { is } from "@electron-toolkit/utils";
import type { App, Context } from "../app";
import {
  type SaveAppearanceSchema,
  type SaveSettingsSchema,
  type UploadFileSchema,
  type ListFilesSchema,
  type DeleteFileSchema,
  getAppearanceResponseSchema,
  saveAppearanceSchema,
  saveAppearanceResponseSchema,
  getSettingsResponseSchema,
  saveSettingsSchema,
  saveSettingsResponseSchema,
  uploadFileSchema,
  listFilesSchema,
  deleteFileSchema,
} from "../../preload/schema/main";
import { MainProcessError, MainProcessErrorCode } from "../error";
import icon from "../../../resources/icon.png?asset";

export function registerMainWindow(app: App): void {
  const createWindow = (context: Context) => {
    const size = context.container.storeService.get("window.size") || {
      width: 900,
      height: 670,
    };
    const position =
      context.container.storeService.get("window.position") || {};

    const mainWindow = new BrowserWindow({
      ...size,
      ...position,
      show: false,
      titleBarStyle: "hidden",
      autoHideMenuBar: true,
      ...(process.platform === "linux" ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, "../preload/index.mjs"),
        sandbox: false,
      },
    });

    if (process.env.NODE_ENV === "development") {
      mainWindow.webContents.openDevTools({ mode: "detach" });
    }

    mainWindow.on("ready-to-show", () => {
      mainWindow.show();
    });

    mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url);
      return { action: "deny" };
    });

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env.ELECTRON_RENDERER_URL) {
      mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
    } else {
      mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
    }

    mainWindow.on("close", () => {
      context.container.storeService.set("window.position", {
        x: mainWindow.getPosition()[0],
        y: mainWindow.getPosition()[1],
      });
      context.container.storeService.set("window.size", {
        width: mainWindow.getSize()[0],
        height: mainWindow.getSize()[1],
      });
    });
  };
  app.on.ready(createWindow);
  app.on.activate((context) => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(context);
    }
  });

  app.handle("main:write-to-clipboard", (_context, _event, args) => {
    clipboard.writeText(args[0]);
  });

  app.handle("main:get-settings", (context, _event) => {
    try {
      const data = context.container.storeService.get("settings");
      return {
        ok: true,
        value: getSettingsResponseSchema.parse(data),
      };
    } catch (e) {
      return {
        ok: false,
        error: new MainProcessError({
          code: MainProcessErrorCode.STORE_SERVICE_ERROR,
          message: "Failed to get settings",
          cause: e,
        }),
      };
    }
  });

  app.handle("main:save-settings", (context, _event, args) => {
    let params: SaveSettingsSchema;
    try {
      params = saveSettingsSchema.parse(args[0] || {});
    } catch (e) {
      return {
        ok: false,
        error: new MainProcessError({
          code: MainProcessErrorCode.BAD_REQUEST,
          message: "Failed to parse request parameters",
          cause: e,
        }),
      };
    }

    try {
      context.container.storeService.set("settings", params);
      return {
        ok: true,
        value: saveSettingsResponseSchema.parse({ data: params }),
      };
    } catch (e) {
      return {
        ok: false,
        error: new MainProcessError({
          code: MainProcessErrorCode.STORE_SERVICE_ERROR,
          message: "Failed to save settings",
          cause: e,
        }),
      };
    }
  });

  app.handle("main:get-appearance", (context, _event) => {
    try {
      const data = context.container.storeService.get("appearance");
      return {
        ok: true,
        value: getAppearanceResponseSchema.parse(data),
      };
    } catch (e) {
      return {
        ok: false,
        error: new MainProcessError({
          code: MainProcessErrorCode.STORE_SERVICE_ERROR,
          message: "Failed to get appearance settings",
          cause: e,
        }),
      };
    }
  });

  app.handle("main:save-appearance", (context, _event, args) => {
    let params: SaveAppearanceSchema;
    try {
      params = saveAppearanceSchema.parse(args[0] || {});
    } catch (e) {
      return {
        ok: false,
        error: new MainProcessError({
          code: MainProcessErrorCode.BAD_REQUEST,
          message: "Failed to parse request parameters",
          cause: e,
        }),
      };
    }

    try {
      nativeTheme.themeSource = params.theme;
      context.container.storeService.set("appearance", params);
      return {
        ok: true,
        value: saveAppearanceResponseSchema.parse({
          data: params,
          isDarkMode: nativeTheme.shouldUseDarkColors,
        }),
      };
    } catch (e) {
      return {
        ok: false,
        error: new MainProcessError({
          code: MainProcessErrorCode.STORE_SERVICE_ERROR,
          message: "Failed to save appearance settings",
          cause: e,
        }),
      };
    }
  });

  app.handle("main:upload-file", async (context, _event, args) => {
    if (args.length < 3) {
      return {
        ok: false,
        error: new MainProcessError({
          code: MainProcessErrorCode.BAD_REQUEST,
          message: "Bad request",
        }),
      };
    }

    let params: UploadFileSchema;
    try {
      params = uploadFileSchema.parse(args[0] || {});
    } catch (e) {
      return {
        ok: false,
        error: new MainProcessError({
          code: MainProcessErrorCode.BAD_REQUEST,
          message: "Failed to parse request parameters",
          cause: e,
        }),
      };
    }

    const name = args[1];
    const input = args[2];
    try {
      const result = await context.container.storageService.upload({
        connection: params.connection,
        processingOptions: params.imageProcessing,
        name,
        input,
      });
      return {
        ok: true,
        value: result,
      };
    } catch (e) {
      return {
        ok: false,
        error: new MainProcessError({
          code: MainProcessErrorCode.STORAGE_SERVICE_ERROR,
          message: "Failed to upload files",
          cause: e,
        }),
      };
    }
  });

  app.handle("main:list-files", async (context, _event, args) => {
    let params: ListFilesSchema;
    try {
      params = listFilesSchema.parse(args[0] || {});
    } catch (e) {
      return {
        ok: false,
        error: new MainProcessError({
          code: MainProcessErrorCode.BAD_REQUEST,
          message: "Failed to parse request parameters",
          cause: e,
        }),
      };
    }

    try {
      const result = await context.container.storageService.list(params);
      return {
        ok: true,
        value: {
          files: result.images,
          nextToken: result.nextToken,
        },
      };
    } catch (e) {
      return {
        ok: false,
        error: new MainProcessError({
          code: MainProcessErrorCode.STORAGE_SERVICE_ERROR,
          message: "Failed to list files",
          cause: e,
        }),
      };
    }
  });

  app.handle("main:delete-file", async (context, _event, args) => {
    let params: DeleteFileSchema;
    try {
      params = deleteFileSchema.parse(args[0] || {});
    } catch (e) {
      return {
        ok: false,
        error: new MainProcessError({
          code: MainProcessErrorCode.BAD_REQUEST,
          message: "Failed to parse request parameters",
          cause: e,
        }),
      };
    }

    try {
      const result = await context.container.storageService.delete(params);
      return {
        ok: true,
        value: result,
      };
    } catch (e) {
      return {
        ok: false,
        error: new MainProcessError({
          code: MainProcessErrorCode.STORAGE_SERVICE_ERROR,
          message: "Failed to delete files",
          cause: e,
        }),
      };
    }
  });
}
