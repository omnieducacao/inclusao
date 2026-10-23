import { createClient } from "@supabase/supabase-js";

/**
 * Cliente do banco para o SERVIDOR. Usa só a chave de serviço (SUPABASE_SERVICE_KEY), que ignora o
 * RLS. O banco é fechado para a chave pública (anon): sem a chave de serviço o app não tem como
 * funcionar, então não existe mais o fallback silencioso para a anon (SCRUM-66).
 * Em produção, a falta das variáveis é pega já na subida (instrumentation.ts / lib/ambiente.ts).
 */
export function getSupabase() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
  const key = (process.env.SUPABASE_SERVICE_KEY || "").trim();
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórios. A chave pública (anon) não serve: " +
      "o banco está fechado para ela."
    );
  }
  return createClient(url, key);
}

export type SupabaseClient = ReturnType<typeof createClient>;
