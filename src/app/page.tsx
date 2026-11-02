"use client";

import { useState } from "react";
import Image from "next/image";
import icono from "@/assets/icono.svg";
import Formulario, { type DatosFormulario } from "@/components/Formulario";
import Resultado from "@/components/Resultado";
import { calcular, SELECCION_VACIA, validar, type Resultado as R, type Solicitud } from "@/lib/calculos";

const INICIAL: DatosFormulario = {
  cliente: "",
  identificacion: "",
  seleccion: SELECCION_VACIA,
  monto: "",
  salario: "",
};

export default function Home() {
  const [datos, setDatos] = useState<DatosFormulario>(INICIAL);
  const [errores, setErrores] = useState<string[]>([]);
  const [resultado, setResultado] = useState<R | null>(null);

  const cambiar = (d: DatosFormulario) => {
    setDatos(d);
    setResultado(null); // evita descargar un informe con datos desactualizados
  };

  const onCalcular = () => {
    const solicitud: Solicitud = {
      cliente: datos.cliente.trim(),
      identificacion: datos.identificacion.trim(),
      seleccion: datos.seleccion,
      montoSolicitado: Number(datos.monto),
      salario: Number(datos.salario),
    };
    const errs = validar(solicitud);
    setErrores(errs);
    setResultado(errs.length ? null : calcular(solicitud));
  };

  const limpiar = () => {
    setDatos(INICIAL);
    setErrores([]);
    setResultado(null);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <header className="mb-8 flex items-center gap-4">
        <Image src={icono} alt="" width={56} height={56} priority className="h-12 w-12 shrink-0 sm:h-14 sm:w-14" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Evaluación de solicitud</h1>
          <p className="mt-1 text-slate-600">
            Completa los criterios, calcula el resultado y descarga el informe en PDF.
          </p>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <Formulario datos={datos} onChange={cambiar} onCalcular={onCalcular} onLimpiar={limpiar} errores={errores} />
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:sticky lg:top-6">
          {resultado ? (
            <Resultado r={resultado} />
          ) : (
            <div className="py-10 text-center text-slate-500">
              <p className="font-medium text-slate-700">Sin resultado todavía</p>
              <p className="mt-1 text-sm">Completa el formulario y pulsa <strong>Calcular</strong>.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
