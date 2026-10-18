// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';
import starlightLinksValidator from 'starlight-links-validator';
import starlightImageZoom from 'starlight-image-zoom';

const site = 'https://stack-dos.github.io';
const base = '/porfolio_stack-dos';

// https://astro.build/config
export default defineConfig({
  site,
  base,
  integrations: [
    // Mermaid va antes que Starlight para procesar los bloques ```mermaid primero.
    mermaid({ autoTheme: true }),
    starlight({
      title: 'Stack-dos',
      description: 'Portfolio y wiki de los proyectos del equipo Stack-dos.',
      defaultLocale: 'root',
      locales: {
        root: { label: 'Español', lang: 'es' },
      },
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/stack-dos' }],
      lastUpdated: true,
      components: { SocialIcons: './src/components/NavLinks.astro' },
      customCss: ['./src/styles/custom.css'],
      // Starlight ya genera og:title/og:description por página; falta la imagen al compartir.
      head: [
        { tag: 'meta', attrs: { property: 'og:image', content: `${site}${base}/og.png` } },
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
      ],
      plugins: [
        // Las páginas de src/pages (portfolio) no las puede validar: se excluyen a mano.
        starlightLinksValidator({
          exclude: [`${base}/`, `${base}/proyectos/`, `${base}/equipo/**`],
        }),
        starlightImageZoom(),
      ],
    }),
  ],
});
