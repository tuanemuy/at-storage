import { useEffect, useCallback } from "react";
import { useStore } from "../../store";

import { Stack } from "styled-system/jsx";
import { Button } from "../../components/ui/button";
import { Drawer } from "../../components/ui/drawer";
import { Spinner } from "../../components/ui/spinner";
import { Uploading } from "../../components/uploader/Uploading";

export function Uploader() {
  const { storage } = useStore();
  const _complete = useCallback(
    (id: string) => {
      storage.complete(id);
    },
    [storage.complete],
  );

  useEffect(() => {
    const onDragOver = (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };
    document.body.addEventListener("dragover", onDragOver);

    const onDrop = (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      for (const file of event.dataTransfer?.files || []) {
        storage.upload(file);
      }
    };
    document.body.addEventListener("drop", onDrop);

    return () => {
      document.body.removeEventListener("dragover", onDragOver);
      document.body.removeEventListener("drop", onDrop);
    };
  }, [storage.upload]);

  if (storage.queue.length > 0) {
    return (
      <Drawer.Root>
        <Drawer.Trigger asChild>
          <Button
            variant="outline"
            size="xs"
            position="fixed"
            right="6"
            bottom="6"
            boxShadow="2xl"
            borderRadius="full"
          >
            <Spinner size="sm" />
            Uploading...
          </Button>
        </Drawer.Trigger>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Body>
              <Stack gap="4">
                {storage.queue.map((item) => (
                  <Uploading
                    key={item.id}
                    file={item}
                    duration={60000}
                    complete={_complete}
                  />
                ))}
              </Stack>
            </Drawer.Body>
            <Drawer.Footer gap="3">
              <Drawer.CloseTrigger asChild>
                <Button variant="outline">Close</Button>
              </Drawer.CloseTrigger>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
    );
  }

  return null;
}
