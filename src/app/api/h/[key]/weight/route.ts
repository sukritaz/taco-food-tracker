import { NextRequest, NextResponse } from "next/server";
import { getHousehold } from "@/lib/household";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/h/[key]/weight  -> all weigh-ins, oldest first (for the chart)
export async function GET(_req: NextRequest, ctx: { params: Promise<{ key: string }> }) {
  const { key } = await ctx.params;
  const h = await getHousehold(key);
  if (!h) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { data, error } = await supabaseAdmin
    .from("weight_log")
    .select("id, household_id, measured_on, weight_kg")
    .eq("household_id", h.id)
    .order("measured_on", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ weights: data });
}

// POST /api/h/[key]/weight  -> log a weigh-in
export async function POST(req: NextRequest, ctx: { params: Promise<{ key: string }> }) {
  const { key } = await ctx.params;
  const h = await getHousehold(key);
  if (!h) return NextResponse.json({ error: "not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const weight_kg = Number(body.weight_kg);
  if (!Number.isFinite(weight_kg) || weight_kg <= 0) return NextResponse.json({ error: "bad weight" }, { status: 400 });
  const measured_on = typeof body.measured_on === "string" && body.measured_on ? body.measured_on : new Date().toISOString().slice(0, 10);

  const { data, error } = await supabaseAdmin
    .from("weight_log")
    .insert({ household_id: h.id, weight_kg, measured_on })
    .select("id, household_id, measured_on, weight_kg")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ weight: data }, { status: 201 });
}
