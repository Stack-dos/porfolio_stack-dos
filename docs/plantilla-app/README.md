# Plantilla de wiki para una app

Copiá `index.mdx` a `src/content/docs/apps/<slug>/index.mdx` y reemplazá todo lo que dice `COMPLETAR`. El paso a paso completo está en [CONTRIBUIR.md](../CONTRIBUIR.md#4-wiki-de-una-app).

Cada app es **una sola página con pestañas** (componente `<Tabs>` de Starlight), sin sidebar:

| Pestaña      | Contenido                                       |
| ------------ | ----------------------------------------------- |
| Inicio       | Qué es, estado, problema, alcance, roadmap      |
| Instalación  | Requisitos y pasos (componente `<Steps>`)       |
| Arquitectura | Stack, componentes (Mermaid), modelo, ADRs      |
| Uso          | Flujo típico (`<Steps>`) y ejemplos por función |

Es `.mdx` (Markdown + componentes), así que: comentarios con `{/* ... */}` en vez de `<!-- -->`, y links con `[texto](url)` en vez de `<url>`.

Antes de abrir el PR: `grep -n "COMPLETAR" src/content/docs/apps/<slug>/index.mdx` no tiene que devolver nada.
