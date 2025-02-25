import { join } from "node:path";
import { BrowserWindow, shell, nativeTheme, clipboard } from "electron";
import { is } from "@electron-toolkit/utils";
import type { App, Context } from "../app";
import {
  getAppearanceResponseSchema,
  saveAppearanceSchema,
  saveAppearanceResponseSchema,
  getSettingsResponseSchema,
  saveSettingsSchema,
  saveSettingsResponseSchema,
  uploadFileSchema,
  listFilesSchema,
  deleteFileSchema,
} from "../../ipc/schema/main";
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

  app.handleWithSchema(
    "main:save-settings",
    saveSettingsSchema,
    (context, _event, params) => {
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
    },
  );

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

  app.handleWithSchema(
    "main:save-appearance",
    saveAppearanceSchema,
    (context, _event, params) => {
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
    },
  );

  app.handleWithSchema(
    "main:upload-file",
    uploadFileSchema,
    async (context, _event, params) => {
      try {
        const result = await context.container.storageService.upload({
          connection: params.connection,
          processingOptions: params.imageProcessing,
          name: params.name,
          input: params.arrayBuffer,
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
    },
  );

  app.handleWithSchema(
    "main:list-files",
    listFilesSchema,
    async (context, _event, params) => {
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
    },
  );

  app.handleWithSchema(
    "main:delete-file",
    deleteFileSchema,
    async (context, _event, params) => {
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
    },
  );
}
