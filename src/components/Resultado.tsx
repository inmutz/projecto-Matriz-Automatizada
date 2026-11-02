"use client";

import { useState } from "react";
import { UMBRALES } from "@/config/matriz";
import { formatoMoneda, formatoPorcentaje, type Resultado as R } from "@/lib/calculos";
import { cargarLogo } from "@/lib/logo";
import { generarPDF } from "@/lib/pdf";

const ESTILO_DECISION: Record<R["decision"], string> = {
  Aprobado: "bg-green-700",
  "En revisión": "bg-amber-600",
  Rechazado: "bg-red-700",
};

const COLOR_BARRA: Record<R["nivelRiesgo"], string> = {
  Bajo: "bg-green-600",
  Medio: "bg-amber-500",
  Alto: "bg-red-600",
};

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{etiqueta}</dt>
      <dd className="mt-1 text-lg font-semibold tabular-nums text-slate-900">{valor}</dd>
    </div>
  );
}

export default function Resultado({ r }: { r: R }) {
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState("");

  const descargar = async () => {
    setGenerando(true);
    setError("");
    try {
      await generarPDF(r, await cargarLogo());
    } catch (e) {
      console.error(e);
      setError("No se pudo generar el PDF. Intenta de nuevo.");
    } finally {
      setGenerando(false);
    }
  };

  const porcentaje = Math.round((r.puntaje / r.puntajeMaximo) * 100);

  return (
    <section aria-live="polite" className="space-y-5">
      <div className={`flex flex-wrap items-center justify-between gap-2 rounded-xl px-5 py-4 text-white ${ESTILO_DECISION[r.decision]}`}>
        <p className="text-xl font-bold">{r.decision}</p>
        <p className="text-sm font-medium opacity-90">Riesgo {r.nivelRiesgo}</p>
      </div>

      <div>
        <div className="mb-1 flex justify-between text-sm">
          <span className="font-medium text-slate-700">Puntaje</span>
          <span className="tabular-nums text-slate-900">{r.puntaje} / {r.puntajeMaximo}</span>
        </div>
        <div className="relative h-3 overflow-hidden rounded-full bg-slate-200">
          <div className={`h-full ${COLOR_BARRA[r.nivelRiesgo]}`} style={{ width: `${porcentaje}%` }} />
          <div className="absolute inset-y-0 w-px bg-slate-500" style={{ left: `${UMBRALES.riesgoMedio}%` }} title="Mínimo riesgo medio" />
          <div className="absolute inset-y-0 w-px bg-slate-500" style={{ left: `${UMBRALES.riesgoBajo}%` }} title="Mínimo riesgo bajo" />
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3">
        <Dato etiqueta="Cuota mensual" valor={formatoMoneda(r.cuotaMensual)} />
        <Dato etiqueta="Cuota / salario" valor={formatoPorcentaje(r.relacionCuotaIngreso)} />
        <Dato etiqueta="Monto máx. sugerido" valor={formatoMoneda(r.montoMaximoSugerido)} />
        <Dato etiqueta="Total a pagar" valor={formatoMoneda(r.totalAPagar)} />
      </dl>
      <p className="text-xs text-slate-500">
        {r.producto.etiqueta}: tasa {formatoPorcentaje(r.producto.tasaAnual, 2)} anual, {r.producto.plazoMeses} meses.
      </p>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            <th className="py-1.5 font-medium">Criterio</th>
            <th className="py-1.5 font-medium">Selección</th>
            <th className="py-1.5 text-right font-medium">Puntos</th>
          </tr>
        </thead>
        <tbody>
          {r.detalle.map((d) => (
            <tr key={d.titulo} className="border-b border-slate-100">
              <td className="py-1.5 text-slate-700">{d.titulo}</td>
              <td className="py-1.5 text-slate-900">{d.opcion}</td>
              <td className="py-1.5 text-right tabular-nums text-slate-900">{d.puntos}/{d.maximo}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-2 text-sm">
        <p className="font-semibold text-slate-900">Motivos</p>
        <ul className="list-inside list-disc space-y-1 text-slate-700">
          {r.motivos.map((m) => <li key={m}>{m}</li>)}
        </ul>
        {r.advertencias.length > 0 && (
          <>
            <p className="pt-2 font-semibold text-slate-900">Observaciones</p>
            <ul className="list-inside list-disc space-y-1 text-amber-800">
              {r.advertencias.map((m) => <li key={m}>{m}</li>)}
            </ul>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={descargar}
        disabled={generando}
        className="w-full rounded-lg bg-slate-900 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
      >
        {generando ? "Generando…" : "Generar informe PDF"}
      </button>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </section>
  );
}
