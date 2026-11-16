"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "../../../../utils/supbase/client";

type Rutina = {
  id: number;
  nombre: string;
  tipo: string;
  plan_id: number | null;
  planes_entrenamiento?:
    | { nombre: string }[]
    | { nombre: string }
    | null;
  descripcion: string | null;
  semana: number;
  dia: number;
};

export default function RutinasLista() {
  const params = useParams();
  const router = useRouter();

  const alumnoId = params.id as string;

  const [rutinas, setRutinas] = useState<Rutina[]>([]);
const [planNombre, setPlanNombre] = useState<string | null>(null);
const [alumnoNombre, setAlumnoNombre] = useState<string | null>(null);
  const [semanaActual, setSemanaActual] = useState(1);
  const [esEntrenadora, setEsEntrenadora] = useState(false);
  const [loading, setLoading] = useState(true);

  async function cargarPlan() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: perfil } = await supabase
      .from("perfiles")
      .select("es_entrenadora")
      .eq("user_id", user?.id)
      .maybeSingle();

    setEsEntrenadora(perfil?.es_entrenadora === true);

const { data: alumno } = await supabase
  .from("alumnos")
  .select("nombre")
  .eq("id", Number(alumnoId))
  .maybeSingle();

setAlumnoNombre(alumno?.nombre ?? null);

