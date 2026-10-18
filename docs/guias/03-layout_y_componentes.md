# Guía 03 — Layout, componentes Astro y estilos

Cómo está armado el "esqueleto" visual del sitio (US-203): por qué el portfolio y la wiki se ven igual, cómo se agregan los links del header y cómo escribir estilos sin romper el modo oscuro.

## 1. Dos tipos de páginas en el mismo sitio

| Tipo      | Dónde vive                    | Quién arma la página          | Ejemplos                              |
| --------- | ----------------------------- | ----------------------------- | ------------------------------------- |
| Wiki      | `src/content/docs/**/*.md(x)` | Starlight, a partir del `.md` | `/apps/stat-pro/`                     |
| Portfolio | `src/pages/**/*.astro`        | Nosotros, en un componente    | `/proyectos/`, `/equipo/<slug>/`, `/` |

Astro arma las rutas a partir de los archivos:

- `src/pages/proyectos.astro` → `/proyectos/`
- `src/pages/equipo/[slug].astro` → `/equipo/nicolas-pinera/`, etc. Los corchetes indican una ruta dinámica, que se genera una vez por cada integrante.

Si una página de `src/pages/` y un `.md` de la wiki generan la misma ruta, hay conflicto. Por eso, cuando exista `src/pages/index.astro` (US-401), hay que borrar `src/content/docs/index.mdx`.

## 2. Anatomía de un componente `.astro`

```astro
---
// 1) Frontmatter: JavaScript/TypeScript que corre en el BUILD, no en el navegador.
import StarlightPage from '@astrojs/starlight/components/StarlightPage.astro';
const titulo = 'Proyectos';
---

<!-- 2) Template: HTML con expresiones entre llaves -->
<StarlightPage frontmatter={{ title: titulo, template: 'splash' }}>
  <p>Hay {3 + 2} proyectos.</p>
</StarlightPage>

<style>
  /* 3) Estilos opcionales, que aplican solo a este componente */
  p {
    margin-top: 1rem;
  }
</style>
```

- **Frontmatter (`---`)**: se ejecuta una vez, al generar el sitio. Ahí se importan componentes, se leen colecciones (`getCollection`), etc. Ese código no llega al navegador.
- **Template**: HTML normal. Lo que va entre `{ }` es JavaScript. Para listas se usa `.map`:

  ```astro
  {proyectos.map((p) => (
    <li>{p.data.nombre}</li>
  ))}
  ```

- **Componentes**: se usan como etiquetas (`<StarlightPage>`). Lo que va dentro de la etiqueta se dibuja donde el componente tiene su `<slot />`.
- **Props**: los atributos (`frontmatter={...}`) son los datos que recibe el componente.

## 3. `StarlightPage`: el layout común

Toda página de `src/pages/` va envuelta en `<StarlightPage>`. Con eso hereda, sin hacer nada más:

- el header (título, buscador, nuestros links, GitHub, modo claro/oscuro);
- los estilos y las fuentes;
- los metadatos de `<head>`: título, descripción y Open Graph (guía 04).

Su prop `frontmatter` acepta los mismos campos que el frontmatter de un `.md` de la wiki:

| Campo                 | Para qué                                                   |
| --------------------- | ---------------------------------------------------------- |
| `title` (obligatorio) | Título de la pestaña y de la página                        |
| `description`         | Texto que se ve al compartir el link                       |
| `template: 'splash'`  | Página sin sidebar ni índice lateral: usar en el portfolio |

## 4. Override de componentes: cómo agregamos los links

Starlight está hecho de componentes chicos (`Header`, `Search`, `SocialIcons`, etc.) y permite **reemplazar** cualquiera desde la configuración:

```js
// astro.config.mjs
components: { SocialIcons: './src/components/NavLinks.astro' },
```

Elegimos `SocialIcons` por dos motivos: en escritorio se dibuja a la derecha del header, y en el celular aparece dentro del menú hamburguesa. Así los links quedan bien en las dos pantallas sin escribir CSS responsive.

Nuestro reemplazo ([src/components/NavLinks.astro](../../src/components/NavLinks.astro)) dibuja los links y después vuelve a dibujar el componente original (`<Default />`). Así no perdemos el ícono de GitHub.

Para agregar un link al header, sumá una entrada a la lista `links` de ese archivo:

```ts
['Blog', 'blog/'],
```

## 5. La "base" y por qué no se escriben links con `/` a secas

El sitio no vive en la raíz del dominio, sino en `https://stack-dos.github.io/porfolio_stack-dos/`. Ese `/porfolio_stack-dos` es la **base** (está en `astro.config.mjs`).

| Link escrito                     | A dónde lleva en producción            | ¿Bien? |
| -------------------------------- | -------------------------------------- | ------ |
| `/proyectos/`                    | `stack-dos.github.io/proyectos/` → 404 | ✗      |
| `/porfolio_stack-dos/proyectos/` | la página correcta                     | ✓      |

- **En `.astro`**: armá los links con `import.meta.env.BASE_URL`, como hace `NavLinks.astro`. Si algún día cambia la base, no hay que tocar nada más.
- **En `.md` / `.mdx`**: escribí la ruta completa, con la base incluida. Si te olvidás, el build falla (guía 04, validador de links).

## 6. Estilos y modo claro/oscuro

Los estilos globales van en [src/styles/custom.css](../../src/styles/custom.css), que está registrado en `customCss` de la configuración. Los estilos de un solo componente van en su propio `<style>`.

**Regla de oro:** nada de colores fijos (`#000`, `white`). Usá las variables de Starlight, que cambian solas según el tema:

| Variable                             | Uso                              |
| ------------------------------------ | -------------------------------- |
| `--sl-color-white`                   | Texto de mayor contraste         |
| `--sl-color-gray-2` … `-6`           | Grises: texto secundario, bordes |
| `--sl-color-black`                   | Fondo                            |
| `--sl-color-accent`, `-high`, `-low` | Color de marca, links, hover     |
| `--sl-text-sm`, `--sl-text-lg`…      | Tamaños de fuente                |

Para cambiar el color de marca de todo el sitio, alcanza con redefinir las variables de acento en `custom.css`. Por ejemplo, `:root { --sl-color-accent: #...; }`; para el tema claro se usa `:root[data-theme='light']`.

## 7. Responsive

- El objetivo es que a 360px de ancho no haya scroll horizontal.
- Para probarlo: `npm run dev` → F12 → ícono de celular → ancho 360.
- Para cambiar estilos según el ancho: `@media (min-width: 50rem) { ... }`. Starlight usa `50rem` como corte entre celular y escritorio.

## 8. Archivos de esta parte

| Archivo                         | Qué es                                             |
| ------------------------------- | -------------------------------------------------- |
| `src/components/NavLinks.astro` | Links del header (override de `SocialIcons`)       |
| `src/styles/custom.css`         | Estilos globales propios                           |
| `src/pages/*.astro`             | Páginas del portfolio, siempre con `StarlightPage` |
| `astro.config.mjs`              | `components` y `customCss`                         |

Más info: <https://starlight.astro.build/guides/overriding-components/> y <https://docs.astro.build/en/basics/astro-components/>.
