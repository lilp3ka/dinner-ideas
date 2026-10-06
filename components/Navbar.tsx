"use client";

import { useLanguage } from "@/lib/LanguageContext";
import { useTheme } from "@/lib/ThemeContext";
import { languages } from "@/lib/translations";

interface NavbarProps {
  favoritesCount: number;
  showFavorites: boolean;
  onToggleFavorites: () => void;
}

export default function Navbar({ favoritesCount, showFavorites, onToggleFavorites }: NavbarProps) {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="border-b border-line bg-paper-card">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <span className="font-display text-lg font-semibold text-ink">
          🍳 {t("title")}
        </span>

        <div className="flex items-center gap-3">
          {favoritesCount > 0 && (
            <button
              onClick={onToggleFavorites}
              className="text-sm text-ink-soft hover:text-ink flex items-center gap-1.5"
            >
              {showFavorites ? "✕" : "❤️"} {t("favoritesButton")} ({favoritesCount})
            </button>
          )}

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as typeof language)}
            className="text-sm bg-paper border border-line rounded-md px-2 py-1 text-ink cursor-pointer"
            aria-label="Language"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>

          <button
            onClick={toggleTheme}
            aria-label={theme === "light" ? "Включить тёмную тему" : "Включить светлую тему"}
            className="text-lg leading-none hover:scale-110 transition-transform"
          >
            {theme === "light" ? "🌑" : "☀️"}
          </button>
        </div>
      </div>
    </nav>
  );
}
