import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars.",
  );
}

/**
 * Anon-key client. All writes go through SECURITY DEFINER rpc functions
 * (create_wish, report_wish, admin_*) — the `wishes` table itself only allows
 * public SELECT of visible rows via RLS.
 */
export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});

export type Wish = {
  id: string;
  body: string;
  first_name: string;
  last_name: string;
  alias: string;
  searchable: boolean;
  mood: "longing" | "gratitude" | "hopes";
  x: number;
  y: number;
  status: "visible" | "hidden";
  report_count: number;
  warm_count: number;
  created_at: string;
};
