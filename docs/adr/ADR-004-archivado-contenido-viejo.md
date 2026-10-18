# ADR-004: Qué hacer con el contenido viejo

- **Estado**: Aceptada
- **Fecha**: 2026-10-17

## Contexto

El repo contiene `PRD/`, `DER/` y `ADR/` del proyecto de estadísticas (Stat Pro). Esa documentación quedó desactualizada: el repo `app_estadistica` ya tiene toda su documentación autocontenida y en Markdown (ADR, diagramas, arquitectura y plan de desarrollo). Este repo pasa a ser solo el sitio portfolio + wiki.

## Alternativas Consideradas

- **Alternativa A, tag `legacy-estadisticas` y borrar de `develop`**.
- **Alternativa B, rama `legacy`**.
- **Alternativa C, moverlo al repo de Stat Pro**.
- **Alternativa D, migrarlo a la wiki del sitio**.

## Decisión Tomada

Se elige la **Alternativa A**:

1. Se crea el tag anotado `legacy-estadisticas` sobre el último commit de `develop` que contiene el material, y se publica en el remoto.
2. Se borran `PRD/`, `DER/` y `ADR/` de `develop`.

C y D se descartan porque el material está desactualizado: la fuente vigente de la documentación de Stat Pro es el repo `app_estadistica`. La wiki pública de Stat Pro se arma a partir de ese repo y no de este material. La plantilla de ADR se conserva en `docs/adr/template_adr.md`.

## Ventajas y Desventajas

### Ventajas

- El repo queda limpio y enfocado en el sitio.
- El tag congela una foto exacta y se recupera con `git checkout legacy-estadisticas`.

### Desventajas

- El tag es poco visible; se deja mencionado en el README.
