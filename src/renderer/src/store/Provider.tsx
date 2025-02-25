import { useEffect, useState, useCallback } from "react";
import type {
  GetAppearanceResponseSchema,
  GetSettingsResponseSchema,
} from "../../../ipc/schema/main";
import { StoreContext } from ".";
import { useStorage } from "../hooks/storage";
import { toaster } from "../components/ui/toaster";

import { IconButton } from "../components/ui/icon-button";
import { Toast } from "../components/ui/toast";
import { X } from "lucide-react";

type Props = {
  initialValues?: {
    isDarkMode?: boolean;
  };
  children: React.ReactNode;
};

export function StoreProvider({ initialValues, children }: Props) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    initialValues?.isDarkMode !== undefined ? initialValues.isDarkMode : false,
  );

  const [appearance, setAppearance] = useState<GetAppearanceResponseSchema>({
    theme: "system",
  });
  const [settings, setSettings] = useState<GetSettingsResponseSchema>({
    connection: {},
    imageProcessing: {
      maxWidth: 1440,
      maxHeight: 2880,
      quality: 80,
      webp: false,
    },
  });

  const onUploaded = useCallback(() => {
    toaster.create({
      title: "Success",
      description: "Your files has been uploaded",
      type: "info",
    });
  }, []);
  const onUploadError = useCallback(() => {
    toaster.create({
      title: "Error",
      description: "Failed to upload your files",
      type: "error",
    });
  }, []);
  const onFetchError = useCallback(() => {
    toaster.create({
      title: "Error",
      description: "Failed to fetch files",
      type: "error",
    });
  }, []);
  const onDeleted = useCallback((key: string) => {
    toaster.create({
      title: "Success",
      description: `${key} has been deleted`,
      type: "error",
    });
  }, []);
  const onDeleteError = useCallback((key: string) => {
    toaster.create({
      title: "Error",
      description: `Failed to delete ${key}`,
      type: "error",
    });
  }, []);
  const storage = useStorage({
    ...settings,
    onUploaded,
    onUploadError,
    onFetchError,
    onDeleted,
    onDeleteError,
  });

  useEffect(() => {
    (async () => {
      const settings = await window.main.getSettings();
      if (settings.ok) {
        setSettings(settings.value);
      } else {
        toaster.create({
          title: "Error",
          description: "Settings not found.",
          type: "error",
        });
      }
    })();

    (async () => {
      const appearance = await window.main.getAppearance();
      if (appearance.ok) {
        setAppearance(appearance.value);
      } else {
        toaster.create({
          title: "Error",
          description: "Appearance settings not found.",
          type: "error",
        });
      }
    })();
  }, []);

  return (
    <StoreContext.Provider
      value={{
        isDarkMode: {
          value: isDarkMode,
          setValue: setIsDarkMode,
        },
        appearance: {
          value: appearance,
          setValue: setAppearance,
        },
        settings: {
          value: settings,
          setValue: setSettings,
        },
        storage,
      }}
    >
      {children}

      <Toast.Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root key={toast.id}>
            <Toast.Title>{toast.title}</Toast.Title>
            <Toast.Description>{toast.description}</Toast.Description>
            <Toast.CloseTrigger asChild>
              <IconButton size="sm" variant="link">
                <X />
              </IconButton>
            </Toast.CloseTrigger>
          </Toast.Root>
        )}
      </Toast.Toaster>
    </StoreContext.Provider>
  );
}
