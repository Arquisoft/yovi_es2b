import { es } from "./es";
import { en } from "./en";

export type SupportedLocale = "es" | "en";

export const translations: Record<SupportedLocale, Record<string, any>> = {
  es,
  en,
};
