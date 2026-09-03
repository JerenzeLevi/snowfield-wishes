import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const PAGE = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor"); // ISO created_at of last item

  let query = supabase
    .from("wishes")
    .select("id, body, alias, mood, warm_count, x, y, created_at")
    .eq("status", "visible")
    .order("created_at", { ascending: false })
    .limit(PAGE);

  if (cursor) query = query.lt("created_at", cursor);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: "Could not load the field." }, { status: 500 });
  }

  const rows = data ?? [];
  const nextCursor = rows.length === PAGE ? rows[rows.length - 1].created_at : null;
  return NextResponse.json({ wishes: rows, nextCursor });
}
