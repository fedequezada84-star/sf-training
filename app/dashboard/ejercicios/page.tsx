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

export default function Ejercicios() {
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarEjercicios() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("ejercicios")
        .select("*")
        .order("nombre", { ascending: true });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setEjercicios(data ?? []);
      setLoading(false);
    }

    cargarEjercicios();
  }, []);

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

            {ejercicios.map((ejercicio) => (
              <div
                key={ejercicio.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6"
              >
                <div className="flex items-start justify-between gap-4">

                  <div>
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

{ejercicio.imagen_url && (
  <div className="mt-4">
    <p className="text-sm text-neutral-400 mb-2">
      Imagen del ejercicio
    </p>
    <img
      src={ejercicio.imagen_url}
      alt={`Demostración de ${ejercicio.nombre}`}
      className="w-full max-w-md rounded-xl border border-neutral-800"
    />
  </div>
)}
                     <div className="text-xs text-neutral-500 mt-4 space-y-1">
              <p>
                Creado:{" "}
                {new Date(ejercicio.created_at).toLocaleString("es-AR")}
              </p>
              <p>
                Última actualización:{" "}
                {new Date(ejercicio.updated_at).toLocaleString("es-AR")}
              </p>
            </div>
                  </div>

  <button
              type="button"
              onClick={() =>
                (window.location.href = `/dashboard/ejercicios/nuevo?id=${ejercicio.id}`)
              }
              className="mt-4 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg"
            >
              Editar ejercicio
            </button>
                  {ejercicio.video_url && (
                    <a
                      href={ejercicio.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-500 font-semibold"
                    >
                      Ver video
                    </a>
                  )}
                   {ejercicio.imagen_musculos_url && (
              <div className="mt-4">
                <p className="text-sm text-neutral-400 mb-2">
                  Músculos trabajados
                </p>
                <img
                  src={ejercicio.imagen_musculos_url}
                  alt={`Músculos trabajados en ${ejercicio.nombre}`}
                  className="w-full max-w-md rounded-xl border border-neutral-800"
                />
              </div>
            )}

                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </main>
  );
}