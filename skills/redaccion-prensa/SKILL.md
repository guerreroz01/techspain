---
name: redaccion-prensa
description: "Trigger: redactar artículo, noticia, artículo de prensa, tutorial, guía paso a paso, cubrir novedad, daily news, revisar fuentes. Redacta noticias y tutoriales de tecnología en español desde las fuentes de src/data/sources.json."
license: Apache-2.0
metadata:
  author: "techspain24"
  version: "1.2"
---

## Activation Contract

Load this skill when the user asks to write or publish a technology news article or a how-to/tutorial guide in Spanish, to review what is new across the project's sources, or to run the daily editorial workflow against `src/data/sources.json`.

## Hard Rules

- Article body AND all frontmatter copy in Spanish, neutral/professional register. No slang, no voseo.
- Slug (the entry's last folder name) in **Spanish**, derived from the Spanish headline: kebab-case, lowercase, ASCII (accents dropped, `ñ` → `n`). The entry lives in a vertical folder, so its **path is its URL**: `src/content/news/<vertical>/<slug>/index.mdx` → `/noticias/<vertical>/<slug>/`. Pick `<vertical>` from the ten tokens (see the vertical list below). Code and identifiers stay in English.
- **Never rename the slug of an already published article.** Older English slugs are indexed by Google and stay as they are; the Spanish rule applies only to new entries.
- **Every new article ships with an English companion** in the same run: `src/content/news-en/<vertical>/<english-slug>/index.mdx`, the same story translated, with `translationOf: <vertical>/<slug>` pointing back at the Spanish entry (the **full** ES id). The English slug is fully English (kebab-case, lowercase, ASCII) and is checked with `npm run slug -- --en <slug>`. Articles published before this workflow stay Spanish-only: never backfill them.
- Editorial scope: cover only the 10 verticals — componentes de PC, portátiles, consolas (portátiles y de sobremesa), tarjetas gráficas, memorias, móviles, wearables (relojes, anillos y gafas inteligentes), audio (auriculares, earphones e IEM, altavoces y barras de sonido, micrófonos, DAC y amplificación), emuladores de videojuegos y tutoriales (guías how-to/paso a paso). Put the primary vertical as the first `tags` entry.
- Una pieza sobre emulación de videojuegos usa `Emuladores` como vertical principal, incluso cuando trate de una consola concreta: el emulador es el tema, la consola es el huésped. La vertical es agnóstica del sistema anfitrión — cubre emuladores de consola en Windows, macOS, Linux y Android; el host va como tag secundario. Excepto si es una guía paso a paso, que va a `Tutoriales`.
- `Wearables` (prioritaria nº 2) es un bloque editorial único — relojes, anillos y gafas inteligentes comparten vertical, no se dividen. Gana sobre `Móviles`: un titular como "Samsung Galaxy Watch 8" o "Pixel Watch" también coincide con móviles por "galaxy"/"pixel", así que la pieza ponible va a `Wearables`.
- `Audio` es la vertical prioritaria nº 1: cubre todo el hardware de sonido (auriculares, earphones e IEM, altavoces y barras de sonido, micrófonos, y DAC/amplificación). Gana a `Móviles`, `Consolas`, `Portátiles` y `Wearables` cuando el titular nombra un producto de audio, así que unos "Galaxy Buds" o una review de auriculares caen en `Audio`.
- Orden de prioridad del clasificador (decide qué vertical gana cuando un titular casa con dos o más): `Audio` → `Wearables` → `Móviles` → `Tutoriales` → tarjetas gráficas, memorias, portátiles, emuladores, consolas, componentes. Consecuencia: una guía how-to sobre audio, un ponible o un móvil cae en esa vertical, no en `Tutoriales`.
- Never copy source text verbatim: translate and rewrite in your own words. Always attribute via `source: { name, url }`.
- Attribute the ultimate origin, not the relay: if the outlet you read cites another outlet as its source, trace and attribute the original, and read it to confirm before publishing.
- Images: download EVERY content image from the original article into the entry's own `src/content/news/<vertical>/<slug>/assets/` folder. Reference the cover as `./assets/<name>`; embed extra images inline with `![alt](./assets/<name>)`. Never hotlink the source's CDN.
- Never invent facts, quotes, numbers, or dates. Every claim must trace to a source listed in `src/data/sources.json`.
- Respect source terms: VideoCardz forbids automated scraping; use only the `rss` field where present, otherwise read the homepage manually.
- Follow the content model in `AGENTS.md` §6 and the template in `assets/frontmatter-template.md`.
- After drafting, run the pre-publish SEO pass on the finished `index.mdx` (the `seo-audit` skill's article contract, `references/article-seo.md`). The pass never touches `title`, `tags`, `featured`, `breaking` or `pubDate`, and never runs the build.

## Piece Types

Every piece is one of two types. Decide the type before writing.

| Type | When | Body shape |
| --- | --- | --- |
| `noticia` | A new development pulled from a dated news item (default). | 2–4 sections with subheadings: what happened, why it matters, what changes for the reader. |
| `tutorial` | A how-to/paso a paso guide, selected from the `## 📘 Tutoriales` section of `scripts/seleccion.md`. | Step-by-step: brief intro (what it solves and for whom), prerequisites if any, numbered steps with subheadings, how to verify it worked, closing caveats/limitations. |

- A `tutorial` puts `Tutoriales` first in `tags`, even when the guide is about hardware (it wins over the topic vertical).
- Tutorials are evergreen content: they are NOT contrasted, confirmed, or checked for saturation. Every step, menu path, and setting name must exist in the original — never invent one.

## Decision Gates

| Fork | Type | Decide |
| --- | --- | --- |
| Relevance | both | Fits one of the 10 verticals (componentes, portátiles, consolas, tarjetas gráficas, memorias, móviles, wearables, audio, emuladores de videojuegos, tutoriales)? No → skip. |
| Saturation | `noticia` | Layer `es-competition` already saturated the story? Yes → skip or find a fresh angle. |
| Confirmation | `noticia` | Layer `primary` confirms the data? Rumor-only → write as rumor with hedging, or skip. |
| Source available | both | No `source` (name+url) traceable to the origin? → do not publish. |
| Guide, not news | `tutorial` | Is it really a step-by-step guide, or a news item with a "how to" paragraph? If it is the latter → treat it as `noticia`. |
| Steps exist in the original | `tutorial` | Does every step, menu path, and setting name come from the original? Any step you cannot trace → drop it; never invent one. |
| Editorial promotion | both | Is this a promotion decision (`featured`/`breaking`)? It is a newsroom call made AFTER the batch is collected, never by a parallel writer: writers cannot coordinate exclusivity, so each leaves both flags `false` and the orchestrator promotes exactly one entry afterwards. |

## Execution Steps

Common to both piece types:

1. Load `src/data/sources.json` and read the layer definitions.
2. Select the pieces worth publishing. For each, create `src/content/news/<vertical>/<slug>/assets/` and download every content image there (first image as `cover`).
3. Write `src/content/news/<vertical>/<slug>/index.mdx` using `assets/frontmatter-template.md`, referencing `./assets/<name>` for the cover and embedding extra images inline.
4. Run the pre-publish SEO pass on the finished `index.mdx`: load the resolved article SEO contract, apply the fixes it returns, and record what changed.
5. Write the English companion at `src/content/news-en/<vertical>/<english-slug>/index.mdx` (see the «English companion version» section below).
6. Set `draft: false` and fill `source` with the ultimate origin.
7. Run `npm run build` and confirm it passes. When articles are delegated, the orchestrator runs a single build at the end; a subagent never runs it.

News path (`noticia`):

1. Pull the latest items: read `rss` feeds for the detection layers (`tech-media`, `asia`, and `emulacion` — emulation news, per-console state and tutorials); for `rss: null` sources read the homepage manually.
2. For each candidate: contrast with `tech-media`/`reviews`; confirm numbers and images with `primary`.
3. Check `es-competition` for saturation before committing to a story.
4. Trace the origin: if the outlet cites another source, open the original and attribute it.
5. Write a 2–4 section body with subheadings: what happened, why it matters, what changes for the reader.
6. Set `pubDate` to today (`YYYY-MM-DD`).

Tutorial path (`tutorial`):

1. Bring the original how-to article (webfetch) and extract the real steps, menu paths, and setting names. Never invent a step.
2. Download every content image from the original into the entry's `assets/` folder.
3. Write the guide with `Tutoriales` first in `tags`, even when it is about hardware: brief intro (what it solves and for whom), prerequisites if any, numbered steps with subheadings, how to verify it worked, and closing caveats/limitations.
4. Skip the news gates: no `es-competition` saturation check, no `primary` confirmation, no contrast with `tech-media`/`reviews`.
5. Attribute the ultimate origin in `source` exactly as in the news path, and set `pubDate` to today (`YYYY-MM-DD`).

## English companion version (`news-en`)

Each Spanish article has its own English page at `/en/news/<vertical>/<english-slug>/`. Both entries are written in the same run:

1. **Spanish first, English second.** The Spanish `index.mdx` (SEO pass included) is the master; the English entry is a faithful translation of the FINAL Spanish text — same facts, same structure, same attributions, neutral English register.
2. Create `src/content/news-en/<vertical>/<english-slug>/index.mdx` (same `<vertical>` as the Spanish entry):
   - **English slug**: fully English (derived from the English headline), kebab-case, lowercase, ASCII. Check it with `npm run slug -- --en <english-slug>`; it lives in a separate namespace, so it may differ from the Spanish slug.
   - **Frontmatter**: `title`, `description` (translated), `pubDate` (identical to the Spanish entry), `updatedDate` if any, `author: 'TechSpain24 Staff'`, `tags` translated to English (`Tutoriales` → `Tutorials` and still first for tutorials), `source` with the SAME `name`/`url` as the Spanish entry, `draft: false`, and the required **`translationOf: <vertical>/<slug>`** (the full Spanish id). There are NO `featured`/`breaking` fields in this collection — promotion stays a Spanish-entry decision.
   - **Images**: copy each used image into the English entry's own `assets/` folder and reference them relatively (`./assets/<name>`), mirroring the Spanish entry.
3. **No separate SEO pass** on the English entry: it mirrors the already-optimized Spanish one. Never invent or drop facts while translating.
4. Validations the build enforces: `translationOf` must resolve to an existing Spanish entry (build fails otherwise), and in production an English article is hidden while its Spanish counterpart is a draft.

## Output Contract

Return: the list of created files (Spanish articles, their English companions, and downloaded images); for each article the ultimate origin used and the original article URL(s); the English slug chosen for each companion; the SEO changes applied, one line per change; and confirmation the build passed. Do not report an article as done without a valid MDX file for BOTH languages and a passing build.

## References

- `assets/frontmatter-template.md` — required frontmatter, body-image handling, and a worked example.
- `seo-audit` skill, `references/article-seo.md` — single-article pre-publish SEO refinement contract.
- `../../AGENTS.md` — §6 content model, §7 adding an article.
- `../../src/data/sources.json` — the curated source list (8 layers).
