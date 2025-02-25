import { useEffect } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useZodForm } from "../hooks/zod-form";
import {
  type SaveSettingsSchema,
  saveSettingsSchema,
} from "../../../ipc/schema/main";
import { toaster } from "../components/ui/toaster";
import { useStore } from "../store";

import { Controller } from "react-hook-form";
import { Stack, HStack, styled } from "styled-system/jsx";
import { Button } from "../components/ui/button";
import { Field } from "../components/ui/field";
import { NumberInput } from "../components/ui/number-input";
import { Switch } from "../components/ui/switch";

export function Settings() {
  const { settings } = useStore();

  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useZodForm({
    schema: saveSettingsSchema,
    defaultValues: {
      ...settings.value,
    },
  });

  useEffect(() => {
    reset(settings.value);
  }, [reset, settings.value]);

  const onSubmit: SubmitHandler<SaveSettingsSchema> = async (inputs) => {
    const result = await window.main.saveSettings(inputs);
    if (result.ok) {
      settings.setValue(result.value.data);
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

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
      <Stack gap="2">
        <styled.h2 fontWeight="bold" fontSize="1.1rem">
          Connection
        </styled.h2>

        <Stack gap="3">
          <Field.Root invalid={!!errors.connection?.region}>
            <Field.Label>Region</Field.Label>
            <Field.Input type="text" {...register("connection.region")} />
            <Field.ErrorText>Please enter a valid value</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.connection?.bucketName}>
            <Field.Label>Bucket Name</Field.Label>
            <Field.Input type="text" {...register("connection.bucketName")} />
            <Field.ErrorText>Please enter a valid value</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.connection?.basePath}>
            <Field.Label>Path to Upload</Field.Label>
            <Field.Input type="text" {...register("connection.basePath")} />
            <Field.ErrorText>Please enter a valid value</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.connection?.accessKey}>
            <Field.Label>Access Key</Field.Label>
            <Field.Input
              type="password"
              {...register("connection.accessKey")}
            />
            <Field.ErrorText>Please enter a valid value</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.connection?.secretKey}>
            <Field.Label>Secret Key</Field.Label>
            <Field.Input
              type="password"
              {...register("connection.secretKey")}
            />
            <Field.ErrorText>Please enter a valid value</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.connection?.endpoint}>
            <Field.Label>Custom Endpoint</Field.Label>
            <Field.Input type="text" {...register("connection.endpoint")} />
            <Field.HelperText>
              Leave empty to use the default endpoint (Amazon S3)
            </Field.HelperText>
            <Field.ErrorText>Please enter a valid value</Field.ErrorText>
          </Field.Root>
        </Stack>
      </Stack>

      <Stack gap="2" mt="4">
        <styled.h2 fontWeight="bold" fontSize="1.1rem">
          Image Processing
        </styled.h2>

        <Stack gap="3">
          <Field.Root invalid={!!errors.imageProcessing?.maxWidth}>
            <Field.Label>Max Width</Field.Label>
            <Controller
              name="imageProcessing.maxWidth"
              control={control}
              rules={{ required: true, min: 1, max: 9999 }}
              render={({ field }) => (
                <NumberInput
                  min={1}
                  max={9999}
                  allowMouseWheel={false}
                  value={field.value.toString()}
                  onValueChange={(details) => {
                    const num = Number.parseInt(details.value, 10);
                    field.onChange(num || 0);
                  }}
                  onFocusChange={(details) =>
                    !details.focused && field.onBlur()
                  }
                />
              )}
            />
            <Field.ErrorText>Please enter a valid value</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.imageProcessing?.maxHeight}>
            <Field.Label>Max Height</Field.Label>
            <Controller
              name="imageProcessing.maxHeight"
              control={control}
              rules={{ required: true, min: 1, max: 9999 }}
              render={({ field }) => (
                <NumberInput
                  min={1}
                  max={9999}
                  allowMouseWheel={false}
                  value={field.value.toString()}
                  onValueChange={(details) => {
                    const num = Number.parseInt(details.value, 10);
                    field.onChange(num || 0);
                  }}
                  onFocusChange={(details) =>
                    !details.focused && field.onBlur()
                  }
                />
              )}
            />
            <Field.ErrorText>Please enter a valid value</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.imageProcessing?.quality}>
            <Field.Label>Quality</Field.Label>
            <Controller
              name="imageProcessing.quality"
              control={control}
              rules={{ required: true, min: 1, max: 100 }}
              render={({ field }) => (
                <NumberInput
                  min={1}
                  max={100}
                  allowMouseWheel={false}
                  value={field.value.toString()}
                  onValueChange={(details) => {
                    const num = Number.parseInt(details.value, 10);
                    field.onChange(num || 0);
                  }}
                  onFocusChange={(details) =>
                    !details.focused && field.onBlur()
                  }
                />
              )}
            />
            <Field.ErrorText>Please enter a valid value</Field.ErrorText>
          </Field.Root>

          <Field.Root>
            <Controller
              name="imageProcessing.webp"
              control={control}
              render={({ field }) => (
                <Switch
                  value={field.value ? "on" : "off"}
                  checked={field.value}
                  onCheckedChange={(details) => field.onChange(details.checked)}
                >
                  <styled.span fontSize="0.875rem">
                    Upload with WebP
                  </styled.span>
                </Switch>
              )}
            />
          </Field.Root>
        </Stack>
      </Stack>

      <HStack gap="4" mt="6">
        <Button type="submit">Save</Button>
        <Button
          type="button"
          onClick={() => reset(settings.value)}
          variant="subtle"
        >
          Reset
        </Button>
      </HStack>
    </form>
  );
}
