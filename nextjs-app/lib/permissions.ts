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
    | "can_monitoramento"
    | "can_pgi"
    | "can_estudantes"
    | "can_config"
    | "can_gestao";

/**
 * Get the current session or return a 401 response.
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
