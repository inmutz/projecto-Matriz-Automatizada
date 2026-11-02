/**
 * Exportación estática para GitHub Pages.
 * En GitHub Actions el sitio se sirve en https://<usuario>.github.io/<repo>/,
 * por eso se usa basePath = "/<repo>". En local queda vacío.
 */
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isPages = process.env.GITHUB_ACTIONS === "true" && repo && !repo.endsWith(".github.io");
const basePath = isPages ? `/${repo}` : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  devIndicators: false,
  turbopack: { root: dirname(fileURLToPath(import.meta.url)) },
};

export default nextConfig;
