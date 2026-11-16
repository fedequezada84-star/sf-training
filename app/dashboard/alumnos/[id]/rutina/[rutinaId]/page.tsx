"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "../../../../../utils/supbase/client";

type Rutina = {
  id: number;
  nombre: string;
  tipo: string;
  descripcion: string | null;
  semana: number;
  dia: number;
};
type RutinaEjercicio = {
  id: number;
  ejercicio_id: number;
  series: number;
  repeticiones: number;
  peso: number | null;
  descanso: number;
  orden: number;
  notas: string | null;
  notas_series: string[] | null;
};

type Ejercicio = {
  id: number;
  nombre: string;
  grupo_muscular: string;
  tipo: string;
};

type EjercicioRutina = RutinaEjercicio & {
  ejercicio: Ejercicio | null;
};

export default function DetalleRutina() {
  const params = useParams();
  const router = useRouter();

  const alumnoId = params.id as string;
  const rutinaId = params.rutinaId as string;

  const [rutina, setRutina] = useState<Rutina | null>(null);
  const [ejercicios, setEjercicios] = useState<EjercicioRutina[]>([]);
  const [loading, setLoading] = useState(true);
const [editandoId, setEditandoId] = useState<number | null>(null);
const [guardandoId, setGuardandoId] = useState<number | null>(null);
const [formSeries, setFormSeries] = useState("3");
const [formRepeticiones, setFormRepeticiones] = useState("10");
const [formPeso, setFormPeso] = useState("");
const [formDescanso, setFormDescanso] = useState("60");
const [formNotas, setFormNotas] = useState("");
const [formNotasSeries, setFormNotasSeries] = useState<string[]>([]);
const [editandoRutina, setEditandoRutina] = useState(false);
const [formNombreRutina, setFormNombreRutina] = useState("");
const [formTipoRutina, setFormTipoRutina] = useState("");
const [formSemanaRutina, setFormSemanaRutina] = useState(1);
const [formDiaRutina, setFormDiaRutina] = useState(1);
const [formDescripcionRutina, setFormDescripcionRutina] = useState("");
  useEffect(() => {
    async function cargarRutina() {
      const supabase = createClient();

      const { data: rutinaData, error: rutinaError } = await supabase
        .from("rutinas")
.select("id, nombre, tipo, descripcion, semana, dia")
        .eq("id", Number(rutinaId))
        .single();

      if (rutinaError) {
        console.error(rutinaError);
        setLoading(false);
        return;
      }

      setRutina(rutinaData);
      setFormNombreRutina(rutinaData.nombre);
setFormTipoRutina(rutinaData.tipo);
setFormSemanaRutina(rutinaData.semana);
setFormDiaRutina(rutinaData.dia);
setFormDescripcionRutina(rutinaData.descripcion ?? "");

      const { data: rutinaEjercicios, error: rutinaEjerciciosError } =
        await supabase
          .from("rutina_ejercicios")
          .select(
"id, ejercicio_id, series, repeticiones, peso, descanso, orden, notas, notas_series"
          )
          .eq("rutina_id", Number(rutinaId))
          .order("orden", { ascending: true });

      if (rutinaEjerciciosError) {
        console.error(rutinaEjerciciosError);
        setLoading(false);
        return;
      }

      if (!rutinaEjercicios || rutinaEjercicios.length === 0) {
        setEjercicios([]);
        setLoading(false);
        return;
      }

      const ejercicioIds = rutinaEjercicios.map(
        (item: RutinaEjercicio) => item.ejercicio_id
      );

      const { data: ejerciciosData, error: ejerciciosError } =
        await supabase
          .from("ejercicios")
          .select("id, nombre, grupo_muscular, tipo")
          .in("id", ejercicioIds);

      if (ejerciciosError) {
        console.error(ejerciciosError);
        setLoading(false);
        return;
      }

      const ejerciciosCompletos: EjercicioRutina[] = rutinaEjercicios.map(
        (item: RutinaEjercicio) => ({
          ...item,
          ejercicio:
            ejerciciosData?.find(
              (ejercicio: Ejercicio) => ejercicio.id === item.ejercicio_id
            ) ?? null,
        })
      );

      setEjercicios(ejerciciosCompletos);
      setLoading(false);
    }

    cargarRutina();
  }, [rutinaId]);

      async function guardarRutina() {
  if (!rutina) return;

  const supabase = createClient();

  const { data, error } = await supabase
    .from("rutinas")
    .update({
      nombre: formNombreRutina.trim(),
      tipo: formTipoRutina,
      semana: formSemanaRutina,
      dia: formDiaRutina,
      descripcion: formDescripcionRutina.trim() || null,
    })
    .eq("id", rutina.id)
    .select("id, nombre, tipo, descripcion, semana, dia")
    .single();

  if (error || !data) {
    console.error(error);
    alert("No se pudieron guardar los cambios.");
    return;
  }

  setRutina(data);
  setEditandoRutina(false);
 async function guardarEnRepositorio() {
    if (!rutina) return;

    const supabase = createClient();

    const { error } = await supabase
      .from("rutinas")
      .update({ en_repositorio: true })
      .eq("id", rutina.id);

    if (error) {
      console.error(error);
      alert("No se pudo guardar la rutina en el repositorio.");
      return;
    }

    setRutina((actual) =>
      actual ? { ...actual, en_repositorio: true } : actual
    );

    alert("Rutina guardada en el repositorio.");
  }
}async function eliminarEjercicio(id: number) {

    const confirmar = window.confirm(
      "¿Seguro que querés eliminar este ejercicio de la rutina?"
    );

    if (!confirmar) {
      return;
    }

    const supabase = createClient();

    const { error } = await supabase
      .from("rutina_ejercicios")
      .delete()
      .eq("id", id)
      .eq("rutina_id", Number(rutinaId));

    if (error) {
      console.error(error);
      alert("No se pudo eliminar el ejercicio.");
      return;
    }

    setEjercicios((actuales) =>
      actuales.filter((ejercicio: EjercicioRutina) => ejercicio.id !== id)
    );
  }

  function abrirEditor(item: EjercicioRutina) {
  setEditandoId(item.id);
  setFormSeries(String(item.series));
  setFormRepeticiones(String(item.repeticiones));
  setFormPeso(item.peso !== null ? String(item.peso) : "");
  setFormDescanso(String(item.descanso));
  setFormNotas(item.notas ?? "");
  setFormNotasSeries(
    Array.from(
      { length: item.series },
      (_, index) => item.notas_series?.[index] ?? ""
    )
  );
}

function cambiarCantidadSeries(valor: string) {
  setFormSeries(valor);

  const cantidad = Math.max(1, Number(valor) || 1);

  setFormNotasSeries((actuales) =>
    Array.from(
      { length: cantidad },
      (_, index) => actuales[index] ?? ""
    )
  );
}

function cambiarNotaSerie(index: number, valor: string) {
  setFormNotasSeries((actuales) => {
    const nuevas = [...actuales];
    nuevas[index] = valor;
    return nuevas;
  });
}

async function guardarConfiguracion(itemId: number) {
  setGuardandoId(itemId);

  const supabase = createClient();

  const { data, error } = await supabase
    .from("rutina_ejercicios")
    .update({
      series: Number(formSeries),
      repeticiones: Number(formRepeticiones),
      peso: formPeso ? Number(formPeso) : null,
      descanso: Number(formDescanso),
      notas: formNotas.trim() || null,
      notas_series: formNotasSeries.map((nota) => nota.trim()),
    })
    .eq("id", itemId)
    .eq("rutina_id", Number(rutinaId))
    .select(
      "id, ejercicio_id, series, repeticiones, peso, descanso, orden, notas, notas_series"
    )
    .single();

  if (error || !data) {
    console.error(error);
    alert("No se pudieron guardar los cambios.");
    setGuardandoId(null);
    return;
  }

  setEjercicios((actuales) =>
    actuales.map((item) =>
      item.id === itemId ? { ...item, ...data } : item
    )
  );

  setEditandoId(null);
  setGuardandoId(null);
}
  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white p-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-neutral-400">Cargando rutina...</p>
        </div>
      </main>
    );
  }

  if (!rutina) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold">
            No se encontró la rutina
          </h1>

          <button
            onClick={() =>
              router.push(`/dashboard/alumnos/${alumnoId}/rutinas-lista`)
            }
            className="mt-6 text-neutral-400 hover:text-white"
          >
            ← Volver a las rutinas
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-5xl mx-auto">

        <p className="text-emerald-500 font-bold tracking-[0.25em]">
          SF TRAINING
        </p>

        <p className="text-emerald-500 font-bold text-sm mb-2">
  Semana {rutina.semana} · Día {rutina.dia}
