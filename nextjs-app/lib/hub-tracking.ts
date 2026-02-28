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
  } catch {
    // Tabela pode não existir ou erro de conexão — ignorar
  }
}
