# ADR-007: Formato del CV

- **Estado**: Aceptada
- **Fecha**: 2026-10-17

## Contexto

Cada integrante tiene su CV en `/equipo/<slug>/`, pensado para reclutadores y clientes. La web es lo que se comparte con un link; los procesos de selección suelen pedir un PDF para adjuntar.

## Alternativas Consideradas

- **Alternativa A, solo página web**: Markdown en la colección `integrantes`.
- **Alternativa B, solo PDF**: archivo subido al repo y enlazado.
- **Alternativa C, web + PDF opcional hecho a mano**.
- **Alternativa D, web + PDF generado automáticamente**: con CSS de impresión o exportado en el build con un navegador headless.

## Decisión Tomada

Se elige la **Alternativa C**:

- El CV web sale del cuerpo Markdown del archivo de cada integrante.
- El PDF es opcional: si el campo `cv_pdf` existe, se muestra el botón "Descargar CV (PDF)" y el archivo vive en `public/cv/<slug>.pdf`.
- La página de CV incluye una hoja de estilos de impresión (`@media print`) para que "Imprimir → Guardar como PDF" dé un resultado prolijo aunque no haya PDF subido.

Si mantener los dos formatos se vuelve costoso, se puede migrar a D más adelante.

## Ventajas y Desventajas

### Ventajas

- La web se comparte, Google la indexa y se lee bien en el celular.
- Hay un PDF para postulaciones, con el diseño que cada integrante quiera.
- No se agregan dependencias ni pasos al build.

### Desventajas

- Hay dos formatos que mantener, que pueden desincronizarse.
- El PDF es binario y no se puede revisar en un PR.
