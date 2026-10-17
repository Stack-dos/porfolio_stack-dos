# ADR-006: Estrategia de ramas

- **Estado**: Aceptada
- **Fecha**: 2026-10-17

## Contexto

El equipo son dos personas. El sitio se publica al mergear a `main` (ADR-002), todo cambio pasa por PR con revisión y el PRD define releases versionados con SemVer.

## Alternativas Consideradas

- **Alternativa A, `feature/*` → `develop` → `main`**: GitFlow simplificado.
- **Alternativa B, trunk-based (`feature/*` → `main`)**: cada merge publica.
- **Alternativa C, híbrido**: el código pasa por `develop` y el contenido va directo a `main`.

## Decisión Tomada

Se elige la **Alternativa A**:

- Las ramas `feature/*`, `docs/*` y `fix/*` salen de `develop` y vuelven a `develop` por PR, con build en verde y aprobación del otro integrante.
- Para publicar se abre un PR de release de `develop` a `main`. Al mergearlo se crea el tag de versión y se dispara el deploy.
- Un hotfix urgente sale de `main` y vuelve a `main` y a `develop`.
- `develop` y `main` quedan protegidas: no se permite push directo y el check de build es obligatorio.

Se puede revisar después del lanzamiento de `v1.0.0`: si la mayoría de los cambios pasan a ser contenido, B es más ágil.

## Ventajas y Desventajas

### Ventajas

- Permite agrupar cambios en releases versionados.
- `main` siempre refleja lo publicado.
- Es el flujo que el equipo ya usa.

### Desventajas

- Cada cambio necesita dos PR para llegar a producción.
- Es más burocrático para cambios chicos de contenido.
- Hay riesgo de divergencia entre `develop` y `main` si los hotfix no se mergean de vuelta.
