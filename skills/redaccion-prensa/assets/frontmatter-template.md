# Frontmatter template — artículos de prensa

Cada entrada es un directorio propio: `src/content/news/<slug>/` con su `index.mdx` y su carpeta `assets/`. El nombre de la carpeta **es** el slug de la URL (`entry.id`). Usar kebab-case sin acentos.

```
src/content/news/
└── mi-articulo/
    ├── index.mdx
    └── assets/
        ├── cover.jpg
        └── imagen-2.jpg
```

Copiar y completar este bloque YAML en `index.mdx`:

```yaml
---
title: 'Titular de la noticia'
description: 'Bajada de una o dos frases.'
pubDate: 2026-09-10
# updatedDate: 2026-09-11
author: 'Redacción Tecnología Hoy'
tags: ['Inteligencia Artificial']
featured: false
breaking: false
cover: './assets/cover.jpg'
coverAlt: 'Descripción de la imagen'
source:
  name: 'The Verge'
  url: 'https://www.theverge.com/...'
---
```

## Reglas de campo

| Campo | Tipo | Requerido | Notas |
| --- | --- | --- | --- |
| `title` | string | sí | Titular en español, sin voseo. |
| `description` | string | sí | 1–2 frases; se usa para SEO/OG/cards. |
| `pubDate` | date | sí | Fecha de hoy, `YYYY-MM-DD`. |
| `updatedDate` | date | no | Solo si se actualiza después. |
| `author` | string | no | Default: `SITE.author`. |
| `tags` | string[] | no | Metadatos; primer tag = vertical principal (ver sección Verticales). |
| `featured` | boolean | no | Candidato a noticia principal del home. |
| `breaking` | boolean | no | Muestra en el banner "Última hora". |
| `cover` | image() | no | Imagen local relativa a la entrada: `./assets/<nombre>`. |
| `coverAlt` | string | no | Alt de la imagen de portada. |
| `source` | `{ name, url }` | no | Atribución al **medio original** (origen, no intermediario). |
| `draft` | boolean | no | `true` lo excluye del build de producción. |

## Verticales

La página cubre 6 verticales. El artículo debe encajar en una de ellas y usarla como primer `tags`:

1. Componentes
2. Portátiles
3. Consolas (portátiles y de escritorio)
4. Tarjetas gráficas
5. Memorias
6. Móviles

## Imágenes

- Cada entrada tiene su propia carpeta `assets/` dentro de su directorio.
- Descargar **TODAS** las imágenes de contenido del original a `src/content/news/<slug>/assets/`.
- La principal se usa como `cover` (`./assets/cover.jpg`).
- Las imágenes adicionales se **embeben en el cuerpo** con markdown relativo:

```mdx
![Descripción de la imagen](./assets/imagen-2.jpg)
```

- Nunca hacer hotlink al CDN de la fuente (tpucdn.com, etc.): descargar siempre a local.

## Cuerpo del artículo (markdown/MDX)

- Escribir en **español neutro/profesional**, reescribiendo con palabras propias (no copiar del original).
- Añadir **opinión y contexto**: explicar qué pasó, por qué importa y qué cambia para el lector hispanohablante.
- No inventar datos, citas ni cifras. Atribuir al **origen** de la noticia.
- Soportado: headings, listas, tablas, blockquotes, código e **imágenes embebidas** (rutas relativas `./assets/...`).

## Ejemplo mínimo

```
src/content/news/
└── proceso-2nm/
    ├── index.mdx
    └── assets/
        ├── chips.svg
        └── comparativa.jpg
```

```mdx
---
title: 'Un nuevo proceso de 2 nm promete más autonomía en portátiles'
description: 'El fabricante arrancó la producción en serie del nodo, con mejoras de eficiencia que podrían alargar la batería de los próximos equipos.'
pubDate: 2026-09-10
author: 'Redacción Tecnología Hoy'
tags: ['Componentes', 'Semiconductores']
cover: './assets/chips.svg'
coverAlt: 'Ilustración abstracta de un chip'
source:
  name: 'Tom's Hardware'
  url: 'https://www.tomshardware.com/...'
---

El fabricante confirmó que su nodo de 2 nanómetros ya se produce en serie, un hito
que llega después de meses de rumores. La compañía asegura que la nueva generación
reduce el consumo energético por operación en torno a un 30 %.

![Comparativa de nodos del fabricante](./assets/comparativa.jpg)

## Qué cambia para el usuario

La mejora no se traduce de inmediato en más velocidad, sino en algo más valioso
para el día a día: hacer lo mismo gastando menos energía.
```
