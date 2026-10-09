import { getSupabase } from "./supabase";

export type ModoEscola = "completo" | "simplificado";

/** Onda 2: modo da escola (completo | simplificado), definido em Configuração da escola. */
export async function modoDaEscola(workspaceId: string | null | undefined): Promise<ModoEscola> {
  if (!workspaceId) return "completo";
  const { data } = await getSupabase().from("workspaces").select("modo").eq("id", workspaceId).maybeSingle();
  return (data as { modo?: string } | null)?.modo === "simplificado" ? "simplificado" : "completo";
}
