# Delegation playbook — redacción de artículos

Cuándo usarla: el usuario dice que ya seleccionó artículos y pide redactarlos. En lugar
de escribir el orquestador, se delega **un subagente por artículo**, todos en paralelo.

## Reglas de delegación

- Un subagente (`general`) por artículo. No reutilizar el mismo subagente para varios.
- Todos se lanzan en **una sola respuesta** (múltiples llamadas `task`) para que corran en paralelo.
- Cada subagente escribe dos carpetas: `src/content/news/<vertical>/<slug>/` (español) y
  `src/content/news-en/<vertical>/<english-slug>/` (inglés). Son carpetas distintas por
  artículo, así que no hay solapamiento entre subagentes. No usar `background` en escritores.
- Emitir una línea de estado antes y después de cada llamada (`⏳ Delegating …`, `✅/⚠️ …`).

## Redactores por vertical

Cada pieza la firma el redactor de su vertical y se escribe con su voz. La ficha de
cada uno vive en `skills/redaccion-prensa/redactores/<token>.md` y es de lectura
obligatoria para el subagente. La firma **no** se escribe en el frontmatter: se deriva
del token de vertical del id (`src/lib/authors.ts`), igual que la URL.

| Vertical (`<token>`) | Redactor |
| --- | --- |
| `audio` | Marta Ruiz |
| `wearables` | Diego Salas |
| `moviles` | Lucía Vega |
| `tutoriales` | Andrés Molina |
| `tarjetas-graficas` | Nadia Ortiz |
| `memorias` | Bruno Delgado |
| `portatiles` | Clara Ibáñez |
| `emuladores` | Iván Cordero |
| `consolas` | Sara Lozano |
| `componentes` | Tomás Riera |
| `drones` | Álvaro Nieto |

## Pasos previos a delegar (orquestador)

1. Leer `scripts/seleccion.md` y localizar los artículos marcados con `[*]`.
2. Por cada marcado, derivar:
   - `article_url` — el enlace de la línea.
   - `source_name` — el medio que figura al final de la línea.
   - `slug` — **en español**, kebab-case, minúsculas y ASCII (sin acentos, `ñ` → `n`),
     derivado del titular en español (no del título inglés ni chino de la fuente).
     Verificalo con `npm run slug -- <slug>`: avisa si no cumple kebab-case ASCII,
     si sale `ocupado` sugiere el sufijo libre, y los tokens de vertical salen
     `reservado` (no se pueden usar como slug).
     **Nunca renombres el slug de un artículo ya publicado**: esa URL está indexada,
     así que los slugs viejos en inglés se quedan como están.
     **Nunca listes `src/content/news/`** (ni `ls`, ni glob, ni grep recursivo):
     son cientos de entradas y cada listado quema ~12 KB de contexto.
   - `vertical` — el nombre de la sección `##` en la que está (traducido al token interno:
     `tarjetas-graficas`, `memorias`, `portatiles`, `emuladores`, `consolas`, `componentes`,
     `moviles`, `wearables`, `audio`, `tutoriales`, `drones`). Es la **carpeta y el segmento de URL**
     del artículo: `src/content/news/<vertical>/<slug>/` → `/noticias/<vertical>/<slug>/`.
   - `tipo` — `tutorial` si la línea está bajo la sección `## 📘 Tutoriales` de
     `scripts/seleccion.md`; en cualquier otra sección, `noticia`.

   **Antes de delegar, confirmá que el tema NO esté publicado.** Es el paso que
   frena el duplicado, y va acá, no después de redactar. Por cada marcado corré
   `npm run find -- <términos distintivos>` (nombres propios, modelos, siglas;
   evitá palabras comunes, que dan ruido). Si devuelve **cualquier** coincidencia,
   descartá el candidato.

   Ojo con la trampa: `npm run slug` valida el **slug**, no el **tema**. Un slug
   nuevo y una fuente distinta pueden esconder una historia ya publicada; el
   índice de contrastación (`scripts/articulos-publicados.md`) solo guarda título
   y URL, así que un nombre de proyecto que aparezca únicamente en la descripción
   no se ve con un grep ahí. `npm run find` sí lo ve.
3. Calcular `fecha_de_hoy` con la fecha actual en el momento de delegar (`YYYY-MM-DD`).
   Nunca uses una fecha literal fija.
4. Resolver `seo_contract_path`: la ruta absoluta al contrato de SEO de artículo del skill
   `seo-audit` (`references/article-seo.md`). Se resuelve desde el registro de skills, no se
   escribe a mano; el subagente la recibe ya sustituida en su prompt.
5. Rellenar la plantilla de abajo con esos valores (incluido `seo_contract_path`) y pasarla a cada subagente.

## Plantilla de prompt (por artículo)

Completar los `{...}` y pegar como prompt del subagente:

---

Eres redactor de prensa tecnológica para un portal español en Astro. Escribe UNA pieza
de tipo `{tipo}` (`noticia` | `tutorial`).

