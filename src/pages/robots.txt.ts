import type { APIRoute } from 'astro';

// Generated so the sitemap URL always matches `site` + `base`.
// Note: on a GitHub Pages *project* site, crawlers only read robots.txt at the domain root
// (akashp3128.github.io/robots.txt), so this file takes full effect once a custom domain is used.
export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const sitemap = new URL(`${base}/sitemap-index.xml`, site).toString();
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
