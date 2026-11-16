"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "../../../../../../utils/supbase/client";

type Ejercicio = {
  id: number;
  nombre: string;
  grupo_muscular: string;
  tipo: string;
  descripcion: string | null;
  imagen_url: string | null;
video_url: string | null;
};

export default function AgregarEjercicios() {
  const params = useParams();
  const router = useRouter();

  const rutinaId = params.rutinaId as string;
  const alumnoId = params.id as string;

 const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [rutina, setRutina] = useState<{
    nombre: string;
    semana: number;
    dia: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const [series, setSeries] = useState("3");
  const [repeticiones, setRepeticiones] = useState("10");
  const [peso, setPeso] = useState("");
  const [descanso, setDescanso] = useState("60");

  const [notasSeries, setNotasSeries] = useState<string[]>([
    "",
    "",
]);

  useEffect(() => {
    async function cargarEjercicios() {
      const supabase = createClient();
      const { data: rutinaData, error: rutinaError } = await supabase
        .from("rutinas")
        .select("nombre, semana, dia")
        .eq("id", Number(rutinaId))
        .single();

      if (rutinaError) {
        console.error("ERROR CARGANDO RUTINA:", rutinaError);
      } else {
        console.log("RUTINA CARGADA:", rutinaData);
        setRutina(rutinaData);
      }
      const { data, error } = await supabase
        .from("ejercicios")
.select("id, nombre, grupo_muscular, tipo, descripcion, imagen_url, video_url")
        .order("nombre", { ascending: true });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setEjercicios(data ?? []);
      setLoading(false);
    }

    cargarEjercicios();
  }, []);

const normalizarTexto = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const ejerciciosFiltrados = ejercicios.filter((ejercicio) => {
  const texto = normalizarTexto(busqueda);

  return (
    normalizarTexto(ejercicio.nombre).includes(texto) ||
    normalizarTexto(ejercicio.grupo_muscular ?? "").includes(texto) ||
    normalizarTexto(ejercicio.tipo ?? "").includes(texto)
  );
});
const ejercicioSeleccionadoData = ejercicios.find(
  (ejercicio) => ejercicio.id === ejercicioSeleccionado
);
function actualizarSeries(valor: string) {
    setSeries(valor);

    const cantidad = Math.max(1, Number(valor) || 1);

    setNotasSeries((actuales) =>
      Array.from(
        { length: cantidad },
        (_, index) => actuales[index] ?? ""
      )
    );
  }

  function actualizarNotaSerie(index: number, valor: string) {
    setNotasSeries((actuales) => {
      const nuevas = [...actuales];
      nuevas[index] = valor;
      return nuevas;
    });
  }

  async function agregarEjercicio(ejercicioId: number) {
    setGuardando(ejercicioId);
    setMensaje("");

    const supabase = createClient();

    const { count } = await supabase
      .from("rutina_ejercicios")
      .select("*", { count: "exact", head: true })
      .eq("rutina_id", Number(rutinaId));

    const nuevoOrden = (count ?? 0) + 1;

    const notasLimpias = notasSeries.map((nota) =>
      nota.trim()
    );

    const { error } = await supabase
      .from("rutina_ejercicios")
      .insert({
        rutina_id: Number(rutinaId),
        ejercicio_id: ejercicioId,
        series: Number(series),
        repeticiones: Number(repeticiones),
        peso: peso ? Number(peso) : null,
        descanso: Number(descanso),
        orden: nuevoOrden,
        notas: null,
        notas_series: notasLimpias,
      });

    if (error) {
      console.error(error);
      setMensaje(
        `No se pudo agregar el ejercicio: ${error.message}`
      );
      setGuardando(null);
      return;
    }

setMensaje("Ejercicio agregado correctamente.");
setGuardando(null);
setEjercicioSeleccionado(null);
setBusqueda("");
setNotasSeries(Array.from({ length: Number(series) || 1 }, () => ""));
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-emerald-500 font-bold tracking-[0.25em]">
          SF TRAINING
        </p>

        {rutina && (
          <>
            <p className="text-emerald-500 font-semibold mt-5">
              Semana {rutina.semana} · Día {rutina.dia}
            </p>

            <h1 className="text-4xl font-bold mt-1">
              {rutina.nombre}
            </h1>
          </>
        )}

        <p className="text-neutral-400 mt-2">
          Agregá los ejercicios de este día.
        </p>


        <p className="text-neutral-400 mt-2">
          Elegí un ejercicio para agregarlo a esta rutina.
        </p>

<div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mt-8">
  <h2 className="text-xl font-bold mb-4">
    Seleccionar ejercicio
  </h2>

  <input
    type="text"
    value={busqueda}
    onChange={(e) => setBusqueda(e.target.value)}
    placeholder="Escribí ejercicio o músculo: press, bíceps, tríceps, cuádriceps..."
    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-4"
  />

{busqueda.trim() && ejercicioSeleccionado === null && (
    <div className="mt-3 bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden">
      {ejerciciosFiltrados.length === 0 ? (
        <p className="p-4 text-neutral-400">
          No encontramos ejercicios para esa búsqueda.
        </p>
      ) : (
        ejerciciosFiltrados.slice(0, 10).map((ejercicio) => (
          <button
            key={ejercicio.id}
            type="button"
            onClick={() => {
              setEjercicioSeleccionado(ejercicio.id);
setBusqueda("");
            }}
            className="w-full text-left px-4 py-3 border-b border-neutral-700 last:border-b-0 hover:bg-neutral-700"
          >
            <p className="font-semibold">
              {ejercicio.nombre}
            </p>

            <p className="text-sm text-emerald-400">
              {ejercicio.grupo_muscular ?? "Sin grupo muscular"}
            </p>

            <p className="text-xs text-neutral-400">
              {ejercicio.tipo ?? "Sin tipo"}
            </p>
          </button>
        ))
      )}
    </div>
  )}
</div>
<div className={`bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mt-8 ${ejercicioSeleccionado === null ? "hidden" : ""}`}>
          {ejercicioSeleccionadoData && (
  <div className="mb-5 bg-neutral-800 border border-neutral-700 rounded-xl p-4">
    <p className="text-sm text-neutral-400">
      Ejercicio seleccionado
    </p>
    <h2 className="text-2xl font-bold mt-1">
      {ejercicioSeleccionadoData.nombre}
    </h2>
    <p className="text-emerald-500 text-sm mt-1">
      {ejercicioSeleccionadoData.grupo_muscular} · {ejercicioSeleccionadoData.tipo}
    </p>
  </div>
)}
          <h2 className="text-xl font-bold mb-5">
            Parámetros iniciales
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm mb-2">
                Series
              </label>

              <input
                type="number"
                min="1"
                value={series}
                onChange={(e) =>
                  actualizarSeries(e.target.value)
                }
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">
                Repeticiones
              </label>

              <input
                type="number"
                min="1"
                value={repeticiones}
                onChange={(e) =>
                  setRepeticiones(e.target.value)
                }
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">
                Peso (kg)
              </label>

              <input
                type="number"
                min="0"
                step="0.5"
                value={peso}
                onChange={(e) =>
                  setPeso(e.target.value)
                }
                placeholder="Ej: 20"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">
                Descanso (seg)
              </label>

              <input
                type="number"
                min="0"
                value={descanso}
                onChange={(e) =>
                  setDescanso(e.target.value)
                }
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3"
              />
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-bold">
              Indicaciones por serie
            </h3>

            <p className="text-neutral-400 text-sm mt-1">
              Opcionales. Podés dejar cualquier serie vacía.
            </p>

            <div className="mt-4 space-y-4">
              {notasSeries.map((nota, index) => (
                <div key={index}>
                  <label className="block text-sm mb-2">
                    Serie {index + 1} — indicación opcional
                  </label>

                  <input
                    type="text"
                    value={nota}
                    onChange={(e) =>
                      actualizarNotaSerie(
                        index,
                        e.target.value
                      )
                    }
                    placeholder="Ej: Bajar en 3 segundos"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3"
                  />
                </div>
              ))}
            </div>
          </div>
</div>

        {ejercicioSeleccionado !== null && (
  <button
    type="button"
    onClick={() => agregarEjercicio(ejercicioSeleccionado)}
    disabled={guardando !== null}
    className="mt-6 w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl px-5 py-4 font-bold text-lg"
  >
    {guardando !== null
      ? "Agregando ejercicio..."
: "+ Agregar otro ejercicio"}
  </button>
)}

        {mensaje && (
          <div className="mt-5 bg-emerald-900/30 border border-emerald-700 rounded-xl p-4 text-emerald-400">
            {mensaje}
          </div>
        )}

        {loading ? (
          <p className="text-neutral-400 mt-8">
            Cargando ejercicios...
          </p>
        ) : ejercicios.length === 0 ? (
          <div className="mt-8 bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
            <p className="text-neutral-300">
              No hay ejercicios disponibles.
            </p>

            <button
              onClick={() =>
                router.push("/dashboard/ejercicios/nuevo")
              }
              className="mt-5 bg-emerald-600 hover:bg-emerald-500 rounded-xl px-5 py-3 font-semibold"
            >
              + Crear ejercicio
            </button>
          </div>
        ) : (
<div className="hidden">
{busqueda.trim() && ejercicioSeleccionado === null && ejerciciosFiltrados.map((ejercicio) => (
              <div
                key={ejercicio.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between gap-5">
                  <div>
                    <h2 className="text-xl font-bold">
                      {ejercicio.nombre}
                    </h2>

                    <p className="text-emerald-500 text-sm mt-1">
                      {ejercicio.grupo_muscular}
                    </p>

                    <p className="text-neutral-400 text-sm mt-1">
                      {ejercicio.tipo}
                    </p>

                    {ejercicio.descripcion && (
                      <p className="text-neutral-400 mt-3">
                        {ejercicio.descripcion}
                      </p>
                    )}
                    <div className="mt-4 space-y-4">
                      {ejercicio.imagen_url ? (
  <details>
    <summary className="cursor-pointer text-emerald-500 font-semibold">
      🖼️ Ver imagen
    </summary>

    <div className="mt-3">
      <img
        src={ejercicio.imagen_url}
        alt={`Demostración de ${ejercicio.nombre}`}
        className="w-full max-w-md rounded-xl border border-neutral-700"
      />
    </div>
  </details>
) : (
  <p className="text-neutral-500 text-sm">
    🖼️ Imagen no disponible
  </p>
)}

{ejercicio.video_url ? (
  <details>
    <summary className="cursor-pointer text-emerald-500 font-semibold">
      ▶️ Ver demostración
    </summary>

    <div className="mt-3 w-full max-w-2xl aspect-video">
      <iframe
        src={ejercicio.video_url.replace("watch?v=", "embed/")}
        title={`Video de ${ejercicio.nombre}`}
        className="w-full h-full rounded-xl border border-neutral-700"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  </details>
) : (
  <p className="text-neutral-500 text-sm">
    ▶️ Video no disponible
  </p>
)}



</div>
                  </div>

<button
  type="button"
  onClick={() => setEjercicioSeleccionado(ejercicio.id)}
  className={`${
    ejercicioSeleccionado === ejercicio.id
      ? "bg-emerald-700"
      : "bg-neutral-800 hover:bg-neutral-700"
  } border border-neutral-700 rounded-xl px-5 py-3 font-semibold`}
>
  {ejercicioSeleccionado === ejercicio.id
    ? "✓ Seleccionado"
    : "Seleccionar"}
</button>
                </div>
              </div>
            ))}
          </div>
        )}

 <button
        type="button"
        onClick={() =>
          router.push(
            `/dashboard/alumnos/${alumnoId}/rutina/${rutinaId}`
          )
        }
        className="mt-8 w-full bg-emerald-600 hover:bg-emerald-500 rounded-xl px-5 py-4 font-bold text-lg"
      >
        ✓ Finalizar día
      </button>
      </div>
    </main>
  );
}