**Antes de escribir, leé estos cuatro archivos (obligatorio):**
1. `skills/redaccion-prensa/SKILL.md`
2. La ficha de tu redactor: `skills/redaccion-prensa/redactores/{vertical}.md`
3. `skills/redaccion-prensa/assets/frontmatter-template.md`
4. Contrato de SEO de artículo: `{seo_contract_path}`

Si `{tipo}` es `tutorial`, leé además la sección **«Variante: tutoriales»** de
`skills/redaccion-prensa/DELEGATION.md` y seguila al pie de la letra.

**Tu artículo:**
- Tipo de pieza: `{tipo}` (`noticia` | `tutorial`)
- URL original: `{article_url}`
- Slug (última carpeta, kebab-case **en español**, minúsculas y ASCII): `{slug}`
- Slug EN (última carpeta en inglés): lo elegís **vos**, derivado del titular en inglés,
  kebab-case minúsculas ASCII; verificalo con `npm run slug -- --en <english-slug>`.
- Vertical (carpeta/segmento de URL y primer elemento de `tags`): `{vertical}`
- Fuente a atribuir en `source`: `{source_name}`
- Fecha de hoy (`pubDate`): `{fecha_de_hoy}` — calculada al delegar, nunca un literal fijo.

**Reglas no negociables:**
- Cuerpo y frontmatter en español neutro/profesional (sin voseo, sin slang). El slug va en español (es la URL); los identificadores de código, en inglés.
- Estructura por directorio: `src/content/news/{vertical}/{slug}/index.mdx` + `src/content/news/{vertical}/{slug}/assets/`, y **además** el compañero en inglés `src/content/news-en/{vertical}/<english-slug>/index.mdx` + `assets/` (ver «Compañero en inglés» más abajo). **Ambas piezas son obligatorias**: sin la inglesa, el artículo no está terminado.
- Descarga TODAS las imágenes del artículo original a `assets/` con curl (añade `-A` con un User-Agent de navegador). La principal como `cover` (`./assets/cover.jpg` o `.png` según extensión); el resto embebidas con `![alt](./assets/x.jpg)`.
- **No listes `src/content/news/`** (ni `ls`, ni glob, ni grep recursivo): son cientos de entradas y cada listado quema ~12 KB de contexto. Tu slug y tu carpeta ya vienen dados. Para ver si un tema ya está cubierto, usá `npm run find -- <términos distintivos>`. **Si tu pieza ya está publicada, pará y reportalo: no la escribas.**
- No copies verbatim: traduce y reescribe con tus palabras. No inventes datos, citas ni cifras.
- Atribuye el origen real en `source: { name, url }`. Si el medio cita a otro, atribuye al original.
- `pubDate: {fecha_de_hoy}`. **No escribas `author`**: la firma se deriva del vertical (`src/lib/authors.ts`). El tono es el de la ficha de tu redactor (`redactores/{vertical}.md`): estilo, nunca permiso para inventar datos.
- Tras redactar, ejecutá la pasada de SEO pre-publicación (`{seo_contract_path}`) sobre el `index.mdx` terminado. La pasada NO toca `title`, `tags`, `featured`, `breaking` ni `pubDate`, y NO ejecuta el build.

**Pasos:**
1. Trae el contenido del artículo (webfetch) y extrae hechos, URLs de imagen y el origen real.
2. Crea la carpeta y descarga las imágenes a `assets/`.
3. Escribe `index.mdx` con el frontmatter y el cuerpo según `{tipo}`:
   - `noticia`: 2-4 secciones con subtítulos, con contexto para el lector hispanohablante.
   - `tutorial`: guía paso a paso (ver «Variante: tutoriales»).
4. Ejecutá la pasada de SEO pre-publicación (`{seo_contract_path}`) sobre el `index.mdx` terminado: aplicá las correcciones que devuelva y registrá qué cambió. Nunca toques `title`, `tags`, `featured`, `breaking` ni `pubDate`.
5. Escribí el **compañero en inglés** (ver «Compañero en inglés»): `src/content/news-en/{vertical}/<english-slug>/index.mdx`, traducción fiel del texto YA FINALIZADO en español, con las imágenes copiadas a su propia `assets/`.
6. **NO ejecutes el build.** El orquestador hará un único `npm run build` al final, después de recoger todos los resultados.

**Devuelve en tu único mensaje final:** slug final (si la pasada SEO renombró la carpeta, el nuevo), **slug EN final**, título final, título EN, fuente atribuida, imagen(es) usada(s) y los cambios de SEO aplicados (uno por línea). No ejecutes el build.

---

## Compañero en inglés (obligatorio)

Todo artículo nuevo de este flujo publica DOS URLs: `/noticias/<vertical>/<slug>/`
(español, el maestro) y `/en/news/<vertical>/<english-slug>/` (inglés, traducción).
La página inglesa se genera de esta entrada, así que si falta, el artículo queda a
medio publicar. La vertical es la **misma** carpeta en las dos colecciones.

- **Slug EN:** derivado del **titular en inglés**, kebab-case minúsculas ASCII.
  Namespace separado del español (puede coincidir o no). Verificalo con
  `npm run slug -- --en <english-slug>`.
