// @ts-check
import { defineConfig } from 'astro/config';

import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  // Placeholder domain. Replace with the real URL before deploying.
  // Required by @astrojs/sitemap and the RSS feed to build absolute URLs.
  site: 'https://example.com',
  adapter: vercel(),
  integrations: [sitemap(), mdx()]
});
