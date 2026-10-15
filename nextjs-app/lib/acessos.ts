import { getSupabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";

export type TipoAcesso = "login" | "demo_entrada" | "demo_pagina" | "demo_papel";

/**
 * Registra um acesso à plataforma (onda 57): login de quem usa de verdade e o caminho de quem
 * entra na demonstração. Nunca derruba quem chamou: se não gravar, só fica no log.
 */
export async function registrarAcesso(a: {
  tipo: TipoAcesso; workspace_id?: string | null; workspace_nome?: string | null; usuario_nome?: string | null;
  papel?: string | null; lead_id?: string | null; rota?: string | null; modulo?: string | null;
}): Promise<void> {
  try {
    const { error } = await getSupabase().from("acessos").insert({
      tipo: a.tipo, workspace_id: a.workspace_id ?? null, workspace_nome: a.workspace_nome?.slice(0, 160) ?? null,
      usuario_nome: a.usuario_nome?.slice(0, 160) ?? null, papel: a.papel?.slice(0, 60) ?? null,
      lead_id: a.lead_id ?? null, rota: a.rota?.slice(0, 160) ?? null, modulo: a.modulo?.slice(0, 60) ?? null,
    });
    if (error) throw error;
  } catch (err) {
    logger.warn({ err }, "registrarAcesso");
  }
}
