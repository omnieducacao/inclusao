import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const key =
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || "";

export function getSupabase() {
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL e SUPABASE_SERVICE_KEY (ou SUPABASE_ANON_KEY) são obrigatórios."
    );
  }
  return createClient(url, key);
}

export type SupabaseClient = ReturnType<typeof createClient>;
