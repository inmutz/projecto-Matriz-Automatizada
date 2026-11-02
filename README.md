# Matriz Automatizada

Aplicación web para evaluar la solicitud de un cliente y generar un **informe en PDF**.
Todos los cálculos se hacen en el navegador: no necesita backend ni base de datos, así que se puede publicar gratis en **GitHub Pages**.

## Uso local

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # genera el sitio estático en la carpeta out/
```

## Cómo funciona

1. El usuario elige **Sector, Provincia, Score, Producto, Rango salarial y Edad**, y escribe el **monto solicitado** y el **salario**.
2. **Calcular** muestra el resultado en pantalla.
3. **Generar informe PDF** descarga el informe.

### Cálculos (`src/lib/calculos.ts`)

| Concepto | Fórmula |
|---|---|
| Puntaje | Suma de los puntos de cada opción elegida (máximo 100) |
| Nivel de riesgo | Bajo ≥ 70, Medio 50–69, Alto < 50 |
| Cuota mensual | Amortización francesa: `M · r / (1 − (1 + r)^−n)`, con `r = tasa anual / 12` y `n = plazo en meses` |
| Relación cuota / salario | `cuota / salario` |
| Monto máximo sugerido | Monto que se paga con el 40 % del salario, limitado al máximo del producto |

**Decisión**
- **Rechazado**: riesgo alto, cuota > 50 % del salario, o monto mayor al máximo del producto.
- **En revisión**: riesgo medio, o cuota entre 40 % y 50 % del salario.
- **Aprobado**: en cualquier otro caso.

## Editar la matriz

Todo se configura en **`src/config/matriz.ts`**:
- Opciones de cada menú desplegable y sus puntos.
- Tasa, plazo y monto máximo de cada producto.
- Umbrales de riesgo y de capacidad de pago (`UMBRALES`).
- Moneda y formato de números (`MONEDA`).

Los valores actuales son **de ejemplo**. Reemplázalos por los de tu matriz real.

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub (por ejemplo `matriz-automatizada`).
2. Sube el código:
   ```bash
   git init
   git add .
   git commit -m "Primera versión"
   git branch -M main
   git remote add origin https://github.com/<tu-usuario>/<tu-repo>.git
   git push -u origin main
   ```
3. En GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Cada `push` a `main` publica el sitio en `https://<tu-usuario>.github.io/<tu-repo>/`.
   El workflow está en `.github/workflows/deploy.yml`. La ruta base (`/<tu-repo>`) se ajusta sola.
