// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Deployed as a GitHub Pages *project* site: https://akashp3128.github.io/fade-landing/
// When a custom domain is added later, set SITE_URL=https://example.com and BASE_PATH=/
// (as env vars / repo Variables) instead of editing this file.
const SITE_URL = process.env.SITE_URL || 'https://akashp3128.github.io';
const BASE_PATH = process.env.BASE_PATH || '/fade-landing';

// Draft legal pages are noindex until reviewed, so keep them out of the sitemap too.
const EXCLUDE_FROM_SITEMAP = ['/privacy/', '/terms/', '/404'];

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  trailingSlash: 'ignore',
  output: 'static',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      filter: (page) => !EXCLUDE_FROM_SITEMAP.some((p) => page.includes(p)),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
