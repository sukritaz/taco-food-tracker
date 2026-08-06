import { getHousehold } from "@/lib/household";
import { supabaseAdmin } from "@/lib/supabase";
import type { FoodLog } from "@/lib/types";
import CalendarClient from "./CalendarClient";

export const dynamic = "force-dynamic";

export default async function CalendarPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const h = (await getHousehold(key))!;

  const { data } = await supabaseAdmin
    .from("food_log")
    .select("id, household_id, fed_at, food_type, amount, unit, fed_by, note")
    .eq("household_id", h.id)
    .order("fed_at", { ascending: false });

  return <CalendarClient household={h} logs={(data ?? []) as FoodLog[]} />;
}
