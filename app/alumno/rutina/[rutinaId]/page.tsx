"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

type Rutina = {
  id: number;
  nombre: string;
  tipo: string;
  descripcion: string | null;
};


type Ejercicio = {
  id: number;
  nombre: string;
  grupo_muscular: string;
  tipo: string;

  musculo_principal: string | null;
  musculos_secundarios: string | null;
  imagen_musculos_url: string | null;
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
  ejercicio: Ejercicio | null;

};

function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

export default function RutinaAlumno() {
  const params = useParams();
  const router = useRouter();

  const rutinaId = Number(params.rutinaId);

  const [rutina, setRutina] = useState<Rutina | null>(null);
  const [ejercicios, setEjercicios] = useState<RutinaEjercicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarRutina() {
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

      const { data: rutinaData, error: rutinaError } = await supabase
        .from("rutinas")
        .select("id, nombre, tipo, descripcion")
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
            "id, ejercicio_id, series, repeticiones, peso, descanso, orden, notas"
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
.select("id, nombre, grupo_muscular, tipo, video_url, imagen_url, musculo_principal, musculos_secundarios, imagen_musculos_url")
          .in("id", ejercicioIds);

      if (ejerciciosDataError) {
        console.error(ejerciciosDataError);
        setMensaje("No se pudieron cargar los datos de los ejercicios.");
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
      setLoading(false);
    }

    if (rutinaId) {
      cargarRutina();
    }
  }, [rutinaId, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white p-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-neutral-400">Cargando rutina...</p>
        </div>
      </main>
    );
  }

  if (!rutina) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white p-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-red-400">
            {mensaje || "Rutina no encontrada."}
          </p>

          <button
            onClick={() => router.push("/alumno")}
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

        {rutina.descripcion && (
          <p className="text-neutral-400 mt-3">
            {rutina.descripcion}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => router.push("/alumno")}
            className="bg-neutral-800 hover:bg-neutral-700 rounded-lg px-5 py-3"
          >
            ← Volver a mis rutinas
          </button>

          {ejercicios.length > 0 && (
            <button
              onClick={() =>
                router.push(`/alumno/rutina/${rutinaId}/entrenar`)
              }
              className="bg-emerald-600 hover:bg-emerald-500 rounded-lg px-5 py-3 font-bold"
            >
▶ Ver entrenamiento
            </button>
          )}
        </div>

        <section className="mt-10">
          <h2 className="text-2xl font-bold mb-5">
            Ejercicios
          </h2>

          {ejercicios.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <p className="text-neutral-400">
                Esta rutina todavía no tiene ejercicios.
              </p>
            </div>
          ) : (
            <div className="grid gap-5">
              {ejercicios.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
                >
                  <p className="text-emerald-500 font-bold">
                    Ejercicio {index + 1}
                  </p>

                  <h3 className="text-2xl font-bold mt-1">
                    {item.ejercicio?.nombre ?? "Ejercicio"}
                  </h3>

{item.ejercicio && (
  <div className="mt-4">
    <p className="text-neutral-400">
      {item.ejercicio.grupo_muscular} · {item.ejercicio.tipo}
      
    </p>
{item.ejercicio.musculo_principal && (
  <p className="text-neutral-300 text-sm mt-2">
    <strong>Músculo principal:</strong>{" "}
    {item.ejercicio.musculo_principal}
  </p>
)}

{item.ejercicio.musculos_secundarios && (
  <p className="text-neutral-400 text-sm mt-1">
    <strong>Músculos secundarios:</strong>{" "}
    {item.ejercicio.musculos_secundarios}
  </p>
)}

  </div>
)}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-neutral-800 rounded-lg p-4">
                      <p className="text-neutral-400 text-sm">
                        Series
                      </p>
                      <p className="text-xl font-bold">
                        {item.series}
                      </p>
                    </div>

                    <div className="bg-neutral-800 rounded-lg p-4">
                      <p className="text-neutral-400 text-sm">
                        Repeticiones
                      </p>
                      <p className="text-xl font-bold">
                        {item.repeticiones}
                      </p>
                    </div>

                    <div className="bg-neutral-800 rounded-lg p-4">
                      <p className="text-neutral-400 text-sm">
                        Peso
                      </p>
                      <p className="text-xl font-bold">
                        {item.peso !== null
                          ? `${item.peso} kg`
                          : "—"}
                      </p>
                    </div>

                    <div className="bg-neutral-800 rounded-lg p-4">
                      <p className="text-neutral-400 text-sm">
                        Descanso
                      </p>
                      <p className="text-xl font-bold">
                        {item.descanso} s
                      </p>
                    </div>
                  </div>

                  {item.notas && (
                    <div className="mt-5">
                      <p className="text-neutral-400 text-sm">
                        Indicaciones
                      </p>
                      <p className="mt-1">
                        {item.notas}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}