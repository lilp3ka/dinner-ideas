import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ru", "uk", "en", "zh", "ja"],
  defaultLocale: "ru",
});

export const localeLabels: Record<string, string> = {
  ru: "Русский",
  uk: "Українська",
  en: "English",
  zh: "中文",
  ja: "日本語",
};
