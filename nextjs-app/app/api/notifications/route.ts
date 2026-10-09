import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { vinculoDaSessao, filtrarPorVinculo } from "@/lib/turmas";
import { NextResponse } from "next/server";
import { getSession, memberIdDaSessao } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";

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
        const userIdentifier =
            session.user_role === "family" && session.family_responsible_id
                ? `family_${session.family_responsible_id}`
                : session.usuario_nome;
        const notifications: { id: string; type: string; title: string; description: string; severity: "info" | "warning" | "alert"; studentId?: string; studentName?: string }[] = [];

        if (!userIdentifier) {
            return NextResponse.json({ notifications: [], total: 0 });
        }

        // 1–3. Alertas por estudante. Onda 1: uma consulta só (antes eram dezenas), limitada ao
        // vínculo de quem pede, e nunca para a família (ela via nomes de outros estudantes).
        type Linha = {
            id: string; name: string; grade: string | null; class_group: string | null; class_id: string | null;
            planejamento_ativo: string | null; pei_data: Record<string, unknown> | null;
            updated_at: string | null; daily_logs: Array<{ data_sessao?: string }> | null;
        };
        let students: Linha[] = [];
        if (session.user_role !== "family") {
            const { data } = await sb
                .from("students")
                .select("id, name, grade, class_group, class_id, planejamento_ativo, pei_data, updated_at, daily_logs")
                .eq("workspace_id", workspaceId);
            students = filtrarPorVinculo(await vinculoDaSessao(session), (data || []) as Linha[]);
        }

        const hoje = Date.now();
        const dias = (iso: string) => Math.floor((hoje - new Date(iso).getTime()) / 86_400_000);

        // 1. Diário sem registros há mais de 14 dias (só quem já tinha registros)
        for (const st of students.slice(0, 40)) {
            const datas = (st.daily_logs || []).map((r) => r?.data_sessao).filter(Boolean) as string[];
            if (datas.length === 0) continue;
            const ultima = datas.sort().at(-1)!;
            if (dias(ultima) > 14) {
                notifications.push({
                    id: `diario-${st.id}`,
                    type: "diario",
                    title: "Diário sem registros recentes",
                    description: `${st.name} não tem registros no Diário há mais de 14 dias.`,
                    severity: "warning",
                    studentId: st.id,
                    studentName: st.name,
                });
            }
        }

        // 2. PAEE ativo com PEI em rascunho ou sem revisão há 60 dias
        for (const st of students.filter((x) => x.planejamento_ativo).slice(0, 10)) {
            const statusPei = (st.pei_data || {}).status_validacao_pei as string | undefined;
            const peiRascunho = statusPei === "rascunho" || !statusPei;
            const peiDesatualizado = st.updated_at ? dias(st.updated_at) > 60 : false;
            if (peiRascunho || peiDesatualizado) {
                notifications.push({
                    id: `paee-pei-${st.id}`,
                    type: "paee",
                    title: "PAEE ativo sem PEI atualizado",
                    description: `${st.name} tem PAEE ativo. ${peiRascunho ? "PEI em rascunho." : "PEI não revisado há mais de 60 dias."}`,
                    severity: "warning",
                    studentId: st.id,
                    studentName: st.name,
                });
            }
        }

        // 3. PEI sem revisão há mais de 60 dias
        for (const st of students.slice(0, 40)) {
            if (!st.pei_data || !st.updated_at) continue;
            const d = dias(st.updated_at);
            if (d > 60) {
                notifications.push({
                    id: `pei-${st.id}`,
                    type: "pei",
                    title: "PEI sem revisão",
                    description: `PEI de ${st.name} não é atualizado há ${d} dias.`,
                    severity: d > 90 ? "alert" : "info",
                    studentId: st.id,
                    studentName: st.name,
                });
            }
        }

        // 3b. Onda 2: revisão do PEI atrasada (coordenação) e PEI aguardando ciência (professor)
        const hojeStr = new Date().toISOString().slice(0, 10);
        const vigentes = students.filter((st) => {
            const v = (st.pei_data || {}).vigencia as { status?: string } | undefined;
            return v?.status === "vigente";
        });
        if (session.user_role === "master" || session.is_platform_admin || ["coordenacao", "direcao"].includes(String((session.member as Record<string, unknown> | undefined)?.papel || ""))) {
            for (const st of vigentes) {
                const v = (st.pei_data || {}).vigencia as { proxima_revisao?: string };
                if (v.proxima_revisao && v.proxima_revisao < hojeStr) {
                    notifications.push({
                        id: `pei-revisao-${st.id}`,
                        type: "pei",
                        title: "Revisão do PEI atrasada",
                        description: `A revisão do PEI de ${st.name} estava marcada para ${new Date(`${v.proxima_revisao}T12:00:00`).toLocaleDateString("pt-BR")}.`,
                        severity: "alert",
                        studentId: st.id,
                        studentName: st.name,
                    });
                }
            }
        }
        const meuId = memberIdDaSessao(session);
        if (session.user_role === "member" && meuId && vigentes.length > 0) {
            const { data: lidas } = await sb
                .from("pei_ciencias")
                .select("student_id, versao")
                .eq("workspace_id", workspaceId)
                .eq("member_id", meuId);
            const ok = new Set((lidas || []).map((c: { student_id: string; versao: number }) => `${c.student_id}:${c.versao}`));
            for (const st of vigentes) {
                const v = (st.pei_data || {}).vigencia as { versao?: number };
                if (!ok.has(`${st.id}:${v.versao}`)) {
                    notifications.push({
                        id: `pei-ciencia-${st.id}-${v.versao}`,
                        type: "pei",
                        title: "PEI aguardando sua leitura",
                        description: `O PEI de ${st.name} (versão ${v.versao}) está vigente. Leia e registre ciência em PEI - Professor.`,
                        severity: "info",
                        studentId: st.id,
                        studentName: st.name,
                    });
                }
            }
        }

        // 4. Announcements (já visualizados como modal, então aparecem aqui como notificações)
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
                    .eq("user_email", userIdentifier);

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
                logger.error({ err: err }, "Error parsing announcements:");
            }
        }

        return NextResponse.json({
            notifications: notifications.slice(0, 15),
            total: notifications.length,
        });
    } catch (err) {
        logger.error({ err: err }, "Notifications error:");
        return NextResponse.json({ error: "Erro ao carregar notificações" }, { status: 500 });
    }
}
