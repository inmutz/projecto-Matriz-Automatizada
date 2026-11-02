import icono from "@/assets/icono.png";

/** Descarga el ícono PNG para incrustarlo en el PDF. Devuelve undefined si falla. */
export async function cargarLogo(): Promise<Uint8Array | undefined> {
  try {
    const res = await fetch(icono.src);
    if (!res.ok) return undefined;
    return new Uint8Array(await res.arrayBuffer());
  } catch {
    return undefined;
  }
}
