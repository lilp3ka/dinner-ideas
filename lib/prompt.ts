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
  cuisine?: string[];
  diet?: string[];
  allergens?: string[];
  maxCookTime?: number;
  servings?: number;
  language?: string;
}

export function buildPrompt(params: IdeaRequestParams): string {
  const {
    ingredients,
    cuisine,
    diet,
    allergens,
    maxCookTime,
    servings,
    language,
  } = params;

  const languageNames: Record<string, string> = {
    ru: "русском",
    uk: "украинском",
    en: "английском",
    zh: "китайском",
    ja: "японском",
  };
  const languageName = languageNames[language ?? "ru"] ?? "русском";

  const constraints: string[] = [];
  if (cuisine && cuisine.length > 0)
    constraints.push(`Кухня: ${cuisine.join(", ")}.`);
  if (diet && diet.length > 0)
    constraints.push(`Диетические ограничения: ${diet.join(", ")}.`);
  if (allergens && allergens.length > 0) {
    constraints.push(
      `ВАЖНО, это ограничение по здоровью: исключи из рецептов полностью следующие продукты и всё, что их содержит: ${allergens.join(", ")}. Не предлагай блюда с этими продуктами ни в каком виде.`,
    );
  }
  if (maxCookTime)
    constraints.push(`Время готовки не больше ${maxCookTime} минут.`);
  if (servings) constraints.push(`Число порций: ${servings}.`);

  return `Ты — кулинарный помощник. Придумай 3 разных варианта ужина на основе списка продуктов, которые есть у пользователя. Весь текст в ответе — названия блюд, описания, названия ингредиентов и шаги приготовления — напиши на ${languageName} языке, независимо от того, на каком языке дан список продуктов ниже.

Шаги приготовления должны быть подробными, как в хорошей кулинарной книге, а не общими фразами. Для каждого шага указывай конкретику: точную температуру (градусы, или словами вроде "средний огонь", "сильный огонь"), точное время этого конкретного этапа в минутах или секундах, и визуальный или тактильный признак готовности этого шага (например, "пока лук не станет золотистым", "пока мясо не побелеет со всех сторон"). Дроби крупные действия на отдельные шаги вместо того, чтобы объединять несколько действий в один пункт. Обычно это означает 5-8 шагов вместо 3-4, но ориентируйся на реальную сложность рецепта, а не на фиксированное число.

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
