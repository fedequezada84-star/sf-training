"use client";

import { useState } from "react";
import { createClient } from "../utils/supbase/client";

export default function Signup() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(
      "Cuenta creada. Revisá tu email para confirmar la cuenta."
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl font-black text-emerald-500">SF</div>
          <div className="text-3xl font-bold tracking-[0.3em]">
            TRAINING
          </div>
          <p className="text-neutral-400 mt-3">
            Entrenamiento personalizado
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
          <h1 className="text-2xl font-bold mb-2">Crear cuenta</h1>

          <p className="text-neutral-400 mb-6">
            Creá tu cuenta para comenzar.
          </p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Contraseña</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-3 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 rounded-xl py-3 font-bold"
            >
              Crear cuenta
            </button>
          </form>

          {message && (
            <p className="text-sm text-neutral-300 mt-4">{message}</p>
          )}
        </div>
      </div>
    </main>
  );
}