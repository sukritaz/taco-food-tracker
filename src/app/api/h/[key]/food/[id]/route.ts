import { NextRequest, NextResponse } from "next/server";
import { getHousehold } from "@/lib/household";
import { supabaseAdmin } from "@/lib/supabase";

// DELETE /api/h/[key]/food/[id]  -> remove one entry (scoped to household)
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ key: string; id: string }> }) {
  const { key, id } = await ctx.params;
  const h = await getHousehold(key);
  if (!h) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { error } = await supabaseAdmin
    .from("food_log")
    .delete()
    .eq("id", id)
    .eq("household_id", h.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
