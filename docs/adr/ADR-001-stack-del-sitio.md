# ADR-001: Stack del sitio

- **Estado**: Aceptada
- **Fecha**: 2026-10-17

## Contexto

El sitio necesita un portfolio con páginas a medida (landing "Quiénes somos" y CV por integrante) y una wiki por app con sidebar y buscador. Se publica gratis en GitHub Pages y lo mantienen dos personas. Hoy es solo en español, pero tiene que poder sumar inglés más adelante.

## Alternativas Consideradas

- **Alternativa A, Astro + Starlight**: Astro para el portfolio y Starlight para la wiki, en un único proyecto.
- **Alternativa B, MkDocs Material**: generador de documentación en Python, todo en Markdown.
- **Alternativa C, Docusaurus**: docs, blog y páginas a medida con React.
- **Alternativa D, Jekyll (theme Chirpy)**: el generador nativo de GitHub Pages.
- **Alternativa E, HTML/CSS a mano**: sin framework.

## Decisión Tomada

Se elige la **Alternativa A, Astro + Starlight**. Es la única que resuelve bien las dos partes: páginas a medida para el portfolio y una wiki completa (sidebar, buscador, tabla de contenidos, modo oscuro, i18n) sin agregar complejidad. Las maquetas comparativas se revisaron en https://claude.ai/artifact/AR4PojgredzfXMuMS1CTra.

Las otras alternativas se descartaron por estos motivos:

- **B:** la landing y el CV quedan dentro del layout de documentación.
- **C:** es más pesada y obliga a usar React.
- **D:** sus themes modernos están pensados para blog, no para wiki por app, y no ejercitaría CI/CD propio.
- **E:** habría que construir la wiki entera a mano.

## Ventajas y Desventajas

### Ventajas

- Portfolio y wiki viven en el mismo proyecto y comparten el estilo.
- Buscador (Pagefind), sidebar, tabla de contenidos, modo oscuro e i18n vienen incluidos.
- El contenido se valida con esquemas: un frontmatter roto hace fallar el build.
- El sitio es muy liviano, casi sin JavaScript, lo que da buen Lighthouse.

### Desventajas

- Hay que aprender Astro.
- Requiere Node y un paso de build (CI).
- Que la landing y el CV se vean igual que la wiki lleva trabajo de CSS.
