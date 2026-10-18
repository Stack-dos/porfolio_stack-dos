# Guía 02 — TypeScript y content collections

Lo mínimo de TypeScript (y de Zod) para leer, entender y modificar `src/content.config.ts`. No hace falta saber TypeScript "en serio": este archivo usa una porción chica del lenguaje.

## 1. JavaScript y TypeScript

- **JavaScript (JS)**: el lenguaje que corre en el navegador y en Node. No tiene tipos: una variable puede ser un número y después un texto, y los errores aparecen recién al ejecutar.
- **TypeScript (TS)**: es JavaScript + tipos. Se escribe en archivos `.ts`, el editor te avisa errores mientras escribís y, antes de ejecutarse, se "borran" los tipos y queda JS común. Astro lo hace solo, no hay que compilar nada a mano.

Todo JS válido es TS válido. Por eso `content.config.ts` casi no tiene "tipos escritos": se apoya en Zod, que veremos abajo.

## 2. La sintaxis que aparece en el archivo

### `import`

```ts
import { defineCollection } from 'astro:content';
```

Trae una función de otro módulo (paquete). Las llaves `{ }` indican qué nombre se importa. Los módulos que usamos:

| Módulo                        | Qué aporta                                           |
| ----------------------------- | ---------------------------------------------------- |
| `astro:content`               | `defineCollection`, para declarar una colección      |
| `astro/loaders`               | `glob`, para leer archivos de una carpeta            |
| `astro/zod`                   | `z`, la librería de validación (Zod)                 |
| `@astrojs/starlight/loaders`  | `docsLoader`, el loader de la wiki                   |
| `@astrojs/starlight/schema`   | `docsSchema`, el esquema de las páginas de la wiki   |

### `const`

```ts
const proyectos = defineCollection({ ... });
```

Declara una variable que no se reasigna. Acá guarda la definición de la colección. (Existe también `let`, para variables que cambian; en este archivo no hace falta.)

### Objetos `{ clave: valor }`

```ts
{ pattern: '**/*.md', base: './src/content/proyectos' }
```

Un objeto es un conjunto de pares clave → valor, separados por comas. Es lo mismo que el frontmatter YAML de un `.md`, con otra sintaxis. Los objetos se pueden anidar.

### Arrays `[ ]`

```ts
['planificado', 'en-desarrollo', 'publicado', 'archivado']
```

Una lista ordenada. Textos entre comillas (`'...'`) son *strings*.

### Llamar funciones y encadenar métodos

```ts
z.string().startsWith('/apps/').optional()
```

`algo()` llama a una función. El `.` accede a algo "de adentro" del valor anterior. Encadenar es leer de izquierda a derecha: "un texto, que empiece con `/apps/`, y que sea opcional".

### Funciones flecha `=>`

```ts
schema: ({ image }) => z.object({ ... })
```

Una función escrita corta: `(parámetros) => resultado`. Acá el esquema de `integrantes` no es un objeto fijo sino una función: Astro la llama pasándole herramientas (entre ellas `image`), y la función devuelve el esquema. `({ image })` significa "del objeto que recibo, sacá la propiedad `image`" (eso se llama *desestructurar*).

¿Por qué solo `integrantes` lo usa? Porque `image()` necesita saber dónde está el archivo `.md` para resolver la ruta de la foto, y Astro solo la da así.

### `export`

```ts
export const collections = { docs: ..., proyectos, integrantes };
```

Hace visible la variable fuera del archivo. Astro busca exactamente un export llamado `collections` en `src/content.config.ts`; ese nombre no se puede cambiar.

`{ proyectos, integrantes }` es un atajo de `{ proyectos: proyectos, integrantes: integrantes }`. La clave es el nombre de la colección.

## 3. Zod: validar datos

Zod describe la "forma" que tienen que tener los datos y los valida. Astro lo usa para revisar el frontmatter de cada `.md` al hacer el build.

