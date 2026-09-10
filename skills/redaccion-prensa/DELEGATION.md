# Delegation playbook — redacción de artículos

Cuándo usarla: el usuario dice que ya seleccionó artículos y pide redactarlos. En lugar
de escribir el orquestador, se delega **un subagente por artículo**, todos en paralelo.

## Reglas de delegación

- Un subagente (`general`) por artículo. No reutilizar el mismo subagente para varios.
- Todos se lanzan en **una sola respuesta** (múltiples llamadas `task`) para que corran en paralelo.
- Cada subagente escribe una carpeta distinta (`src/content/news/<slug>/`), así que no hay
  solapamiento de archivos. No usar `background` en escritores.
- Emitir una línea de estado antes y después de cada llamada (`⏳ Delegating …`, `✅/⚠️ …`).

## Pasos previos a delegar (orquestador)

1. Leer `scripts/seleccion.md` y localizar los artículos marcados con `[*]`.
2. Por cada marcado, derivar:
   - `article_url` — el enlace de la línea.
   - `source_name` — el medio que figura al final de la línea.
   - `slug` — kebab-case en inglés, derivado del título.
   - `vertical` — el nombre de la sección `##` en la que está (traducido al token interno:
     `tarjetas-graficas`, `memorias`, `portatiles`, `consolas`, `componentes`).
3. Rellenar la plantilla de abajo con esos valores y pasarla a cada subagente.

## Plantilla de prompt (por artículo)

Completar los `{...}` y pegar como prompt del subagente:

---

Eres redactor de prensa tecnológica para un portal español en Astro. Escribe UNA noticia.

**Antes de escribir, leé estos dos archivos (obligatorio):**
1. `skills/redaccion-prensa/SKILL.md`
2. `skills/redaccion-prensa/assets/frontmatter-template.md`

**Tu artículo:**
- URL original: `{article_url}`
- Slug (carpeta, kebab-case en inglés): `{slug}`
- Vertical (primer elemento de `tags`): `{vertical}`
- Fuente a atribuir en `source`: `{source_name}`

**Reglas no negociables:**
- Cuerpo y frontmatter en español neutro/profesional (sin voseo, sin slang). El slug y los identificadores en inglés.
- Estructura por directorio: `src/content/news/{slug}/index.mdx` + `src/content/news/{slug}/assets/`.
- Descarga TODAS las imágenes del artículo original a `assets/` con curl (añade `-A` con un User-Agent de navegador). La principal como `cover` (`./assets/cover.jpg` o `.png` según extensión); el resto embebidas con `![alt](./assets/x.jpg)`.
- No copies verbatim: traduce y reescribe con tus palabras. No inventes datos, citas ni cifras.
- Atribuye el origen real en `source: { name, url }`. Si el medio cita a otro, atribuye al original.
- `pubDate: 2026-09-10`, `author: 'Redacción Tecnología Hoy'`.

**Pasos:**
1. Trae el contenido del artículo (webfetch) y extrae hechos, URLs de imagen y el origen real.
2. Crea la carpeta y descarga las imágenes a `assets/`.
3. Escribe `index.mdx` con el frontmatter y un cuerpo de 2-4 secciones con subtítulos, añadiendo opinión y contexto para el lector hispanohablante.
4. **NO ejecutes el build.** El orquestador hará un único `npm run build` al final, después de recoger todos los resultados.

**Devuelve en tu único mensaje final:** slug, título final, fuente atribuida e imagen(es) usada(s). No ejecutes el build.

---

## Notas

- Si un artículo original no carga o no tiene imagen, el subagente debe seguir con el texto y avisar de la imagen ausente en su resultado (no inventar una).
- El `vertical` de la plantilla se traduce así para el primer `tags`:
  `tarjetas-graficas` → `Tarjetas gráficas`, `memorias` → `Memorias`, `portatiles` → `Portátiles`,
  `consolas` → `Consolas`, `componentes` → `Componentes`, `moviles` → `Móviles`.
- Recoger los resultados de todos los subagentes, ejecutar **un único `npm run build`** al final (los subagentes no lo ejecutan para no pisarse `dist/` y `.astro/`), y confirmar al usuario cuántos artículos quedaron listos y cuáles fallaron.
