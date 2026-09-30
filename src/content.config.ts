import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { SITE } from './consts';

const news = defineCollection({
  loader: glob({
    base: './src/content/news',
    pattern: '**/*.{md,mdx}',
    // Each entry is a folder: `<slug>/index.mdx`. Derive the id from the folder
    // name so `entry.id` stays the URL slug (drops a trailing `/index`).
    generateId: ({ entry }) =>
      entry.replace(/\/index\.(md|mdx)$/i, '').replace(/\.(md|mdx)$/i, ''),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      author: z.string().default(SITE.author),
      // Topics used as metadata only. There are no tag pages by design.
      tags: z.array(z.string()).default([]),
      // Candidate for the home lead story.
      featured: z.boolean().default(false),
      // Last-minute story shown in the breaking banner.
      breaking: z.boolean().default(false),
      // Colocated cover image, resolved relative to the entry's folder
      // (e.g. `./assets/cover.jpg` inside `<slug>/assets/`).
      cover: image().optional(),
      coverAlt: z.string().optional(),
      // Attribution to the English-language outlet the article is based on.
      source: z
        .object({
          name: z.string(),
          url: z.string().url(),
        })
        .optional(),
      draft: z.boolean().default(false),
    }),
});

// English counterpart of a Spanish article. Deliberately a SEPARATE collection:
// every existing consumer of `news` (home, archive, RSS, `buscar.json`,
// `articulos-publicados`, the sitemap date reader) keeps reading
// only the Spanish corpus and can never leak an English article. The one
// deliberate exception is `/news-sitemap.xml`, which reads both collections
// and labels each entry with `news:language`. Entries live in
// `src/content/news-en/<english-slug>/`, so `entry.id` is the English URL slug
// under `/en/news/`.
const newsEn = defineCollection({
  loader: glob({
    base: './src/content/news-en',
    pattern: '**/*.{md,mdx}',
    generateId: ({ entry }) =>
      entry.replace(/\/index\.(md|mdx)$/i, '').replace(/\.(md|mdx)$/i, ''),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      // English byline, not `SITE.author` ('Redacción TechSpain24'): the default
      // must read as English on an English page if a writer omits the field.
      author: z.string().default('TechSpain24 Staff'),
      tags: z.array(z.string()).default([]),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      source: z
        .object({
          name: z.string(),
          url: z.string().url(),
        })
        .optional(),
      draft: z.boolean().default(false),
      // Spanish counterpart: the `news` entry id (ES slug) this translates.
      // Required — the build fails if it does not resolve to a Spanish entry
      // (see `src/pages/en/news/[slug].astro`).
      translationOf: z.string(),
      // NOTE: no `featured`/`breaking`. Promotion is decided on the Spanish
      // entry only; the English page is a translation, not a newsroom pick.
    }),
});

export const collections = { news, newsEn };
