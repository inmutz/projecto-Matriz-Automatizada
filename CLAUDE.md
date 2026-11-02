# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static Next.js (App Router, TypeScript, Tailwind v4) app that evaluates a client's credit request and downloads a PDF report. There is **no backend and no database**: all scoring and PDF generation run in the browser, and the site is deployed to GitHub Pages. UI text, identifiers, and docs are in Spanish; keep new code consistent with that.

## Commands

```bash
npm run dev      # dev server at http://localhost:3000
npm run build    # static export to out/ (also runs the TypeScript check)
npm run lint     # tsc --noEmit (type check only; there is no ESLint)
npm start        # serve the built out/ folder with `npx serve`
```

There is no test framework. To check the calculation logic or the PDF output without a browser, write a temporary `.mts` script under `src/` (so the `@/*` path alias resolves) and run it with `npx -y tsx src/<file>.mts`. Use `.mts` because top-level `await` fails in CommonJS. In Node, jsPDF's `doc.save()` writes the PDF to the current working directory. Delete the script and the generated PDFs afterwards.

## Architecture

Data flows one way: `src/config/matriz.ts` → `src/lib/calculos.ts` → UI preview / `src/lib/pdf.ts`.

- **`src/config/matriz.ts`** is the single source of truth for business rules: the options and points for each dropdown, each product's `tasaAnual`/`plazoMeses`/`montoMaximo`, the thresholds in `UMBRALES`, and the currency in `MONEDA`. The `CRITERIOS` array drives the order and rendering of the dropdowns, and its `clave` values define the `ClaveCriterio` type. To add a criterion, add an entry here and the form, scoring, and PDF table pick it up automatically. The current values are placeholders and the user will replace them with their real matrix.
- **`src/lib/calculos.ts`** contains pure functions. `validar()` returns a list of error strings. `calcular()` returns a `Resultado` with the score breakdown, risk level, monthly payment (fixed-payment amortization), the payment-to-salary ratio, the maximum suggested amount, the `decision`, and `motivos` and `advertencias`. Decision priority: any rejection reason → `Rechazado`; otherwise any review reason → `En revisión`; otherwise `Aprobado`. `advertencias` (for example, a salary outside the selected salary range) never change the decision. `calcular()` uses the product found through `seleccion.producto`.
- **`src/lib/pdf.ts`** imports `jspdf` and `jspdf-autotable` dynamically so they stay out of the initial bundle. The built-in PDF fonts only support Latin-1, so every string must go through the `t()` sanitizer, and Unicode symbols such as `•` and `≤` must not be used. Before the "Resultado" block, the code estimates its height and only adds a page if the block will not fit, so the report normally stays on one page. Keep that in mind when adding rows.
- **`src/assets/`** holds the app icon. `icono.svg` is the source and is used for the page header and favicon. `icono.png` is a 256px raster copy that exists because jsPDF cannot embed SVG. It is fetched at runtime by `src/lib/logo.ts` and passed to `generarPDF(r, logo)`. After editing the SVG, regenerate the PNG with `npx -y sharp-cli -i src/assets/icono.svg -o src/assets/icono.png resize 256 256`. Assets are imported statically, not placed in `public/`, so their URLs automatically include the GitHub Pages `basePath`.
- **`src/app/page.tsx`** holds the form state. Any form change clears the current `Resultado` so the user cannot download a report built from stale inputs.

## Deployment (GitHub Pages)

- `next.config.mjs` uses `output: "export"` and sets `basePath` to `/<repo>` only when `GITHUB_ACTIONS=true`, reading the repo name from `GITHUB_REPOSITORY`. It skips this for `*.github.io` repos. Local builds have no basePath. To simulate the Pages build, run `GITHUB_ACTIONS=true GITHUB_REPOSITORY=user/repo npm run build`.
- `turbopack.root` is pinned to the project directory because a stray `package-lock.json` exists in the user's home folder.
- `.github/workflows/deploy.yml` builds on every push to `main` and deploys `out/` with `actions/deploy-pages`. The repo must have Pages → Source set to "GitHub Actions". `public/.nojekyll` is required so that `_next/` is served.
- Nothing can use server features: no API routes, no `next/image` optimization, and no dynamic routes without `generateStaticParams`.