const { data, error } = await supabase
      .from("planes_entrenamiento")
      .select("nombre, semana_actual")
      .eq("alumno_id", Number(alumnoId))
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(error);
      return;
    }

    setPlanNombre(data?.nombre ?? null);
    setSemanaActual(data?.semana_actual ?? 1);
  }

  useEffect(() => {
    async function cargarRutinas() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("rutinas")
        .select(
     "id, nombre, tipo, descripcion, plan_id, semana, dia"
        )
        .eq("alumno_id", Number(alumnoId))
        .order("semana", { ascending: true })
        .order("dia", { ascending: true });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setRutinas(data ?? []);
      setLoading(false);
    }

    cargarRutinas();
    cargarPlan();
  }, [alumnoId]);

  async function pasarSemana() {
    const supabase = createClient();
    const nuevaSemana = semanaActual + 1;

    const { error } = await supabase
      .from("planes_entrenamiento")
      .update({ semana_actual: nuevaSemana })
      .eq("alumno_id", Number(alumnoId))
      .eq("estado", "activo");

    if (error) {
      console.error(error);
      alert("No se pudo avanzar de semana.");
      return;
    }

    setSemanaActual(nuevaSemana);
  }
   async function mantenerRutina() {
    const supabase = createClient();
    const nuevaSemana = semanaActual + 1;

    const { data: rutinasActuales, error: errorRutinas } = await supabase
      .from("rutinas")
      .select("id, nombre, tipo, plan_id, descripcion, dia")
      .eq("alumno_id", Number(alumnoId))
      .eq("semana", semanaActual)
      .order("dia", { ascending: true });

    if (errorRutinas) {
      console.error(errorRutinas);
      alert("No se pudo leer la rutina actual.");
      return;
    }

    if (!rutinasActuales || rutinasActuales.length === 0) {
      alert("No hay rutinas para mantener en esta semana.");
      return;
    }

    const { data: rutinasSiguiente, error: errorSiguiente } = await supabase
      .from("rutinas")
      .select("id")
      .eq("alumno_id", Number(alumnoId))
      .eq("semana", nuevaSemana);

    if (errorSiguiente) {
      console.error(errorSiguiente);
      alert("No se pudo comprobar la próxima semana.");
      return;
    }

    if (rutinasSiguiente && rutinasSiguiente.length > 0) {
      alert(`La Semana ${nuevaSemana} ya tiene rutinas cargadas.`);
      return;
    }

    for (const rutinaActual of rutinasActuales) {
      const { data: nuevaRutina, error: errorNuevaRutina } =
        await supabase
          .from("rutinas")
          .insert({
            alumno_id: Number(alumnoId),
            nombre: rutinaActual.nombre,
            tipo: rutinaActual.tipo,
            plan_id: rutinaActual.plan_id,
            descripcion: rutinaActual.descripcion,
            semana: nuevaSemana,
            dia: rutinaActual.dia,
          })
          .select("id")
          .single();

      if (errorNuevaRutina || !nuevaRutina) {
        console.error(errorNuevaRutina);
        alert("No se pudo copiar una de las rutinas.");
        return;
      }

      const { data: ejerciciosActuales, error: errorEjercicios } =
        await supabase
          .from("rutina_ejercicios")
          .select(
            "ejercicio_id, series, repeticiones, peso, descanso, orden, notas, notas_series"
          )
          .eq("rutina_id", rutinaActual.id)
          .order("orden", { ascending: true });

      if (errorEjercicios) {
        console.error(errorEjercicios);
        alert("No se pudieron copiar los ejercicios.");
        return;
      }

      if (ejerciciosActuales && ejerciciosActuales.length > 0) {
        const ejerciciosParaCopiar = ejerciciosActuales.map((ejercicio) => ({
          rutina_id: nuevaRutina.id,
          ejercicio_id: ejercicio.ejercicio_id,
          series: ejercicio.series,
          repeticiones: ejercicio.repeticiones,
          peso: ejercicio.peso,
          descanso: ejercicio.descanso,
          orden: ejercicio.orden,
          notas: ejercicio.notas,
          notas_series: ejercicio.notas_series,
        }));

        const { error: errorInsertEjercicios } = await supabase
          .from("rutina_ejercicios")
          .insert(ejerciciosParaCopiar);

        if (errorInsertEjercicios) {
          console.error(errorInsertEjercicios);
          alert("No se pudieron copiar todos los ejercicios.");
          return;
        }
      }
    }

    setSemanaActual(nuevaSemana);
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <p className="text-emerald-500 font-bold tracking-[0.25em]">
          SF TRAINING
        </p>

        <h1 className="text-4xl font-bold mt-2">
Semana {semanaActual} {alumnoNombre ? `· ${alumnoNombre}` : ""}
        </h1>

        {planNombre && (
          <p className="text-emerald-400 font-semibold text-lg mt-2">
            Plan: {planNombre}
          </p>
        )}

        <p className="text-neutral-400 mt-2">
          Planificación semanal del alumno.
        </p>
    <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
          {Array.from(
            { length: Math.max(semanaActual, 1) },
            (_, index) => index + 1
          ).map((semana) => (
            <button
              key={semana}
              type="button"
              onClick={() => setSemanaActual(semana)}
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold ${
                semana === semanaActual
                  ? "bg-emerald-600 text-white"
                  : "bg-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              Semana {semana}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mt-8">
          {esEntrenadora && (
            <button
              type="button"
onClick={mantenerRutina}
              className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl px-5 py-3 font-semibold"
            >
              ✓ Mantener rutina
            </button>
          )}



          <button
            type="button"
            onClick={() =>
              router.push(`/dashboard/alumnos/${alumnoId}`)
            }
            className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl px-5 py-3 font-semibold"
          >
            ← Volver al perfil
          </button>
        </div>

        {loading ? (
          <div className="mt-8 text-neutral-400">
            Cargando planificación...
          </div>
        ) : (
          <div className="grid gap-4 mt-8">
            {Array.from({ length: 7 }, (_, index) => index + 1).map(
              (dia) => {
                const rutinaDia = rutinas.find(
                  (rutina) =>
                    rutina.semana === semanaActual &&
                    rutina.dia === dia
                );

                return (
                  <div
                    key={dia}
                    className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-emerald-500 font-semibold">
                          Día {dia}
                        </p>

                        {rutinaDia ? (
                          <>
                            <h2 className="text-xl font-bold mt-1">
                              {rutinaDia.nombre}
                            </h2>

                            <p className="text-neutral-400 mt-1">
                              {rutinaDia.tipo}
                            </p>

                            {rutinaDia.descripcion && (
                              <p className="text-neutral-500 text-sm mt-2">
                                {rutinaDia.descripcion}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-neutral-500 mt-2">
                            Sin planificar
                          </p>
                        )}
                      </div>

                      {rutinaDia ? (
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/dashboard/alumnos/${alumnoId}/rutina/${rutinaDia.id}`
                            )
                          }
                          className="text-emerald-500 hover:text-emerald-400 font-semibold"
                        >
                          Ver día →
                        </button>
                      ) : esEntrenadora ? (
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/dashboard/alumnos/${alumnoId}/rutinas?semana=${semanaActual}&dia=${dia}`
                            )
                          }
                          className="bg-emerald-600 hover:bg-emerald-500 rounded-xl px-5 py-3 font-semibold"
                        >
                          + Crear día
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              }
            )}
                      {esEntrenadora && (
              <button
                type="button"
                onClick={pasarSemana}
                className="mt-4 w-full text-sm text-neutral-400 hover:text-white py-2"
              >
                → Pasar a Semana {semanaActual + 1}
              </button>
            )}
             {esEntrenadora && semanaActual > 1 && (
            <button
              type="button"
              onClick={() => setSemanaActual(semanaActual - 1)}
              className="w-full text-sm text-neutral-400 hover:text-white py-2"
            >
              ← Volver a Semana {semanaActual - 1}
            </button>
          )}
          </div>
          
        )}
      </div>
    </main>
  );
}