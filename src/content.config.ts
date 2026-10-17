import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

const proyectos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/proyectos' }),
  schema: z.object({
    nombre: z.string(),
    descripcion: z.string(),
    stack: z.array(z.string()).min(1),
    estado: z.enum(['planificado', 'en-desarrollo', 'publicado', 'archivado']),
    repo: z.url().optional(),
    wiki: z.string().startsWith('/apps/').optional(),
    destacado: z.boolean().default(false),
  }),
});

const integrantes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/integrantes' }),
  schema: ({ image }) =>
    z.object({
      nombre: z.string(),
      rol: z.string(),
      foto: image().optional(),
      email: z.email(),
      linkedin: z.url(),
      github: z.url(),
      cv_pdf: z.string().startsWith('/cv/').optional(),
    }),
});

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  proyectos,
  integrantes,
};
