"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../../../utils/supbase/client";

export default function CrearRutina() {
  const params = useParams();
  const router = useRouter();
const searchParams = useSearchParams();
  const alumnoId = params.id as string;

  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("Pesas");
  const [descripcion, setDescripcion] = useState("");
const [semana, setSemana] = useState(() => Number(searchParams.get("semana")) || 1);
const [dia, setDia] = useState(() => Number(searchParams.get("dia")) || 1);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  async function crearRutina(e: React.FormEvent) {
    e.preventDefault();

    if (!nombre.trim()) {
      setMensaje("Ingresá un nombre para la rutina.");
      return;
    }

    setGuardando(true);
    setMensaje("");

    const supabase = createClient();

    const { data: nuevaRutina, error } = await supabase
      .from("rutinas")
      .insert({
        nombre: nombre.trim(),
        alumno_id: Number(alumnoId),
        tipo,
        descripcion: descripcion.trim(),
        semana: semana,
dia: dia,
      })
      .select("id")
      .single();

    if (error || !nuevaRutina) {
      console.error(error);
      setMensaje("No se pudo guardar la rutina.");
      setGuardando(false);
      return;
    }

    setGuardando(false);

    router.push(
      `/dashboard/alumnos/${alumnoId}/rutina/${nuevaRutina.id}`
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-3xl mx-auto">

        <p className="text-emerald-500 font-bold tracking-[0.25em]">
          SF TRAINING
        </p>

<h1 className="text-4xl font-bold mt-2">
  Crear entrenamiento
</h1>
<p className="text-emerald-500 font-semibold mt-2">
  Semana {semana} · Día {dia}
</p>
        <p className="text-neutral-400 mt-2">
          Creá una nueva rutina para este alumno.
        </p>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mt-8">

          <form onSubmit={crearRutina}>

            <label className="block text-sm mb-2">
              Nombre de la rutina
            </label>

            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Rutina Piernas"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-4 mb-6 outline-none focus:border-emerald-500"
            />

            <label className="block text-sm mb-2">
              Tipo de rutina
            </label>

            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-4 mb-6 outline-none focus:border-emerald-500"
            >
              <option value="Pesas">Pesas</option>
              <option value="Funcional">Funcional</option>
              <option value="Core">Core</option>
              <option value="Pliometría">Pliometría</option>
            </select>

<div className="grid grid-cols-2 gap-4 mb-4">
  <div>
    <label className="block text-sm mb-2">
      Semana
    </label>
    <input
      type="number"
      min="1"
      value={semana}
      onChange={(e) => setSemana(Number(e.target.value))}
      className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-4"
    />
  </div>

  <div>
    <label className="block text-sm mb-2">
      Día
    </label>
    <input
      type="number"
      min="1"
      max="7"
      value={dia}
      onChange={(e) => setDia(Number(e.target.value))}
      className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-4"
    />
  </div>
</div>
            <label className="block text-sm mb-2">
              Descripción
            </label>

            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Objetivo o indicaciones de la rutina..."
              rows={5}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-4 mb-6 outline-none focus:border-emerald-500 resize-none"
            />

            {mensaje && (
              <p className="text-red-400 mb-4">
                {mensaje}
              </p>
            )}

            <button
              type="submit"
              disabled={guardando}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 font-semibold py-4 rounded-xl"
            >
              {guardando ? "Guardando..." : "Crear rutina"}
            </button>

          </form>

        </div>

        <button
          onClick={() => router.back()}
          className="mt-5 text-neutral-400 hover:text-white"
        >
          ← Volver al perfil
        </button>

      </div>
    </main>
  );
}