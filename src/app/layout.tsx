import type { Metadata } from "next";
import "./globals.css";
import iconoSvg from "@/assets/icono.svg";
import iconoPng from "@/assets/icono.png";

export const metadata: Metadata = {
  title: "Matriz Automatizada | Evaluación de solicitudes",
  description: "Evalúa solicitudes de crédito y genera un informe PDF.",
  icons: {
    icon: [{ url: iconoSvg.src, type: "image/svg+xml" }, { url: iconoPng.src, type: "image/png" }],
    apple: iconoPng.src,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-100 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
