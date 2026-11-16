"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  async function cambiarPassword(e: React.FormEvent) {
    e.preventDefault();

    setMensaje("");
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setGuardando(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      console.error(error);
      setError("No se pudo cambiar la contraseña.");
      setGuardando(false);
      return;
    }

    setMensaje("Contraseña actualizada correctamente.");

    setTimeout(() => {
      window.location.href = "/login";
    }, 1500);
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl font-black text-emerald-500">
            SF
          </div>

          <h1 className="text-2xl font-bold tracking-[0.25em]">
            TRAINING
          </h1>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-2">
            Nueva contraseña
          </h2>

          <p className="text-neutral-400 mb-6">
            Elegí una nueva contraseña para tu cuenta.
          </p>

          <form onSubmit={cambiarPassword}>
            <label className="block text-sm mb-2">
              Nueva contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 mb-5"
            />

            <label className="block text-sm mb-2">
              Repetir contraseña
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repetí la contraseña"
              required
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 mb-5"
            />

            {error && (
              <div className="mb-4 rounded-lg border border-red-800 bg-red-950/30 p-3 text-red-300">
                {error}
              </div>
            )}

            {mensaje && (
              <div className="mb-4 rounded-lg border border-emerald-800 bg-emerald-950/30 p-3 text-emerald-300">
                {mensaje}
              </div>
            )}

            <button
              type="submit"
              disabled={guardando}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg px-4 py-3 font-bold"
            >
              {guardando ? "Guardando..." : "Cambiar contraseña"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}