"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "../../../../../../../utils/supbase/client";

export default function EditarEjercicio() {
  const params = useParams();
  const router = useRouter();

  const alumnoId = params.id as string;
  const rutinaId = params.rutinaId as string;
  const ejercicioId = params.ejercicioId as string;

  const [nombreEjercicio, setNombreEjercicio] = useState("");

  const [series, setSeries] = useState("");
  const [repeticiones, setRepeticiones] = useState("");
  const [peso, setPeso] = useState("");
  const [descanso, setDescanso] = useState("");
  const [notas, setNotas] = useState("");
  const [notasSeries, setNotasSeries] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarEjercicio() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("rutina_ejercicios")
        .select(
          `
          id,
          series,
          repeticiones,
          peso,
          descanso,
notas,
notas_series,
notas_series,
          ejercicio_id
          `
        )
        .eq("id", Number(ejercicioId))
        .eq("rutina_id", Number(rutinaId))
        .single();

      if (error) {
        console.error(error);
        setMensaje("No se pudo cargar el ejercicio.");
        setLoading(false);
        return;
      }

      setSeries(String(data.series ?? ""));
      setRepeticiones(String(data.repeticiones ?? ""));
      setPeso(data.peso !== null ? String(data.peso) : "");
      setDescanso(String(data.descanso ?? ""));
      setNotas(data.notas ?? "");
      setNotasSeries(
  Array.isArray(data.notas_series) ? data.notas_series : []
);
      

      const { data: ejercicio, error: ejercicioError } = await supabase
        .from("ejercicios")
        .select("nombre")
        .eq("id", data.ejercicio_id)
        .single();

      if (!ejercicioError && ejercicio) {
        setNombreEjercicio(ejercicio.nombre);
      }

      setLoading(false);
    }

    cargarEjercicio();
  }, [ejercicioId, rutinaId]);

  async function guardarCambios(e: React.FormEvent) {
    e.preventDefault();

    setGuardando(true);
    setMensaje("");

    const supabase = createClient();

    const { error } = await supabase
      .from("rutina_ejercicios")
      .update({
        series: Number(series),
        repeticiones: Number(repeticiones),
        peso: peso ? Number(peso) : null,
        descanso: Number(descanso),
notas: notas.trim() || null,
notas_series: notasSeries.map((nota) => nota.trim()),
      })
      .eq("id", Number(ejercicioId))
      .eq("rutina_id", Number(rutinaId));

    if (error) {
      console.error(error);
      setMensaje("No se pudieron guardar los cambios.");
      setGuardando(false);
      return;
    }

router.push(`/dashboard/alumnos/${alumnoId}/rutina/${rutinaId}`);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white p-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-neutral-400">
            Cargando ejercicio...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-3xl mx-auto">

        <p className="text-emerald-500 font-bold tracking-[0.25em]">
          SF TRAINING
        </p>

        <h1 className="text-4xl font-bold mt-2">
          Editar ejercicio
        </h1>

        <p className="text-neutral-400 mt-2">
          Modificá los parámetros de este ejercicio.
        </p>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mt-8">

          <div className="mb-7">
            <p className="text-neutral-400 text-sm">
              Ejercicio
            </p>

            <h2 className="text-2xl font-bold mt-1">
              {nombreEjercicio}
            </h2>
          </div>

          <form onSubmit={guardarCambios}>

            <div className="grid grid-cols-2 gap-5">

              <div>
                <label className="block text-sm mb-2">
                  Series
                </label>

                <input
                  type="number"
                  min="1"
                  value={series}
                  onChange={(e) => setSeries(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-4"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">
                  Repeticiones
                </label>

                <input
                  type="number"
                  min="1"
                  value={repeticiones}
                  onChange={(e) => setRepeticiones(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-4"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">
                  Peso (kg)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  placeholder="Ej: 20"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-4"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">
                  Descanso (segundos)
                </label>

                <input
                  type="number"
                  min="0"
                  value={descanso}
                  onChange={(e) => setDescanso(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-4"
                />
              </div>

            </div>

            <div className="mt-5">

              <label className="block text-sm mb-2">
                Notas
              </label>

<textarea
  value={notas}
  onChange={(e) => setNotas(e.target.value)}
  placeholder="Ej: controlar la bajada y mantener los hombros estables"
  rows={5}
  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3"
/>

<div className="mt-6">
  <label className="block text-sm mb-2">
    Indicaciones por serie (opcional)
  </label>

  {Array.from({ length: Number(series) || 1 }, (_, index) => (
    <input
      key={index}
      type="text"
      value={notasSeries[index] ?? ""}
      onChange={(e) => {
        const nuevas = [...notasSeries];
        nuevas[index] = e.target.value;
        setNotasSeries(nuevas);
      }}
      placeholder={`Serie ${index + 1}: indicación opcional`}
      className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 mb-3"
    />
  ))}
</div>

            </div>

            {mensaje && (
              <p className="text-red-400 mt-5">
                {mensaje}
              </p>
            )}

            <button
              type="submit"
              disabled={guardando}
              className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl py-4 font-semibold"
            >
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>

          </form>

          <button
            onClick={() =>
              router.push(
                `/dashboard/alumnos/${alumnoId}/rutina/${rutinaId}`
              )
            }
            className="w-full mt-3 text-neutral-400 hover:text-white py-3"
          >
            ← Cancelar
          </button>

        </div>

      </div>
    </main>
  );
}