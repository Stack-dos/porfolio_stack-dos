# ADR-008: Blog de novedades

- **Estado**: Aceptada
- **Fecha**: 2026-10-17

## Contexto

Queremos contar qué vamos haciendo: avances del equipo y, sobre todo, cada versión de los proyectos (`v0.1`, `v0.2`... hasta la versión final). La wiki documenta el estado actual de cada app, pero no cuenta su evolución. Hace falta un lugar con posteos fechados, filtrables por proyecto y con feed.

## Alternativas Consideradas

- **Alternativa A, plugin `starlight-blog`**: blog dentro de Starlight, con autores, tags, paginación y RSS ya resueltos.
- **Alternativa B, colección propia `blog` + páginas Astro**: control total del diseño, pero hay que hacer listado, tags, paginación y RSS (`@astrojs/rss`) a mano.
- **Alternativa C, solo GitHub Releases**: cero código, pero queda fuera del sitio y no sirve para posteos que no son releases.

## Decisión Tomada

Se elige la **Alternativa A**. Los posts se escriben en Markdown como el resto del contenido (ADR-003) y heredan el diseño de la wiki. Cada post de un proyecto lleva un tag con el slug del proyecto, y los releases además el tag `release`, para poder filtrar.

B se descarta porque reimplementa lo que el plugin ya trae. C sigue usándose para el versionado del sitio (sección 12 del PRD), pero no reemplaza al blog.

## Ventajas y Desventajas

### Ventajas

- Publicar un post es crear un `.md` y abrir un PR, sin tocar código.
- Tags, autores y RSS sin desarrollo propio.
- Mismo diseño y buscador que la wiki.

### Desventajas

- Dependencia de un plugin de la comunidad: puede tardar en soportar versiones nuevas de Astro/Starlight.
- El diseño queda atado al de Starlight.
