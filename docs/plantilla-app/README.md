# Plantilla de wiki para una app

Copiá esta carpeta (menos este README) a `src/content/docs/apps/<slug>/`, reemplazá `SLUG` por el slug de la app y todo lo que dice `COMPLETAR`. El paso a paso completo está en [CONTRIBUIR.md](../CONTRIBUIR.md#4-wiki-de-una-app).

| Archivo           | Contenido                                  |
| ----------------- | ------------------------------------------ |
| `index.md`        | Qué es, estado, problema, alcance, roadmap |
| `instalacion.md`  | Requisitos, pasos y cómo verificar         |
| `arquitectura.md` | Stack, componentes, modelo de datos, ADRs  |
| `uso.md`          | Flujo típico y ejemplos por funcionalidad  |

Antes de abrir el PR: `grep -rn "COMPLETAR\|SLUG" src/content/docs/apps/<slug>/` no tiene que devolver nada.
