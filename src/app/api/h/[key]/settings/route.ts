import { NextRequest, NextResponse } from "next/server";
import { getHousehold } from "@/lib/household";
import { supabaseAdmin } from "@/lib/supabase";

// PATCH /api/h/[key]/settings -> update cat name, conversion factors, optional target
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ key: string }> }) {
  const { key } = await ctx.params;
  const h = await getHousehold(key);
  if (!h) return NextResponse.json({ error: "not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const patch: Record<string, unknown> = {};

  if (typeof body.cat_name === "string" && body.cat_name.trim()) patch.cat_name = body.cat_name.trim().slice(0, 60);

  const dry = Number(body.dry_scoop_g);
  if (Number.isFinite(dry) && dry > 0) patch.dry_scoop_g = dry;

  const wet = Number(body.wet_pouch_g);
  if (Number.isFinite(wet) && wet > 0) patch.wet_pouch_g = wet;

  if (body.daily_target_g === null) {
    patch.daily_target_g = null;
  } else if (body.daily_target_g !== undefined) {
    const t = Number(body.daily_target_g);
    if (Number.isFinite(t) && t > 0) patch.daily_target_g = t;
  }

  if (Object.keys(patch).length === 0) return NextResponse.json({ error: "nothing to update" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("household")
    .update(patch)
    .eq("id", h.id)
    .select("id, key, cat_name, dry_scoop_g, wet_pouch_g, daily_target_g")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ household: data });
}
