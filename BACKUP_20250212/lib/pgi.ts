import { getSupabase } from "./supabase";

export type AcaoPGI = {
  tipo: string;
  o_que: string;
  por_que?: string;
  quem?: string;
  onde?: string;
  como?: string;
  prazo?: string;
  custo?: string;
  perfil?: string[];
  criado_em?: string;
};

export type DimensionamentoPGI = {
  n_total?: number;
  n_deficiencia?: number;
  n_prof?: number;
  horas_dia?: number;
};

export type PGIData = {
  acoes?: AcaoPGI[];
  dimensionamento?: DimensionamentoPGI;
};

export const TIPOS_ACAO: Record<
  string,
  [string, string]
> = {
  infraestrutura: ["Infraestrutura (Acessibilidade física)", "infra"],
  sala_multifuncional: ["Sala Multifuncional (SRM)", "srm"],
  formacao_equipe: ["Formação de Equipe", "equipe"],
  recursos_pedagogicos: ["Recursos Pedagógicos", "pedag"],
  dimensionamento_pgei: ["Dimensionamento / Equipe (PGEI)", "pgei"],
  comunicacao_procedimentos: ["Comunicação e procedimentos", "com"],
};

export const PERFIS_ATENDIMENTO = [
  "TEA",
  "Deficiência física",
  "Deficiência intelectual",
  "Dificuldades de aprendizagem",
  "Altas habilidades",
  "Comportamentos disruptivos",
  "Outro",
];

export async function getPGIData(workspaceId: string): Promise<PGIData> {
  if (!workspaceId) return { acoes: [], dimensionamento: {} };
  const sb = getSupabase();
  const { data } = await sb
    .from("workspaces")
    .select("pgi_data")
    .eq("id", workspaceId)
    .maybeSingle();
  const raw = (data as { pgi_data?: PGIData })?.pgi_data;
  if (!raw || typeof raw !== "object") return { acoes: [], dimensionamento: {} };
  return {
    acoes: Array.isArray(raw.acoes) ? raw.acoes : [],
    dimensionamento: raw.dimensionamento && typeof raw.dimensionamento === "object"
      ? raw.dimensionamento
      : {},
  };
}

export async function updatePGIData(
  workspaceId: string,
  pgiData: PGIData
): Promise<{ error?: string }> {
  const sb = getSupabase();
  const { error } = await sb
    .from("workspaces")
    .update({ pgi_data: pgiData })
    .eq("id", workspaceId);
  if (error) return { error: error.message };
  return {};
}
