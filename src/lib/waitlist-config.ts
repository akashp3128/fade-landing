/**
 * Build-time waitlist configuration from PUBLIC_* env vars.
 * Falls back to mode "none" whenever the chosen mode is missing what it needs,
 * so a half-configured deploy never silently drops sign-ups.
 */
export type WaitlistMode = 'none' | 'supabase' | 'formspree' | 'endpoint';

export interface WaitlistConfig {
  mode: WaitlistMode;
  /** Requested mode, even if we fell back to none. */
  requestedMode: string;
  endpoint: string;
  anonKey: string;
  fallbackEmail: string;
  misconfigured: boolean;
}

export function getWaitlistConfig(): WaitlistConfig {
  const env = import.meta.env;
  const requestedMode = (env.PUBLIC_WAITLIST_MODE || 'none').toLowerCase().trim();
  const fallbackEmail = (env.PUBLIC_WAITLIST_FALLBACK_EMAIL || '').trim();
  const none: WaitlistConfig = { mode: 'none', requestedMode, endpoint: '', anonKey: '', fallbackEmail, misconfigured: false };

  if (requestedMode === 'supabase') {
    const base = (env.PUBLIC_SUPABASE_URL || '').trim().replace(/\/$/, '');
    // Prefer the new publishable key (sb_publishable_...); legacy anon JWT still accepted.
    const anonKey = (env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.PUBLIC_SUPABASE_ANON_KEY || '').trim();
    const table = (env.PUBLIC_SUPABASE_WAITLIST_TABLE || 'barber_waitlist').trim();
    if (!base || !anonKey || !/^https:\/\//.test(base)) return { ...none, misconfigured: true };
    return { mode: 'supabase', requestedMode, endpoint: `${base}/rest/v1/${encodeURIComponent(table)}`, anonKey, fallbackEmail, misconfigured: false };
  }

  if (requestedMode === 'formspree' || requestedMode === 'endpoint') {
    const endpoint = (env.PUBLIC_WAITLIST_ENDPOINT || '').trim();
    if (!/^https:\/\//.test(endpoint)) return { ...none, misconfigured: true };
    return { mode: requestedMode, requestedMode, endpoint, anonKey: '', fallbackEmail, misconfigured: false };
  }

  return none;
}
