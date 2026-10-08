"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import type { IdeaRequestParams } from "@/lib/prompt";

interface IdeaFormProps {
  onSubmit: (params: IdeaRequestParams) => void;
  isLoading: boolean;
}

type Category = "ingredient" | "cuisine" | "diet";

function useTagInput(
  category: Category,
  invalidMessage: string,
  initial: string[] = [],
) {
  const [tags, setTags] = useState<string[]>(initial);
  const [inputValue, setInputValue] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addTag() {
    const trimmed = inputValue.trim();
    if (!trimmed || tags.includes(trimmed)) {
      setInputValue("");
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const response = await fetch("/api/validate-term", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term: trimmed, category }),
      });
      const data = await response.json();

      if (data.valid) {
        setTags((prev) => [...prev, trimmed]);
        setInputValue("");
      } else {
        setError(invalidMessage);
      }
    } catch {
      // При сбое сети не блокируем пользователя — добавляем как есть.
      setTags((prev) => [...prev, trimmed]);
      setInputValue("");
    } finally {
      setIsValidating(false);
    }
  }

  function removeTag(target: string) {
    setTags((prev) => prev.filter((item) => item !== target));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  }

  function handleInputChange(value: string) {
    setInputValue(value);
    if (error) setError(null);
  }

  return {
    tags,
    inputValue,
    setInputValue: handleInputChange,
    addTag,
    removeTag,
    handleKeyDown,
    isValidating,
    error,
  };
}

export default function IdeaForm({ onSubmit, isLoading }: IdeaFormProps) {
  const t = useTranslations();

  const ingredients = useTagInput("ingredient", t("invalidTermError"));
  const cuisine = useTagInput("cuisine", t("invalidTermError"));
  const diet = useTagInput("diet", t("invalidTermError"));
  const [maxCookTime, setMaxCookTime] = useState(60);
  const [servings, setServings] = useState(2);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (ingredients.tags.length === 0) return;

    onSubmit({
      ingredients: ingredients.tags,
      cuisine: cuisine.tags.length > 0 ? cuisine.tags : undefined,
      diet: diet.tags.length > 0 ? diet.tags : undefined,
      maxCookTime,
      servings,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-paper-card rounded-2xl shadow-sm p-6 flex flex-col gap-5 border border-line"
    >
      <div>
        <label className="block text-sm font-medium text-ink mb-2">
          {t("ingredientsLabel")}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={ingredients.inputValue}
            onChange={(e) => ingredients.setInputValue(e.target.value)}
            onKeyDown={ingredients.handleKeyDown}
            placeholder={t("ingredientsPlaceholder")}
            disabled={ingredients.isValidating}
            className="flex-1 border border-line bg-paper rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-saffron disabled:opacity-60"
          />
          <button
            type="button"
            onClick={ingredients.addTag}
            disabled={ingredients.isValidating}
            className="bg-ink text-paper px-4 py-2 rounded-lg text-sm hover:bg-ink/90 transition-colors disabled:opacity-60"
          >
            {ingredients.isValidating ? "⏳" : t("addButton")}
          </button>
        </div>
        {ingredients.error && (
          <p className="text-paprika text-xs mt-1.5">{ingredients.error}</p>
        )}

        {ingredients.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {ingredients.tags.map((tag) => (
              <span
                key={tag}
                className="bg-herb/10 text-herb text-sm px-3 py-1 rounded-full flex items-center gap-1.5 border border-herb/20"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => ingredients.removeTag(tag)}
                  className="text-herb/70 hover:text-herb font-bold leading-none"
                  aria-label={tag}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            {t("cuisineLabel")}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={cuisine.inputValue}
              onChange={(e) => cuisine.setInputValue(e.target.value)}
              onKeyDown={cuisine.handleKeyDown}
              placeholder={t("cuisinePlaceholder")}
              disabled={cuisine.isValidating}
              className="flex-1 border border-line bg-paper rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-saffron disabled:opacity-60"
            />
            <button
              type="button"
              onClick={cuisine.addTag}
              disabled={cuisine.isValidating}
              className="bg-ink text-paper px-3 rounded-lg text-sm hover:bg-ink/90 transition-colors disabled:opacity-60"
            >
              {cuisine.isValidating ? "⏳" : t("addButton")}
            </button>
          </div>
          {cuisine.error && (
            <p className="text-paprika text-xs mt-1.5">{cuisine.error}</p>
          )}
          {cuisine.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {cuisine.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-saffron/10 text-saffron text-sm px-3 py-1 rounded-full flex items-center gap-1.5 border border-saffron/20"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => cuisine.removeTag(tag)}
                    className="text-saffron/70 hover:text-saffron font-bold leading-none"
                    aria-label={tag}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            {t("dietLabel")}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={diet.inputValue}
              onChange={(e) => diet.setInputValue(e.target.value)}
              onKeyDown={diet.handleKeyDown}
              placeholder={t("dietPlaceholder")}
              disabled={diet.isValidating}
              className="flex-1 border border-line bg-paper rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-saffron disabled:opacity-60"
            />
            <button
              type="button"
              onClick={diet.addTag}
              disabled={diet.isValidating}
              className="bg-ink text-paper px-3 rounded-lg text-sm hover:bg-ink/90 transition-colors disabled:opacity-60"
            >
              {diet.isValidating ? "⏳" : t("addButton")}
            </button>
          </div>
          {diet.error && (
            <p className="text-paprika text-xs mt-1.5">{diet.error}</p>
          )}
          {diet.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {diet.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-paprika/10 text-paprika text-sm px-3 py-1 rounded-full flex items-center gap-1.5 border border-paprika/20"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => diet.removeTag(tag)}
                    className="text-paprika/70 hover:text-paprika font-bold leading-none"
                    aria-label={tag}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            {t("cookTimeLabel")}: {maxCookTime} {t("minutesShort")}
          </label>
          <input
            type="range"
            min={10}
            max={120}
            step={5}
            value={maxCookTime}
            onChange={(e) => setMaxCookTime(Number(e.target.value))}
            className="w-full accent-saffron"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            {t("servingsLabel")}: {servings}
          </label>
          <input
            type="range"
            min={1}
            max={8}
            value={servings}
            onChange={(e) => setServings(Number(e.target.value))}
            className="w-full accent-saffron"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={ingredients.tags.length === 0 || isLoading}
        className="bg-saffron text-paper font-medium py-3 rounded-lg hover:bg-saffron/90 transition-colors disabled:bg-line disabled:text-ink-soft disabled:cursor-not-allowed"
      >
        {isLoading ? t("submitLoading") : t("submitButton")}
      </button>
    </form>
  );
}
