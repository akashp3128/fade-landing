# fade-landing

Marketing site for **Fade**, the booking + payments app for independent barbers (launching first in Chicago).

- **Stack:** [Astro 5](https://astro.build) (static output) + Tailwind CSS v4, compiled at build time (no CDN). Fonts are self-hosted via Fontsource.
- **Hosting:** GitHub Pages project site at <https://akashp3128.github.io/fade-landing/>, deployed by GitHub Actions.

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Home, aimed at barbers: profile, services, hours, bookings, Stripe Connect payouts, shareable link. Client teaser + FAQ. |
| `/clients/` | For clients: discovery comes after barbers, launching in Chicago. |
| `/pricing/` | **Placeholder** pricing tiers (clearly labelled, not an offer). |
| `/waitlist/` | Barber waitlist / sign-up form. |
| `/privacy/`, `/terms/` | **DRAFT** legal pages pending legal review (`noindex`, excluded from sitemap). |
| `404` | Custom not-found page (`dist/404.html`, served by GitHub Pages). |

## Local development

Requires Node 18.20+ (CI uses Node 20).

```bash
npm install
cp .env.example .env     # optional, defaults are safe (waitlist off, analytics off)
npm run dev              # http://localhost:4321/fade-landing/
npm run build            # static site in dist/
npm run preview          # serve dist/ at http://localhost:4321/fade-landing/
npm run check:links      # verify every internal link/asset resolves under the base path
```

The site is built for the `/fade-landing` base path. Always link internally with the `url()` helper from `src/lib/site.ts` so links keep working under the base path (and later on a custom domain).

## Design tokens

All colors, fonts and radii live in **one place**: the `@theme` block at the top of `src/styles/global.css`. Components use semantic classes (`bg-canvas`, `bg-surface`, `text-fg`, `text-fg-muted`, `bg-accent`, `text-accent-fg`, `rounded-card`, `font-display`, …), so adopting the official Fade Design tokens is a matter of replacing those values. Current values are interim (carried over from the original page: dark + gold, Playfair Display + Inter).

Raster brand placeholders (`favicon-32.png`, `apple-touch-icon.png`, `icon-192/512.png`, `og-image.png`) are generated from `public/favicon.svg` by `scripts/render-assets.mjs` (needs `playwright-core` + Chrome; see the script header). Replace them with official assets when available.

## Environment variables

All variables are **public** (`PUBLIC_*` values are baked into the static HTML/JS). Never put a secret in them. See `.env.example` for the full list.

### Waitlist (`PUBLIC_WAITLIST_MODE`)

| Mode | What it does | Needs |
| --- | --- | --- |
| `none` (default) | Form is shown but disabled, with a friendly "Sign-ups open soon" notice. Nothing is sent. Optionally shows a mailto link if `PUBLIC_WAITLIST_FALLBACK_EMAIL` is set. | nothing |
| `supabase` | `POST {PUBLIC_SUPABASE_URL}/rest/v1/{PUBLIC_SUPABASE_WAITLIST_TABLE}` with `Prefer: return=minimal`. Duplicate email (HTTP 409) is shown as "already on the list". | Supabase project URL + **publishable** key (`sb_publishable_…`, or legacy anon JWT in `PUBLIC_SUPABASE_ANON_KEY`), and run [`supabase/waitlist.sql`](supabase/waitlist.sql) once. |
| `formspree` | `POST` JSON to `PUBLIC_WAITLIST_ENDPOINT` with `Accept: application/json`. | A Formspree form endpoint, e.g. `https://formspree.io/f/xxxxxxx`. |
| `endpoint` | Same as `formspree`, for any JSON form endpoint (Basin, Getform, your own API). | An HTTPS endpoint URL. |

If a mode is selected but its settings are missing, the build logs a warning and falls back to `none`, so sign-ups are never silently dropped.

Payload fields: `name`, `email` (lower-cased), `city` (defaults to Chicago), `role` (`barber` | `shop_owner`), `shop_name` (optional), `instagram` (optional, `@` stripped), `consent` (`true`), `source` (`landing`). A hidden honeypot field (`website`) silently discards bot submissions. Client-side validation runs before any request.

`supabase/waitlist.sql` creates `public.barber_waitlist` with RLS **enabled**, an insert-only policy for `anon`, column-level INSERT grants only, no SELECT/UPDATE/DELETE for public roles, check constraints, and a case-insensitive unique index on email. Read sign-ups from the Supabase dashboard. (Tested against Postgres 17: anon insert works; anon select/update and duplicate emails are rejected.)

### Analytics (`PUBLIC_ANALYTICS_PROVIDER`)

Off by default. `src/components/Analytics.astro` renders no third-party script unless configured:

- `plausible`: set `PUBLIC_PLAUSIBLE_DOMAIN` (e.g. `akashp3128.github.io`), optional `PUBLIC_PLAUSIBLE_SRC`.
- `umami`: set `PUBLIC_UMAMI_WEBSITE_ID` and `PUBLIC_UMAMI_SRC`.

Components can call `window.fadeTrack(event, props)`; it is a no-op when analytics is off. The waitlist emits `waitlist_signup` on success. If analytics is enabled, update the privacy policy accordingly.

### Deploy target

`SITE_URL` (default `https://akashp3128.github.io`) and `BASE_PATH` (default `/fade-landing`). For a custom domain later: `SITE_URL=https://yourdomain.com`, `BASE_PATH=/`, add `public/CNAME`.

## Deploy (GitHub Pages)

`.github/workflows/deploy.yml` builds on every PR (build + link check only) and deploys `dist/` to Pages on push to `main` using `actions/upload-pages-artifact` + `actions/deploy-pages`.

One-time setup (repo owner): **Settings → Pages → Build and deployment → Source: GitHub Actions**. Until that's set, the deploy job on `main` will fail.

To configure the waitlist or analytics in production, add the env vars above as **repository Variables** (Settings → Secrets and variables → Actions → Variables) and re-run the workflow.

## SEO

Per-page `<title>`/description, canonical URL, Open Graph + Twitter card tags, 1200×630 OG image, SVG + PNG favicons, web manifest, `@astrojs/sitemap` (`sitemap-index.xml`) and a generated `robots.txt`. Note: on a GitHub Pages *project* site, crawlers only read `robots.txt` at the domain root, so it takes full effect once a custom domain is used; the sitemap is still discoverable via the `<link rel="sitemap">` tag and Search Console.

## Content rules

No fabricated testimonials, stats, store badges or company/legal entity names. Unknown details are marked as placeholders (e.g. `[Company legal name]`, `$[TBD]`).
