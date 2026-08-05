// Server-side guard: pins the backend this app talks to.
//
// The editor regenerates `.env` on every code change and can re-inject a
// different Supabase project ref. The client bundle is already pinned through
// `define` in vite.config.ts; this does the same for server-side code
// (SSR, server functions), which reads `process.env`.
//
// Imported for its side effect at the top of `src/server.ts`.

const CANONICAL_URL = "https://olgvvhjguiwgcfxpdnli.supabase.co";
const CANONICAL_PUBLISHABLE_KEY = "sb_publishable_Q5LWwgGUesb3x5rRMDz8Nw_XvPFKXBj";
const CANONICAL_PROJECT_ID = "olgvvhjguiwgcfxpdnli";

// Any project ref that is NOT the canonical one gets overridden.
function isForeign(value: string | undefined): boolean {
  return !!value && !value.includes(CANONICAL_PROJECT_ID);
}

try {
  if (typeof process !== "undefined" && process.env) {
    const urlWasForeign = !process.env.SUPABASE_URL || isForeign(process.env.SUPABASE_URL);
    if (urlWasForeign) {
      process.env.SUPABASE_URL = CANONICAL_URL;
      // The key must belong to the same project as the URL.
      process.env.SUPABASE_PUBLISHABLE_KEY = CANONICAL_PUBLISHABLE_KEY;
    }
    if (isForeign(process.env.SUPABASE_PROJECT_ID) || !process.env.SUPABASE_PROJECT_ID) {
      process.env.SUPABASE_PROJECT_ID = CANONICAL_PROJECT_ID;
    }
    if (!process.env.SUPABASE_PUBLISHABLE_KEY) {
      process.env.SUPABASE_PUBLISHABLE_KEY = CANONICAL_PUBLISHABLE_KEY;
    }
  }
} catch {
  // Never let env pinning break the server entry.
}

export {};
