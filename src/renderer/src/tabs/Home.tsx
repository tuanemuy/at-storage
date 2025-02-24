import { format } from "date-fns";
import { bytes } from "../../../lib/format";
import { useStore } from "../store";
import { toaster } from "../components/ui/toaster";

import { Box, HStack, styled } from "../../styled-system/jsx";
import { IconButton } from "../components/ui/icon-button";
import { DateInput } from "../components/input/DateInput";
import { Delete } from "../components/image/Delete";
import { Copy } from "lucide-react";

export function Home() {
  const { storage } = useStore();

  return (
    <Box w="100%" py="2">
      <DateInput
        value={storage.dateString}
        onChange={(value) =>
          storage.setDateString(value || format(new Date(), "yyyy-MM-dd"))
        }
      />

      <styled.ul
        position="relative"
        display="grid"
        gridTemplateColumns={{ base: "1fr", lg: "repeat(2, minmax(0, 1fr))" }}
        gap={{ base: "3", lg: "6" }}
        w="100%"
        mt={{ base: "4", lg: "6" }}
      >
        {storage.files.map((image) => (
          <styled.li key={image.key}>
            <Box display="flex" alignItems="start">
              <Box
                flexShrink="0"
                width="128px"
                border="1px solid"
                borderColor="border.muted"
                borderRadius="md"
                bg="bg.muted"
                overflow="hidden"
              >
                <styled.img
                  src={image.url}
                  alt={image.key}
                  loading="lazy"
                  w="100%"
                  h="auth"
                  aspectRatio="1/1"
                  objectFit="contain"
                  objectPosition="50% 50%"
                />
              </Box>
              <Box ml="4" py="2" lineHeight="1.5">
                <styled.p
                  fontWeight="bold"
                  fontSize="0.75rem"
                  wordBreak="break-all"
                >
                  {image.url}
                </styled.p>
                <Box mt="1" fontSize="0.75rem">
                  <styled.p>
                    Modified: {format(image.lastModified, "yyyy/MM/dd HH:mm")}
                  </styled.p>
                  <styled.p> Size: {bytes(image.size)}</styled.p>
                </Box>
                <HStack mt="2" gap="2">
                  <IconButton variant="outline" size="xs">
                    <Copy
                      onClick={async () => {
                        try {
                          await window.main.writeToClipboard(image.url);
                          toaster.create({
                            title: "Success",
                            description: "URL has been copied to clipboard",
                          });
                        } catch (e) {
                          toaster.create({
                            title: "Error",
                            description: "Failed to copy URL to clipboard",
                          });
                        }
                      }}
                    />
                  </IconButton>
                  <Delete storageKey={image.key} />
                </HStack>
              </Box>
            </Box>
          </styled.li>
        ))}
      </styled.ul>
    </Box>
  );
}
