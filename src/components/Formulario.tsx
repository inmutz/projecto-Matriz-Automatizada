"use client";

import { CRITERIOS, type ClaveCriterio } from "@/config/matriz";

export type DatosFormulario = {
  cliente: string;
  identificacion: string;
  seleccion: Record<ClaveCriterio, string>;
  monto: string;
  salario: string;
};

type Props = {
  datos: DatosFormulario;
  onChange: (datos: DatosFormulario) => void;
  onCalcular: () => void;
  onLimpiar: () => void;
  errores: string[];
};

const claseCampo =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20";
const claseEtiqueta = "mb-1 block text-sm font-medium text-slate-700";

export default function Formulario({ datos, onChange, onCalcular, onLimpiar, errores }: Props) {
  const set = <K extends keyof DatosFormulario>(k: K, v: DatosFormulario[K]) => onChange({ ...datos, [k]: v });

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onCalcular();
      }}
      noValidate
    >
      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-900">Cliente</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cliente" className={claseEtiqueta}>Nombre (opcional)</label>
            <input id="cliente" className={claseCampo} value={datos.cliente} onChange={(e) => set("cliente", e.target.value)} />
          </div>
          <div>
            <label htmlFor="identificacion" className={claseEtiqueta}>Identificación (opcional)</label>
            <input id="identificacion" className={claseCampo} value={datos.identificacion} onChange={(e) => set("identificacion", e.target.value)} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-900">Criterios</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CRITERIOS.map((c) => (
            <div key={c.clave}>
              <label htmlFor={c.clave} className={claseEtiqueta}>{c.titulo}</label>
              <select
                id={c.clave}
                className={claseCampo}
                value={datos.seleccion[c.clave]}
                onChange={(e) => set("seleccion", { ...datos.seleccion, [c.clave]: e.target.value })}
              >
                <option value="">Seleccionar…</option>
                {c.opciones.map((o) => (
                  <option key={o.id} value={o.id}>{o.etiqueta}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-900">Montos</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="monto" className={claseEtiqueta}>Monto solicitado</label>
            <input
              id="monto" type="number" inputMode="decimal" min={0} step="0.01" placeholder="0.00"
              className={claseCampo} value={datos.monto} onChange={(e) => set("monto", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="salario" className={claseEtiqueta}>Salario mensual</label>
            <input
              id="salario" type="number" inputMode="decimal" min={0} step="0.01" placeholder="0.00"
              className={claseCampo} value={datos.salario} onChange={(e) => set("salario", e.target.value)}
            />
          </div>
        </div>
      </section>

      {errores.length > 0 && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="mb-1 font-semibold">Revisa los siguientes campos:</p>
          <ul className="list-inside list-disc space-y-0.5">
            {errores.map((e) => <li key={e}>{e}</li>)}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="rounded-lg bg-blue-700 px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
          Calcular
        </button>
        <button type="button" onClick={onLimpiar} className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100">
          Limpiar
        </button>
      </div>
    </form>
  );
}
