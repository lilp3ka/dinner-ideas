"use client";

import { useTranslations } from "next-intl";
import type { Dish } from "@/lib/prompt";

interface IdeaCardProps {
  dish: Dish;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export default function IdeaCard({ dish, isFavorite, onToggleFavorite }: IdeaCardProps) {
  const t = useTranslations();

  const meta = [
    `${dish.cookTimeMinutes} ${t("minutesShort")}`,
    `${dish.servings} ${dish.servings === 1 ? t("servingWord") : t("servingsWord")}`,
    dish.cuisine,
  ];
  if (dish.calories !== null) {
    meta.push(`${dish.calories} ${t("caloriesShort")}`);
  }

  return (
    <div className="bg-paper-card rounded-xl border border-line overflow-hidden flex flex-col">
      <div className="h-1.5 bg-paprika" />

      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-2xl font-semibold text-ink leading-tight">
              {dish.title}
            </h3>
            <p className="text-ink-soft text-sm mt-1.5">{dish.description}</p>
          </div>

          <button
            type="button"
            onClick={onToggleFavorite}
            aria-label={isFavorite ? t("removeFavoriteLabel") : t("addFavoriteLabel")}
            className="flex-shrink-0 text-xl leading-none mt-1 transition-transform hover:scale-110"
          >
            {isFavorite ? "❤️" : "🤍"}
          </button>
        </div>

        <p className="text-xs text-ink-soft tracking-wide">
          {meta.join(" · ")}
        </p>

        <div className="border-t border-line pt-4">
          <h4 className="font-medium text-ink text-sm mb-2">{t("ingredientsSectionTitle")}</h4>
          <p className="text-sm text-ink-soft leading-relaxed">
            {dish.ingredients.join(", ")}
          </p>
        </div>

        <div className="border-t border-line pt-4">
          <h4 className="font-medium text-ink text-sm mb-2">{t("stepsSectionTitle")}</h4>
          <ol className="space-y-2.5">
            {dish.steps.map((step, i) => (
              <li key={i} className="text-sm text-ink-soft flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-herb/10 text-herb text-xs font-medium flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
