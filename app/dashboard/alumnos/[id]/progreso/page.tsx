"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "../../../../utils/supbase/client";

type SerieRealizada = {
  id: number;
  entrenamiento_id: number;
  rutina_ejercicio_id: number;
  serie_numero: number;
  repeticiones: number;
  peso: number | null;
  completada: boolean;
};

type EjercicioInfo = {
  id: number;
  nombre: string;
};

type RutinaEjercicioInfo = {
  id: number;
  ejercicio_id: number;
  orden: number;
};

type Entrenamiento = {
  id: number;
  rutina_id: number;
  estado: string;
  started_at: string;
  finished_at: string | null;
  comentario: string | null;
  series: SerieRealizada[];
};

export default function ProgresoAlumno() {
  const params = useParams();
  const router = useRouter();

  const alumnoId = params.id as string;

  const [entrenamientos, setEntrenamientos] = useState<Entrenamiento[]>([]);
  const [rutinaEjercicios, setRutinaEjercicios] = useState<
    RutinaEjercicioInfo[]
  >([]);
  const [ejercicios, setEjercicios] = useState<EjercicioInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarDatos() {
      const supabase = createClient();

      const { data: entrenamientosData, error: entrenamientosError } =
        await supabase
          .from("entrenamiento_sesiones")
          .select(
            "id, rutina_id, estado, started_at, finished_at, comentario"
          )
          .eq("alumno_id", Number(alumnoId))
          .order("started_at", { ascending: false });

      if (entrenamientosError) {
        console.error(entrenamientosError);
        setLoading(false);
        return;
      }

      const entrenamientosBase = entrenamientosData ?? [];

      if (entrenamientosBase.length === 0) {
        setEntrenamientos([]);
        setLoading(false);
        return;
      }

      const entrenamientoIds = entrenamientosBase.map(
        (entrenamiento) => entrenamiento.id
      );

      const { data: seriesData, error: seriesError } = await supabase
        .from("entrenamiento_series")
        .select(
          "id, entrenamiento_id, rutina_ejercicio_id, serie_numero, repeticiones, peso, completada"
        )
        .in("entrenamiento_id", entrenamientoIds)
        .order("serie_numero", { ascending: true });

      if (seriesError) {
        console.error(seriesError);
        setLoading(false);
        return;
      }

      const series = seriesData ?? [];

      const rutinaEjercicioIds = [
        ...new Set(
          series.map((serie) => serie.rutina_ejercicio_id)
        ),
      ];

      let rutinaEjerciciosData: RutinaEjercicioInfo[] = [];

      if (rutinaEjercicioIds.length > 0) {
        const { data, error } = await supabase
          .from("rutina_ejercicios")
          .select("id, ejercicio_id, orden")
          .in("id", rutinaEjercicioIds)
          .order("orden", { ascending: true });

        if (error) {
          console.error(error);
          setLoading(false);
          return;
        }

        rutinaEjerciciosData = data ?? [];
      }

      const ejercicioIds = [
        ...new Set(
          rutinaEjerciciosData.map(
            (item) => item.ejercicio_id
          )
        ),
      ];

      let ejerciciosData: EjercicioInfo[] = [];

      if (ejercicioIds.length > 0) {
        const { data, error } = await supabase
          .from("ejercicios")
          .select("id, nombre")
          .in("id", ejercicioIds);

        if (error) {
          console.error(error);
          setLoading(false);
          return;
        }

        ejerciciosData = data ?? [];
      }

      const entrenamientosConSeries: Entrenamiento[] =
        entrenamientosBase.map((entrenamiento) => ({
          ...entrenamiento,
          series: series.filter(
            (serie) =>
              serie.entrenamiento_id === entrenamiento.id
          ),
        }));

      setRutinaEjercicios(rutinaEjerciciosData);
      setEjercicios(ejerciciosData);
      setEntrenamientos(entrenamientosConSeries);
      setLoading(false);
    }

    cargarDatos();
  }, [alumnoId]);

  function obtenerNombreEjercicio(
    rutinaEjercicioId: number
  ) {
    const rutinaEjercicio = rutinaEjercicios.find(
      (item) => item.id === rutinaEjercicioId
    );

    if (!rutinaEjercicio) {
      return `Ejercicio #${rutinaEjercicioId}`;
    }

    const ejercicio = ejercicios.find(
      (item) => item.id === rutinaEjercicio.ejercicio_id
    );

    return ejercicio?.nombre ?? `Ejercicio #${rutinaEjercicioId}`;
  }

  function obtenerOrdenEjercicio(
    rutinaEjercicioId: number
  ) {
    const rutinaEjercicio = rutinaEjercicios.find(
      (item) => item.id === rutinaEjercicioId
    );

    return rutinaEjercicio?.orden ?? 9999;
  }

  function obtenerEjerciciosDelEntrenamiento(
    series: SerieRealizada[]
  ) {
    const ids = [
      ...new Set(
        series.map((serie) => serie.rutina_ejercicio_id)
      ),
    ];

    return ids.sort(
      (a, b) =>
        obtenerOrdenEjercicio(a) -
        obtenerOrdenEjercicio(b)
    );
  }

  function formatearFecha(fecha: string) {
    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function formatearHora(fecha: string) {
    return new Date(fecha).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function calcularDuracion(
    inicio: string,
    fin: string | null
  ) {
    if (!fin) return null;

    const diferencia =
      new Date(fin).getTime() -
      new Date(inicio).getTime();

    const minutos = Math.floor(
      diferencia / 60000
    );

    if (minutos < 1) {
      return "menos de 1 min";
    }

    return `${minutos} min`;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white p-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-neutral-400">
            Cargando progreso...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-5xl mx-auto">

        <p className="text-emerald-500 font-bold tracking-[0.25em]">
          SF TRAINING
        </p>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mt-2">
          <div>
            <h1 className="text-4xl font-bold">
              Progreso del alumno
            </h1>

            <p className="text-neutral-400 mt-2">
              Historial de entrenamientos realizados.
            </p>
          </div>

          <button
            onClick={() =>
              router.push(`/dashboard/alumnos/${alumnoId}`)
            }
            className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl px-5 py-3 font-semibold"
          >
            ← Volver al perfil
          </button>
        </div>

        {entrenamientos.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 mt-8">
            <p className="text-neutral-300">
              Todavía no hay entrenamientos registrados.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 mt-8">

            {entrenamientos.map((entrenamiento) => {
              const ejerciciosDelEntrenamiento =
                obtenerEjerciciosDelEntrenamiento(
                  entrenamiento.series
                );

              const duracion = calcularDuracion(
                entrenamiento.started_at,
                entrenamiento.finished_at
              );

              const estaFinalizado =
                entrenamiento.estado === "finalizado";

              return (
                <section
                  key={entrenamiento.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden"
                >

                  {/* ENCABEZADO DEL ENTRENAMIENTO */}
                  <div className="p-6 border-b border-neutral-800">

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                      <div>
                        <p className="text-emerald-500 font-bold text-lg">
                          Entrenamiento #{entrenamiento.id}
                        </p>

                        <p className="text-white text-xl font-semibold mt-1">
                          {formatearFecha(
                            entrenamiento.started_at
                          )}
                        </p>

                        <p className="text-neutral-400 mt-1">
                          {formatearHora(
                            entrenamiento.started_at
                          )}

                          {entrenamiento.finished_at &&
                            ` → ${formatearHora(
                              entrenamiento.finished_at
                            )}`}

                          {duracion &&
                            ` · ${duracion}`}
                        </p>
                      </div>

                      <div>
                        {estaFinalizado ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 text-emerald-400 font-semibold">
                            ✓ Finalizado
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-yellow-500/10 border border-yellow-500/30 px-4 py-2 text-yellow-400 font-semibold">
                            ● En curso
                          </span>
                        )}
                      </div>

                    </div>

                    {entrenamiento.comentario && (
                      <div className="mt-5 bg-neutral-800 rounded-xl p-4">
                        <p className="text-neutral-400 text-sm">
                          Comentario del alumno
                        </p>

                        <p className="text-white mt-1">
                          {entrenamiento.comentario}
                        </p>
                      </div>
                    )}

                  </div>

                  {/* EJERCICIOS */}
                  <div className="p-6">

                    {ejerciciosDelEntrenamiento.length === 0 ? (
                      <p className="text-neutral-400">
                        No hay series registradas en este entrenamiento.
                      </p>
                    ) : (
                      <div>

                        <h2 className="text-xl font-bold mb-5">
                          Ejercicios realizados
                        </h2>

                        <div className="grid gap-6">

                          {ejerciciosDelEntrenamiento.map(
                            (
                              rutinaEjercicioId,
                              ejercicioIndex
                            ) => {

                              const seriesDelEjercicio =
                                entrenamiento.series
                                  .filter(
                                    (serie) =>
                                      serie.rutina_ejercicio_id ===
                                      rutinaEjercicioId
                                  )
                                  .sort(
                                    (a, b) =>
                                      a.serie_numero -
                                      b.serie_numero
                                  );

                              return (
                                <div
                                  key={rutinaEjercicioId}
                                  className="bg-neutral-800 rounded-2xl overflow-hidden"
                                >

                                  {/* NOMBRE EJERCICIO */}
                                  <div className="px-5 py-4 border-b border-neutral-700">

                                    <p className="text-emerald-400 text-sm font-semibold">
                                      Ejercicio{" "}
                                      {ejercicioIndex + 1}
                                    </p>

                                    <p className="text-white text-lg font-bold mt-1">
                                      {obtenerNombreEjercicio(
                                        rutinaEjercicioId
                                      )}
                                    </p>

                                  </div>

                                  {/* CABECERA TABLA */}
                                  <div className="hidden md:grid grid-cols-4 gap-4 px-5 py-3 bg-neutral-900 text-neutral-400 text-sm font-semibold">
                                    <span>Serie</span>
                                    <span>Repeticiones</span>
                                    <span>Peso</span>
                                    <span>Estado</span>
                                  </div>

                                  {/* SERIES */}
                                  <div>
                                    {seriesDelEjercicio.map(
                                      (serie) => (
                                        <div
                                          key={serie.id}
                                          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 px-5 py-4 border-b border-neutral-700 last:border-b-0"
                                        >

                                          <div>
                                            <p className="text-neutral-400 text-xs md:hidden">
                                              Serie
                                            </p>

                                            <p className="font-semibold">
                                              Serie{" "}
                                              {serie.serie_numero}
                                            </p>
                                          </div>

                                          <div>
                                            <p className="text-neutral-400 text-xs md:hidden">
                                              Repeticiones
                                            </p>

                                            <p className="font-semibold">
                                              {serie.repeticiones}
                                            </p>
                                          </div>

                                          <div>
                                            <p className="text-neutral-400 text-xs md:hidden">
                                              Peso
                                            </p>

                                            <p className="font-semibold">
                                              {serie.peso !== null
                                                ? `${serie.peso} kg`
                                                : "—"}
                                            </p>
                                          </div>

                                          <div>
                                            <p className="text-neutral-400 text-xs md:hidden">
                                              Estado
                                            </p>

                                            <p
                                              className={
                                                serie.completada
                                                  ? "text-emerald-400 font-semibold"
                                                  : "text-red-400 font-semibold"
                                              }
                                            >
                                              {serie.completada
                                                ? "✓ Completada"
                                                : "No completada"}
                                            </p>
                                          </div>

                                        </div>
                                      )
                                    )}
                                  </div>

                                </div>
                              );
                            }
                          )}

                        </div>
                      </div>
                    )}

                  </div>

                </section>
              );
            })}

          </div>
        )}

      </div>
    </main>
  );
}