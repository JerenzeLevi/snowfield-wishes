import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const first = (searchParams.get("first") ?? "").trim().toLowerCase();
  const last = (searchParams.get("last") ?? "").trim().toLowerCase();

  if (!first || !last) {
    return NextResponse.json({ error: "Enter a first name and a surname." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("wishes")
    .select("id, body, first_name, last_name, mood, warm_count, created_at")
    .eq("searchable", true)
    .eq("status", "visible")
    .eq("name_search", `${first} ${last}`)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: "Search failed." }, { status: 500 });
  }

  return NextResponse.json({ wishes: data ?? [] });
}
