"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "../../../../utils/supbase/client";

type Rutina = {
  id: number;
  nombre: string;
  tipo: string;
  descripcion: string | null;
};

export default function RutinaDetalle() {
  const params = useParams();
  const router = useRouter();

  const alumnoId = params.id as string;

  const [rutinas, setRutinas] = useState<Rutina[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarRutinas() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("rutinas")
        .select("id, nombre, tipo, descripcion")
        .eq("alumno_id", Number(alumnoId))
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setRutinas(data ?? []);
      setLoading(false);
    }

    cargarRutinas();
  }, [alumnoId]);

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-5xl mx-auto">

        <p className="text-emerald-500 font-bold tracking-[0.25em]">
          SF TRAINING
        </p>

        <h1 className="text-4xl font-bold mt-2">
          Rutinas del alumno
        </h1>

        <button
          onClick={() => router.back()}
          className="mt-6 text-neutral-400 hover:text-white"
        >
          ← Volver
        </button>

        {loading ? (
          <p className="text-neutral-400 mt-8">
            Cargando...
          </p>
        ) : rutinas.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 mt-8">
            <p className="text-neutral-400">
              Este alumno todavía no tiene rutinas.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 mt-8">

            {rutinas.map((rutina) => (
              <div
                key={rutina.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6"
              >

                <h2 className="text-2xl font-bold">
                  {rutina.nombre}
                </h2>

                <p className="text-emerald-500 mt-2">
                  {rutina.tipo}
                </p>

                {rutina.descripcion && (
                  <p className="text-neutral-400 mt-4">
                    {rutina.descripcion}
                  </p>
                )}

                <div className="mt-6">
                  <button
                    className="bg-emerald-600 hover:bg-emerald-500 rounded-xl px-5 py-3 font-semibold"
                  >
                    Agregar ejercicios
                  </button>
                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </main>
  );
}