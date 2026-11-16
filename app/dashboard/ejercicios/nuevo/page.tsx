"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

export default function NuevoEjercicio() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [grupoMuscular, setGrupoMuscular] = useState("");
  const [musculoPrincipal, setMusculoPrincipal] = useState("");
  const [musculosSecundarios, setMusculosSecundarios] = useState("");
  const [tipo, setTipo] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [imagenMusculosUrl, setImagenMusculosUrl] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [cargandoEjercicio, setCargandoEjercicio] = useState(false);

  useEffect(() => {
    const parametros = new URLSearchParams(window.location.search);
    const id = parametros.get("id");

    if (!id) {
      return;
    }

    setEditandoId(id);
    setCargandoEjercicio(true);

    async function cargarEjercicio() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("ejercicios")
        .select("*")
        .eq("id", Number(id))
        .single();

      if (error || !data) {
        console.error(error);
        setMensaje("No se pudo cargar el ejercicio.");
        setCargandoEjercicio(false);
        return;
      }

      setNombre(data.nombre ?? "");
      setGrupoMuscular(data.grupo_muscular ?? "");
      setMusculoPrincipal(data.musculo_principal ?? "");
      setMusculosSecundarios(data.musculos_secundarios ?? "");
      setTipo(data.tipo ?? "");
      setVideoUrl(data.video_url ?? "");
      setImagenUrl(data.imagen_url ?? "");
      setImagenMusculosUrl(data.imagen_musculos_url ?? "");
      setDescripcion(data.descripcion ?? "");

      setCargandoEjercicio(false);
    }

    cargarEjercicio();
  }, []);

  async function guardarEjercicio(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!nombre.trim()) {
      setMensaje("Ingresá el nombre del ejercicio.");
      return;
    }

    if (!grupoMuscular.trim()) {
      setMensaje("Ingresá el grupo muscular.");
      return;
    }

    if (!tipo.trim()) {
      setMensaje("Ingresá el tipo de ejercicio.");
      return;
    }

    setGuardando(true);
    setMensaje("");

    const supabase = createClient();

const videoAutomatico = videoUrl.trim() || null;
const imagenAutomatica = imagenUrl.trim() || null;

let videoFinal = videoAutomatico;
let imagenFinal = imagenAutomatica;

if (!videoFinal || !imagenFinal) {
  try {
    const respuesta = await fetch(
      `/api/youtube-search?q=${encodeURIComponent(nombre.trim())}`
    );

    if (respuesta.ok) {
      const multimedia = await respuesta.json();

      videoFinal = videoFinal ?? multimedia.video_url ?? null;
      imagenFinal = imagenFinal ?? multimedia.imagen_url ?? null;
    }
  } catch {
    // Si YouTube falla, el ejercicio se guarda igual.
  }
}

const textoEjercicio = nombre.trim().toLowerCase();

const coincidenciaMusculos =
  textoEjercicio.includes("press banca") ||
  textoEjercicio.includes("press de banca") ||
  textoEjercicio.includes("bench press")
    ? {
        principal: "Pectoral mayor",
        secundarios: "Tríceps, deltoides anterior",
      }
    : textoEjercicio.includes("press inclinado")
      ? {
          principal: "Pectoral mayor superior",
          secundarios: "Tríceps, deltoides anterior",
        }
      : textoEjercicio.includes("remo") ||
          textoEjercicio.includes("remada")
        ? {
            principal: "Dorsal ancho",
            secundarios: "Romboides, trapecio, bíceps",
          }
        : textoEjercicio.includes("jalón") ||
            textoEjercicio.includes("jalon") ||
            textoEjercicio.includes("dominada")
          ? {
              principal: "Dorsal ancho",
              secundarios: "Bíceps, romboides",
            }
          : textoEjercicio.includes("curl bíceps") ||
              textoEjercicio.includes("curl biceps")
            ? {
                principal: "Bíceps",
                secundarios: "Braquial, braquiorradial",
              }
            : textoEjercicio.includes("tríceps") ||
                textoEjercicio.includes("triceps")
              ? {
                  principal: "Tríceps",
                  secundarios: "Deltoides anterior",
                }
              : textoEjercicio.includes("sentadilla") ||
                  textoEjercicio.includes("squat")
                ? {
                    principal: "Cuádriceps",
                    secundarios: "Glúteos, isquiotibiales",
                  }
                : textoEjercicio.includes("peso muerto") ||
                    textoEjercicio.includes("deadlift")
                  ? {
                      principal: "Glúteos",
                      secundarios: "Isquiotibiales, erectores espinales",
                    }
                  : textoEjercicio.includes("prensa")
                    ? {
                        principal: "Cuádriceps",
                        secundarios: "Glúteos, isquiotibiales",
                      }
                    : textoEjercicio.includes("zancada") ||
                        textoEjercicio.includes("estocada") ||
                        textoEjercicio.includes("lunge")
                      ? {
                          principal: "Cuádriceps",
                          secundarios: "Glúteos, isquiotibiales",
                        }
                      : textoEjercicio.includes("elevación lateral") ||
                          textoEjercicio.includes("elevacion lateral")
                        ? {
                            principal: "Deltoides lateral",
                            secundarios: "Trapecio",
                          }
                        : textoEjercicio.includes("press militar") ||
                            textoEjercicio.includes("press hombro")
                          ? {
                              principal: "Deltoides",
                              secundarios: "Tríceps, trapecio",
                            }
                          : textoEjercicio.includes("hip thrust")
                            ? {
                                principal: "Glúteos",
                                secundarios: "Isquiotibiales",
                              }
                            : null;

