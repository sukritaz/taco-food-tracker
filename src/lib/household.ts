import { supabaseAdmin } from "./supabase";
import type { Household } from "./types";

// Look up a household by its secret URL key. Returns null when not found —
// callers return 404 so an invalid/guessed key reveals nothing.
export async function getHousehold(key: string): Promise<Household | null> {
  const { data, error } = await supabaseAdmin
    .from("household")
    .select("id, key, cat_name, dry_scoop_g, wet_pouch_g, daily_target_g")
    .eq("key", key)
    .maybeSingle();

  if (error || !data) return null;
  return data as Household;
}
