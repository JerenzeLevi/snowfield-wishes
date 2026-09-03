import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createWishSchema } from "@/lib/validation";
import { findProfanity } from "@/lib/profanity";
import { randomPosition } from "@/lib/field";

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = createWishSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const input = parsed.data;

  const bad =
    findProfanity(input.body) ||
    findProfanity(input.alias ?? "") ||
    findProfanity(`${input.firstName ?? ""} ${input.lastName ?? ""}`);
  if (bad) {
    return NextResponse.json(
      { error: "That wording tripped our filter. Try rephrasing kindly." },
      { status: 422 },
    );
  }

  const pos = input.visibility === "alias" ? randomPosition() : { x: null, y: null };

  const { data, error } = await supabase.rpc("create_wish", {
    p_body: input.body,
    p_visibility: input.visibility,
    p_first_name: input.firstName ?? null,
    p_last_name: input.lastName ?? null,
    p_alias: input.alias ?? null,
    p_x: pos.x,
    p_y: pos.y,
  });

  if (error) {
    return NextResponse.json({ error: "Could not save your wish." }, { status: 500 });
  }

  return NextResponse.json({ wish: data }, { status: 201 });
}
