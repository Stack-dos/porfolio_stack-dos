// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  site: 'https://stack-dos.github.io',
  base: '/porfolio_stack-dos',
  integrations: [
    starlight({
      title: 'Stack-dos',
      defaultLocale: 'root',
      locales: {
        root: { label: 'Español', lang: 'es' },
      },
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/stack-dos' }],
      lastUpdated: true,
    }),
  ],
});
