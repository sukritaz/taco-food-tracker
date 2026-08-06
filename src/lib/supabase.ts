import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only client using the secret key (sb_secret_…, formerly service_role).
// It bypasses RLS, so this file must never be imported into a client component.
// All DB access happens in server route handlers / server components that first
// validate the household key.
//
// The publishable key and JWKS URL in .env.local go unused: there is no auth and
// the browser never talks to Supabase directly, so nothing needs a public client.
//
// Initialized lazily (on first use) so `next build` doesn't require env vars at
// build time — the check only fires when a request actually hits the DB.
let client: SupabaseClient | null = null;

function init(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SECRET_KEY. Copy .env.local.example to .env.local and fill it in.",
    );
  }
  if (secretKey.startsWith("sb_publishable_")) {
    // Publishable keys are subject to RLS, and these tables have no policies —
    // every query would silently return zero rows instead of erroring.
    throw new Error(
      "SUPABASE_SECRET_KEY holds a publishable key. Use the secret key (sb_secret_…) from Project Settings > API Keys.",
    );
  }
  return createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    if (!client) client = init();
    return Reflect.get(client, prop, receiver);
  },
});
