import { NextRequest, NextResponse } from "next/server";
import { DishSchema, type Dish } from "@/lib/prompt";

const MODEL = "gemini-3.5-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const languageNames: Record<string, string> = {
  ru: "русский",
  uk: "украинский",
  en: "английский",
  zh: "китайский",
  ja: "японский",
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY не настроен на сервере" },
      { status: 500 },
    );
  }

  let body: { dish: Dish; targetLanguage: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Некорректный JSON в запросе " },
      { status: 400 },
    );
  }

  const { dish, targetLanguage } = body;
  if (!dish || !targetLanguage) {
    return NextResponse.json(
      { error: "Нужны поля dish и targerLanguage" },
      { status: 400 },
    );
  }

  const languageName = languageNames[targetLanguage] ?? "русский";

  const prompt = `Переведи следующий рецепт на ${languageName} язык. Сохрани точно такую же структуру JSON, переведи только текстовые значения (title, description, cuisine, ingredients, steps). Поля cookTimeMinutes, servings и calories НЕ переводи, оставь как есть. Ответь СТРОГО JSON, без markdown и пояснений.

  Рецепт для перевода:
  ${JSON.stringify(dish)}`;

  try {
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json",
          maxOutputTokens: 2048,
          thinkingConfig: { thinkingLevel: "low" },
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Gemini API вернул ошибку ${response.status}: ${errorBody}`,
      );
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const text = parts
      .map((part: { text?: string }) => part.text)
      .filter(Boolean)
      .join("");

    if (!text) {
      throw new Error("Gemini не вернул текст в ответе");
    }

    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsedJson = JSON.parse(cleaned);

    const validated = DishSchema.safeParse(parsedJson);
    if (!validated.success) {
      throw new Error("Переведенный рецепт не прошёл проверку структуры");
    }

    return NextResponse.json(validated.data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Неизвестная ошибка";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
