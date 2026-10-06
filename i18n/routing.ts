import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ru", "uk", "en", "zh", "ja"],
  defaultLocale: "ru",
});
