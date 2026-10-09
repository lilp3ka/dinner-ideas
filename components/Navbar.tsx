"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname, Link } from "@/i18n/navigation";
import { routing, localeLabels } from "@/i18n/routing";
import { useTheme } from "@/lib/ThemeContext";

interface NavbarProps {
  favoritesCount: number;
}

export default function Navbar({ favoritesCount }: NavbarProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  function handleLanguageChange(newLocale: string) {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <nav className="border-b border-line bg-paper-card">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="font-display text-lg font-semibold text-ink">
          🍳 {t("title")}
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/favorites"
            className="text-sm text-ink-soft hover:text-ink flex items-center gap-1.5"
          >
            ❤️ {t("favoritesButton")}
            {favoritesCount > 0 && ` (${favoritesCount})`}
          </Link>

          <Link
            href="/shopping-list"
            className="text-sm text-ink-soft hover:text-ink flex items-center gap-1.5"
          >
            🛒 {t("shoppingListTitle")}
          </Link>

          <Link
            href="/history"
            className="text-sm text-ink-soft hover:text-ink flex items-center gap-1.5"
          >
            🕒 {t("historyTitle")}
          </Link>

          <select
            value={locale}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="text-sm bg-paper border border-line rounded-md px-2 py-1 text-ink cursor-pointer"
            aria-label="Language"
          >
            {routing.locales.map((code) => (
              <option key={code} value={code}>
                {localeLabels[code]}
              </option>
            ))}
          </select>

          <button
            onClick={toggleTheme}
            aria-label={theme === "light" ? "Dark mode" : "Light mode"}
            className="text-lg leading-none hover:scale-110 transition-transform"
          >
            {theme === "light" ? "🌑" : "☀️"}
          </button>
        </div>
      </div>
    </nav>
  );
}
