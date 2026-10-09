"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import IdeaCard from "@/components/IdeaCard";
import Navbar from "@/components/Navbar";
import { getHistory, removeHistoryEntry, clearHistory, type HistoryEntry } from "@/lib/history";
import { getFavorites, addFavorite, removeFavorite, getDishId, type FavoriteDish } from "@/lib/favorites";
import type { Dish } from "@/lib/prompt";

export default function HistoryPage() {
  const t = useTranslations();
  const locale = useLocale();

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [favorites, setFavorites] = useState<FavoriteDish[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHistory(getHistory());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFavorites(getFavorites());
  }, []);

  function handleRemoveEntry(id: string) {
    setHistory(removeHistoryEntry(id));
  }

  function handleClearAll() {
    setHistory(clearHistory());
  }

  function handleToggleFavorite(dish: Dish) {
    const id = getDishId(dish);
    const isAlreadyFavorite = favorites.some((f) => f.id === id);

    const updated = isAlreadyFavorite ? removeFavorite(id) : addFavorite(dish, locale);
    setFavorites(updated);
  }

  function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString(locale, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <>
      <Navbar favoritesCount={favorites.length} />

      <main className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          <header className="flex items-center justify-between">
            <h1 className="font-display text-4xl font-semibold text-ink">
              {t("historyTitle")}
            </h1>
            {history.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-sm text-paprika hover:text-paprika/80"
              >
                {t("historyClearAll")}
              </button>
            )}
          </header>

          {history.length === 0 && (
            <div className="text-center py-12 text-ink-soft/60">
              <div className="text-5xl mb-7">🕒</div>
              <p className="text-sm">{t("historyEmpty")}</p>
            </div>
          )}

          {history.map((entry) => (
            <section key={entry.id} className="border-t border-line pt-6 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-ink-soft">
                  <span className="font-medium text-ink">{formatDate(entry.createdAt)}</span>
                  {entry.params.ingredients.length > 0 && (
                    <span> · {t("historyRestoreParams")}: {entry.params.ingredients.join(", ")}</span>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveEntry(entry.id)}
                  className="text-ink-soft/50 hover:text-paprika text-sm flex-shrink-0"
                  aria-label={formatDate(entry.createdAt)}
                >
                  ×
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {entry.dishes.map((dish, i) => (
                  <IdeaCard
                    key={i}
                    dish={dish}
                    isFavorite={favorites.some((f) => f.id === getDishId(dish))}
                    onToggleFavorite={() => handleToggleFavorite(dish)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
