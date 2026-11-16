"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  async function enviarRecuperacion(e: React.FormEvent) {
    e.preventDefault();

    setMensaje("");
    setError("");
    setEnviando(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      console.error(error);
      setError("No se pudo enviar el correo de recuperación.");
      setEnviando(false);
      return;
    }

    setMensaje(
      "Si el email está registrado, recibirás un correo para cambiar tu contraseña."
    );

    setEnviando(false);
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
            Recuperar contraseña
          </h2>

          <p className="text-neutral-400 mb-6">
            Ingresá el email de tu cuenta y te enviaremos un enlace para crear
            una nueva contraseña.
          </p>

          <form onSubmit={enviarRecuperacion}>
            <label className="block text-sm mb-2">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
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
              disabled={enviando}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg px-4 py-3 font-bold"
            >
              {enviando ? "Enviando..." : "Enviar enlace"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/login";
            }}
            className="w-full mt-4 text-neutral-400 hover:text-white"
          >
            ← Volver al inicio de sesión
          </button>
        </div>
      </div>
    </main>
  );
}