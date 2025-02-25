import { useEffect } from "react";
import { format } from "date-fns";
import {
  type ConnectionStore,
  type ImageProcessingStore,
  type ListedFile,
  uploadFileSchema,
  listFilesSchema,
  deleteFileSchema,
} from "../../../ipc/schema/main";

import { useState, useCallback } from "react";
import { generateId } from "../../../lib/id";

export type Status = "uploading" | "uploaded" | "failed";

export type FileInfo = {
  id: string;
  name: string;
  status: Status;
};

type UseStorageParams = {
  connection: ConnectionStore;
  imageProcessing: ImageProcessingStore;
  defaultDateString?: string;
  onUploaded?: (id: string) => void;
  onUploadError?: () => void;
  onFetched?: () => void;
  onFetchError?: () => void;
  onDeleted?: (key: string) => void;
  onDeleteError?: (key: string) => void;
  onSettingsError?: () => void;
};

export function useStorage({
  connection,
  imageProcessing,
  defaultDateString,
  onUploaded,
  onUploadError,
  onFetched,
  onFetchError,
  onDeleted,
  onDeleteError,
  onSettingsError,
}: UseStorageParams) {
  const [dateString, setDateString] = useState(
    defaultDateString ?? format(new Date(), "yyyy-MM-dd"),
  );
  const [files, setFiles] = useState<ListedFile[]>([]);
  const [queue, setQueue] = useState<FileInfo[]>([]);

  const upload = useCallback(
    async (file: File) => {
      const name = file.name.split(".").slice(0, -1).join(".");
      const params = uploadFileSchema.safeParse({
        connection,
        imageProcessing,
        name,
        arrayBuffer: await file.arrayBuffer(),
      });
      if (!params.success) {
        onUploadError?.();
        return;
      }

      const id = generateId();
      setQueue((prev) => [...prev, { id, name, status: "uploading" }]);

      const result = await window.main.uploadFile(params.data);
      if (result.ok) {
        onUploaded?.(id);
        fetch(connection, dateString);
        setQueue((prev) =>
          prev.map((item) => {
            if (item.id === id) {
              return { ...item, status: "uploaded" };
            }
            return item;
          }),
        );
      } else {
        onUploadError?.();
        setQueue((prev) =>
          prev.map((item) => {
            if (item.id === id) {
              return { ...item, status: "failed" };
            }
            return item;
          }),
        );
      }
    },
    [connection, imageProcessing, dateString, onUploaded, onUploadError],
  );

  const complete = useCallback((id: string) => {
    setQueue((prev) =>
      prev.filter((item) => {
        return item.id !== id;
      }),
    );
  }, []);

  const deleteByKey = useCallback(
    async (key: string) => {
      const params = deleteFileSchema.safeParse({
        connection,
        key,
      });
      if (params.success) {
        (async () => {
          const result = await window.main.deleteFile(params.data);

          if (result.ok) {
            fetch(connection, dateString);
            onDeleted?.(key);
          } else {
            onDeleteError?.(key);
          }
        })();
      } else {
        onSettingsError?.();
      }
    },
    [connection, dateString, onDeleted, onDeleteError, onSettingsError],
  );

  const fetch = useCallback(
    (connection: ConnectionStore, dateString: string) => {
      const params = listFilesSchema.safeParse({
        connection,
        dateString,
      });
      if (params.success) {
        (async () => {
          const result = await window.main.listFiles(params.data);

          if (result.ok) {
            setFiles(
              result.value.files.sort((a, b) => {
                return a.lastModified < b.lastModified ? 1 : -1;
              }),
            );
            onFetched?.();
          } else {
            onFetchError?.();
          }
        })();
      } else {
        onSettingsError?.();
      }
    },
    [onFetched, onFetchError, onSettingsError],
  );

  useEffect(() => {
    fetch(connection, dateString);
  }, [fetch, connection, dateString]);

  return {
    queue,
    upload,
    complete,
    files,
    dateString,
    setDateString,
    deleteByKey,
  };
}
