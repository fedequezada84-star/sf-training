"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

type Historial = {
  id: number;
  rutina_id: number;
  alumno_id: number | null;
  version: number;
  nombre: string | null;
  tipo: string | null;
  descripcion: string | null;
  ejercicios: Array<{
    id?: number;
    ejercicio_id?: number;
    series?: number | null;
    repeticiones?: number | null;
    peso?: number | null;
    descanso?: number | null;
    orden?: number | null;
    notas?: string | null;
  }>;
  created_at: string;
};

export default function HistorialRutina() {
  const params = useParams();
  const router = useRouter();

  const rutinaId = params.rutinaId as string;

  const [historial, setHistorial] = useState<Historial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarHistorial() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: perfil, error: perfilError } = await supabase
        .from("perfiles")
        .select("rol")
        .eq("user_id", user.id)
        .maybeSingle();

      if (perfilError) {
        console.error(perfilError);
        setError("No se pudo verificar el perfil.");
        setLoading(false);
        return;
      }

      if (
        !perfil ||
        !["administrador", "entrenadora"].includes(perfil.rol)
      ) {
        router.push("/dashboard");
        return;
      }

      const { data, error: historialError } = await supabase
        .from("rutina_historial")
        .select(
          "id, rutina_id, alumno_id, version, nombre, tipo, descripcion, ejercicios, created_at"
        )
        .eq("rutina_id", Number(rutinaId))
        .order("version", { ascending: false });

      if (historialError) {
        console.error(historialError);
        setError("No se pudo cargar el historial.");
        setLoading(false);
        return;
      }

      setHistorial((data as Historial[]) ?? []);
      setLoading(false);
    }

    cargarHistorial();
  }, [rutinaId, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <p className="text-neutral-400">
            Cargando historial...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-12">

        <p className="text-emerald-500 font-bold tracking-[0.3em]">
          SF TRAINING
        </p>

        <h1 className="text-4xl font-bold mt-2">
          Historial de rutina
        </h1>

        <p className="text-neutral-400 mt-2">
          Versiones anteriores de esta rutina.
        </p>

        {error && (
          <div className="mt-6 rounded-xl border border-red-800 bg-red-950/30 p-4 text-red-400">
            {error}
          </div>
        )}

        {!error && historial.length === 0 && (
          <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-8">
            <p className="text-neutral-400">
              Todavía no hay versiones guardadas de esta rutina.
            </p>
          </div>
        )}

        <div className="mt-8 space-y-5">
          {historial.map((version) => (
            <div
              key={version.id}
              className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
            >

              <div className="flex items-start justify-between gap-4">

                <div>
                  <p className="text-emerald-500 font-semibold">
                    Versión {version.version}
                  </p>

                  <h2 className="text-2xl font-bold mt-1">
                    {version.nombre}
                  </h2>

                  <p className="text-neutral-400 mt-1">
                    {version.tipo}
                  </p>
                </div>

                <p className="text-sm text-neutral-500 whitespace-nowrap">
                  {new Date(version.created_at).toLocaleString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>

              </div>

              {version.descripcion && (
                <p className="text-neutral-400 mt-4">
                  {version.descripcion}
                </p>
              )}

              <div className="mt-6">

                <p className="text-sm text-neutral-500 mb-3">
                  {version.ejercicios.length}{" "}
                  {version.ejercicios.length === 1
                    ? "ejercicio"
                    : "ejercicios"}
                </p>

                {version.ejercicios.length > 0 ? (
                  <div className="space-y-3">

                    {version.ejercicios.map((ejercicio, index) => (
                      <div
                        key={ejercicio.id ?? index}
                        className="rounded-xl bg-neutral-800 p-4"
                      >

                        <p className="font-semibold">
                          Ejercicio {index + 1}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">

                          <div>
                            <span className="text-neutral-500">
                              Series
                            </span>
                            <p>{ejercicio.series ?? "-"}</p>
                          </div>

                          <div>
                            <span className="text-neutral-500">
                              Repeticiones
                            </span>
                            <p>{ejercicio.repeticiones ?? "-"}</p>
                          </div>

                          <div>
                            <span className="text-neutral-500">
                              Peso
                            </span>
                            <p>
                              {ejercicio.peso != null
                                ? `${ejercicio.peso} kg`
                                : "-"}
                            </p>
                          </div>

                          <div>
                            <span className="text-neutral-500">
                              Descanso
                            </span>
                            <p>
                              {ejercicio.descanso != null
                                ? `${ejercicio.descanso} s`
                                : "-"}
                            </p>
                          </div>

                        </div>

                        {ejercicio.notas && (
                          <p className="text-sm text-neutral-400 mt-3">
                            Notas: {ejercicio.notas}
                          </p>
                        )}

                      </div>
                    ))}

                  </div>
                ) : (
                  <p className="text-neutral-500">
                    Esta versión no tenía ejercicios.
                  </p>
                )}

              </div>

            </div>
          ))}
        </div>

        <button
          onClick={() =>
            router.push(
              `/dashboard/alumnos/${params.id}/rutina/${rutinaId}`
            )
          }
          className="mt-8 rounded-xl border border-neutral-700 bg-neutral-800 px-5 py-3 font-semibold hover:bg-neutral-700"
        >
          ← Volver a la rutina
        </button>

      </div>
    </main>
  );
}