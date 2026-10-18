// Colecciones de contenido: qué carpetas lee Astro y qué campos tiene que tener cada .md.
// Si un frontmatter no cumple el esquema, `npm run build` falla con el archivo y el campo.
// Explicación detallada: docs/guias/02-typescript_y_colecciones.md
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// Proyectos del portfolio: un archivo por proyecto en src/content/proyectos/<slug>.md
const proyectos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/proyectos' }),
  schema: z.object({
    nombre: z.string(),
    descripcion: z.string(),
    stack: z.array(z.string()).min(1), // al menos una tecnología
    estado: z.enum(['planificado', 'en-desarrollo', 'publicado', 'archivado']),
    repo: z.url().optional(), // opcional: un proyecto planificado puede no tener repo todavía
    wiki: z.string().startsWith('/apps/').optional(), // ruta a su wiki, solo si existe
    destacado: z.boolean().default(false), // true = aparece en la landing
  }),
});

// Integrantes del equipo: un archivo por persona en src/content/integrantes/<slug>.md
// El cuerpo del .md (debajo del frontmatter) es el CV.
const integrantes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/integrantes' }),
  // Es una función porque necesita `image`, que Astro solo pasa así:
  // valida que la foto exista y la optimiza.
  schema: ({ image }) =>
    z.object({
      nombre: z.string(),
      rol: z.string(),
      foto: image().optional(), // ruta relativa al .md, ej. ./fotos/<slug>.jpg
      email: z.email(),
      linkedin: z.url(),
      github: z.url(),
      cv_pdf: z.string().startsWith('/cv/').optional(), // archivo en public/cv/<slug>.pdf
    }),
});

// Astro busca exactamente este export. `docs` es la wiki (src/content/docs/), la maneja Starlight.
export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  proyectos,
  integrantes,
};
