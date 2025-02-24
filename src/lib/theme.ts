export type Theme = "system" | "light" | "dark";

export const themes = ["system", "light", "dark"] as const;

export function isTheme(value: string): value is Theme {
  return ["system", "light", "dark"].includes(value);
}
