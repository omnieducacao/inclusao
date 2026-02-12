/**
 * Sistema de módulos habilitados por workspace
 * Compatível com Streamlit (omni_utils.get_enabled_modules)
 */

import { getSupabase } from "./supabase";

export const MODULE_KEYS = ["pei", "paee", "hub", "diario", "avaliacao"] as const;
export type ModuleKey = typeof MODULE_KEYS[number];

export const MODULE_LABELS: Record<ModuleKey, string> = {
  pei: "Estratégias & PEI",
  paee: "Plano de Ação (AEE)",
  hub: "Hub de Recursos",
  diario: "Diário de Bordo",
  avaliacao: "Monitoramento & Avaliação",
};

/**
 * Retorna lista de módulos habilitados para o workspace
 * Se for platform_admin, retorna todos os módulos
 * Se enabled_modules for null/vazio no DB, retorna todos por padrão
 */
export async function getEnabledModules(
  workspaceId: string | null,
  isPlatformAdmin: boolean = false
): Promise<ModuleKey[]> {
  // Platform admin tem acesso a tudo
  if (isPlatformAdmin) {
    return [...MODULE_KEYS];
  }

  if (!workspaceId) {
    // Sem workspace = todos os módulos por padrão
    return [...MODULE_KEYS];
  }

  try {
    const sb = getSupabase();
    const { data } = await sb
      .from("workspaces")
      .select("enabled_modules")
      .eq("id", workspaceId)
      .maybeSingle();

    const enabledModules = (data as { enabled_modules?: string[] | null })?.enabled_modules;

    // Se null/vazio no DB, retorna todos por padrão
    if (!enabledModules || !Array.isArray(enabledModules) || enabledModules.length === 0) {
      return [...MODULE_KEYS];
    }

    // Filtrar apenas módulos válidos
    return enabledModules.filter((m): m is ModuleKey => MODULE_KEYS.includes(m as ModuleKey));
  } catch (error) {
    console.error("Erro ao buscar módulos habilitados:", error);
    // Em caso de erro, retorna todos por padrão
    return [...MODULE_KEYS];
  }
}

/**
 * Verifica se um módulo específico está habilitado
 */
export async function isModuleEnabled(
  module: ModuleKey,
  workspaceId: string | null,
  isPlatformAdmin: boolean = false
): Promise<boolean> {
  const enabled = await getEnabledModules(workspaceId, isPlatformAdmin);
  return enabled.includes(module);
}

/**
 * Mapeia permissão de membro para módulo
 */
export function permissionToModule(permission: string): ModuleKey | null {
  const mapping: Record<string, ModuleKey> = {
    can_pei: "pei",
    can_paee: "paee",
    can_hub: "hub",
    can_diario: "diario",
    can_avaliacao: "avaliacao",
  };
  return mapping[permission] || null;
}
