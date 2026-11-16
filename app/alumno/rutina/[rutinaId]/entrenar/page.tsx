"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

type Rutina = {
  id: number;
  nombre: string;
  tipo: string;
};

type Ejercicio = {
  id: number;
  nombre: string;
  grupo_muscular: string;
  tipo: string;
  video_url: string | null;
  imagen_url: string | null;
};

type RutinaEjercicio = {
  id: number;
  ejercicio_id: number;
  series: number;
  repeticiones: number;
  peso: number | null;
  descanso: number;
  orden: number;
  notas: string | null;
  notas_series: string[] | null;
  ejercicio: Ejercicio | null;
};

type SerieRealizada = {
  repeticiones: number;
  peso: string;
};

function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

export default function EntrenarRutina() {
  const params = useParams();
  const router = useRouter();

  const rutinaId = Number(params.rutinaId);

  const [rutina, setRutina] = useState<Rutina | null>(null);
  const [ejercicios, setEjercicios] = useState<RutinaEjercicio[]>([]);
  const [alumnoId, setAlumnoId] = useState<number | null>(null);

  const [entrenamientoId, setEntrenamientoId] = useState<number | null>(
    null
  );
  const [inicioEntrenamiento, setInicioEntrenamiento] = useState<string | null>(
  null
);

  const [seriesRealizadas, setSeriesRealizadas] = useState<
    Record<number, SerieRealizada[]>
  >({});
  const [seriesCompletadas, setSeriesCompletadas] = useState<
  Record<number, boolean[]>
>({});

  const [comentario, setComentario] = useState("");
  const [loading, setLoading] = useState(true);
  const [iniciando, setIniciando] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [segundosEntrenamiento, setSegundosEntrenamiento] = useState(0);
  const [avisoTresHoras, setAvisoTresHoras] = useState(false);

  useEffect(() => {
    async function cargarDatos() {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      const { data: alumno, error: alumnoError } = await supabase
        .from("alumnos")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (alumnoError || !alumno) {
        setMensaje("No se encontró el perfil del alumno.");
        setLoading(false);
        return;
      }

      setAlumnoId(alumno.id);

      const { data: rutinaData, error: rutinaError } = await supabase
        .from("rutinas")
        .select("id, nombre, tipo")
        .eq("id", rutinaId)
        .eq("alumno_id", alumno.id)
        .single();

      if (rutinaError || !rutinaData) {
        setMensaje("No se encontró esta rutina.");
        setLoading(false);
        return;
      }

      setRutina(rutinaData);

      const { data: rutinaEjercicios, error: ejerciciosError } =
        await supabase
          .from("rutina_ejercicios")
          .select(
"id, ejercicio_id, series, repeticiones, peso, descanso, orden, notas, notas_series"
          )
          .eq("rutina_id", rutinaId)
          .order("orden", { ascending: true });

      if (ejerciciosError) {
        console.error(ejerciciosError);
        setMensaje("No se pudieron cargar los ejercicios.");
        setLoading(false);
        return;
      }

      if (!rutinaEjercicios || rutinaEjercicios.length === 0) {
        setEjercicios([]);
        setLoading(false);
        return;
      }

      const ejercicioIds = rutinaEjercicios.map(
        (item) => item.ejercicio_id
      );

      const { data: ejerciciosData, error: ejerciciosDataError } =
        await supabase
          .from("ejercicios")
.select("id, nombre, grupo_muscular, tipo, video_url, imagen_url")
          .in("id", ejercicioIds);

      if (ejerciciosDataError) {
        console.error(ejerciciosDataError);
        setMensaje("No se pudieron cargar los ejercicios.");
        setLoading(false);
        return;
      }

      const ejerciciosCompletos: RutinaEjercicio[] =
        rutinaEjercicios.map((item) => ({
          ...item,
          ejercicio:
            ejerciciosData?.find(
              (ejercicio) => ejercicio.id === item.ejercicio_id
            ) ?? null,
        }));

      setEjercicios(ejerciciosCompletos);

      const valoresIniciales: Record<number, SerieRealizada[]> = {};

      ejerciciosCompletos.forEach((item) => {
        valoresIniciales[item.id] = Array.from(
          { length: item.series },
          () => ({
            repeticiones: item.repeticiones,
            peso: item.peso !== null ? String(item.peso) : "",
          })
        );
      });

      setSeriesRealizadas(valoresIniciales);
      const completadasIniciales: Record<number, boolean[]> = {};

ejerciciosCompletos.forEach((item) => {
  completadasIniciales[item.id] = Array(item.series).fill(false);
});

setSeriesCompletadas(completadasIniciales);
        const { data: entrenamientoActivo } = await supabase
        .from("entrenamiento_sesiones")
        .select("id, started_at, comentario")
        .eq("alumno_id", alumno.id)
        .eq("rutina_id", rutinaId)
        .eq("estado", "en_curso")
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (entrenamientoActivo) {
        setEntrenamientoId(entrenamientoActivo.id);
        setInicioEntrenamiento(entrenamientoActivo.started_at);
        setComentario(entrenamientoActivo.comentario ?? "");
      }
      setLoading(false);
    }

    if (rutinaId) {
      cargarDatos();
    }
  }, [rutinaId, router]);
  useEffect(() => {
  if (!entrenamientoId) {
    setSegundosEntrenamiento(0);
    return;
  }

  const intervalo = setInterval(() => {
if (inicioEntrenamiento) {
  const inicio = new Date(inicioEntrenamiento).getTime();
  const ahora = Date.now();

  setSegundosEntrenamiento(
    Math.max(0, Math.floor((ahora - inicio) / 1000))
  );
}
  }, 1000);

  return () => clearInterval(intervalo);
}, [entrenamientoId, inicioEntrenamiento]);

useEffect(() => {
    if (!entrenamientoId) return;

    if (segundosEntrenamiento >= 9900 && !avisoTresHoras) {
      setAvisoTresHoras(true);
    }

    if (segundosEntrenamiento >= 10800 && !finalizando) {
      finalizarEntrenamiento();
    }
  }, [
    segundosEntrenamiento,
    entrenamientoId,
    avisoTresHoras,
    finalizando,
  ]);  function cambiarSerie(
    rutinaEjercicioId: number,
    numeroSerie: number,
    campo: "repeticiones" | "peso",
    valor: string
  ) {
    setSeriesRealizadas((actual) => {
      const nuevas = { ...actual };

      const series = [...(nuevas[rutinaEjercicioId] ?? [])];

      series[numeroSerie] = {
        ...series[numeroSerie],
        [campo]:
          campo === "repeticiones" ? Number(valor) : valor,
      };

      nuevas[rutinaEjercicioId] = series;

      return nuevas;
    });
  }
function completarEjercicio(rutinaEjercicioId: number) {
  setSeriesCompletadas((actual) => {
    const nuevas = { ...actual };

    const cantidadSeries =
      seriesRealizadas[rutinaEjercicioId]?.length ?? 0;

    nuevas[rutinaEjercicioId] = Array(cantidadSeries).fill(true);

    return nuevas;
  });
}

  async function iniciarEntrenamiento() {
    if (iniciando || entrenamientoId) return;
    if (!alumnoId) {
      setMensaje("No se encontró el alumno.");
      return;
    }

    setIniciando(true);
    setMensaje("");

    const supabase = createClient();

const { data: sesionCreada, error: insertError } = await supabase
  .from("entrenamiento_sesiones")
  .insert({
    alumno_id: alumnoId,
    rutina_id: rutinaId,
    estado: "en_curso",
  })
  .select("id, started_at")
  .single();

    if (insertError) {
      console.error(insertError);

      setMensaje(
        `No se pudo iniciar el entrenamiento: ${insertError.message}`
      );

      setIniciando(false);
      return;
    }

    const { data: sesion, error: sesionError } = await supabase
      .from("entrenamiento_sesiones")
.select("id, started_at")   
      .eq("alumno_id", alumnoId)
      .eq("rutina_id", rutinaId)
      .eq("estado", "en_curso")
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sesionError || !sesion) {
      console.error(sesionError);

      setMensaje(
        sesionError
          ? `El entrenamiento se creó, pero no se pudo recuperar: ${sesionError.message}`
          : "El entrenamiento se creó, pero no se pudo recuperar su ID."
      );

      setIniciando(false);
      return;
    }

    setEntrenamientoId(sesion.id);
    setInicioEntrenamiento(sesion.started_at);
    setMensaje("Entrenamiento iniciado correctamente.");
    setIniciando(false);
  }

  async function finalizarEntrenamiento() {
    if (!entrenamientoId) return;

    setFinalizando(true);
    setMensaje("");

    const supabase = createClient();

    for (const ejercicio of ejercicios) {
      const series = seriesRealizadas[ejercicio.id] ?? [];

      for (let i = 0; i < series.length; i++) {
        const serie = series[i];

        const { error } = await supabase
          .from("entrenamiento_series")
          .insert({
            entrenamiento_id: entrenamientoId,
            rutina_ejercicio_id: ejercicio.id,
            serie_numero: i + 1,
            repeticiones: Number(serie.repeticiones),
            peso:
              serie.peso === "" ? null : Number(serie.peso),
completada:
  seriesCompletadas[ejercicio.id]?.[i] ?? false,
          });

        if (error) {
          console.error(error);

          setMensaje(
            `No se pudieron guardar las series: ${error.message}`
          );

          setFinalizando(false);
          return;
        }
      }
    }

    const { error: finalizarError } = await supabase
      .from("entrenamiento_sesiones")
      .update({
        estado: "finalizado",
        finished_at: new Date().toISOString(),
        comentario: comentario || null,
      })
      .eq("id", entrenamientoId);

    if (finalizarError) {
      console.error(finalizarError);

      setMensaje(
        `No se pudo finalizar el entrenamiento: ${finalizarError.message}`
      );

      setFinalizando(false);
      return;
    }

    setFinalizando(false);
    setMensaje("Entrenamiento finalizado correctamente.");

    setTimeout(() => {
      router.push(`/alumno/rutina/${rutinaId}`);
    }, 1200);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white p-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-neutral-400">
            Cargando entrenamiento...
          </p>
        </div>
      </main>
    );
  }

  if (!rutina) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white p-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-red-400">
            {mensaje || "No se encontró la rutina."}
          </p>

          <button
            onClick={() =>
              router.push(`/alumno/rutina/${rutinaId}`)
            }
            className="mt-6 bg-neutral-800 hover:bg-neutral-700 rounded-lg px-5 py-3"
          >
            ← Volver
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <p className="text-emerald-500 font-bold tracking-widest">
          
          SF TRAINING
        </p>

        <h1 className="text-4xl font-bold mt-2">
          {rutina.nombre}
        </h1>

        <p className="text-emerald-400 mt-2">
          {rutina.tipo}
        </p>

        <div className="mt-6">
          {!entrenamientoId ? (
            <button
              onClick={iniciarEntrenamiento}
              disabled={iniciando || !alumnoId}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg px-6 py-3 font-bold"
            >
              {iniciando
                ? "Iniciando..."
                : "▶ Iniciar entrenamiento"}
            </button>
          ) : (
            <div className="bg-emerald-900/30 border border-emerald-700 rounded-xl p-4">
<div className="text-emerald-400 font-bold"></div>
                Entrenamiento en curso
                <div className="text-emerald-400 text-2xl font-bold mt-3">
  {Math.floor(segundosEntrenamiento / 60)
    .toString()
    .padStart(2, "0")}
  :
  {(segundosEntrenamiento % 60)
    .toString()
    .padStart(2, "0")}
</div>


              <p className="text-neutral-300 text-sm mt-1">
                Registrá lo que realizaste en cada serie.
              </p>
                {avisoTresHoras && (
                  <div className="mt-4 bg-yellow-900/30 border border-yellow-700 rounded-lg p-3">
                    <p className="text-yellow-300 font-semibold">
                      ⚠️ Llevás 2 h 45 min entrenando.
                    </p>
                    <p className="text-yellow-200 text-sm mt-1">
                      El entrenamiento se finalizará automáticamente al cumplir 3 horas.
                    </p>
                  </div>
                )}
            </div>
          )}
        </div>

        {mensaje && (
          <div className="mt-6 bg-neutral-900 border border-neutral-700 rounded-xl p-4">
            <p className="text-emerald-400">
              {mensaje}
            </p>
          </div>
        )}

        <section className="mt-10 grid gap-6">
          {ejercicios.map((ejercicio, ejercicioIndex) => (
            <div
              key={ejercicio.id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
            >
              <p className="text-emerald-500 font-bold">
                Ejercicio {ejercicioIndex + 1}
              </p>

              <h2 className="text-2xl font-bold mt-1">
                {ejercicio.ejercicio?.nombre ??
                  "Ejercicio"}
              </h2>

              {ejercicio.ejercicio && (
                <p className="text-neutral-400 mt-1">
                  {ejercicio.ejercicio.grupo_muscular}
                </p>
              )}
{ejercicio.ejercicio?.imagen_url && (
  <details className="mt-4">
    <summary className="cursor-pointer text-emerald-500 font-semibold">
      🖼️ Ver imagen
    </summary>

    <img
      src={ejercicio.ejercicio.imagen_url}
      alt={`Demostración de ${ejercicio.ejercicio.nombre}`}
      className="mt-3 w-full max-w-md rounded-xl border border-neutral-700"
    />
  </details>
)}

{ejercicio.ejercicio?.video_url && (
  <details className="mt-4">
    <summary className="cursor-pointer text-emerald-500 font-semibold">
      ▶ Ver demostración
    </summary>

    <div className="mt-3 w-full max-w-2xl aspect-video">
      <iframe
        src={ejercicio.ejercicio.video_url.replace(
          "watch?v=",
          "embed/"
        )}
        title={`Video de ${ejercicio.ejercicio.nombre}`}
        className="w-full h-full rounded-xl border border-neutral-700"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  </details>
)}
              <div className="mt-6 space-y-4">
                {(seriesRealizadas[ejercicio.id] ?? []).map(
                  (serie, serieIndex) => (
                    <div
                      key={serieIndex}
                      className="bg-neutral-800 rounded-lg p-4"
                    >
                      <p className="font-bold mb-3">
                        Serie {serieIndex + 1}
                      </p>
                      {ejercicio.notas_series?.[serieIndex] && (
  <p className="text-emerald-400 text-sm mb-4">
    {ejercicio.notas_series[serieIndex]}
  </p>
)}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-neutral-400 mb-1">
                            Repeticiones
                          </label>

<input
  type="number"
  value={serie.repeticiones}
  disabled
  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 opacity-70"
 />

                        </div>

                        <div>
                          <label className="block text-sm text-neutral-400 mb-1">
                            Peso (kg)
                          </label>

<input
  type="number"
  value={serie.peso}
  disabled
  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 opacity-70"
/>
                        </div>

                      </div>
                    </div>
                  )
                )}
              </div>
{entrenamientoId && (
  <button
    type="button"
    onClick={() => completarEjercicio(ejercicio.id)}
    className="mt-4 w-full rounded-lg px-4 py-3 font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
  >
    {seriesCompletadas[ejercicio.id]?.every(Boolean)
      ? "✓ Ejercicio completado"
      : "Marcar ejercicio como completado"}
  </button>
)}
              <div className="mt-5 bg-neutral-800 rounded-lg p-4">
                <p className="text-neutral-400 text-sm">
                  Descanso
                </p>

                <p className="text-xl font-bold">
                  {ejercicio.descanso} segundos
                </p>
              </div>
            </div>
          ))}
        </section>

        {entrenamientoId && (
          <section className="mt-10">
            <label className="block text-lg font-bold mb-2">
              ¿Cómo te sentiste?
            </label>

            <textarea
              value={comentario}
              onChange={(e) =>
                setComentario(e.target.value)
              }
              placeholder="Contale a Sofi cómo te sentiste durante el entrenamiento..."
              className="w-full min-h-32 bg-neutral-900 border border-neutral-700 rounded-xl p-4"
            />

            <button
              onClick={finalizarEntrenamiento}
              disabled={finalizando}
              className="mt-5 w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg px-6 py-4 font-bold text-lg"
            >
              {finalizando
                ? "Guardando entrenamiento..."
                : "✓ Finalizar entrenamiento"}
            </button>
          </section>
        )}

        <button
          onClick={() =>
            router.push(`/alumno/rutina/${rutinaId}`)
          }
          className="mt-6 bg-neutral-800 hover:bg-neutral-700 rounded-lg px-5 py-3"
        >
          ← Volver a la rutina
        </button>
      </div>
    </main>
  );
}