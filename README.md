# Stack-dos — Portfolio + Wiki

Sitio del equipo Stack-dos: presentación, CVs de los integrantes, listado de proyectos y una wiki con la documentación de cada app.

**Sitio:** <https://stack-dos.github.io/porfolio_stack-dos/>

Hecho con [Astro](https://astro.build) + [Starlight](https://starlight.astro.build) y publicado en GitHub Pages. El plan completo está en [docs/PRD.md](docs/PRD.md).

## Correrlo local

Requiere Node (versión en `.nvmrc`).

```bash
npm install
npm run dev     # http://localhost:4321/porfolio_stack-dos/
npm run build   # build de producción en dist/
```

## Agregar contenido

| Qué             | Dónde                               |
| --------------- | ----------------------------------- |
| Proyecto        | `src/content/proyectos/<slug>.md`   |
| Integrante/CV   | `src/content/integrantes/<slug>.md` |
| Wiki de una app | `src/content/docs/apps/<slug>/`     |

Paso a paso completo en [docs/runbook-contenido.md](docs/runbook-contenido.md).

Flujo: rama desde `develop` → cambios → PR a `develop` con revisión del otro integrante. Se publica con el PR de release a `main`.

## Contenido anterior

La documentación vieja de la app de estadísticas (PRD, DER, ADRs) está archivada en el tag `legacy-estadisticas`:

```bash
git checkout legacy-estadisticas
```
