import { getSupabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";

type AuditAction = "view" | "create" | "update" | "delete" | "export" | "login" | "logout";

interface AuditParams {
    workspaceId?: string | null;
    actorName?: string;
    actorRole?: string;
    action: AuditAction;
    resourceType: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
}

/**
 * Log an action to the audit_log table (LGPD Art. 37).
 * 
 * Usage:
 * ```ts
 * await logAction({
 *   workspaceId: session.workspace_id,
 *   actorName: session.usuario_nome,
 *   actorRole: session.user_role,
 *   action: "view",
 *   resourceType: "student",
 *   resourceId: studentId,
 * });
 * ```
 * 
 * This function never throws — errors are silently logged to the console.
 * Audit logging should never break the main flow.
 */
export async function logAction(params: AuditParams): Promise<void> {
    try {
        const supabase = getSupabase();
        await supabase.from("audit_log").insert({
            workspace_id: params.workspaceId || null,
            actor_id: params.actorName || null,
            actor_role: params.actorRole || null,
            action: params.action,
            resource_type: params.resourceType,
            resource_id: params.resourceId || null,
            metadata: params.metadata || {},
            ip_address: params.ipAddress || null,
        });
    } catch (err) {
        // Audit should never break the main flow
        logger.error({ err }, "[audit] Failed to log action");
    }
}

/**
 * Log a data export event (LGPD portability).
 */
export async function logExport(params: {
    workspaceId: string | null;
    actorName: string;
    actorRole: string;
    resourceType: string;
    resourceId: string;
    format?: string;
}): Promise<void> {
    return logAction({
        ...params,
        action: "export",
        metadata: { format: params.format || "json" },
    });
}

/**
 * Log a student data access event.
 */
export async function logStudentAccess(params: {
    workspaceId: string | null;
    actorName: string;
    actorRole: string;
    studentId: string;
    module: string;
}): Promise<void> {
    return logAction({
        ...params,
        action: "view",
        resourceType: "student",
        resourceId: params.studentId,
        metadata: { module: params.module },
    });
}
