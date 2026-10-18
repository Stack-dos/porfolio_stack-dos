// @ts-check
// ↑ Le pide al editor que revise este archivo JS como si fuera TypeScript (autocompletado y errores).

// Configuración central del sitio. Astro la lee al correr `npm run dev` o `npm run build`.
// Guía: docs/guias/01-scaffold_astro.md (base), 03 (layout) y 04 (plugins).
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';
import starlightLinksValidator from 'starlight-links-validator';
import starlightImageZoom from 'starlight-image-zoom';

// Dominio y subcarpeta donde se publica en GitHub Pages:
// https://stack-dos.github.io/porfolio_stack-dos/
const site = 'https://stack-dos.github.io';
const base = '/porfolio_stack-dos'; // todos los links internos deben empezar con esto

// https://astro.build/config
export default defineConfig({
  site, // se usa para URLs absolutas: sitemap, Open Graph, canonical
  base,
  integrations: [
    // Diagramas ```mermaid en el Markdown. Va antes que Starlight para procesar esos bloques primero.
    // autoTheme: el diagrama cambia de colores con el modo claro/oscuro.
    mermaid({ autoTheme: true }),

    // Starlight: arma la wiki (sidebar, buscador, modo oscuro) y el layout que reusa el portfolio.
    starlight({
      title: 'Stack-dos', // nombre que aparece en el header y en la pestaña
      description: 'Portfolio y wiki de los proyectos del equipo Stack-dos.', // default para páginas sin description

      // Sitio en un solo idioma: español en la raíz (sin /es/ en las URLs).
      defaultLocale: 'root',
      locales: {
        root: { label: 'Español', lang: 'es' },
      },

      // Ícono de GitHub de la organización en el header.
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/stack-dos' }],

      // Muestra "Última actualización" al pie de cada página de la wiki (sale de la fecha del commit).
      lastUpdated: true,

      // Sin el índice "En esta página" de la derecha: más ancho para el contenido.
      tableOfContents: false,

      // Reemplazamos el componente SocialIcons por el nuestro, que suma los links
      // Inicio / Proyectos / Equipo / Wiki y después dibuja el original (guía 03).
      components: { SocialIcons: './src/components/NavLinks.astro' },

      // Estilos propios que se cargan en todas las páginas.
      customCss: ['./src/styles/custom.css'],

      // Etiquetas extra en el <head> de todas las páginas.
      // Starlight ya genera og:title/og:description por página; falta la imagen al compartir (guía 04).
      head: [
        { tag: 'meta', attrs: { property: 'og:image', content: `${site}${base}/og.png` } },
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
        // Estadísticas de visitas con Umami (sin cookies). Panel en https://cloud.umami.is
        {
          tag: 'script',
          attrs: {
            defer: true,
            src: 'https://cloud.umami.is/script.js',
            'data-website-id': 'd5ea7d34-331f-4010-b5ad-17b7fb1e198b',
          },
        },
      ],

      plugins: [
        // Hace fallar el build si un link interno de la wiki está roto.
        // Las páginas de src/pages (portfolio) no las puede validar: se excluyen a mano.
        // Si se crea una página nueva en src/pages y se linkea desde la wiki, agregarla acá.
        starlightLinksValidator({
          exclude: [`${base}/`, `${base}/proyectos/`, `${base}/equipo/**`],
        }),
        // Zoom al hacer clic en las imágenes de la wiki.
        starlightImageZoom(),
      ],
    }),
  ],
});
