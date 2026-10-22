import { getSession, type SessionPayload } from "@/lib/session";
import { NextResponse } from "next/server";

/**
 * Permission validation helper for API routes.
 * 
 * Checks if the current user has the required permission for a module.
 * Platform admins and workspace masters always have access.
 * Members need the specific permission flag in their session.
 */

export type PermissionKey =
    | "can_pei"
    | "can_paee"
    | "can_hub"
    | "can_diario"
    | "can_avaliacao"      // Evolução & Dados (monitoramento) e avaliações
    | "can_pei_professor"
    | "can_estudantes"
    | "can_gestao";        // Gestão, PGI e Configuração da escola
// Onda 0: can_monitoramento, can_pgi e can_config não existiam nos membros, então
// professores com acesso legítimo recebiam 403. Agora seguem as mesmas flags das telas.

/**
 * SCRUM-68: o responsável (papel "family") só usa as rotas de /api/familia e as comuns
 * (notificações, avisos). Rotas de equipe recusam esse papel com 403, mesmo que o proxy.ts falhe.
 * Retorna null se for equipe (coordenação, professor, admin da plataforma).
 */
export function requireStaff(session: Pick<SessionPayload, "user_role">): NextResponse | null {
    if (session.user_role === "family") {
        return NextResponse.json({ error: "Acesso não permitido para o perfil família." }, { status: 403 });
    }
    return null;
}

/**
 * Get the current session or return a 401 response.
 * Rotas de equipe: o papel família recebe 403 (ver requireStaff). Nenhuma rota de
 * /api/familia usa este helper.
 */
export async function requireAuth(): Promise<
    { session: SessionPayload; error?: never } | { session?: never; error: NextResponse }
> {
    const session = await getSession();
    if (!session) {
        return {
            error: NextResponse.json(
                { error: "Não autenticado. Faça login novamente." },
                { status: 401 }
            ),
        };
    }
    const staff = requireStaff(session);
    if (staff) return { error: staff };
    return { session };
}

/**
 * Check if the user has a specific module permission.
 * Returns null if authorized, or a 403 Response if not.
 * 
 * Platform admins and masters always pass.
 * Members must have the specific permission flag.
 * 
 * Usage:
 *   const { session, error } = await requireAuth();
 *   if (error) return error;
 *   const denied = requirePermission(session, "can_pei");
 *   if (denied) return denied;
 */
export function requirePermission(
    session: SessionPayload,
    permission: PermissionKey
): NextResponse | null {
    const staff = requireStaff(session);
    if (staff) return staff;

    // Platform admins always have access
    if (session.is_platform_admin) return null;

    // Workspace masters always have access
    if (session.user_role === "master") return null;

    // Members need specific permission
    const member = session.member as Record<string, unknown> | undefined;
    if (member?.[permission]) return null;

    return NextResponse.json(
        { error: "Permissão negada. Contate o administrador da escola." },
        { status: 403 }
    );
}

/**
 * Convenience: require auth + permission in one call.
 */
export async function requireAuthAndPermission(
    permission: PermissionKey
): Promise<
    { session: SessionPayload; error?: never } | { session?: never; error: NextResponse }
> {
    const result = await requireAuth();
    if (result.error) return result;

    const denied = requirePermission(result.session, permission);
    if (denied) return { error: denied };

    return { session: result.session };
}
