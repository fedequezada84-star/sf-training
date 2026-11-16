import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    if (!q) {
      return NextResponse.json({
        video_url: null,
        imagen_url: null,
      });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        video_url: null,
        imagen_url: null,
      });
    }

    const url = new URL(
      "https://www.googleapis.com/youtube/v3/search"
    );

    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", `${q} ejercicio técnica`);
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "1");
    url.searchParams.set("videoEmbeddable", "true");
    url.searchParams.set("videoSyndicated", "true");
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString(), {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({
        video_url: null,
        imagen_url: null,
      });
    }

    const data = await response.json();
    const item = data.items?.[0];

    if (!item?.id?.videoId) {
      return NextResponse.json({
        video_url: null,
        imagen_url: null,
      });
    }

    const videoId = item.id.videoId;

    return NextResponse.json({
      video_url: `https://www.youtube.com/watch?v=${videoId}`,
      imagen_url:
        item.snippet?.thumbnails?.high?.url ??
        item.snippet?.thumbnails?.medium?.url ??
        item.snippet?.thumbnails?.default?.url ??
        null,
    });
  } catch {
    return NextResponse.json({
      video_url: null,
      imagen_url: null,
    });
  }
}