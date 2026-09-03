import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function auth(request: Request): boolean {
  const token = request.headers.get("x-admin-token");
  return !!token && token === process.env.ADMIN_SECRET;
}

export async function GET(request: Request) {
  if (!auth(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const { data, error } = await supabase.rpc("admin_list_wishes", {
    p_secret: process.env.ADMIN_SECRET,
  });
  if (error) {
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
  return NextResponse.json({ wishes: data ?? [] });
}

export async function POST(request: Request) {
  if (!auth(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  let body: { id?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  if (!body.id || (body.status !== "visible" && body.status !== "hidden")) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const { error } = await supabase.rpc("admin_set_status", {
    p_secret: process.env.ADMIN_SECRET,
    p_id: body.id,
    p_status: body.status,
  });
  if (error) {
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
