"use client";

import { useEffect, useState } from "react";



import { createClient } from "../../utils/supbase/client";
type Alumno = {
  id: number;
  nombre: string;
  email: string;
};

export default function Alumnos() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
useEffect(() => {
  async function cargarAlumnos() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("alumnos")
      .select("id, nombre, email")
      .order("nombre", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setAlumnos(data ?? []);
  }

  cargarAlumnos();
}, []);
  async function agregarAlumno(e: React.FormEvent) {
  e.preventDefault();

  if (!nombre.trim() || !email.trim()) {
    return;
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("alumnos")
    .insert({
      nombre: nombre.trim(),
      email: email.trim(),
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    alert("No se pudo guardar el alumno.");
    return;
  }

  setAlumnos((prev) => [...prev, data]);
  setNombre("");
  setEmail("");
}

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-5xl mx-auto">

        <div className="mb-8">
          <p className="text-emerald-500 font-bold tracking-[0.25em]">
            SF TRAINING
          </p>

          <h1 className="text-4xl font-bold mt-2">
            Alumnos
          </h1>

          <p className="text-neutral-400 mt-2">
            Administrá tus alumnos y su información.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="md:col-span-1 bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-5">
              Nuevo alumno
            </h2>

            <form onSubmit={agregarAlumno}>

              <label className="block text-sm mb-2">
                Nombre
              </label>

              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre y apellido"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 mb-4 outline-none focus:border-emerald-500"
              />

              <label className="block text-sm mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alumno@email.com"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 mb-5 outline-none focus:border-emerald-500"
              />

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 font-semibold py-3 rounded-xl"
              >
                Agregar alumno
              </button>

            </form>
          </div>

          <div className="md:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-6">

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold">
                Mis alumnos
              </h2>

              <span className="text-neutral-400 text-sm">
                {alumnos.length} alumnos
              </span>
            </div>

            {alumnos.length === 0 ? (
              <div className="border border-dashed border-neutral-700 rounded-xl p-8 text-center">
                <p className="text-neutral-400">
                  Todavía no tenés alumnos cargados.
                </p>

                <p className="text-neutral-600 text-sm mt-2">
                  Agregá tu primer alumno desde el formulario.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {alumnos.map((alumno) => (
                  <div
                    key={alumno.id}
                    className="bg-neutral-800 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold">
                        {alumno.nombre}
                      </p>

                      <p className="text-neutral-400 text-sm">
                        {alumno.email}
                      </p>
                    </div>

                   <a
  href={`/dashboard/alumnos/${alumno.id}`}
  className="text-emerald-500 text-sm font-semibold"
>
  Ver perfil
</a>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </main>
  );
}