"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

type Alumno = {
  id: number;
  nombre: string;
  email: string;
};

type Rutina = {
  id: number;
  nombre: string;
  tipo: string;
  descripcion: string | null;
  semana: number;
  dia: number;
};

function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

export default function AlumnoHome() {
  const router = useRouter();
  const [alumno, setAlumno] = useState<Alumno | null>(null);
  const [rutinas, setRutinas] = useState<Rutina[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarDatos() {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMensaje("No hay una sesión activa.");
        setLoading(false);
        return;
      }

const { data: perfil } = await supabase
  .from("perfiles")
  .select("rol")
  .eq("user_id", user.id)
  .maybeSingle();

if (perfil?.rol === "administrador" || perfil?.rol === "entrenadora") {
  router.push("/dashboard");
  return;
}
      const { data: alumnoData, error: alumnoError } = await supabase
        .from("alumnos")
        .select("id, nombre, email")
        .eq("user_id", user.id)
        .single();

      if (alumnoError || !alumnoData) {
        setMensaje("No se encontró el perfil del alumno.");
        setLoading(false);
        return;
      }

      setAlumno(alumnoData);

      const { data: rutinasData, error: rutinasError } = await supabase
        .from("rutinas")
.select("id, nombre, tipo, descripcion, semana, dia")
        .eq("alumno_id", alumnoData.id)
        .order("created_at", { ascending: false });

      if (rutinasError) {
        console.error(rutinasError);
        setMensaje("No se pudieron cargar las rutinas.");
        setLoading(false);
        return;
      }

      setRutinas(rutinasData ?? []);
      setLoading(false);
    }

    cargarDatos();
  }, []);

  const semanas = Array.from(new Set(rutinas.map((rutina) => rutina.semana)))
  .sort((a, b) => a - b)
  .map((semana) => ({
    semana,
    dias: Array.from(
      new Set(
        rutinas
          .filter((rutina) => rutina.semana === semana)
          .map((rutina) => rutina.dia)
      )
    )
      .sort((a, b) => a - b)
      .map((dia) => ({
        dia,
        rutinas: rutinas.filter(
          (rutina) => rutina.semana === semana && rutina.dia === dia
        ),
      })),
  }));
  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white p-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-neutral-400">Cargando...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <p className="text-emerald-500 font-bold tracking-[0.3em]">
          SF TRAINING
        </p>

        <h1 className="text-4xl font-bold mt-2">
          Hola{alumno ? `, ${alumno.nombre}` : ""}
        </h1>

        <p className="text-neutral-400 mt-2">
          Tus rutinas de entrenamiento
        </p>

        {mensaje && (
          <div className="mt-6 rounded-xl border border-red-800 bg-red-950/30 p-4 text-red-300">
            {mensaje}
          </div>
        )}

        <section className="mt-8">
          {rutinas.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center">
              <h2 className="text-xl font-bold">
                Todavía no tenés rutinas
              </h2>

              <p className="text-neutral-400 mt-2">
                Cuando tu entrenadora te asigne una rutina, aparecerá acá.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
{semanas.map((semana) => (
  <div key={semana.semana} className="mb-10">
    <h2 className="text-2xl font-bold mb-5">
      Semana {semana.semana}
    </h2>

    <div className="grid gap-5">
      {semana.dias.map((dia) => (
        <div
          key={dia.dia}
          className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6"
        >
          <p className="text-emerald-500 font-bold text-lg mb-4">
            Día {dia.dia}
          </p>

          <div className="grid gap-4">
            {dia.rutinas.map((rutina) => (
              <div key={rutina.id}>
                <h3 className="text-2xl font-bold">
                  {rutina.nombre}
                </h3>

                <p className="text-emerald-500 mt-2">
                  {rutina.tipo}
                </p>

                {rutina.descripcion && (
                  <p className="text-neutral-400 mt-3">
                    {rutina.descripcion}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() =>
                    (window.location.href = `/alumno/rutina/${rutina.id}`)
                  }
                  className="w-full mt-5 bg-emerald-600 hover:bg-emerald-500 rounded-xl px-5 py-3 font-semibold"
                >
                  Ver entrenamiento
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}