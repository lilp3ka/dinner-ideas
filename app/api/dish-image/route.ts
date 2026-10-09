import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    return NextResponse.json(
      { error: "UNSPLASH_ACCESS_KEY не настроен на сервере" },
      { status: 500 }
    );
  }

  const query = request.nextUrl.searchParams.get("query");
  if (!query) {
    return NextResponse.json({ error: "Нужен параметр query" }, { status: 400 });
  }

  try {
    const url = new URL("https://api.unsplash.com/search/photos");
    url.searchParams.set("query", `${query} food dish`);
    url.searchParams.set("per_page", "1");
    url.searchParams.set("orientation", "squarish");

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Client-ID ${accessKey}` },
    });

    if (!response.ok) {
      throw new Error(`Unsplash API вернул ошибку ${response.status}`);
    }

    const data = await response.json();
    const photo = data?.results?.[0];

    if (!photo) {
      return NextResponse.json({ image: null });
    }

    return NextResponse.json({
      image: {
        url: photo.urls.small,
        alt: photo.alt_description ?? query,
        photographerName: photo.user.name,
        photographerUrl: photo.user.links.html,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Неизвестная ошибка";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
