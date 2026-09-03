import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "Bad id." }, { status: 400 });
  }

  const { error } = await supabase.rpc("report_wish", { p_id: id });
  if (error) {
    return NextResponse.json({ error: "Could not report." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
