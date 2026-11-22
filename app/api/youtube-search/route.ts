import { NextResponse } from "next/server";

type YouTubeSearchItem = {
  id?: { videoId?: string };
  snippet?: {
    thumbnails?: {
      high?: { url: string };
      medium?: { url: string };
      default?: { url: string };
    };
  };
};

type YouTubeVideoItem = {
  id: string;
  contentDetails?: { duration?: string };
};

function duracionEnSegundos(duracion: string): number | null {
  const partes = duracion.match(
    /^P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/
  );

  if (!partes) return null;

  return (
    Number(partes[1] ?? 0) * 86400 +
    Number(partes[2] ?? 0) * 3600 +
    Number(partes[3] ?? 0) * 60 +
    Number(partes[4] ?? 0)
  );
}

export async function GET(request: Request) {
  const vacio = {
    video_url: null,
    imagen_url: null,
  };

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!q || !apiKey) {
      return NextResponse.json(vacio);
    }

    const busqueda = new URL(
      "https://www.googleapis.com/youtube/v3/search"
    );

    busqueda.searchParams.set("part", "snippet");
    busqueda.searchParams.set(
      "q",
      `${q} ejercicio técnica demostración`
    );
    busqueda.searchParams.set("type", "video");
    busqueda.searchParams.set("videoDuration", "short");
    busqueda.searchParams.set("videoEmbeddable", "true");
    busqueda.searchParams.set("videoSyndicated", "true");
    busqueda.searchParams.set("maxResults", "25");
    busqueda.searchParams.set("key", apiKey);

    const respuesta = await fetch(busqueda.toString(), {
      cache: "no-store",
    });

    if (!respuesta.ok) {
      console.error("Error en búsqueda YouTube:", respuesta.status);
      return NextResponse.json(vacio);
    }

    const resultados: { items?: YouTubeSearchItem[] } =
      await respuesta.json();

    const candidatos = (resultados.items ?? [])
      .filter((item) => typeof item.id?.videoId === "string")
      .map((item) => ({
        id: item.id!.videoId!,
        imagen:
          item.snippet?.thumbnails?.high?.url ??
          item.snippet?.thumbnails?.medium?.url ??
          item.snippet?.thumbnails?.default?.url ??
          null,
      }));

    if (candidatos.length === 0) {
      return NextResponse.json(vacio);
    }

    const detalles = new URL(
      "https://www.googleapis.com/youtube/v3/videos"
    );

    detalles.searchParams.set("part", "contentDetails");
    detalles.searchParams.set(
      "id",
      candidatos.map((item) => item.id).join(",")
    );
    detalles.searchParams.set("key", apiKey);

    const respuestaDetalles = await fetch(detalles.toString(), {
      cache: "no-store",
    });

    if (!respuestaDetalles.ok) {
      console.error(
        "Error consultando duración:",
        respuestaDetalles.status
      );
      return NextResponse.json(vacio);
    }

    const datosDetalles: { items?: YouTubeVideoItem[] } =
      await respuestaDetalles.json();

    const duraciones = new Map<string, number>();

    for (const item of datosDetalles.items ?? []) {
      const duracion = item.contentDetails?.duration;

      if (!duracion) continue;

      const segundos = duracionEnSegundos(duracion);

      if (segundos !== null) {
        duraciones.set(item.id, segundos);
      }
    }

    const validos = candidatos.filter((item) => {
      const segundos = duraciones.get(item.id);

      return (
        segundos !== undefined &&
        segundos >= 1 &&
        segundos <= 50 &&
        item.imagen !== null
      );
    });

    const elegido =
      validos.find((item) => {
        const segundos = duraciones.get(item.id)!;
        return segundos >= 15 && segundos <= 40;
      }) ?? validos[0];

    if (!elegido) {
      return NextResponse.json(vacio);
    }

    return NextResponse.json({
      video_url: `https://www.youtube.com/watch?v=${elegido.id}`,
      imagen_url: elegido.imagen,
    });
  } catch (error) {
    console.error("Error buscando multimedia:", error);
    return NextResponse.json(vacio);
  }
}