const datos = {
  nombre: nombre.trim(),
  grupo_muscular: grupoMuscular.trim(),
  musculo_principal:
    musculoPrincipal.trim() || coincidenciaMusculos?.principal || null,
  musculos_secundarios:
    musculosSecundarios.trim() ||
    coincidenciaMusculos?.secundarios ||
    null,
  tipo: tipo.trim(),
  video_url: videoFinal,
  imagen_url: imagenFinal,
  imagen_musculos_url: imagenMusculosUrl.trim() || null,
  descripcion: descripcion.trim() || null,
};

    let error;

    if (editandoId) {
      const resultado = await supabase
        .from("ejercicios")
        .update(datos)
        .eq("id", Number(editandoId));

      error = resultado.error;
    } else {
      const resultado = await supabase
        .from("ejercicios")
        .insert(datos);

      error = resultado.error;
    }

    if (error) {
      console.error(error);
      setMensaje("No se pudo guardar el ejercicio.");
      setGuardando(false);
      return;
    }

    router.push("/dashboard/ejercicios");
  }

  if (cargandoEjercicio) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <p className="text-neutral-400">
            Cargando ejercicio...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-12">

        <p className="text-emerald-500 font-bold tracking-[0.3em]">
          SF TRAINING
        </p>

        <h1 className="text-4xl font-bold mt-2">
          {editandoId ? "Editar ejercicio" : "Nuevo ejercicio"}
        </h1>

        <p className="text-neutral-400 mt-2">
          {editandoId
            ? "Modificá los datos del ejercicio."
            : "Agregá cualquier ejercicio a la biblioteca."}
        </p>

        <div className="mt-8 bg-neutral-900 border border-neutral-800 rounded-2xl p-6">

          <form onSubmit={guardarEjercicio}>

            <label className="block text-sm mb-2">
              Nombre del ejercicio
            </label>

            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Press banca con barra"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3"
            />

            <label className="block text-sm mb-2 mt-6">
              Grupo muscular
            </label>

            <input
              type="text"
              value={grupoMuscular}
              onChange={(e) => setGrupoMuscular(e.target.value)}
              placeholder="Ej: Pecho"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3"
            />

            <label className="block text-sm mb-2 mt-6">
              Músculo principal
            </label>

            <input
              type="text"
              value={musculoPrincipal}
              onChange={(e) =>
                setMusculoPrincipal(e.target.value)
              }
              placeholder="Ej: Pectoral mayor"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3"
            />

            <label className="block text-sm mb-2 mt-6">
              Músculos secundarios
            </label>

            <input
              type="text"
              value={musculosSecundarios}
              onChange={(e) =>
                setMusculosSecundarios(e.target.value)
              }
              placeholder="Ej: Deltoides anterior, tríceps"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3"
            />

            <label className="block text-sm mb-2 mt-6">
              Tipo de entrenamiento
            </label>

            <input
              type="text"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              placeholder="Ej: Pesas, Funcional, Pliometría, AMRAP, EMOM..."
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3"
            />

            <label className="block text-sm mb-2 mt-6">
              Video de YouTube
            </label>

            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/..."
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3"
            />

            <label className="block text-sm mb-2 mt-6">
              URL de imagen
            </label>

            <input
              type="url"
              value={imagenUrl}
              onChange={(e) => setImagenUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3"
            />

            <label className="block text-sm mb-2 mt-6">
              Imagen de músculos trabajados
            </label>

            <input
              type="url"
              value={imagenMusculosUrl}
              onChange={(e) =>
                setImagenMusculosUrl(e.target.value)
              }
              placeholder="https://..."
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3"
            />

            <label className="block text-sm mb-2 mt-6">
              Descripción / indicaciones
            </label>

            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Indicaciones para realizar correctamente el ejercicio..."
              rows={5}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3"
            />

            {mensaje && (
              <p className="mt-4 text-red-400">
                {mensaje}
              </p>
            )}

            <button
              type="submit"
              disabled={guardando}
              className="w-full mt-8 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-4 rounded-xl"
            >
              {guardando
                ? "Guardando..."
                : editandoId
                ? "Guardar cambios"
                : "Guardar ejercicio"}
            </button>

          </form>

          <button
            type="button"
            onClick={() =>
              router.push("/dashboard/ejercicios")
            }
            className="w-full mt-4 text-neutral-400 hover:text-white"
          >
            ← Volver a la biblioteca
          </button>

        </div>
      </div>
    </main>
  );
}