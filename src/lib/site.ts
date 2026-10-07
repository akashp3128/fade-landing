/** Shared site constants + base-path aware URL helper. */

export const SITE = {
  name: 'Fade',
  tagline: 'Booking and payments for barbers',
  defaultDescription:
    'Fade is a booking and payments app for independent barbers: profile, services, hours, bookings, Stripe payouts and one shareable booking link. Launching first in Chicago.',
  city: 'Chicago',
  ogImage: '/og-image.png',
  // Placeholder: no legal entity exists yet. Do not replace with a real name until confirmed.
  legalName: '[Company legal name]',
  // Placeholder contact for legal pages. Replace once a monitored inbox exists.
  contactEmail: '[contact email]',
} as const;

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Prefix an internal path with the configured base (e.g. /fade-landing). */
export function url(path = '/'): string {
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${p}`;
}

/** Absolute URL (for canonical / OG tags). */
export function absoluteUrl(path: string, site: URL | undefined): string {
  const origin = site ? site.origin : 'https://akashp3128.github.io';
  return new URL(url(path), origin).toString();
}
