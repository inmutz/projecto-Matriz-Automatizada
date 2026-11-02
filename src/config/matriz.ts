/**
 * MATRIZ DE EVALUACIÓN (EJEMPLO)
 * ---------------------------------------------------------------
 * Este es el ÚNICO archivo que necesitas editar para cambiar:
 *   - las opciones de los menús desplegables,
 *   - los puntos que aporta cada opción,
 *   - las tasas, plazos y montos máximos de cada producto,
 *   - los umbrales de riesgo y de capacidad de pago.
 *
 * Regla general: más puntos = menor riesgo.
 * La suma de los puntos máximos de todos los criterios es 100.
 */

export type Opcion = {
  id: string;
  etiqueta: string;
  puntos: number;
};

export type OpcionRango = Opcion & {
  /** Límites opcionales, usados para validar coherencia con el salario. */
  min?: number;
  max?: number;
};

export type Producto = Opcion & {
  /** Tasa de interés anual (0.18 = 18 %). */
  tasaAnual: number;
  /** Plazo en meses. */
  plazoMeses: number;
  /** Monto máximo que se puede prestar con este producto. */
  montoMaximo: number;
};

export const MONEDA = {
  /** Código ISO de la moneda, usado para formatear cifras. */
  codigo: "USD",
  /** Configuración regional para formato de números. */
  locale: "es-US",
};

export const SECTORES: Opcion[] = [
  { id: "publico", etiqueta: "Sector público", puntos: 20 },
  { id: "privado", etiqueta: "Privado formal", puntos: 15 },
  { id: "independiente", etiqueta: "Independiente", puntos: 10 },
  { id: "informal", etiqueta: "Informal", puntos: 5 },
];

export const PROVINCIAS: Opcion[] = [
  { id: "prov-a", etiqueta: "Provincia A", puntos: 10 },
  { id: "prov-b", etiqueta: "Provincia B", puntos: 8 },
  { id: "prov-c", etiqueta: "Provincia C", puntos: 6 },
  { id: "prov-d", etiqueta: "Provincia D", puntos: 4 },
];

export const SCORES: Opcion[] = [
  { id: "750+", etiqueta: "750 o más (Excelente)", puntos: 30 },
  { id: "700-749", etiqueta: "700 – 749 (Muy bueno)", puntos: 24 },
  { id: "650-699", etiqueta: "650 – 699 (Bueno)", puntos: 18 },
  { id: "600-649", etiqueta: "600 – 649 (Regular)", puntos: 10 },
  { id: "<600", etiqueta: "Menos de 600 (Bajo)", puntos: 0 },
];

export const PRODUCTOS: Producto[] = [
  { id: "hipotecario", etiqueta: "Préstamo hipotecario", puntos: 10, tasaAnual: 0.11, plazoMeses: 240, montoMaximo: 10_000_000 },
  { id: "vehiculo", etiqueta: "Préstamo de vehículo", puntos: 8, tasaAnual: 0.13, plazoMeses: 60, montoMaximo: 3_000_000 },
  { id: "personal", etiqueta: "Préstamo personal", puntos: 6, tasaAnual: 0.18, plazoMeses: 48, montoMaximo: 1_000_000 },
  { id: "tarjeta", etiqueta: "Tarjeta de crédito", puntos: 4, tasaAnual: 0.6, plazoMeses: 12, montoMaximo: 300_000 },
];

export const RANGOS_SALARIALES: OpcionRango[] = [
  { id: "r1", etiqueta: "Hasta 15,000", puntos: 3, min: 0, max: 15_000 },
  { id: "r2", etiqueta: "15,001 – 30,000", puntos: 6, min: 15_001, max: 30_000 },
  { id: "r3", etiqueta: "30,001 – 60,000", puntos: 9, min: 30_001, max: 60_000 },
  { id: "r4", etiqueta: "60,001 – 100,000", puntos: 12, min: 60_001, max: 100_000 },
  { id: "r5", etiqueta: "Más de 100,000", puntos: 15, min: 100_001 },
];

export const EDADES: Opcion[] = [
  { id: "18-24", etiqueta: "18 – 24 años", puntos: 8 },
  { id: "25-35", etiqueta: "25 – 35 años", puntos: 15 },
  { id: "36-50", etiqueta: "36 – 50 años", puntos: 15 },
  { id: "51-60", etiqueta: "51 – 60 años", puntos: 10 },
  { id: "61+", etiqueta: "61 años o más", puntos: 5 },
];

export const UMBRALES = {
  /** Puntaje mínimo para riesgo BAJO. */
  riesgoBajo: 70,
  /** Puntaje mínimo para riesgo MEDIO (por debajo es ALTO). */
  riesgoMedio: 50,
  /** Relación cuota / salario aceptable (0.40 = 40 %). */
  relacionCuotaMax: 0.4,
  /** Por encima de esta relación la solicitud se rechaza. */
  relacionCuotaRechazo: 0.5,
};

/** Criterios que se muestran como menús desplegables, en orden. */
export const CRITERIOS = [
  { clave: "sector", titulo: "Sector", opciones: SECTORES },
  { clave: "provincia", titulo: "Provincia", opciones: PROVINCIAS },
  { clave: "score", titulo: "Score crediticio", opciones: SCORES },
  { clave: "producto", titulo: "Producto", opciones: PRODUCTOS },
  { clave: "rangoSalarial", titulo: "Rango salarial", opciones: RANGOS_SALARIALES },
  { clave: "edad", titulo: "Edad", opciones: EDADES },
] as const;

export type ClaveCriterio = (typeof CRITERIOS)[number]["clave"];
