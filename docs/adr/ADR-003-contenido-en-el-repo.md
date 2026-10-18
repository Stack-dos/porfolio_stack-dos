# ADR-003: Dónde vive el contenido

- **Estado**: Aceptada
- **Fecha**: 2026-10-17

## Contexto

El sitio tiene tres tipos de contenido: proyectos, integrantes con su CV, y páginas de la wiki de cada app. Lo cargan los dos integrantes del equipo, que son desarrolladores y ya trabajan con PR. Sumar contenido tiene que ser simple y no puede romper el sitio.

## Alternativas Consideradas

- **Alternativa A, Markdown en el repo**: content collections de Astro con esquemas Zod.
- **Alternativa B, CMS basado en git**: Decap CMS o Pages CMS.
- **Alternativa C, CMS headless externo**: Contentful o Sanity.
- **Alternativa D, wiki nativa de GitHub**: la pestaña Wiki del repo.

## Decisión Tomada

Se elige la **Alternativa A**. Todo el contenido son archivos Markdown en el repo, con estas colecciones:

- `src/content/proyectos/`: un archivo por proyecto.
- `src/content/integrantes/`: un archivo por integrante; el cuerpo es el CV.
- `src/content/docs/apps/<slug>/`: la wiki de cada app (Starlight).

Cada cambio entra por PR con revisión y build. Si en el futuro se suma alguien que no use git, se puede agregar B encima sin migrar contenido, porque también guarda Markdown en el repo.

## Ventajas y Desventajas

### Ventajas

- Contenido revisado, versionado y con historial.
- Un frontmatter inválido hace fallar el build y no llega a producción.
- Sin servicios externos ni costos.
- Se puede editar desde cualquier editor o desde la web de GitHub.

### Desventajas

- Requiere saber Markdown y YAML básico.
- No hay editor visual.
- Las imágenes se versionan en el repo, así que hay que cuidar su tamaño.
