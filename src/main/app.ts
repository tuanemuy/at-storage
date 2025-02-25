import {
  type IpcMainInvokeEvent,
  app,
  nativeTheme,
  nativeImage,
  ipcMain,
} from "electron";
import { electronApp, optimizer } from "@electron-toolkit/utils";
import type { ZodType } from "zod";
import { type IStoreService, StoreService } from "./service/store";
import { type IStorageService, StorageService } from "./service/storage";
import { appUserModeId, defaultImageProcessing } from "../lib/config";
import { themes } from "../lib/theme";
import { MainProcessError, MainProcessErrorCode } from "./error";

import icon from "../../resources/icon.png?asset";

const storeSchema = {
  window: {
    type: "object",
    properties: {
      size: {
        type: "object",
        properties: {
          width: {
            type: "number",
            minimum: 1,
          },
          height: {
            type: "number",
            minimum: 1,
          },
        },
      },
      position: {
        type: "object",
        properties: {
          x: {
            type: "number",
            minimum: 0,
          },
          y: {
            type: "number",
            minimum: 0,
          },
        },
      },
    },
  },
  settings: {
    type: "object",
    properties: {
      connection: {
        type: "object",
        properties: {
          region: {
            type: "string",
          },
          bucketName: {
            type: "string",
          },
          basePath: {
            type: "string",
          },
          accessKey: {
            type: "string",
          },
          secretKey: {
            type: "string",
          },
          endpoint: {
            type: "string",
          },
        },
      },
      imageProcessing: {
        type: "object",
        properties: {
          maxWidth: {
            type: "number",
            minimum: 1,
            maximum: 9999,
          },
          maxHeight: {
            type: "number",
            minimum: 1,
            maximum: 9999,
          },
          quality: {
            type: "number",
            minimum: 1,
            maximum: 100,
          },
          webp: {
            type: "boolean",
          },
        },
      },
    },
  },
  appearance: {
    type: "object",
    properties: {
      theme: {
        type: "string",
        enum: themes,
      },
    },
  },
};

export type Container = {
  storageService: IStorageService;
  storeService: IStoreService;
};

export type Context = {
  container: Container;
  state: {
    objects: string[];
  };
};

export type WindowEvent = "ready" | "activate";

type Callback = (
  context: Context,
  event: IpcMainInvokeEvent,
  // biome-ignore lint:
  ...args: any[]
  // biome-ignore lint:
) => Promise<any> | any;

type ValidatedCallback<T> = (
  context: Context,
  event: IpcMainInvokeEvent,
  params: T,
  // biome-ignore lint:
) => Promise<any> | any;

export type App = {
  on: {
    [key in WindowEvent]: (callback: (context: Context) => void) => void;
  };
  handle: (channel: string, callback: Callback) => void;
  handleWithSchema: <T>(
    channel: string,
    schema: ZodType<T>,
    callback: ValidatedCallback<T>,
  ) => void;
};

export function createApp(): App {
  const context = {
    container: {
      storageService: new StorageService(),
      storeService: new StoreService(storeSchema),
    },
    state: {
      objects: [],
    },
  };

  const settings = context.container.storeService.get("settings");
  const appearance = context.container.storeService.get("appearance");

  if (!settings) {
    context.container.storeService.set("settings", {
      connection: {},
      imageProcessing: defaultImageProcessing,
    });
  }

  if (!appearance) {
    context.container.storeService.set("appearance", {
      theme: "system",
    });
  }

  nativeTheme.themeSource = appearance?.theme || "system";

  if (process.platform === "darwin") {
    app.dock.setIcon(nativeImage.createFromPath(icon));
  }

  app.whenReady().then(() => {
    electronApp.setAppUserModelId(appUserModeId);

    app.on("browser-window-created", (_, window) => {
      optimizer.watchWindowShortcuts(window);
    });
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  const handle = (channel: string, callback: Callback) => {
    // biome-ignore lint:
    ipcMain.handle(channel, (event, ...args: any[]) =>
      callback(context, event, args),
    );
  };

  const handleWithSchema = <T>(
    channel: string,
    schema: ZodType<T>,
    callback: ValidatedCallback<T>,
  ) => {
    // biome-ignore lint:
    ipcMain.handle(channel, (event, ...args: any[]) => {
      try {
        const params: T = schema.parse(args[0] || {});
        return callback(context, event, params);
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
    });
  };

  return {
    on: {
      ready: (callback) => {
        app.on("ready", () => callback(context));
      },
      activate: (callback) => {
        app.on("activate", () => callback(context));
      },
    },
    handle,
    handleWithSchema,
  };
}
