import { z } from "zod";

export const DishSchema = z.object({
  title: z.string(),
  description: z.string(),
  cookTimeMinutes: z.number(),
  servings: z.number(),
  cuisine: z.string(),
  ingredients: z.array(z.string()),
  steps: z.array(z.string()),
  calories: z.number().nullable(),
});

export const IdeasResponseSchema = z.object({
  dishes: z.array(DishSchema),
});

export type Dish = z.infer<typeof DishSchema>;
export type IdeasResponse = z.infer<typeof IdeasResponseSchema>;

export interface IdeaRequestParams {
  ingredients: string[];
  cuisine?: string;
  diet?: string;
  maxCookTime?: number;
  servings?: number;
  language?: string;
}

export function buildPrompt(params: IdeaRequestParams): string {
  const { ingredients, cuisine, diet, maxCookTime, servings, language } = params;

  const languageNames: Record<string, string> = {
    ru: "руском",
    uk: "украинском",
    en: "английском",
    zh: "китайском",
    ja: "японском",
  };
  const languageName = languageNames[language ?? "ru"] ?? "русском";

  const constraints: string[] = [];
  if (cuisine) constraints.push(`Кухня: ${cuisine}.`);
  if (diet) constraints.push(`Диетичекие ограничения: ${diet}.`);
  if (maxCookTime)
    constraints.push(`Время готовки не больше: ${maxCookTime} минут.`);
  if (servings) constraints.push(`Количество порций: ${servings}.`);

  return `Ты — кулинарный помощник. Придумай 3 разных варианта ужина на основе списка продуктов, которые есть у пользователя. Весь текст в ответе — названия блюд, описания, названия ингредиентов и шаги приготовления — напиши на ${languageName} языке, независимо от того, на каком языке дан список продуктов ниже.

  Доступные продукты: ${ingredients.join(", ")}.
  ${constraints.join(" ")}

  Можно использовать базовые продукты, которые есть почти всегда (соль, перец, масло, вода), даже если их нет в списке. Не обязательно использовать все продукты из списка сразу.

  Ответь СТРОГО в формате JSON, без markdown-разметки, без \`\`\`json, без пояснений до или после. Структура ответа должна быть ровно такой:

  {
    "dishes": [
      {
        "title": "Название блюда",
        "description": "Одно-два предложениия о блюде",
        "cookTimeMinutes": 30,
        "servings": 2,
        "cuisine": "Например, итальянская",
        "ingredients": ["ингедиент 1", "ингредиент 2"],
        "steps": ["шаг 1", "шаг 2", "шаг 3"],
        "calories": 450
}
]
}

Если калорийность оценить сложно, поставь null вместо числа. Верни ровно 3 блюда.`;
}
