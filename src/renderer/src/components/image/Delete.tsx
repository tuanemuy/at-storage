import { useStore } from "../../store";

import { Stack } from "../../../styled-system/jsx";
import { Dialog } from "../ui/dialog";
import { Button } from "../ui/button";
import { IconButton } from "../ui/icon-button";
import { Trash2, X } from "lucide-react";

type Props = {
  storageKey: string;
};

export function Delete({ storageKey }: Props) {
  const { storage } = useStore();

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <IconButton variant="outline" size="xs">
          <Trash2 />
        </IconButton>
      </Dialog.Trigger>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Stack gap="8" p="6">
            <Stack gap="1">
              <Dialog.Title>Delete</Dialog.Title>
              <Dialog.Description>
                Are you sure you want to delete this image?
                <br />
                Key: {storageKey}
              </Dialog.Description>
            </Stack>
            <Stack gap="3" direction="row" width="full">
              <Dialog.CloseTrigger asChild>
                <Button variant="outline" width="full" flexShrink="1">
                  Cancel
                </Button>
              </Dialog.CloseTrigger>
              <Button
                onClick={() => storage.deleteByKey(storageKey)}
                width="full"
                flexShrink="1"
              >
                Confirm
              </Button>
            </Stack>
          </Stack>
          <Dialog.CloseTrigger asChild position="absolute" top="2" right="2">
            <IconButton aria-label="Close Dialog" variant="ghost" size="sm">
              <X />
            </IconButton>
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
