import {
  CRITERIOS,
  MONEDA,
  PRODUCTOS,
  RANGOS_SALARIALES,
  UMBRALES,
  type ClaveCriterio,
  type Opcion,
  type Producto,
} from "@/config/matriz";

export type Solicitud = {
  cliente: string;
  identificacion: string;
  seleccion: Record<ClaveCriterio, string>;
  montoSolicitado: number;
  salario: number;
};

export type NivelRiesgo = "Bajo" | "Medio" | "Alto";
export type Decision = "Aprobado" | "En revisión" | "Rechazado";

export type DetalleCriterio = {
  titulo: string;
  opcion: string;
  puntos: number;
  maximo: number;
};

export type Resultado = {
  fecha: Date;
  solicitud: Solicitud;
  producto: Producto;
  detalle: DetalleCriterio[];
  puntaje: number;
  puntajeMaximo: number;
  nivelRiesgo: NivelRiesgo;
  cuotaMensual: number;
  totalAPagar: number;
  relacionCuotaIngreso: number;
  montoMaximoSugerido: number;
  decision: Decision;
  motivos: string[];
  advertencias: string[];
};

export const SELECCION_VACIA = Object.fromEntries(
  CRITERIOS.map((c) => [c.clave, ""]),
) as Record<ClaveCriterio, string>;

/** Cuota mensual con amortización francesa (cuota fija). */
export function cuotaMensual(monto: number, tasaAnual: number, plazoMeses: number): number {
  const r = tasaAnual / 12;
  if (r === 0) return monto / plazoMeses;
  return (monto * r) / (1 - Math.pow(1 + r, -plazoMeses));
}

/** Monto que se puede financiar con una cuota dada (valor presente). */
export function montoParaCuota(cuota: number, tasaAnual: number, plazoMeses: number): number {
  const r = tasaAnual / 12;
  if (r === 0) return cuota * plazoMeses;
  return (cuota * (1 - Math.pow(1 + r, -plazoMeses))) / r;
}

export function nivelDeRiesgo(puntaje: number): NivelRiesgo {
  if (puntaje >= UMBRALES.riesgoBajo) return "Bajo";
  if (puntaje >= UMBRALES.riesgoMedio) return "Medio";
  return "Alto";
}

/** Devuelve la lista de errores de validación (vacía si todo está bien). */
export function validar(s: Solicitud): string[] {
  const errores: string[] = [];
  for (const c of CRITERIOS) {
    if (!s.seleccion[c.clave]) errores.push(`Selecciona una opción en "${c.titulo}".`);
  }
  if (!(s.montoSolicitado > 0)) errores.push("El monto solicitado debe ser mayor que 0.");
  if (!(s.salario > 0)) errores.push("El salario debe ser mayor que 0.");
  return errores;
}

export function calcular(s: Solicitud): Resultado {
  const detalle: DetalleCriterio[] = CRITERIOS.map((c) => {
    const opciones = c.opciones as readonly Opcion[];
    const op = opciones.find((o) => o.id === s.seleccion[c.clave]);
    if (!op) throw new Error(`Opción inválida en ${c.titulo}`);
    return {
      titulo: c.titulo,
      opcion: op.etiqueta,
      puntos: op.puntos,
      maximo: Math.max(...opciones.map((o) => o.puntos)),
    };
  });

  const puntaje = detalle.reduce((acc, d) => acc + d.puntos, 0);
  const puntajeMaximo = detalle.reduce((acc, d) => acc + d.maximo, 0);
  const nivelRiesgo = nivelDeRiesgo(puntaje);

  const producto = PRODUCTOS.find((p) => p.id === s.seleccion.producto)!;
  const cuota = cuotaMensual(s.montoSolicitado, producto.tasaAnual, producto.plazoMeses);
  const relacion = cuota / s.salario;
  const montoMaximoSugerido = Math.min(
    montoParaCuota(s.salario * UMBRALES.relacionCuotaMax, producto.tasaAnual, producto.plazoMeses),
    producto.montoMaximo,
  );

  // --- Decisión -------------------------------------------------
  const rechazo: string[] = [];
  const revision: string[] = [];
  const pct = (n: number) => `${(n * 100).toFixed(1)} %`;

  if (nivelRiesgo === "Alto")
    rechazo.push(`Puntaje de ${puntaje} por debajo del mínimo de ${UMBRALES.riesgoMedio} (riesgo alto).`);
  else if (nivelRiesgo === "Medio")
    revision.push(`Puntaje de ${puntaje} en rango de riesgo medio (${UMBRALES.riesgoMedio}–${UMBRALES.riesgoBajo - 1}).`);

  if (relacion > UMBRALES.relacionCuotaRechazo)
    rechazo.push(`La cuota representa ${pct(relacion)} del salario (máximo ${pct(UMBRALES.relacionCuotaRechazo)}).`);
  else if (relacion > UMBRALES.relacionCuotaMax)
    revision.push(`La cuota representa ${pct(relacion)} del salario (recomendado hasta ${pct(UMBRALES.relacionCuotaMax)}).`);

  if (s.montoSolicitado > producto.montoMaximo)
    rechazo.push(`El monto solicitado supera el máximo del producto (${formatoMoneda(producto.montoMaximo)}).`);

  let decision: Decision;
  let motivos: string[];
  if (rechazo.length) {
    decision = "Rechazado";
    motivos = [...rechazo, ...revision];
  } else if (revision.length) {
    decision = "En revisión";
    motivos = revision;
  } else {
    decision = "Aprobado";
    motivos = [
      `Puntaje de ${puntaje} con riesgo bajo.`,
      `La cuota representa ${pct(relacion)} del salario, dentro del límite de ${pct(UMBRALES.relacionCuotaMax)}.`,
    ];
  }

  // --- Advertencias (no cambian la decisión) --------------------
  const advertencias: string[] = [];
  const rango = RANGOS_SALARIALES.find((r) => r.id === s.seleccion.rangoSalarial);
  if (rango && ((rango.min !== undefined && s.salario < rango.min) || (rango.max !== undefined && s.salario > rango.max)))
    advertencias.push(`El salario ingresado (${formatoMoneda(s.salario)}) no coincide con el rango salarial seleccionado (${rango.etiqueta}).`);
  if (decision !== "Aprobado" && montoMaximoSugerido > 0 && montoMaximoSugerido < s.montoSolicitado)
    advertencias.push(`Monto máximo sugerido según capacidad de pago: ${formatoMoneda(montoMaximoSugerido)}.`);

  return {
    fecha: new Date(),
    solicitud: s,
    producto,
    detalle,
    puntaje,
    puntajeMaximo,
    nivelRiesgo,
    cuotaMensual: cuota,
    totalAPagar: cuota * producto.plazoMeses,
    relacionCuotaIngreso: relacion,
    montoMaximoSugerido,
    decision,
    motivos,
    advertencias,
  };
}

const fmtMoneda = new Intl.NumberFormat(MONEDA.locale, {
  style: "currency",
  currency: MONEDA.codigo,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatoMoneda(n: number): string {
  return fmtMoneda.format(n);
}

export function formatoPorcentaje(n: number, decimales = 1): string {
  return `${(n * 100).toFixed(decimales)} %`;
}
