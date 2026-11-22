"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../utils/supbase/client";

type Ejercicio = {
  id: number;
  nombre: string;
  grupo_muscular: string;
  musculo_principal: string | null;
  musculos_secundarios: string | null;
  tipo: string;
  video_url: string | null;
  imagen_url: string | null;
  imagen_musculos_url: string | null;
  descripcion: string | null;
  created_at: string;
  updated_at: string;
};

type Multimedia = {
  video_url: string;
  imagen_url: string;
};

export default function Ejercicios() {
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [buscandoId, setBuscandoId] = useState<number | null>(null);
  const [guardandoId, setGuardandoId] = useState<number | null>(null);
  const [multimediaPendiente, setMultimediaPendiente] = useState<
    Record<number, Multimedia>
  >({});
  const [mensajes, setMensajes] = useState<Record<number, string>>({});

  useEffect(() => {
    async function cargarEjercicios() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("ejercicios")
        .select("*")
        .order("nombre", { ascending: true });

      if (error) {
        console.error(error);
        setErrorCarga("No se pudieron cargar los ejercicios.");
      } else {
        setEjercicios(data ?? []);
      }

      setLoading(false);
    }

    void cargarEjercicios();
  }, []);

  async function buscarMultimedia(ejercicio: Ejercicio) {
    setBuscandoId(ejercicio.id);
    setMensajes((actual) => ({
      ...actual,
      [ejercicio.id]: "",
    }));

    setMultimediaPendiente((actual) => {
      const nuevo = { ...actual };
      delete nuevo[ejercicio.id];
      return nuevo;
    });

    try {
      const respuesta = await fetch(
        `/api/youtube-search?q=${encodeURIComponent(ejercicio.nombre)}`,
        { cache: "no-store" }
      );

      if (!respuesta.ok) {
        throw new Error("No se pudo consultar YouTube.");
      }

      const datos: {
        video_url?: unknown;
        imagen_url?: unknown;
      } = await respuesta.json();

      if (
        typeof datos.video_url !== "string" ||
        !datos.video_url.startsWith(
          "https://www.youtube.com/watch?v="
        ) ||
        typeof datos.imagen_url !== "string" ||
        !datos.imagen_url.startsWith("https://")
      ) {
        setMensajes((actual) => ({
          ...actual,
          [ejercicio.id]:
            "No se encontró un video con imagen para este ejercicio.",
        }));
        return;
      }

      setMultimediaPendiente((actual) => ({
        ...actual,
        [ejercicio.id]: {
          video_url: datos.video_url as string,
          imagen_url: datos.imagen_url as string,
        },
      }));
    } catch (error) {
      console.error(error);

      setMensajes((actual) => ({
        ...actual,
        [ejercicio.id]:
          "Error al buscar multimedia. Intentá nuevamente.",
      }));
    } finally {
      setBuscandoId(null);
    }
  }

  async function aprobarMultimedia(ejercicio: Ejercicio) {
    const propuesta = multimediaPendiente[ejercicio.id];

    if (!propuesta) return;

    setGuardandoId(ejercicio.id);

    setMensajes((actual) => ({
      ...actual,
      [ejercicio.id]: "",
    }));

    try {
      const supabase = createClient();

      const cambios: {
        video_url?: string;
        imagen_url?: string;
      } = {};

      if (!ejercicio.video_url) {
        cambios.video_url = propuesta.video_url;
      }

      if (!ejercicio.imagen_url) {
        cambios.imagen_url = propuesta.imagen_url;
      }

      if (Object.keys(cambios).length === 0) {
        setMensajes((actual) => ({
          ...actual,
          [ejercicio.id]:
            "Este ejercicio ya tiene imagen y video. Para cambiarlos, usá Editar ejercicio.",
        }));
        return;
      }

      let consulta = supabase
        .from("ejercicios")
        .update(cambios)
        .eq("id", ejercicio.id);

      if (cambios.video_url) {
        consulta = consulta.is("video_url", null);
      }

      if (cambios.imagen_url) {
        consulta = consulta.is("imagen_url", null);
      }

      const { data, error } = await consulta
        .select("id, video_url, imagen_url")
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setMensajes((actual) => ({
          ...actual,
          [ejercicio.id]:
            "Los datos cambiaron. Actualizá la página y volvé a revisar.",
        }));
        return;
      }

      setEjercicios((actual) =>
        actual.map((item) =>
          item.id === ejercicio.id
            ? {
                ...item,
                video_url: data.video_url,
                imagen_url: data.imagen_url,
              }
            : item
        )
      );

      setMultimediaPendiente((actual) => {
        const nuevo = { ...actual };
        delete nuevo[ejercicio.id];
        return nuevo;
      });

      setMensajes((actual) => ({
        ...actual,
        [ejercicio.id]:
          "Imagen y video aprobados y guardados.",
      }));
    } catch (error) {
      console.error(error);

      setMensajes((actual) => ({
        ...actual,
        [ejercicio.id]:
          "No se pudieron guardar los enlaces. Revisá los permisos e intentá otra vez.",
      }));
    } finally {
      setGuardandoId(null);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-emerald-500 font-bold tracking-[0.25em]">
          SF TRAINING
        </p>

        <h1 className="text-4xl font-bold mt-2">
          Biblioteca de ejercicios
        </h1>

        <p className="text-neutral-400 mt-2">
          Administrá todos los ejercicios disponibles para las rutinas.
        </p>

        <div className="flex gap-3 mt-8">
          <button
            type="button"
            onClick={() => {
              window.location.href = "/dashboard/ejercicios/nuevo";
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-3 rounded-lg"
          >
            + Nuevo ejercicio
          </button>
        </div>

        {loading ? (
          <p className="text-neutral-400 mt-8">
            Cargando ejercicios...
          </p>
        ) : errorCarga ? (
          <p className="text-red-400 mt-8">
            {errorCarga}
          </p>
        ) : ejercicios.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 mt-8">
            <p className="text-neutral-300">
              Todavía no hay ejercicios cargados.
            </p>
            <p className="text-neutral-500 mt-2">
              Podés agregar el primero con “Nuevo ejercicio”.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 mt-8">
            {ejercicios.map((ejercicio) => {
              const propuesta =
                multimediaPendiente[ejercicio.id];

              const tieneAmbos =
                !!ejercicio.video_url &&
                !!ejercicio.imagen_url;

              const ocupado =
                buscandoId !== null ||
                guardandoId !== null;

              return (
                <div
                  key={ejercicio.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl font-bold">
                        {ejercicio.nombre}
                      </h2>

                      <p className="text-emerald-500 text-sm mt-1">
                        {ejercicio.grupo_muscular}
                      </p>

                      {ejercicio.musculo_principal && (
                        <p className="text-white mt-2">
                          <strong>Músculo principal:</strong>{" "}
                          {ejercicio.musculo_principal}
                        </p>
                      )}

                      {ejercicio.musculos_secundarios && (
                        <p className="text-neutral-400 mt-1">
                          <strong>Músculos secundarios:</strong>{" "}
                          {ejercicio.musculos_secundarios}
                        </p>
                      )}

                      <p className="text-neutral-400 text-sm mt-1">
                        {ejercicio.tipo}
                      </p>

                      {ejercicio.descripcion && (
                        <p className="text-neutral-400 mt-3">
                          {ejercicio.descripcion}
                        </p>
                      )}

{ejercicio.imagen_musculos_url && (
  <div className="mt-4">
    <p className="text-sm text-neutral-400 mb-2">
      Músculo trabajado
    </p>
    <img
      src={ejercicio.imagen_musculos_url}
      alt={`Músculos trabajados en ${ejercicio.nombre}`}
      className="w-full max-w-md rounded-xl border border-neutral-800 bg-white"
    />
  </div>
)}

                      {ejercicio.video_url && (
                        <a
                          href={ejercicio.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-3 text-emerald-400 font-semibold underline"
                        >
                          Ver video de YouTube
                        </a>
                      )}



                      <div className="text-xs text-neutral-500 mt-4 space-y-1">
                        <p>
                          Creado:{" "}
                          {new Date(
                            ejercicio.created_at
                          ).toLocaleString("es-AR")}
                        </p>
                        <p>
                          Última actualización:{" "}
                          {new Date(
                            ejercicio.updated_at
                          ).toLocaleString("es-AR")}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        window.location.href =
                          `/dashboard/ejercicios/nuevo?id=${ejercicio.id}`;
                      }}
                      className="self-start bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg"
                    >
                      Editar ejercicio
                    </button>
                  </div>

                  {!tieneAmbos && (
                    <div className="mt-5 border-t border-neutral-700 pt-4">
                      <p className="text-sm text-neutral-400 mb-3">
                        Falta{" "}
                        {!ejercicio.video_url &&
                        !ejercicio.imagen_url
                          ? "imagen y video"
                          : !ejercicio.imagen_url
                          ? "imagen"
                          : "video"}
                        . La búsqueda propone un video y su miniatura.
                        Revisalos antes de guardar.
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          void buscarMultimedia(ejercicio)
                        }
                        disabled={ocupado}
                        className="bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 px-4 py-2 rounded-lg font-semibold"
                      >
                        {buscandoId === ejercicio.id
                          ? "Buscando..."
                          : "Buscar imagen y video"}
                      </button>

                      {propuesta && (
                        <div className="mt-4 bg-neutral-800 rounded-xl p-4">
                          <p className="font-bold mb-2">
                            Propuesta para revisar
                          </p>





                          <a
                            href={propuesta.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-3 text-emerald-400 underline"
                          >
                            Abrir video y verificar la técnica
                          </a>

                          <p className="text-sm text-neutral-300 mt-3">
                            Guardá únicamente si el video corresponde
                            al ejercicio y muestra una técnica apropiada.
                          </p>

                          <div className="flex flex-wrap gap-3 mt-3">
                            <button
                              type="button"
                              onClick={() =>
                                void aprobarMultimedia(ejercicio)
                              }
                              disabled={ocupado}
                              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-4 py-2 rounded-lg font-semibold"
                            >
                              {guardandoId === ejercicio.id
                                ? "Guardando..."
                                : "Aprobar y guardar"}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setMultimediaPendiente(
                                  (actual) => {
                                    const nuevo = { ...actual };
                                    delete nuevo[ejercicio.id];
                                    return nuevo;
                                  }
                                );
                              }}
                              disabled={ocupado}
                              className="bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 px-4 py-2 rounded-lg"
                            >
                              Descartar
                            </button>
                          </div>
                        </div>
                      )}

                      {mensajes[ejercicio.id] && (
                        <p
                          role="status"
                          className="text-sm text-emerald-300 mt-3"
                        >
                          {mensajes[ejercicio.id]}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}