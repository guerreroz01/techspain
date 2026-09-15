# Frontmatter template — artículos de prensa

Cada entrada es un directorio propio: `src/content/news/<slug>/` con su `index.mdx` y su carpeta `assets/`. El nombre de la carpeta **es** el slug de la URL (`entry.id`). Usar kebab-case sin acentos.

```
src/content/news/
└── my-article/
    ├── index.mdx
    └── assets/
        ├── cover.jpg
        └── imagen-2.jpg
```

Copiar y completar este bloque YAML en `index.mdx`:

```yaml
---
title: 'Titular de la noticia o título de la guía'
description: 'Bajada de una o dos frases.'
pubDate: 'YYYY-MM-DD'  # fecha de hoy
# updatedDate: 'YYYY-MM-DD'
author: 'Redacción Tecnología Hoy'
tags: ['<Vertical principal>', '<tag secundario opcional>']
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
| `title` | string | sí | Titular (noticia) o título (tutorial) en español, sin voseo. |
| `description` | string | sí | 1–2 frases; se usa para SEO/OG/cards. |
| `pubDate` | date | sí | Fecha de hoy, `YYYY-MM-DD`. |
| `updatedDate` | date | no | Solo si se actualiza después. |
| `author` | string | no | Default: `SITE.author`. |
| `tags` | string[] | no | Metadatos; primer tag = vertical principal (ver sección Verticales). |
| `featured` | boolean | no | Decisión de mesa (promoción posterior al lote): el redactor lo deja en `false`. Ver «Promoción editorial» en `DELEGATION.md`. |
| `breaking` | boolean | no | Decisión de mesa: el orquestador lo marca `true` solo para una noticia urgente del mismo día. Ver «Promoción editorial» en `DELEGATION.md`. |
| `cover` | image() | no | Imagen local relativa a la entrada: `./assets/<nombre>`. |
| `coverAlt` | string | no | Alt de la imagen de portada. |
| `source` | `{ name, url }` | no | Atribución al **medio original** (origen, no intermediario). |
| `draft` | boolean | no | `true` lo excluye del build de producción. |

## Verticales

La página cubre 7 verticales. El artículo debe encajar en una de ellas y usarla como primer `tags`:

1. Componentes
2. Portátiles
3. Consolas (portátiles y de escritorio)
4. Tarjetas gráficas
5. Memorias
6. Móviles
7. Tutoriales

Los tutoriales son contenido **how-to/paso a paso**. El clasificador diario los busca **primero**, así que una guía sobre una GPU se publica con `Tutoriales` como primer `tags` (gana sobre `Tarjetas gráficas`).

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
└── 2nm-node-process/
    ├── index.mdx
    └── assets/
        ├── chips.svg
        └── comparativa.jpg
```

```mdx
---
title: 'Un nuevo proceso de 2 nm promete más autonomía en portátiles'
description: 'El fabricante arrancó la producción en serie del nodo, con mejoras de eficiencia que podrían alargar la batería de los próximos equipos.'
pubDate: 'YYYY-MM-DD'  # fecha de hoy
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

## Ejemplo de tutorial

`Tutoriales` va **primero** en `tags`, aunque la guía trate de hardware. El cuerpo es
paso a paso: intro breve, requisitos previos, pasos numerados y verificación.

```
src/content/news/
└── windows-11-bootable-usb/
    ├── index.mdx
    └── assets/
        ├── cover.jpg
        └── paso-2.jpg
```

```mdx
---
title: 'Cómo crear un USB de arranque de Windows 11 paso a paso'
description: 'Guía práctica para preparar una unidad de arranque con Windows 11 usando solo herramientas oficiales de Microsoft.'
pubDate: 'YYYY-MM-DD'  # fecha de hoy
author: 'Redacción Tecnología Hoy'
tags: ['Tutoriales', 'Componentes']
cover: './assets/cover.jpg'
coverAlt: 'Unidad USB conectada a un puerto del equipo'
source:
  name: 'Tom's Hardware'
  url: 'https://www.tomshardware.com/...'
---

Preparar un USB de arranque sirve para instalar o reparar Windows 11 en cualquier
equipo, incluso cuando el sistema no inicia. Esta guía usa únicamente herramientas
oficiales de Microsoft.

## Requisitos previos

- Una unidad USB de al menos 8 GB (se borrará todo su contenido).
- Un equipo con Windows en funcionamiento y conexión a internet.

## Pasos

1. Descarga el asistente de instalación oficial de Windows 11 desde la página de Microsoft.
2. Ejecuta el asistente y acepta los términos de la licencia.
3. Selecciona la unidad USB cuando el asistente la liste y confirma que se borrará su contenido.

![Selección de la unidad USB en el asistente](./assets/paso-2.jpg)

## Cómo verificar que funcionó

Reinicia el equipo con la unidad conectada y abre el menú de arranque (normalmente
`F12` o `Supr`). Si la unidad aparece en la lista, el USB quedó listo.

## Advertencias

El proceso borra todo el contenido de la unidad elegida. Verifica que no sea un disco
con datos antes de confirmar.
```
