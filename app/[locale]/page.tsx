"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import IdeaForm from "@/components/IdeaForm";
import IdeaCard from "@/components/IdeaCard";
import Navbar from "@/components/Navbar";
import type { Dish, IdeaRequestParams } from "@/lib/prompt";
import { getFavorites, addFavorite, removeFavorite, getDishId, type FavoriteDish } from "@/lib/favorites";

export default function Home() {
  const t = useTranslations();
  const locale = useLocale();

  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastParams, setLastParams] = useState<IdeaRequestParams | null>(null);
  const [favorites, setFavorites] = useState<FavoriteDish[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFavorites(getFavorites());
  }, []);

  async function fetchIdeas(params: IdeaRequestParams) {
    setIsLoading(true);
    setError(null);
    setDishes([]);
    setLastParams(params);

    try {
      const response = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...params, language: locale }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }

      setDishes(data.dishes);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(params: IdeaRequestParams) {
    fetchIdeas(params);
  }

  function handleRegenerate() {
    if (lastParams) {
      fetchIdeas(lastParams);
    }
  }

  function handleToggleFavorite(dish: Dish) {
    const id = getDishId(dish);
    const isAlreadyFavorite = favorites.some((f) => f.id === id);

    const updated = isAlreadyFavorite ? removeFavorite(id) : addFavorite(dish);
    setFavorites(updated);
  }

  return (
    <>
      <Navbar
        favoritesCount={favorites.length}
        showFavorites={showFavorites}
        onToggleFavorites={() => setShowFavorites((prev) => !prev)}
      />

      <main className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          <header className="text-center">
            <p className="text-xl text-ink-soft tracking-wide mb-4">{t("tagline")}</p>
            <h1 className="font-display text-5xl font-semibold text-ink">{t("title")}</h1>
            <p className="text-ink-soft mt-3 max-w-md mx-auto">{t("subtitle")}</p>
          </header>

          <IdeaForm onSubmit={handleSubmit} isLoading={isLoading} />

          {error && (
            <div className="bg-paprika/10 border border-paprika/30 text-paprika rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="text-center text-ink-soft py-8">{t("loadingText")}</div>
          )}

          {dishes.length > 0 && (
            <div className="flex flex-col gap-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dishes.map((dish, i) => (
                  <IdeaCard
                    key={i}
                    dish={dish}
                    isFavorite={favorites.some((f) => f.id === getDishId(dish))}
                    onToggleFavorite={() => handleToggleFavorite(dish)}
                  />
                ))}
              </div>

              <button
                onClick={handleRegenerate}
                disabled={isLoading}
                className="self-center text-sm text-ink-soft hover:text-ink border border-line rounded-full px-5 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t("submitLoading") : `🔄 ${t("regenerateButton")}`}
              </button>
            </div>
          )}

          {!isLoading && dishes.length === 0 && !error && (
            <div className="text-center py-12 text-ink-soft/60">
              <div className="text-5xl mb-7">🥘</div>
              <p className="text-sm">{t("emptyStateText")}</p>
            </div>
          )}

          {showFavorites && favorites.length > 0 && (
            <section className="border-t border-line pt-8">
              <h2 className="font-display text-2xl font-semibold text-ink mb-5">
                {t("favoritesButton")}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((dish) => (
                  <IdeaCard
                    key={dish.id}
                    dish={dish}
                    isFavorite={true}
                    onToggleFavorite={() => handleToggleFavorite(dish)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
