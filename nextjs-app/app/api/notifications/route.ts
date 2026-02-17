import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

/**
 * GET /api/notifications
 * Returns smart notifications computed on-demand:
 * - Students without Diário entries in X days
 * - PAEE cycles expiring soon
 * - PEI not reviewed in X months
 * - Active announcements (as notifications, not modal)
 */
export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        }
        // Admin da plataforma não tem workspace — retornar lista vazia em vez de 401
        if (session.is_platform_admin || !session.workspace_id) {
            return NextResponse.json({ notifications: [], total: 0 });
        }

        const sb = getSupabase();
        const workspaceId = session.workspace_id;
        const userEmail = session.usuario_nome;
        const notifications: { id: string; type: string; title: string; description: string; severity: "info" | "warning" | "alert"; studentId?: string; studentName?: string }[] = [];

        // If no user email, return empty (shouldn't happen for logged-in user)
        if (!userEmail) {
            return NextResponse.json({ notifications: [], total: 0 });
        }

        // 1. Students without recent Diário entries (> 14 days)
        const { data: students } = await sb
            .from("students")
            .select("id, name")
            .eq("workspace_id", workspaceId);

        if (students && students.length > 0) {
            const twoWeeksAgo = new Date();
            twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
            const cutoff = twoWeeksAgo.toISOString().split("T")[0];

            for (const student of students.slice(0, 20)) {
                const { count } = await sb
                    .from("diario_registros")
                    .select("id", { count: "exact", head: true })
                    .eq("student_id", student.id)
                    .gte("data_sessao", cutoff);

                if (count === 0) {
                    // Check if student has any diário entries at all
                    const { count: totalCount } = await sb
                        .from("diario_registros")
                        .select("id", { count: "exact", head: true })
                        .eq("student_id", student.id);

                    if ((totalCount || 0) > 0) {
                        notifications.push({
                            id: `diario-${student.id}`,
                            type: "diario",
                            title: "Diário sem registros recentes",
                            description: `${student.name} não tem registros no Diário há mais de 14 dias.`,
                            severity: "warning",
                            studentId: student.id,
                            studentName: student.name,
                        });
                    }
                }
            }
        }

        // 2. PEI not updated recently (> 60 days)
        if (students) {
            const twoMonthsAgo = new Date();
            twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60);

            for (const student of students.slice(0, 20)) {
                const { data: peiRow } = await sb
                    .from("students")
                    .select("updated_at, pei_data")
                    .eq("id", student.id)
                    .single();

                if (peiRow?.pei_data && peiRow.updated_at) {
                    const updatedAt = new Date(peiRow.updated_at);
                    if (updatedAt < twoMonthsAgo) {
                        const daysSince = Math.floor((Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
                        notifications.push({
                            id: `pei-${student.id}`,
                            type: "pei",
                            title: "PEI sem revisão",
                            description: `PEI de ${student.name} não é atualizado há ${daysSince} dias.`,
                            severity: daysSince > 90 ? "alert" : "info",
                            studentId: student.id,
                            studentName: student.name,
                        });
                    }
                }
            }
        }

        // 3. Announcements (já visualizados como modal, então aparecem aqui como notificações)
        const { data: configData } = await sb
            .from("platform_config")
            .select("value")
            .eq("key", "announcements")
            .maybeSingle();

        if (configData?.value) {
            try {
                const announcements = JSON.parse(configData.value);
                const now = new Date().toISOString();

                // Get already viewed announcements
                const { data: viewedData } = await sb
                    .from("announcement_views")
                    .select("announcement_id, shown_as_modal, dismissed")
                    .eq("workspace_id", workspaceId)
                    .eq("user_email", userEmail);

                const viewedMap = new Map<string, { shown_as_modal: boolean; dismissed: boolean }>();
                viewedData?.forEach((v) => {
                    viewedMap.set(v.announcement_id, {
                        shown_as_modal: v.shown_as_modal,
                        dismissed: v.dismissed || false
                    });
                });

                for (const ann of announcements) {
                    const viewInfo = viewedMap.get(ann.id);
                    // Only show as notification if:
                    // - Active
                    // - Not expired
                    // - Target matches (all or workspace)
                    // - Already viewed as modal (so now show in notifications)
                    // - NOT dismissed
                    if (
                        ann.active &&
                        (ann.target === "all" || ann.target === workspaceId) &&
                        (!ann.expires_at || ann.expires_at > now) &&
                        viewInfo?.shown_as_modal === true &&
                        viewInfo?.dismissed !== true
                    ) {
                        const severityMap: Record<string, "info" | "warning" | "alert"> = {
                            info: "info",
                            warning: "warning",
                            alert: "alert",
                        };
                        notifications.push({
                            id: `announcement-${ann.id}`,
                            type: "announcement",
                            title: ann.title,
                            description: ann.message,
                            severity: severityMap[ann.type] || "info",
                        });
                    }
                }
            } catch (err) {
                console.error("Error parsing announcements:", err);
            }
        }

        return NextResponse.json({
            notifications: notifications.slice(0, 15),
            total: notifications.length,
        });
    } catch (err) {
        console.error("Notifications error:", err);
        return NextResponse.json({ error: "Erro ao carregar notificações" }, { status: 500 });
    }
}
