import { getSupabase } from "@/lib/supabase";
import { normalizarDominio, normalizarPolitica, type PoliticaDrive } from "@/lib/drive-politica";

/** Onda 92 · SCRUM-243: lê a regra da escola para "Salvar no Drive" (só no servidor). */
export async function lerPoliticaDrive(workspaceId: string): Promise<{ politica: PoliticaDrive; dominio: string }> {
  const { data, error } = await getSupabase()
    .from("workspaces")
    .select("drive_salvar, drive_dominio")
    .eq("id", workspaceId)
    .maybeSingle();
  if (error) {
    // Antes da migração (coluna inexistente) vale o padrão: qualquer conta, com aviso e registro.
    if (/drive_salvar|drive_dominio/.test(error.message)) return { politica: "qualquer", dominio: "" };
    // Qualquer outra falha fecha a porta: sem ler a regra, não salva.
    return { politica: "desligado", dominio: "" };
  }
  if (!data) return { politica: "desligado", dominio: "" };
  const d = data as { drive_salvar?: unknown; drive_dominio?: unknown };
  return { politica: normalizarPolitica(d.drive_salvar), dominio: normalizarDominio(d.drive_dominio) };
}
