import { NextRequest, NextResponse } from "next/server";
import {
  buildPrompt,
  IdeasResponseSchema,
  type IdeaRequestParams,
} from "@/lib/prompt";

const MODEL = "gemini-3.5-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGemini(
  prompt: string,
  apiKey: string,
  attempt = 1,
): Promise<string> {
  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.9,
        responseMimeType: "application/json",
        maxOutputTokens: 6144,
        thinkingConfig: {
          thinkingLevel: "low",
        },
      },
    }),
  });

  if (response.status === 429 && attempt <= 3) {
    await sleep(attempt * 1000);
    return callGemini(prompt, apiKey, attempt + 1);
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Gemini API вернул ошибку: ${response.status} - ${errorBody}`,
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

  return text;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY не настроен на сервере" },
      { status: 500 },
    );
  }

  let body: IdeaRequestParams;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Некорректный JSON в теле запроса" },
      { status: 400 },
    );
  }

  if (!body.ingredients || body.ingredients.length === 0) {
    return NextResponse.json(
      { error: "Необходимо указать хотя бы один продукт" },
      { status: 400 },
    );
  }

  const prompt = buildPrompt(body);

  try {
    const rawText = await callGemini(prompt, apiKey);

    const cleaned = rawText.replace(/``json|```/g, "").trim();

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(cleaned);
    } catch {
      throw new Error("Не удалось разобрать ответ модели как JSON");
    }

    const validated = IdeasResponseSchema.safeParse(parsedJson);
    if (!validated.success) {
      throw new Error("Ответ модели не соответствует ожидаемой структуре");
    }

    return NextResponse.json(validated.data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Неизвестная ошибка";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
