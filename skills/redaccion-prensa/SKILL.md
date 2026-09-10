---
name: redaccion-prensa
description: "Trigger: redactar artículo, noticia, artículo de prensa, cubrir novedad, daily news, revisar fuentes. Redacta noticias de tecnología en español desde las fuentes de src/data/sources.json."
license: Apache-2.0
metadata:
  author: "techspain"
  version: "1.1"
---

## Activation Contract

Load this skill when the user asks to write or publish a technology news article in Spanish, to review what is new across the project's sources, or to run the daily editorial workflow against `src/data/sources.json`.

## Hard Rules

- Article body AND all frontmatter copy in Spanish, neutral/professional register. No slang, no voseo.
- Slug (the entry folder name) and any code/identifiers in English kebab-case. Each entry lives at `src/content/news/<slug>/index.mdx`.
- Editorial scope: cover only the 6 verticals — componentes de PC, portátiles, consolas (portátiles y de sobremesa), tarjetas gráficas, memorias y móviles. Put the primary vertical as the first `tags` entry.
- Never copy source text verbatim: translate and rewrite in your own words. Always attribute via `source: { name, url }`.
- Attribute the ultimate origin, not the relay: if the outlet you read cites another outlet as its source, trace and attribute the original, and read it to confirm before publishing.
- Images: download EVERY content image from the original article into the entry's own `src/content/news/<slug>/assets/` folder. Reference the cover as `./assets/<name>`; embed extra images inline with `![alt](./assets/<name>)`. Never hotlink the source's CDN.
- Never invent facts, quotes, numbers, or dates. Every claim must trace to a source listed in `src/data/sources.json`.
- Respect source terms: VideoCardz forbids automated scraping; use only the `rss` field where present, otherwise read the homepage manually.
- Follow the content model in `AGENTS.md` §6 and the template in `assets/frontmatter-template.md`.

## Decision Gates

| Fork | Decide |
| --- | --- |
| Relevance | Fits one of the 6 verticals (componentes, portátiles, consolas, tarjetas gráficas, memorias, móviles)? No → skip. |
| Saturation | Layer `es-competition` already saturated the story? Yes → skip or find a fresh angle. |
| Confirmation | Layer `primary` confirms the data? Rumor-only → write as rumor with hedging, or skip. |
| Source available | No `source` (name+url) traceable to the origin? → do not publish. |

## Execution Steps

1. Load `src/data/sources.json` and read the layer definitions.
2. Pull the latest items: read `rss` feeds for detection layers (`tech-media`, `asia`); for `rss: null` sources read the homepage manually.
3. For each candidate: contrast with `tech-media`/`reviews`; confirm numbers and images with `primary`.
4. Check `es-competition` for saturation before committing to a story.
5. Trace the origin: if the outlet cites another source, open the original and attribute it.
6. Select the stories worth publishing. For each, create `src/content/news/<slug>/assets/` and download every content image there (first image as `cover`).
7. Write `src/content/news/<slug>/index.mdx` using `assets/frontmatter-template.md`, referencing `./assets/<name>` for the cover and embedding extra images inline.
8. Set `pubDate` to today (`YYYY-MM-DD`), `draft: false`, and fill `source` with the ultimate origin.
9. Run `npm run build` and confirm it passes.

## Output Contract

Return: the list of created files (articles and downloaded images); for each article the ultimate origin used and the original article URL(s); and confirmation the build passed. Do not report an article as done without a valid MDX file and a passing build.

## References

- `assets/frontmatter-template.md` — required frontmatter, body-image handling, and a worked example.
- `../../AGENTS.md` — §6 content model, §7 adding an article.
- `../../src/data/sources.json` — the curated source list (5 layers).
