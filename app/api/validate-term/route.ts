import { error } from "console";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const MODEL = "gemini-3.5-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const ValidationSchema = z.object({
  valid: z.boolean(),
});

type Category = "ingredient" | "cuisine" | "diet";

const categoryPrompts: Record<Category, string> = {
  ingredient:
  "Является ли следующее слово или фраза реальным пищевым продуктом или ингредиентом (на любом языке)? Сюда считаются и базовые продукты (соль, вода, масло), и сложные (например, названия блюд как ингредиент не считаются, а вот 'куриная грудка' или 'соевый соус' — считаются).",
  cuisine:"Является ли следующее слово или фраза реальным названием кухни мира или кулинарного стиля (на любом языке)? Например: итальянская, азиатская, мексиканская, домашняя, фьюжн.",
  diet: "Является ли следующее слово или фраза реальным названием диеты или пищевого ограничения (на любом языке)? Например: вегетарианская, веганская, без глютена, кето, низкоуглеводная."
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY не настроен на сервере"},
      { status: 500 }
    );
  }

  let body: { term: string; category: Category };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный JSON в запросе" }, { status: 400 });
  }

  const { term, category } = body;
  if (!term || !category || !categoryPrompts[category]) {
    return NextResponse.json(
      { error: "Нужны поля term и корректная category" },
      { status: 400 }
    );
  }

  const prompt = `${categoryPrompts[category]}
  Слово/фраза для проверки: "${term}"

  тветь СТРОГО в формате JSON, без markdown и пояснений: {"valid": true} или {"valid": false}.`;

  try {
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0,
          responseMimeType: "application/json",
          maxOutputTokens: 512,
          thinkingConfig: { thinkingLevel: "low" },
        },
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API вернул ошибку ${response.status}: ${errorBody}`);
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

    const validated = ValidationSchema.safeParse(parsedJson);
    if (!validated.success) {
      return NextResponse.json({ valid: true });
    }

    return NextResponse.json(validated.data);
  } catch {
    return NextResponse.json({ valid: true });
  }
}
