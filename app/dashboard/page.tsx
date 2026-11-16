"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../utils/supbase/client";

type Alumno = {
  id: number;
  nombre: string;
  email: string;
  estado: string | null;
  activo: boolean;
};

export default function Dashboard() {
  async function cerrarSesion() {
    const supabase = createClient();

    await supabase.auth.signOut();

    window.location.href = "/login";
  }
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState<number | null>(null);

  useEffect(() => {
    cargarAlumnos();
  }, []);

 async function cargarAlumnos() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = "/login";
    return;
  }

  const { data: perfil, error: perfilError } = await supabase
    .from("perfiles")
.select("rol, es_entrenadora")
    .eq("user_id", user.id)
    .maybeSingle();

  if (
    perfilError ||
    !perfil ||
    !["administrador", "entrenadora"].includes(perfil.rol)
  ) {
    await supabase.auth.signOut();
    window.location.href = "/login";
    return;
  }

  const { data, error } = await supabase
    .from("alumnos")
    .select("id, nombre, email, estado, activo")
    .order("nombre", { ascending: true });

  if (error) {
    console.error(error);
    setLoading(false);
    return;
  }

  setAlumnos(data ?? []);
  setLoading(false);
}

  async function aprobarAlumno(id: number) {
    setProcesando(id);

    const supabase = createClient();

    const { error } = await supabase
      .from("alumnos")
      .update({
        estado: "aprobado",
        activo: true,
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("No se pudo aprobar el alumno.");
      setProcesando(null);
      return;
    }

    setAlumnos((actuales) =>
      actuales.map((alumno) =>
        alumno.id === id
          ? { ...alumno, estado: "aprobado", activo: true }
          : alumno
      )
    );

    setProcesando(null);
  }

  async function desactivarAlumno(id: number) {
    const confirmar = window.confirm(
      "¿Seguro que querés desactivar este alumno?"
    );

    if (!confirmar) {
      return;
    }

    setProcesando(id);

    const supabase = createClient();

    const { error } = await supabase
      .from("alumnos")
      .update({
        activo: false,
        estado: "desactivado",
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("No se pudo desactivar el alumno.");
      setProcesando(null);
      return;
    }

    setAlumnos((actuales) =>
      actuales.map((alumno) =>
        alumno.id === id
          ? { ...alumno, estado: "desactivado", activo: false }
          : alumno
      )
    );

    setProcesando(null);
  }

  async function reactivarAlumno(id: number) {
    setProcesando(id);

    const supabase = createClient();

    const { error } = await supabase
      .from("alumnos")
      .update({
        estado: "aprobado",
        activo: true,
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("No se pudo reactivar el alumno.");
      setProcesando(null);
      return;
    }

    setAlumnos((actuales) =>
      actuales.map((alumno) =>
        alumno.id === id
          ? { ...alumno, estado: "aprobado", activo: true }
          : alumno
      )
    );

    setProcesando(null);
  }

  const pendientes = alumnos.filter(
    (alumno) => alumno.estado === "pendiente"
  );

  const activos = alumnos.filter(
    (alumno) => alumno.estado === "aprobado" && alumno.activo
  );

  const desactivados = alumnos.filter(
    (alumno) => !alumno.activo || alumno.estado === "desactivado"
  );

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-6xl mx-auto">

        <p className="text-emerald-500 font-bold tracking-[0.25em]">
          SF TRAINING
        </p>

<div className="flex items-center justify-between gap-4">
  <h1 className="text-4xl font-bold mt-2">
    Panel de Sofi
  </h1>

  <button
    type="button"
    onClick={cerrarSesion}
    className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl px-5 py-3 font-semibold"
  >
    Cerrar sesión
  </button>
</div>

        <p className="text-neutral-400 mt-2">
          Gestión de alumnos y acceso a la aplicación.
        </p>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6"><a href="/dashboard/alumnos" className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl p-5 font-semibold">👥 Alumnos</a><a href="/dashboard/ejercicios" className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl p-5 font-semibold">🏋️ Biblioteca de ejercicios</a><a href="/dashboard/rutinas" className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl p-5 font-semibold">📚 Repositorio de rutinas</a></div>

        {loading ? (
          <p className="text-neutral-400 mt-10">
            Cargando alumnos...
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">

              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                <p className="text-neutral-400">
                  Pendientes
                </p>

                <p className="text-3xl font-bold mt-2">
                  {pendientes.length}
                </p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                <p className="text-neutral-400">
                  Alumnos activos
                </p>

                <p className="text-3xl font-bold mt-2">
                  {activos.length}
                </p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                <p className="text-neutral-400">
                  Desactivados
                </p>

                <p className="text-3xl font-bold mt-2">
                  {desactivados.length}
                </p>
              </div>

            </div>

            {pendientes.length > 0 && (
              <section className="mt-10">

                <h2 className="text-2xl font-bold">
                  Alumnos pendientes
                </h2>

                <p className="text-neutral-400 mt-1">
                  Estos alumnos todavía necesitan la aprobación de Sofi.
                </p>

                <div className="grid gap-4 mt-5">

                  {pendientes.map((alumno) => (
                    <div
                      key={alumno.id}
                      className="bg-neutral-900 border border-yellow-900/50 rounded-2xl p-6"
                    >

                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                        <div>
                          <h3 className="text-xl font-bold">
                            {alumno.nombre}
                          </h3>

                          <p className="text-neutral-400 mt-1">
                            {alumno.email}
                          </p>

                          <p className="text-yellow-500 text-sm mt-2">
                            Pendiente de aprobación
                          </p>
                        </div>

                        <button
                          onClick={() => aprobarAlumno(alumno.id)}
                          disabled={procesando === alumno.id}
                          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl px-5 py-3 font-semibold"
                        >
                          {procesando === alumno.id
                            ? "Procesando..."
                            : "Aprobar alumno"}
                        </button>

                      </div>

                    </div>
                  ))}

                </div>

              </section>
            )}

            <section className="mt-10">

              <h2 className="text-2xl font-bold">
                Alumnos activos
              </h2>

              <div className="grid gap-4 mt-5">

                {activos.length === 0 ? (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                    <p className="text-neutral-400">
                      No hay alumnos activos.
                    </p>
                  </div>
                ) : (
                  activos.map((alumno) => (
                    <div
                      key={alumno.id}
                      className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6"
                    >

                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                        <div>
                          <h3 className="text-xl font-bold">
                            {alumno.nombre}
                          </h3>

                          <p className="text-neutral-400 mt-1">
                            {alumno.email}
                          </p>

                          <p className="text-emerald-500 text-sm mt-2">
                            Alumno activo
                          </p>
                        </div>

                        <div className="flex gap-3">

                          <Link
                            href={`/dashboard/alumnos/${alumno.id}`}
                            className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl px-5 py-3 font-semibold"
                          >
                            Ver perfil
                          </Link>

                          <button
                            onClick={() =>
                              desactivarAlumno(alumno.id)
                            }
                            disabled={procesando === alumno.id}
                            className="bg-red-900/40 hover:bg-red-900/60 border border-red-800 rounded-xl px-5 py-3 font-semibold text-red-300 disabled:opacity-50"
                          >
                            {procesando === alumno.id
                              ? "Procesando..."
                              : "Desactivar"}
                          </button>

                        </div>

                      </div>

                    </div>
                  ))
                )}

              </div>

            </section>

            {desactivados.length > 0 && (
              <section className="mt-10">

                <h2 className="text-2xl font-bold">
                  Alumnos desactivados
                </h2>

                <div className="grid gap-4 mt-5">

                  {desactivados.map((alumno) => (
                    <div
                      key={alumno.id}
                      className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6"
                    >

                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                        <div>
                          <h3 className="text-xl font-bold">
                            {alumno.nombre}
                          </h3>

                          <p className="text-neutral-400 mt-1">
                            {alumno.email}
                          </p>

                          <p className="text-red-400 text-sm mt-2">
                            Acceso desactivado
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            reactivarAlumno(alumno.id)
                          }
                          disabled={procesando === alumno.id}
                          className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl px-5 py-3 font-semibold disabled:opacity-50"
                        >
                          {procesando === alumno.id
                            ? "Procesando..."
                            : "Reactivar"}
                        </button>

                      </div>

                    </div>
                  ))}

                </div>

              </section>
            )}

          </>
        )}

      </div>
    </main>
  );
}