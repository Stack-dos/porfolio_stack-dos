# ADR-005: Cómo llega la documentación de cada app a la wiki

- **Estado**: Aceptada
- **Fecha**: 2026-10-17

## Contexto

Cada app (`app_estadistica`, VIN Decoder, etc.) tiene su documentación en Markdown en su propio repo. Esa documentación incluye material que no corresponde mostrar públicamente: guías internas, archivos de contexto para IA, planes de trabajo. La wiki del sitio tiene que mostrar solo lo relevante de cada app.

## Alternativas Consideradas

- **Alternativa A, escribirla a mano en este repo**: se curan y adaptan los contenidos de cada app.
- **Alternativa B, traerla al compilar**: el workflow clona cada repo y copia su `docs/`.
- **Alternativa C, git submodules**: cada repo enlazado dentro de `src/content/docs/apps/`.
- **Alternativa D, híbrido**: portada a mano y documentación técnica importada.

## Decisión Tomada

Se elige la **Alternativa A**. Para cada proyecto se toma su documentación como insumo y se arma a mano la wiki en `src/content/docs/apps/<slug>/`, publicando solo lo que aporta a quien visita el sitio.

B, C y D se descartan porque importarían material interno que no debe publicarse (guías, contexto de IA) y suman automatización y tokens innecesarios para un equipo de dos.

Para mitigar la desincronización:

- La portada de cada app indica la fecha de la última actualización.
- Al cerrar un hito o release de una app, se revisa si su wiki necesita cambios.

## Ventajas y Desventajas

### Ventajas

- Control total de qué se publica: nada interno llega al sitio por accidente.
- El contenido se adapta al público del sitio (reclutadores, clientes, devs).
- No hay automatización, tokens ni dependencias entre repos.

### Desventajas

- La documentación queda duplicada y puede desincronizarse con el repo de cada app.
- Actualizar la wiki es trabajo manual.
