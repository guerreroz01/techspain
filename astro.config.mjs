// @ts-check
import { defineConfig } from 'astro/config';

import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  // Real domain. Required by @astrojs/sitemap and the RSS feed to build
  // absolute URLs.
  site: 'https://techspain24.com',
  adapter: vercel(),
  integrations: [sitemap(), mdx()]
});
