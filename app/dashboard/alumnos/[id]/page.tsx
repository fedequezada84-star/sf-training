"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "../../../utils/supbase/client";

type Alumno = {
  id: number;
  nombre: string;
  email: string;
  created_at: string;
};

export default function PerfilAlumno() {
  const params = useParams();
  const id = params.id as string;

  const [alumno, setAlumno] = useState<Alumno | null>(null);
  const [loading, setLoading] = useState(true);
  const [rutinasCount, setRutinasCount] = useState(0);
  const [entrenamientosCount, setEntrenamientosCount] = useState(0);

  useEffect(() => {
    async function cargarAlumno() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("alumnos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setAlumno(data);

      const { count: rutinas, error: rutinasError } = await supabase
        .from("rutinas")
        .select("*", { count: "exact", head: true })
        .eq("alumno_id", Number(id));

      if (!rutinasError) {
        setRutinasCount(rutinas ?? 0);
      }

      const {
        count: entrenamientos,
        error: entrenamientosError,
      } = await supabase
        .from("entrenamiento_sesiones")
        .select("*", { count: "exact", head: true })
        .eq("alumno_id", Number(id));

      if (!entrenamientosError) {
        setEntrenamientosCount(entrenamientos ?? 0);
      }

      setLoading(false);
    }

    cargarAlumno();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <p className="text-neutral-400">Cargando perfil...</p>
      </main>
    );
  }

  if (!alumno) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <p className="text-red-400">No se encontró el alumno.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-5xl mx-auto">

        <p className="text-emerald-500 font-bold tracking-[0.25em]">
          SF TRAINING
        </p>

        <h1 className="text-4xl font-bold mt-2">
          Perfil del alumno
        </h1>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mt-8">

          <h2 className="text-2xl font-bold">
            {alumno.nombre}
          </h2>

          <p className="text-neutral-400 mt-2">
            {alumno.email}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">

            <div className="bg-neutral-800 rounded-xl p-5">
              <p className="text-neutral-400 text-sm">
                Rutinas
              </p>

              <p className="text-3xl font-bold mt-2">
                {rutinasCount}
              </p>
            </div>

            <div className="bg-neutral-800 rounded-xl p-5">
              <p className="text-neutral-400 text-sm">
                Entrenamientos
              </p>

              <p className="text-3xl font-bold mt-2">
                {entrenamientosCount}
              </p>
            </div>

            <div className="bg-neutral-800 rounded-xl p-5">
              <p className="text-neutral-400 text-sm">
                Progreso
              </p>

              <p className="text-3xl font-bold mt-2">
                —
              </p>
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

          <a
            href={`/dashboard/alumnos/${alumno.id}/rutinas`}
            className="bg-emerald-600 hover:bg-emerald-500 rounded-xl p-5 font-semibold text-center"
          >
            Crear rutina
          </a>

          <a
            href={`/dashboard/alumnos/${alumno.id}/rutinas-lista`}
            className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl p-5 font-semibold text-center"
          >
            Ver rutinas
          </a>

          <a
            href={`/dashboard/alumnos/${alumno.id}/progreso`}
            className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl p-5 font-semibold text-center"
          >
            Ver progreso
          </a>

        </div>

      </div>
    </main>
  );
}