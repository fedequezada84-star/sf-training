"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../utils/supbase/client";

export default function Login() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

 async function handleLogin(e: React.FormEvent) {
  e.preventDefault();

  setMessage("");
  setLoading(true);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setMessage("Email o contraseña incorrectos.");
    setLoading(false);
    return;
  }

  const {
  data: { user },
  error: userError,
} = await supabase.auth.getUser();

if (userError || !user) {
  setMessage("No se pudo obtener la sesión del usuario.");
  setLoading(false);
  return;
}

  if (!user) {
    setMessage("No se pudo obtener la información del usuario.");
    setLoading(false);
    return;
  }

  const { data: perfil, error: perfilError } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("user_id", user.id)
    .maybeSingle();

  if (perfilError || !perfil) {
    await supabase.auth.signOut();
    setMessage("No se encontró el perfil de usuario.");
    setLoading(false);
    return;
  }

  if (perfil.rol === "administrador" || perfil.rol === "entrenadora") {
    router.push("/dashboard");
    router.refresh();
    return;
  }

  const { data: alumno, error: alumnoError } = await supabase
    .from("alumnos")
    .select("estado, activo")
    .eq("user_id", user.id)
    .maybeSingle();

  if (alumnoError || !alumno) {
    await supabase.auth.signOut();
    setMessage("No se encontró el perfil del alumno.");
    setLoading(false);
    return;
  }

  if (alumno.estado !== "aprobado" || !alumno.activo) {
    await supabase.auth.signOut();

    if (alumno.estado === "pendiente") {
      setMessage("Tu cuenta está pendiente de aprobación por Sofi.");
    } else {
      setMessage("Tu acceso a SF Training está desactivado.");
    }

    setLoading(false);
    return;
  }

  router.push("/alumno");
  router.refresh();
}

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <div className="text-6xl font-black text-emerald-500">
            SF
          </div>

          <h1 className="text-2xl font-bold tracking-[0.25em]">
            TRAINING
          </h1>
        </div>

        <div className="bg-neutral-900 rounded-3xl p-6 border border-neutral-800">
          <h2 className="text-2xl font-bold mb-2">
            Iniciar sesión
          </h2>

          <p className="text-neutral-400 mb-8">
            Ingresá a tu cuenta para comenzar.
          </p>

          <form onSubmit={handleLogin}>

            <label className="block text-sm mb-2">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-4 mb-5 outline-none focus:border-emerald-500"
              required
            />

            <label className="block text-sm mb-2">
              Contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-4 mb-7 outline-none focus:border-emerald-500"
              required
            />
<div className="text-right mt-2 mb-4">
  <a
    href="/forgot-password"
    className="text-sm text-emerald-500 hover:text-emerald-400"
  >
    ¿Olvidaste tu contraseña?
  </a>
</div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 font-semibold py-4 rounded-xl"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>

            {message && (
              <p className="text-red-400 text-sm text-center mt-4">
                {message}
              </p>
            )}

          </form>
        </div>

        <p className="text-center text-neutral-600 text-sm mt-8">
          SF Training · Sofía Festa
        </p>

      </div>
    </main>
  );
}