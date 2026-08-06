import { getHousehold } from "@/lib/household";
import { supabaseAdmin } from "@/lib/supabase";
import type { FoodLog, WeightLog } from "@/lib/types";
import ChartClient from "./ChartClient";

export const dynamic = "force-dynamic";

export default async function ChartPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const h = (await getHousehold(key))!;

  const [{ data: food }, { data: weights }] = await Promise.all([
    supabaseAdmin
      .from("food_log")
      .select("id, household_id, fed_at, food_type, amount, unit, fed_by, note")
      .eq("household_id", h.id)
      .order("fed_at", { ascending: true }),
    supabaseAdmin
      .from("weight_log")
      .select("id, household_id, measured_on, weight_kg")
      .eq("household_id", h.id)
      .order("measured_on", { ascending: true }),
  ]);

  return (
    <ChartClient
      household={h}
      logs={(food ?? []) as FoodLog[]}
      weights={(weights ?? []) as WeightLog[]}
    />
  );
}
