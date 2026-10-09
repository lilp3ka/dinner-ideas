import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const emojiUrl = "https://cdnjs.cloudflare.com/ajax/libs/twemoji/2.0.1/72x72/1f373.png";
  const imageData = await fetch(emojiUrl).then((res) => res.arrayBuffer());
  const base64 = Buffer.from(imageData).toString("base64");

  return new ImageResponse(
    (
      <img
        src={`data:image/png;base64,${base64}`}
        width={32}
        height={32}
        alt=""
      />
    ),
    { ...size }
  );
}