- **Frontmatter EN:** `title`, `description` (traducidos), `pubDate` igual al
  español, `updatedDate` si existe, **sin `author`** (la firma se deriva y es la
  misma que la de la pieza española), `tags`
  traducidos al inglés (**`Tutorials` va primero en tutoriales**), `source` con
  el **mismo** `name`/`url` que la pieza española, `draft: false`, y
  **`translationOf: {vertical}/{slug}`** (el id español **completo** al que traduce). **No** lleva
  `featured` ni `breaking`: esos campos no existen en esta colección y la
  promoción es solo decisión de la pieza española.
- **Cuerpo EN:** traducción fiel del español final a inglés neutro
  (profesional, sin slang): mismos hechos, misma estructura, mismas imágenes.
  Copiá cada imagen usada a `src/content/news-en/{vertical}/<english-slug>/assets/` y
  referencialas con `./assets/<nombre>`. No inventes ni omitas datos al traducir.
- **Sin pasada SEO en inglés:** la pieza EN espeja la española ya optimizada.
- Si el `translationOf` no apunta a un artículo español existente, **el build
  falla**; y en producción la versión EN se oculta mientras la española siga en
  `draft: true`.

---

## Variante: tutoriales (`tipo: tutorial`)

Cuando `tipo` es `tutorial`, la pieza es una guía práctica, no una noticia. Esto es lo
que cambia respecto de la plantilla:

- **Cuerpo paso a paso:** introducción breve (qué resuelve y para quién), requisitos
  previos si aplican, pasos numerados con subtítulos, cómo verificar que funcionó, y
  cierre con advertencias o limitaciones.
- **`tags`:** `Tutoriales` va **primero**, aunque la guía trate de hardware (gana sobre
  el vertical del tema). El `vertical` del tema puede ir como tag secundario.
- **Pasada SEO:** aplica también a los tutoriales. Se ejecuta sobre el `index.mdx`
  terminado, pero la regla de `Tutoriales` primero en `tags` debe quedar intacta: la
  pasada trata `tags` como solo lectura.
- **Sin pasos periodísticos:** una guía es contenido evergreen, no una novedad. No se
  contrasta con `tech-media`/`reviews`, no se confirman cifras con `primary` y no hay
  saturación que chequear contra `es-competition`.
- **No inventar (crítico):** cada paso, ruta de menú y nombre de ajuste tiene que estar
  en el original. Si el original no lo dice, no se escribe.
- **Atribución:** se atribuye el origen real en `source: { name, url }` igual que en las
  noticias.
- **Build:** el subagente sigue sin ejecutar el build; el orquestador corre uno solo al
  final.

## Promoción editorial (`featured` / `breaking`)

El redactor **siempre deja `featured: false` y `breaking: false`**. No es una decisión
suya y no debe cambiarla.

La razón es el paralelismo: las delegaciones lanzan muchos subagentes a la vez y ninguno
ve a los demás. Si cada redactor pudiera marcar `featured: true`, un lote de 38 artículos
terminaría con 38 destacadas y la portada empeoraría. La exclusividad no se puede
coordinar desde un subagente.

La promoción la hace **el orquestador al final del lote**, cuando ya juntó todos los
resultados y ve el conjunto completo:

1. Elegir **exactamente una** entrada y marcarla `featured: true`.
2. Bajar a `false` la que estaba destacada antes: si otra entrada del sitio ya tenía
   `featured: true`, se le pone `false`. Nunca puede quedar más de una destacada.
3. Marcar `breaking: true` **solo** si la noticia es urgente y del mismo día. Es la
   excepción, no la norma.

Esto vive en el orquestador porque es la única parte del flujo que ve el lote entero. No
es una tarea del redactor.

## Notas

- Si un artículo original no carga o no tiene imagen, el subagente debe seguir con el texto y avisar de la imagen ausente en su resultado (no inventar una).
- El `vertical` de la plantilla se traduce así para el primer `tags`:
  `tarjetas-graficas` → `Tarjetas gráficas`, `memorias` → `Memorias`, `portatiles` → `Portátiles`,
  `emuladores` → `Emuladores`, `consolas` → `Consolas`, `componentes` → `Componentes`,
  `moviles` → `Móviles`, `wearables` → `Wearables`, `audio` → `Audio`, `tutoriales` → `Tutoriales`,
  `drones` → `Drones`.
- Recoger los resultados de todos los subagentes, ejecutar **un único `npm run build`** al final (los subagentes no lo ejecutan para no pisarse `dist/` y `.astro/`), y confirmar al usuario cuántos artículos quedaron listos y cuáles fallaron.
- Por qué `tags` queda bloqueado en la pasada SEO: `tags[0]` decide el `@type` del JSON-LD (`Article` vs `NewsArticle`) en `src/pages/noticias/[slug].astro:47`, así que reordenarlo cambia la salida machine-readable; y como no hay páginas de tag, los tags no tienen ninguna superficie rastreable. Cero beneficio, riesgo real.
