import type { Resultado } from "./calculos";
import { formatoMoneda, formatoPorcentaje } from "./calculos";

const COLOR_DECISION: Record<Resultado["decision"], [number, number, number]> = {
  Aprobado: [22, 128, 61],
  "En revisión": [180, 110, 0],
  Rechazado: [185, 28, 28],
};

const AZUL: [number, number, number] = [30, 58, 95];

/** Las fuentes estándar del PDF solo cubren Latin-1: limpiamos caracteres fuera de rango. */
function t(s: string): string {
  return s
    .replace(/[  ]/g, " ")
    .replace(/[–—]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"');
}

function nombreArchivo(r: Resultado): string {
  const cliente = (r.solicitud.cliente || "cliente")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  const f = r.fecha;
  const fecha = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}-${String(f.getDate()).padStart(2, "0")}`;
  return `informe-${cliente || "cliente"}-${fecha}.pdf`;
}

/**
 * @param logo Bytes del ícono en PNG (ver `cargarLogo` en ./logo.ts). Si falta, el PDF se genera sin ícono.
 */
export async function generarPDF(r: Resultado, logo?: Uint8Array): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const ancho = doc.internal.pageSize.getWidth();
  const margen = 15;
  let y = 0;
  const der = (content: string) => ({ content, styles: { halign: "right" as const } });
  const finalY = () => (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  // --- Encabezado ---------------------------------------------
  doc.setFillColor(...AZUL);
  doc.rect(0, 0, ancho, 24, "F");
  let xTitulo = margen;
  if (logo) {
    doc.addImage(logo, "PNG", margen, 4, 16, 16, "logo", "FAST");
    xTitulo = margen + 20;
  }
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(t("Informe de evaluación de solicitud"), xTitulo, 11.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    t(`Generado el ${r.fecha.toLocaleDateString("es")} a las ${r.fecha.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}`),
    xTitulo,
    18.5,
  );
  y = 32;

  const titulo = (texto: string) => {
    doc.setTextColor(...AZUL);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(t(texto), margen, y);
    y += 2;
  };

  const tablaClaveValor = (filas: [string, string][]) => {
    autoTable(doc, {
      startY: y,
      margin: { left: margen, right: margen },
      body: filas.map(([k, v]) => [t(k), t(v)]),
      theme: "grid",
      styles: { fontSize: 9.5, cellPadding: 1.5 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 65, fillColor: [241, 245, 249] } },
    });
    y = finalY() + 7;
  };

  // --- Datos del cliente --------------------------------------
  titulo("Datos del cliente");
  tablaClaveValor([
    ["Nombre", r.solicitud.cliente || "-"],
    ["Identificación", r.solicitud.identificacion || "-"],
    ["Monto solicitado", formatoMoneda(r.solicitud.montoSolicitado)],
    ["Salario mensual", formatoMoneda(r.solicitud.salario)],
  ]);

  // --- Criterios evaluados ------------------------------------
  titulo("Criterios evaluados");
  autoTable(doc, {
    startY: y,
    margin: { left: margen, right: margen },
    head: [["Criterio", t("Selección"), der("Puntos"), der(t("Máximo"))]],
    body: r.detalle.map((d) => [t(d.titulo), t(d.opcion), String(d.puntos), String(d.maximo)]),
    foot: [["Total", "", der(String(r.puntaje)), der(String(r.puntajeMaximo))]],
    theme: "grid",
    styles: { fontSize: 9.5, cellPadding: 1.5 },
    headStyles: { fillColor: AZUL },
    footStyles: { fillColor: [226, 232, 240], textColor: 20 },
    columnStyles: { 2: { halign: "right" }, 3: { halign: "right" } },
  });
  y = finalY() + 7;

  // --- Análisis financiero ------------------------------------
  titulo("Análisis financiero");
  tablaClaveValor([
    ["Producto", r.producto.etiqueta],
    ["Tasa de interés anual", formatoPorcentaje(r.producto.tasaAnual, 2)],
    ["Plazo", `${r.producto.plazoMeses} meses`],
    ["Cuota mensual estimada", formatoMoneda(r.cuotaMensual)],
    ["Total a pagar", formatoMoneda(r.totalAPagar)],
    ["Relación cuota / salario", formatoPorcentaje(r.relacionCuotaIngreso)],
    ["Monto máximo sugerido", formatoMoneda(r.montoMaximoSugerido)],
    ["Monto máximo del producto", formatoMoneda(r.producto.montoMaximo)],
  ]);

  // --- Resultado ----------------------------------------------
  doc.setFontSize(10);
  const lineasTexto = [...r.motivos, ...r.advertencias].reduce(
    (n, m) => n + doc.splitTextToSize(t(`- ${m}`), ancho - margen * 2 - 4).length,
    0,
  );
  const altoResultado = 4 + 21 + (lineasTexto + 2) * 5 + 6;
  if (y + altoResultado > doc.internal.pageSize.getHeight() - 18) {
    doc.addPage();
    y = 20;
  }
  titulo("Resultado");
  y += 2;
  const color = COLOR_DECISION[r.decision];
  doc.setFillColor(...color);
  doc.roundedRect(margen, y, ancho - margen * 2, 14, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(t(`DECISIÓN: ${r.decision.toUpperCase()}`), margen + 5, y + 9);
  doc.setFontSize(11);
  doc.text(
    t(`Puntaje ${r.puntaje}/${r.puntajeMaximo}  |  Riesgo ${r.nivelRiesgo}`),
    ancho - margen - 5,
    y + 9,
    { align: "right" },
  );
  y += 21;

  const lista = (encabezado: string, items: string[]) => {
    if (!items.length) return;
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(t(encabezado), margen, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    for (const item of items) {
      const lineas = doc.splitTextToSize(t(`- ${item}`), ancho - margen * 2 - 4);
      doc.text(lineas, margen + 2, y);
      y += lineas.length * 5;
    }
    y += 3;
  };
  lista("Motivos:", r.motivos);
  lista("Observaciones:", r.advertencias);

  // --- Pie de página ------------------------------------------
  const paginas = doc.getNumberOfPages();
  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i);
    const alto = doc.internal.pageSize.getHeight();
    doc.setDrawColor(200, 200, 200);
    doc.line(margen, alto - 14, ancho - margen, alto - 14);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(t("Documento generado automáticamente. Resultado orientativo sujeto a verificación."), margen, alto - 9);
    doc.text(`${i} / ${paginas}`, ancho - margen, alto - 9, { align: "right" });
  }

  doc.save(nombreArchivo(r));
}
