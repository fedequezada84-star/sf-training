import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <nav className="border-b border-neutral-800 bg-neutral-950">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center gap-3">
          <Link href="/dashboard" className="font-bold text-emerald-500 mr-4">
            SF TRAINING
          </Link>

          <Link
            href="/dashboard"
            className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg px-4 py-2 font-semibold"
          >
            🏠 Panel
          </Link>

          <Link
            href="/dashboard/alumnos"
            className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg px-4 py-2 font-semibold"
          >
            👥 Alumnos
          </Link>

          <Link
            href="/dashboard/ejercicios"
            className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg px-4 py-2 font-semibold"
          >
🏋️ Biblioteca de ejercicios
          </Link>

          <Link
            href="/dashboard/rutinas"
            className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg px-4 py-2 font-semibold"
          >
📚 Repositorio de rutinas
          </Link>
        </div>
      </nav>

      {children}
    </div>
  );
}