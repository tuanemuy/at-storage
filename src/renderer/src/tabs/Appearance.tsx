import { useEffect } from "react";
import type { SubmitHandler } from "react-hook-form";
import {
  type SaveAppearanceSchema,
  saveAppearanceSchema,
} from "../../../preload/schema/main";
import { toaster } from "../components/ui/toaster";
import { useZodForm } from "../hooks/zod-form";
import { useStore } from "../store";

import { Controller } from "react-hook-form";
import { Stack, HStack } from "styled-system/jsx";
import { Button } from "../components/ui/button";
import { Field } from "../components/ui/field";
import { Select, createListCollection } from "../components/ui/select";
import { isTheme } from "../../../lib/theme";
import { ChevronsUpDown, Check } from "lucide-react";

export function Appearance() {
  const { isDarkMode, appearance } = useStore();

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useZodForm({
    schema: saveAppearanceSchema,
    defaultValues: {
      ...appearance.value,
    },
  });

  useEffect(() => {
    reset(appearance.value);
  }, [reset, appearance.value]);

  const onSubmit: SubmitHandler<SaveAppearanceSchema> = async (inputs) => {
    const result = await window.main.saveAppearance(inputs);
    if (result.ok) {
      isDarkMode.setValue(result.value.isDarkMode);
      appearance.setValue(result.value.data);

      toaster.create({
        title: "Success",
        description: "Your settings have been updated",
        type: "info",
      });
    } else {
      toaster.create({
        title: "Error",
        description: "Failed to save your settings",
        type: "error",
      });
    }
  };

  const onInvalid = () => {
    toaster.create({
      title: "Erorr",
      description: "Plerase enter valid values",
      type: "error",
    });
  };

  const themes = createListCollection({
    items: [
      { label: "System", value: "system" },
      { label: "Light", value: "light" },
      { label: "Dark", value: "dark" },
    ],
  });

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
      <Stack gap="3">
        <Field.Root invalid={!!errors.theme}>
          <Controller
            name="theme"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Select.Root
                positioning={{ sameWidth: true }}
                collection={themes}
                value={[field.value]}
                onValueChange={(details) =>
                  isTheme(details.value[0])
                    ? field.onChange(details.value[0])
                    : field.onChange("system")
                }
                onFocusOutside={() => field.onBlur()}
              >
                <Select.Label>Theme</Select.Label>
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="Select a Theme" />
                    <ChevronsUpDown />
                  </Select.Trigger>
                </Select.Control>
                <Select.Positioner>
                  <Select.Content>
                    {themes.items.map((item) => (
                      <Select.Item key={item.value} item={item}>
                        <Select.ItemText>{item.label}</Select.ItemText>
                        <Select.ItemIndicator>
                          <Check />
                        </Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Select.Root>
            )}
          />
          <Field.ErrorText>Please enter a valid value</Field.ErrorText>
        </Field.Root>
      </Stack>

      <HStack gap="4" mt="6">
        <Button type="submit">Save</Button>
        <Button
          type="button"
          onClick={() => reset(appearance.value)}
          variant="subtle"
        >
          Reset
        </Button>
      </HStack>
    </form>
  );
}
