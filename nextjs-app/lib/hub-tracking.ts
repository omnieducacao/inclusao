/**
 * Persistência de metadados do conteúdo gerado no Hub (4.4.1)
 * Rastreabilidade: "Questões de LP para João, 3º ano", etc.
 */
import { getSupabase } from "./supabase";

export type HubContentType =
  | "criar_atividade"
  | "criar_itens"
  | "adaptar_prova"
  | "adaptar_atividade"
  | "plano_aula"
  | "roteiro"
  | "dinamica"
  | "papo_mestre"
  | "mapa_mental"
  | "inclusao_brincar"
  | "rotina_avd"
  | "experiencia_ei"
  | "gerar_imagem";

export type SaveHubContentParams = {
  workspaceId: string;
  memberId?: string | null;
  studentId?: string | null;
  contentType: HubContentType;
  description: string;
  engine?: string;
  metadata?: Record<string, unknown>;
};

/**
 * Salva metadados do conteúdo gerado no Hub.
 * Falha silenciosa — não deve bloquear o fluxo principal.
 */
export async function saveHubGeneratedContent(params: SaveHubContentParams): Promise<void> {
  try {
    const sb = getSupabase();
    await sb.from("hub_generated_content").insert({
      workspace_id: params.workspaceId,
      member_id: params.memberId || null,
      student_id: params.studentId || null,
      content_type: params.contentType,
      description: params.description,
      engine: params.engine || null,
      metadata: params.metadata || {},
    });
  } catch { /* expected fallback */
    // Tabela pode não existir ou erro de conexão — ignorar
  }
}

/** Versão dos prompts das ferramentas: sobe quando um prompt muda, para saber o que gerou cada material. */
export const PROMPT_VERSION_HUB = "2026-10-onda3b"; // regras de qualidade do OmniProf + resumo do PEI completo

const NOMES: Record<HubContentType, string> = {
  criar_atividade: "Atividade",
  criar_itens: "Questões",
  adaptar_prova: "Prova adaptada",
  adaptar_atividade: "Atividade adaptada",
  plano_aula: "Plano de aula",
  roteiro: "Roteiro individual",
  dinamica: "Dinâmica inclusiva",
  papo_mestre: "Papo de mestre",
  mapa_mental: "Mapa mental",
  inclusao_brincar: "Inclusão no brincar",
  rotina_avd: "Rotina e AVD",
  experiencia_ei: "Experiência (EI)",
  gerar_imagem: "Imagem",
};

export function nomeDoMaterial(tipo: string): string {
  return NOMES[tipo as HubContentType] ?? "Material";
}

/**
 * Onda 3: guarda o material gerado no histórico do estudante (quando há um estudante),
 * com o texto, a versão do prompt e a versão do PEI usada como contexto.
 * Nunca derruba a resposta: erro aqui é ignorado.
 */
export function registrarMaterial(params: {
  session: { workspace_id?: string | null; simulating_workspace_id?: string; member?: Record<string, unknown>; simulating_member_id?: string } | null | undefined;
  studentId?: string | null;
  versaoPei?: number | null;
  contentType: HubContentType;
  descricao: string;
  engine?: string;
  conteudo?: string;
  metadata?: Record<string, unknown>;
}): void {
  const s = params.session;
  const workspaceId = s?.simulating_workspace_id || s?.workspace_id;
  if (!workspaceId) return;
  const memberId = s?.simulating_member_id || ((s?.member as { id?: unknown } | undefined)?.id as string | undefined) || null;
  void saveHubGeneratedContent({
    workspaceId,
    memberId: typeof memberId === "string" ? memberId : null,
    studentId: params.studentId || null,
    contentType: params.contentType,
    description: params.descricao.slice(0, 200),
    engine: params.engine,
    metadata: {
      ...(params.metadata || {}),
      prompt_version: PROMPT_VERSION_HUB,
      versao_pei: params.versaoPei ?? null,
      conteudo: params.studentId && params.conteudo ? params.conteudo.slice(0, 60_000) : undefined,
    },
  });
}
