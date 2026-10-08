"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import IdeaCard from "@/components/IdeaCard";
import Navbar from "@/components/Navbar";
import {
  getFavorites,
  removeFavorite,
  type FavoriteDish,
} from "@/lib/favorites";
import type { Dish } from "@/lib/prompt";

function getCacheKey(dishId: string, language: string): string {
  return `dinner-ideas:translation:${dishId}:${language}`;
}

export default function FavoritesPage() {
  const t = useTranslations();
  const locale = useLocale();

  const [favorites, setFavorites] = useState<FavoriteDish[]>([]);
  const [translations, setTranslations] = useState<Record<string, Dish>>({});
  const [translatingKeys, setTranslatingKeys] = useState<string[]>([]);
  const requestedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFavorites(getFavorites());
  }, []);

  useEffect(() => {
    favorites.forEach((dish) => {
      if (dish.language === locale) return;

      const cacheKey = getCacheKey(dish.id, locale);
      if (requestedRef.current.has(cacheKey)) return;

      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        requestedRef.current.add(cacheKey);
        setTranslations((prev) => ({
          ...prev,
          [cacheKey]: JSON.parse(cached),
        }));
        return;
      }

      requestedRef.current.add(cacheKey);
      setTranslatingKeys((prev) => [...prev, cacheKey]);

      fetch("/api/translate-dish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dish, targetLanguage: locale }),
      })
        .then((res) => res.json())
        .then((translated: Dish & { error?: string }) => {
          if (!translated.error) {
            setTranslations((prev) => ({ ...prev, [cacheKey]: translated }));
            sessionStorage.setItem(cacheKey, JSON.stringify(translated));
          }
        })
        .finally(() => {
          setTranslatingKeys((prev) => prev.filter((key) => key !== cacheKey));
        });
    });
  }, [favorites, locale]);

  function handleRemove(id: string) {
    const updated = removeFavorite(id);
    setFavorites(updated);
  }

  function getDisplayDish(dish: FavoriteDish): Dish {
    if (dish.language === locale) return dish;
    const cacheKey = getCacheKey(dish.id, locale);
    return translations[cacheKey] ?? dish;
  }

  function isTranslating(dish: FavoriteDish): boolean {
    return translatingKeys.includes(getCacheKey(dish.id, locale));
  }

  return (
    <>
      <Navbar favoritesCount={favorites.length} />

      <main className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          <header className="text-center">
            <h1 className="font-display text-4xl font-semibold text-ink">
              {t("favoritesButton")}
            </h1>
          </header>

          {favorites.length === 0 && (
            <div className="text-center py-12 text-ink-soft/60">
              <div className="text-5xl mb-7">🤍</div>
              <p className="text-sm">{t("emptyStateText")}</p>
            </div>
          )}

          {favorites.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((dish) => (
                <div key={dish.id} className="relative">
                  {isTranslating(dish) && (
                    <div className="absolute top-3 right-3 z-10 bg-ink text-paper text-xs px-2 py-1 rounded-full">
                      ⏳
                    </div>
                  )}
                  <IdeaCard
                    dish={getDisplayDish(dish)}
                    isFavorite={true}
                    onToggleFavorite={() => handleRemove(dish.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