| Zod                                   | Significa                                        | Ejemplo válido en el `.md`      |
| ------------------------------------- | ------------------------------------------------ | ------------------------------- |
| `z.object({ ... })`                   | Un objeto con esos campos                        | todo el frontmatter             |
| `z.string()`                          | Texto                                            | `nombre: Stat Pro`              |
| `z.boolean()`                         | `true` o `false`                                 | `destacado: true`               |
| `z.array(z.string())`                 | Lista de textos                                  | `stack: [python, SQLite]`       |
| `.min(1)`                             | Al menos 1 elemento                              | no vale `stack: []`             |
| `z.enum([...])`                       | Uno de esos valores exactos                      | `estado: planificado`           |
| `z.url()`                             | Texto con forma de URL                           | `repo: https://github.com/...`  |
| `z.email()`                           | Texto con forma de email                         | `email: a@b.com`                |
| `.startsWith('/cv/')`                 | Texto que empieza así                            | `cv_pdf: /cv/nico.pdf`          |
| `.optional()`                         | El campo puede no estar                          | (se omite la línea)             |
| `.default(false)`                     | Si no está, vale `false`                         | (se omite la línea)             |
| `image()` (de Astro, no de Zod)       | Ruta a una imagen que existe; Astro la optimiza  | `foto: ./fotos/nico.jpg`        |

Por defecto **todo campo es obligatorio**: si falta, el build falla. Si el `.md` trae un campo que el esquema no conoce, se ignora.

### Tipos gratis

Del esquema Zod, Astro genera los tipos TypeScript automáticamente (en `.astro/`). Cuando en una página hagas:

```ts
const proyectos = await getCollection('proyectos');
proyectos[0].data.estado; // el editor sabe que es 'planificado' | 'en-desarrollo' | ...
```

el editor autocompleta los campos y marca error si escribís `data.estadoo`. Por eso no escribimos tipos a mano: el esquema es la única fuente de verdad.

## 4. El loader `glob`

```ts
loader: glob({ pattern: '**/*.md', base: './src/content/proyectos' })
```

- `base`: carpeta a leer.
- `pattern`: qué archivos. `**/*.md` = todos los `.md`, incluidas subcarpetas.
- El nombre del archivo sin extensión pasa a ser el `id` de la entrada: `stat-pro.md` → `id: 'stat-pro'`. Ese id se usa como slug en las URLs. Por eso los nombres van en kebab-case y sin tildes.

## 5. Leer el archivo completo

```ts
const proyectos = defineCollection({                       // colección "proyectos"
  loader: glob({ pattern: '**/*.md', base: './src/content/proyectos' }), // lee esa carpeta
  schema: z.object({                                       // cada .md debe tener:
    nombre: z.string(),                                    //   un nombre (texto)
    descripcion: z.string(),                               //   una descripción
    stack: z.array(z.string()).min(1),                     //   al menos 1 tecnología
    estado: z.enum(['planificado', 'en-desarrollo', 'publicado', 'archivado']),
    repo: z.url().optional(),                              //   URL del repo, si existe
    wiki: z.string().startsWith('/apps/').optional(),      //   link a la wiki, si existe
    destacado: z.boolean().default(false),                 //   si va en la landing
  }),
});
```

## 6. Cómo agregar o cambiar un campo

1. Agregalo al `z.object` de la colección (por ejemplo `anio: z.number().optional()`).
2. Si es obligatorio, cargalo en **todos** los `.md` de esa carpeta, o el build falla.
3. Corré `npm run build` (o `npm run dev`) para que Astro regenere los tipos.
4. Si el editor no ve el campo nuevo, reiniciá el servidor de TypeScript (VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server").

## 7. Leer un error de validación

```txt
[InvalidContentEntryDataError] proyectos → zz-test data does not match collection schema.
  nombre: Required
  estado: Invalid option: expected one of "planificado"|"en-desarrollo"|"publicado"|"archivado"
```

- `proyectos → zz-test`: colección y archivo (`src/content/proyectos/zz-test.md`).
- Cada línea siguiente es un campo y qué le pasa: `Required` = falta; `Invalid option` = valor fuera del enum; `Invalid URL` = formato inválido.

## 8. Para seguir

- Content collections: <https://docs.astro.build/en/guides/content-collections/>
- Zod: <https://zod.dev>
- TypeScript en 5 minutos: <https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html>
