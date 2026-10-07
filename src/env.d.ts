/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_WAITLIST_MODE?: 'none' | 'supabase' | 'formspree' | 'endpoint';
  readonly PUBLIC_SUPABASE_URL?: string;
  readonly PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly PUBLIC_SUPABASE_ANON_KEY?: string;
  readonly PUBLIC_SUPABASE_WAITLIST_TABLE?: string;
  readonly PUBLIC_WAITLIST_ENDPOINT?: string;
  readonly PUBLIC_WAITLIST_FALLBACK_EMAIL?: string;
  readonly PUBLIC_ANALYTICS_PROVIDER?: 'none' | 'plausible' | 'umami';
  readonly PUBLIC_PLAUSIBLE_DOMAIN?: string;
  readonly PUBLIC_PLAUSIBLE_SRC?: string;
  readonly PUBLIC_UMAMI_WEBSITE_ID?: string;
  readonly PUBLIC_UMAMI_SRC?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  fadeTrack?: (event: string, props?: Record<string, string | number | boolean>) => void;
}
