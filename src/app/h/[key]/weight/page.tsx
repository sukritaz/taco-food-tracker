import { getHousehold } from "@/lib/household";
import { supabaseAdmin } from "@/lib/supabase";
import type { WeightLog } from "@/lib/types";
import WeightClient from "./WeightClient";

export const dynamic = "force-dynamic";

export default async function WeightPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const h = (await getHousehold(key))!;

  const { data } = await supabaseAdmin
    .from("weight_log")
    .select("id, household_id, measured_on, weight_kg")
    .eq("household_id", h.id)
    .order("measured_on", { ascending: false });

  return <WeightClient householdKey={key} catName={h.cat_name} initial={(data ?? []) as WeightLog[]} />;
}
