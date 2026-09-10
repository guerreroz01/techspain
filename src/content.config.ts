import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { SITE } from './consts';

const news = defineCollection({
  loader: glob({ base: './src/content/news', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
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
    // Path inside `/public` or a remote URL.
    cover: z.string().optional(),
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

export const collections = { news };
