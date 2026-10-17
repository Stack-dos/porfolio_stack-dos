# ADR-002: Método de deploy a GitHub Pages

- **Estado**: Aceptada
- **Fecha**: 2026-10-17

## Contexto

Astro (ADR-001) requiere un paso de build que genera `dist/`, y GitHub Pages tiene que servir ese resultado. El flujo de ramas es `feature/*` → `develop` → `main`, y el sitio se publica cuando `develop` se mergea a `main`.

## Alternativas Consideradas

- **Alternativa A, GitHub Actions + Pages oficial**: `withastro/action` para el build y `actions/deploy-pages` para publicar, con la fuente de Pages configurada en "GitHub Actions".
- **Alternativa B, Actions que pushea a una rama `gh-pages`**: `peaceiris/actions-gh-pages`.
- **Alternativa C, build local y push de `dist/`**: deploy manual sin CI.
- **Alternativa D, hosting externo**: Netlify, Vercel o Cloudflare Pages.

## Decisión Tomada

Se elige la **Alternativa A**. Es el método recomendado por Astro y por GitHub, no versiona archivos generados y cada deploy queda registrado en Actions y en el entorno `github-pages`.

Flujo resultante:

1. El PR de feature a `develop` corre el check de build y se mergea con aprobación.
2. El PR de release de `develop` a `main` corre el mismo check y se mergea.
3. El push a `main` dispara el workflow de deploy, que publica el sitio. También se puede disparar a mano con `workflow_dispatch`.

## Ventajas y Desventajas

### Ventajas

- Usa el método oficial, sin actions de terceros para publicar.
- El historial queda limpio, sin commits de archivos generados.
- Hay trazabilidad entre el commit de `main` y la versión publicada.
- Ejercita CI/CD real.

### Desventajas

- Requiere mantener un workflow YAML con los permisos `pages: write` e `id-token: write`.
- Hay que configurar la fuente de Pages como "GitHub Actions" en el repo, una sola vez.
- No hay previews por PR como en el hosting externo; se compensa con el build de CI y se puede revisar más adelante.
