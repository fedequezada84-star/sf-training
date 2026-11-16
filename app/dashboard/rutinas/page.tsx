"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../utils/supbase/client";

type Rutina = {
  id: number;
  alumno_id: number;
  nombre: string;
  tipo: string;
  descripcion: string | null;
  semana: number;
  dia: number;
  en_repositorio: boolean;
  created_at: string;
};

type Alumno = {
  id: number;
  nombre: string;
};

export default function RepositorioRutinas() {
  const [rutinas, setRutinas] = useState<Rutina[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarDatos() {
      const supabase = createClient();

      const { data: rutinasData, error: rutinasError } = await supabase
        .from("rutinas")
        .select(
          "id, alumno_id, nombre, tipo, descripcion, semana, dia, en_repositorio, created_at"
        )
        .eq("en_repositorio", true)
        .order("created_at", { ascending: false });

      if (rutinasError) {
        console.error(rutinasError);
        setLoading(false);
        return;
      }

      const { data: alumnosData, error: alumnosError } = await supabase
        .from("alumnos")
        .select("id, nombre");

      if (alumnosError) {
        console.error(alumnosError);
      }

      setRutinas(rutinasData ?? []);
      setAlumnos(alumnosData ?? []);
      setLoading(false);
    }

    cargarDatos();
  }, []);

  function obtenerNombreAlumno(alumnoId: number) {
    return alumnos.find((alumno) => alumno.id === alumnoId)?.nombre ?? "Alumno";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-neutral-400">Cargando repositorio...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-emerald-500 font-bold tracking-[0.25em]">
          SF TRAINING
        </p>

        <h1 className="text-4xl font-bold mt-2">
          Repositorio de rutinas
        </h1>

        <p className="text-neutral-400 mt-2">
          Rutinas que Sofi decidió conservar para reutilizarlas.
        </p>

        <div className="mt-8">
          {rutinas.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center">
              <p className="text-neutral-300">
                Todavía no hay rutinas en el repositorio.
              </p>

              <p className="text-neutral-500 mt-2">
                Sofi podrá guardar una rutina aquí cuando decida reutilizarla.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {rutinas.map((rutina) => (
                <div
                  key={rutina.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6"
                >
                  <h2 className="text-xl font-bold">{rutina.nombre}</h2>

                  <p className="text-emerald-500 mt-1">{rutina.tipo}</p>

                  <p className="text-neutral-400 mt-2">
                    Alumno de origen:{" "}
                    {obtenerNombreAlumno(rutina.alumno_id)}
                  </p>

                  <p className="text-neutral-400 text-sm mt-1">
                    Semana {rutina.semana} · Día {rutina.dia}
                  </p>

                  {rutina.descripcion && (
                    <p className="text-neutral-400 mt-3">
                      {rutina.descripcion}
                    </p>
                  )}

                  <div className="mt-5">
                    <Link
                      href={`/dashboard/alumnos/${rutina.alumno_id}/rutina/${rutina.id}`}
                      className="inline-block bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl px-5 py-3 font-semibold"
                    >
                      Ver rutina
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}