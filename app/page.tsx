export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-12">
          <div className="text-7xl font-black text-emerald-500 mb-2">
            SF
          </div>

          <h1 className="text-3xl font-bold tracking-[0.25em]">
            TRAINING
          </h1>

          <p className="text-neutral-400 mt-3">
            Entrenamiento personalizado
          </p>
        </div>

        <div className="bg-neutral-900 rounded-3xl p-6 border border-neutral-800">
          <h2 className="text-2xl font-semibold mb-2">
            Bienvenido
          </h2>

          <p className="text-neutral-400 mb-8">
            Entrená mejor. Seguí tu progreso.
          </p>

<a
  href="/login"
  className="block w-full bg-emerald-600 hover:bg-emerald-500 text-white text-center font-semibold py-4 rounded-xl mb-3"
>
  Iniciar sesión
</a>
<a href="/signup">
  Crear cuenta
</a>
        </div>

        <p className="text-center text-neutral-600 text-sm mt-8">
          SF Training · Sofía Festa
        </p>

      </div>
    </main>
  );
}