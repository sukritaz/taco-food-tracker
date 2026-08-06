import { getHousehold } from "@/lib/household";
import { supabaseAdmin } from "@/lib/supabase";
import type { FoodLog } from "@/lib/types";
import LogClient from "./LogClient";

export const dynamic = "force-dynamic";

function startOfTodayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export default async function LogPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const h = (await getHousehold(key))!; // layout already guarded null

  const { data } = await supabaseAdmin
    .from("food_log")
    .select("id, household_id, fed_at, food_type, amount, unit, fed_by, note")
    .eq("household_id", h.id)
    .gte("fed_at", startOfTodayISO())
    .order("fed_at", { ascending: false });

  return <LogClient householdKey={key} household={h} initialToday={(data ?? []) as FoodLog[]} />;
}
