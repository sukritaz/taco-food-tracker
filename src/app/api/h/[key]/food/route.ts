import { NextRequest, NextResponse } from "next/server";
import { getHousehold } from "@/lib/household";
import { supabaseAdmin } from "@/lib/supabase";
import { VALID_FOODS, VALID_UNITS } from "@/lib/units";
import type { FoodType, Unit } from "@/lib/types";

// GET /api/h/[key]/food?from=ISO&to=ISO  -> list entries in range (default: all)
export async function GET(req: NextRequest, ctx: { params: Promise<{ key: string }> }) {
  const { key } = await ctx.params;
  const h = await getHousehold(key);
  if (!h) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let q = supabaseAdmin
    .from("food_log")
    .select("id, household_id, fed_at, food_type, amount, unit, fed_by, note")
    .eq("household_id", h.id)
    .order("fed_at", { ascending: false });

  if (from) q = q.gte("fed_at", from);
  if (to) q = q.lte("fed_at", to);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ logs: data });
}

// POST /api/h/[key]/food  -> create an entry
export async function POST(req: NextRequest, ctx: { params: Promise<{ key: string }> }) {
  const { key } = await ctx.params;
  const h = await getHousehold(key);
  if (!h) return NextResponse.json({ error: "not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const food_type = body.food_type as FoodType;
  const unit = body.unit as Unit;
  const amount = Number(body.amount);

  if (!VALID_FOODS.includes(food_type)) return NextResponse.json({ error: "bad food_type" }, { status: 400 });
  if (!VALID_UNITS.includes(unit)) return NextResponse.json({ error: "bad unit" }, { status: 400 });
  if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: "bad amount" }, { status: 400 });

  const fed_at = body.fed_at ? new Date(body.fed_at).toISOString() : new Date().toISOString();
  const fed_by = typeof body.fed_by === "string" && body.fed_by.trim() ? body.fed_by.trim().slice(0, 60) : null;
  const note = typeof body.note === "string" && body.note.trim() ? body.note.trim().slice(0, 280) : null;

  const { data, error } = await supabaseAdmin
    .from("food_log")
    .insert({ household_id: h.id, fed_at, food_type, amount, unit, fed_by, note })
    .select("id, household_id, fed_at, food_type, amount, unit, fed_by, note")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ log: data }, { status: 201 });
}
