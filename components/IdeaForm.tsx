"use client";

import { useState, type SubmitEvent, type KeyboardEvent } from "react";
import type { IdeaRequestParams } from "@/lib/prompt";

interface IdeaFormProps {
  onSubmit: (params: IdeaRequestParams) => void;
  isLoading: boolean;
}

export default function IdeaForm({ onSubmit, isLoading }: IdeaFormProps) {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [diet, setDiet] = useState("");
  const [maxCookTime, setMaxCookTime] = useState(60);
  const [servings, setServings] = useState(2);

  function addIngredient() {
    const trimmed = inputValue.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
    }
    setInputValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addIngredient();
    }
  }

  function removeIngredient(target: string) {
    setIngredients(ingredients.filter((item) => item !== target));
  }

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (ingredients.length === 0) return;

    onSubmit({
      ingredients,
      cuisine: cuisine || undefined,
      diet: diet || undefined,
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
          Что у Вас есть в холодильнике?
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Например: курица, рис, огурцы..."
            className="flex-1 border border-line bg-paper rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-soft/50 focus:outilne-none focus:ring-2 focus:ring-saffron"
          />
          <button
            type="button"
            onClick={addIngredient}
            className="bg-ink text-paper px-4 py-2 rounded-lg text-sm hover:bg-ink/90 transition-colors"
          >
            Добавить
          </button>
        </div>

        {ingredients.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {ingredients.map((ingredient) => (
              <span key={ingredient} className="bg-herb/10 text-herb text-sm px-3 py-1 rounded-full flex items-center gap-1.5 border border-herb/20">
                {ingredient}
                <button
                  type="button"
                  onClick={() => removeIngredient(ingredient)}
                  className="text-herb/70 hover:text-herb font-bold leading-none"
                  aria-label={`Удалить ${ingredient}`}
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
            Кухня ( необязательно )
          </label>
          <input
            type="text"
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            placeholder="Итальянская, азиатская..."
            className="w-full border border-line bg-paper rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-soft/50 focus:oultine-none focus:ring-2 focus:ring-saffron"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            Диета ( необязательно )
          </label>
          <input
            type="text"
            value={diet}
            onChange={(e) => setDiet(e.target.value)}
            placeholder="Вегетарианская, без глютена..."
            className="w-full border border-line bg-paper rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-saffron"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            Время готовки: {maxCookTime} мин
          </label>
          <input
            type="range"
            min={10}
            max={120}
            step={5}
            value={maxCookTime}
            onChange={(e) => setMaxCookTime(Number(e.target.value))}
            className="w-full accent-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            Порций: {servings}
          </label>
          <input
            type="range"
            min={1}
            max={8}
            value={servings}
            onChange={(e) => setServings(Number(e.target.value))}
            className="w-full accent-orange-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={ingredients.length === 0 || isLoading}
        className="bg-saffron text-paper font-medium py-3 rounded-lg hover:bg-saffron/90 transition-colors disabled:bg-line disabled:text-ink-soft disabled:cursor-not-allowed"
      >
        {isLoading ? "Придумываю..." : "Предложить идеи ужина"}
      </button>
    </form>
  );
}