</p>
        <h1 className="text-4xl font-bold mt-2">
          {rutina.nombre}
        </h1>

        <p className="text-emerald-500 mt-2">
          {rutina.tipo}
        </p>

        {rutina.descripcion && (
          <p className="text-neutral-400 mt-3">
            {rutina.descripcion}
          </p>
        )}

        <div className="flex gap-3 mt-8">

          <button
            onClick={() =>
              router.push(
                `/dashboard/alumnos/${alumnoId}/rutina/${rutinaId}/ejercicios`
              )
            }
            className="bg-emerald-600 hover:bg-emerald-500 rounded-xl px-5 py-3 font-semibold"
          >
            + Agregar ejercicio
          </button>
          {ejercicios.length > 0 && (
            <button
              type="button"
              onClick={() => setEditandoRutina(true)}
              className="rounded-xl border border-neutral-700 bg-neutral-800 px-5 py-3 font-semibold hover:bg-neutral-700"
            >
              ✏️ Editar rutina
            </button>
          )}



        </div>

        {editandoRutina && (
  <div className="mt-8 bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
    <h2 className="text-2xl font-bold mb-5">
      Editar rutina
    </h2>

    <div className="grid gap-4">
      <div>
        <label className="block text-sm mb-2">
          Nombre de la rutina
        </label>
        <input
          type="text"
          value={formNombreRutina}
          onChange={(e) => setFormNombreRutina(e.target.value)}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-4"
        />
      </div>

      <div>
        <label className="block text-sm mb-2">
          Tipo de rutina
        </label>
        <input
          type="text"
          value={formTipoRutina}
          onChange={(e) => setFormTipoRutina(e.target.value)}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-4"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-2">
            Semana
          </label>
          <input
            type="number"
            min="1"
            value={formSemanaRutina}
            onChange={(e) => setFormSemanaRutina(Number(e.target.value))}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-4"
          />
        </div>

        <div>
          <label className="block text-sm mb-2">
            Día
          </label>
          <input
            type="number"
            min="1"
            max="7"
            value={formDiaRutina}
            onChange={(e) => setFormDiaRutina(Number(e.target.value))}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-4"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm mb-2">
          Descripción
        </label>
        <textarea
          value={formDescripcionRutina}
          onChange={(e) => setFormDescripcionRutina(e.target.value)}
          rows={4}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-4"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={guardarRutina}
          className="bg-emerald-600 hover:bg-emerald-500 rounded-xl px-5 py-3 font-semibold"
        >
          Guardar cambios
        </button>

        <button
          type="button"
          onClick={() => setEditandoRutina(false)}
          className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl px-5 py-3 font-semibold"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
)}
        {ejercicios.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 mt-8 text-center">
            <p className="text-neutral-300">
              Esta rutina todavía no tiene ejercicios.
            </p>

            <p className="text-neutral-500 mt-2">
              Agregá el primer ejercicio con el botón de arriba.
            </p>
          </div>
        ) : (
          <div className="mt-8">

            <h2 className="text-2xl font-bold mb-4">
              Ejercicios
            </h2>

            <div className="grid gap-4">

              {ejercicios.map(
                (item: EjercicioRutina, index: number) => (
                  <div
                    key={item.id}
                    className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6"
                  >

                    <p className="text-emerald-500 text-sm font-semibold">
                      Ejercicio {index + 1}
                    </p>

                    <h3 className="text-xl font-bold mt-1">
                      {item.ejercicio?.nombre ?? "Ejercicio"}
                    </h3>

                    {item.ejercicio && (
                      <p className="text-neutral-400 text-sm mt-1">
                        {item.ejercicio.grupo_muscular} ·{" "}
                        {item.ejercicio.tipo}
                      </p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">

                      <div className="bg-neutral-800 rounded-xl p-4">
                        <p className="text-neutral-400 text-sm">
                          Series
                        </p>
                        <p className="text-xl font-bold">
                          {item.series}
                        </p>
                      </div>

                      <div className="bg-neutral-800 rounded-xl p-4">
                        <p className="text-neutral-400 text-sm">
                          Repeticiones
                        </p>
                        <p className="text-xl font-bold">
                          {item.repeticiones}
                        </p>
                      </div>

                      <div className="bg-neutral-800 rounded-xl p-4">
                        <p className="text-neutral-400 text-sm">
                          Peso
                        </p>
                        <p className="text-xl font-bold">
                          {item.peso !== null
                            ? `${item.peso} kg`
                            : "—"}
                        </p>
                      </div>

                      <div className="bg-neutral-800 rounded-xl p-4">
                        <p className="text-neutral-400 text-sm">
                          Descanso
                        </p>
                        <p className="text-xl font-bold">
                          {item.descanso} s
                        </p>
                      </div>

                    </div>

                    {item.notas && (
                      <div className="mt-4">
                        <p className="text-neutral-400 text-sm">
                          Notas
                        </p>

                        <p className="mt-1">
                          {item.notas}
                        </p>
                      </div>
                    )}

                    <div className="mt-5 flex gap-3">

<button
  type="button"
  onClick={() =>
    router.push(
      `/dashboard/alumnos/${alumnoId}/rutina/${rutinaId}/editar/${item.id}`
    )
  }
  className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl px-5 py-3 font-semibold"
>
  Editar ejercicio
</button>

                      <button
                        onClick={() => eliminarEjercicio(item.id)}
                        className="bg-red-900/40 hover:bg-red-900/60 border border-red-800 rounded-xl px-5 py-3 font-semibold text-red-300"
                      >
                        Eliminar ejercicio
                      </button>

                    </div>

                  </div>
                )
              )}

            </div>

     </div>
        )}

        <div className="mt-8 grid gap-3">
          
          {ejercicios.length > 0 && rutina.dia < 7 && (
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/dashboard/alumnos/${alumnoId}/rutinas?semana=${rutina.semana}&dia=${rutina.dia + 1}`
                )
              }
              className="w-full bg-emerald-600 hover:bg-emerald-500 rounded-xl px-5 py-4 font-semibold"
            >
              → Crear entrenamiento Día {rutina.dia + 1}
            </button>
          )}

          {rutina.dia < 7 && (
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/dashboard/alumnos/${alumnoId}/rutinas?semana=${rutina.semana}&dia=${rutina.dia + 2}`
                )
              }
              className="w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl px-5 py-4 font-semibold"
            >
              → Dejar Día {rutina.dia + 1} sin planificar
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              router.push(`/dashboard/alumnos/${alumnoId}/rutinas-lista`)
            }
            className="w-full text-sm text-neutral-400 hover:text-white py-2"
          >
            ✓ Finalizar semana
          </button>

        </div>
      </div>
    </main>
  );
}