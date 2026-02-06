import { getSupabase } from "./supabase";
import type { EngineId } from "./ai-engines";

/**
 * Verifica se um motor de IA está disponível para o workspace.
 */
export async function isEngineAvailable(
  workspaceId: string,
  engine: EngineId
): Promise<boolean> {
  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("workspaces")
      .select("ai_engines")
      .eq("id", workspaceId)
      .single();

    if (error || !data) return false;

    const aiEngines = (data.ai_engines as string[]) || [];
    return aiEngines.includes(engine);
  } catch {
    return false;
  }
}

/**
 * Busca os módulos habilitados e motores de IA disponíveis para o workspace.
 */
export async function getWorkspaceConfig(workspaceId: string): Promise<{
  enabled_modules: string[];
  ai_engines: string[];
} | null> {
  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("workspaces")
      .select("enabled_modules, ai_engines")
      .eq("id", workspaceId)
      .single();

    if (error || !data) return null;

    return {
      enabled_modules: (data.enabled_modules as string[]) || [],
      ai_engines: (data.ai_engines as string[]) || [],
    };
  } catch {
    return null;
  }
}
