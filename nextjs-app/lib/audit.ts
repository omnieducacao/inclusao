import { getSupabase } from "@/lib/supabase";
import { resumirIp, ipDoPedido, resumirNavegador } from "@/lib/resumo-acesso";
import { logger } from "@/lib/logger";
import type { SessionPayload } from "@/lib/session";

/**
 * Trilha de auditoria (LGPD, art. 37) na tabela audit_log.
 *
 * SCRUM-70: grava só ids (quem fez, onde e em quê), nunca nome, e-mail ou conteúdo. O IP vira
 * resumo (resumirIp) e o navegador só o tipo ("Chrome · Android"). Se o Supabase recusar a
 * gravação, o erro vai para o log do servidor; a auditoria não derruba a ação principal.
 */
export type AuditAction =
    | "view"
    | "create"
    | "update"
    | "delete"
    | "export"
    | "login"
    | "login_failed"
    | "logout"
    | "simulate_start"
    | "simulate_end"
    | "permission_change";

export interface AuditParams {
    workspaceId?: string | null;
    /** id (uuid) de quem fez; nunca o nome */
    actorId?: string | null;
    actorRole?: string | null;
    action: AuditAction;
    resourceType: string;
    resourceId?: string | null;
    metadata?: Record<string, unknown>;
    /** pedido HTTP: dele saem o resumo do IP e o tipo de navegador */
    req?: Request;
}

/** Chaves que costumam carregar dado pessoal ou conteúdo; nunca vão para o log. */
const CHAVES_PROIBIDAS = /nome|name|email|e-mail|senha|password|texto|conteudo|content|cpf|telefone|phone|laudo|diagnostico/i;

export function limparMetadata(metadata: Record<string, unknown> = {}): Record<string, unknown> {
    const limpo: Record<string, unknown> = {};
    for (const [chave, valor] of Object.entries(metadata)) {
        if (CHAVES_PROIBIDAS.test(chave)) continue;
        if (valor === undefined) continue;
        if (typeof valor === "string" && valor.length > 120) continue; // texto longo é conteúdo
        limpo[chave] = valor;
    }
    return limpo;
}

/** Quem está agindo, tirado da sessão: id real (também durante uma simulação), papel e escola. */
export function atorDaSessao(session: SessionPayload): Pick<AuditParams, "workspaceId" | "actorId" | "actorRole" | "metadata"> {
    const simulando = !!(session.simulating_workspace_id || session.simulating_member_id);
    const memberId = (session.member as { id?: string | null } | undefined)?.id || null;
    const fallback =
        session.user_role === "family" ? session.family_responsible_id || null
        : session.user_role === "master" && !session.is_platform_admin ? session.workspace_id
        : memberId;
    const metadata: Record<string, unknown> = {};
    if (session.simulating_workspace_id) metadata.simulando_escola = true;
    if (session.simulating_member_id) metadata.simulando_membro = session.simulating_member_id;
    return {
        workspaceId: session.workspace_id,
        actorId: session.usuario_id || (simulando ? null : fallback),
        actorRole: session.is_platform_admin ? "platform_admin" : session.user_role,
        metadata,
    };
}

export async function logAction(params: AuditParams): Promise<void> {
    const navegador = params.req ? resumirNavegador(params.req.headers.get("user-agent")) : null;
    const linha = {
        workspace_id: params.workspaceId || null,
        actor_id: params.actorId || null,
        actor_role: params.actorRole || null,
        action: params.action,
        resource_type: params.resourceType,
        resource_id: params.resourceId || null,
        metadata: limparMetadata({ ...params.metadata, navegador: navegador || undefined }),
        ip_address: params.req ? resumirIp(ipDoPedido(params.req)) : null, // SCRUM-231: só o resumo
    };
    try {
        const { error } = await getSupabase().from("audit_log").insert(linha);
        if (error) {
            logger.error(
                { code: error.code, message: error.message, action: linha.action, resource_type: linha.resource_type },
                "[audit] gravação recusada"
            );
        }
    } catch (err) {
        logger.error({ err, action: linha.action, resource_type: linha.resource_type }, "[audit] falha ao gravar");
    }
}

/**
 * Atalho para rotas com sessão: registra a ação em nome de quem está logado.
 * A demonstração (Escola Demo) não grava nada, nem auditoria.
 */
export async function auditar(
    session: SessionPayload | null | undefined,
    req: Request | undefined,
    acao: { action: AuditAction; resourceType: string; resourceId?: string | null; metadata?: Record<string, unknown> }
): Promise<void> {
    if (!session || session.is_demo) return;
    const ator = atorDaSessao(session);
    await logAction({ ...ator, ...acao, metadata: { ...ator.metadata, ...acao.metadata }, req });
}

/** Exportação de dados (LGPD, portabilidade). */
export async function logExport(
    session: SessionPayload,
    req: Request | undefined,
    params: { resourceType: string; resourceId?: string | null; format?: string }
): Promise<void> {
    return auditar(session, req, {
        action: "export",
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        metadata: { format: params.format || "json" },
    });
}
