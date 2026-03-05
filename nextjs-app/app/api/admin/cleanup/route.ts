import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

/**
 * POST /api/admin/cleanup
 * Garbage collector: encontra e opcionalmente remove dados órfãos.
 *
 * Body: { dryRun?: boolean }   (default: true = apenas reporta, não apaga)
 *
 * Verifica:
 * 1. pei_disciplinas com student_id que não existe em students
 * 2. avaliacoes_diagnosticas com student_id que não existe
 * 3. planos_ensino sem nenhum vínculo (nem em pei_disciplinas nem em avaliacoes)
 * 4. pei_disciplinas com plano_ensino_id apontando para plano inexistente
 * 5. avaliacoes_diagnosticas com plano_ensino_id apontando para plano inexistente
 *
 * Retorna relatório detalhado.
 */
export async function POST(req: NextRequest) {
    const session = await getSession();

    // Apenas admin da plataforma ou admin do workspace pode rodar
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const isAdmin = !!session.is_platform_admin;
    if (!isAdmin) {
        return NextResponse.json({ error: "Apenas administradores podem executar limpeza" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const dryRun = body.dryRun !== false; // Default: true (simula)

    const sb = getSupabase();
    const workspaceId = session.workspace_id;

    const report: {
        orphaned_pei_disciplinas: number;
        orphaned_avaliacoes: number;
        unlinked_planos: number;
        invalid_plano_refs_pei: number;
        invalid_plano_refs_aval: number;
        cleaned: boolean;
        details: string[];
    } = {
        orphaned_pei_disciplinas: 0,
        orphaned_avaliacoes: 0,
        unlinked_planos: 0,
        invalid_plano_refs_pei: 0,
        invalid_plano_refs_aval: 0,
        cleaned: !dryRun,
        details: [],
    };

    try {
        // 1. pei_disciplinas orphaned (student doesn't exist)
        const { data: allStudentIds } = await sb
            .from("students")
            .select("id")
            .eq("workspace_id", workspaceId);
        const studentIdSet = new Set((allStudentIds || []).map(s => s.id));

        const { data: peiDiscs } = await sb
            .from("pei_disciplinas")
            .select("id, student_id, disciplina")
            .eq("workspace_id", workspaceId);

        const orphanedPei = (peiDiscs || []).filter(d => !studentIdSet.has(d.student_id));
        report.orphaned_pei_disciplinas = orphanedPei.length;
        if (orphanedPei.length > 0) {
            report.details.push(
                `${orphanedPei.length} pei_disciplinas órfãs: ${orphanedPei.map(d => `${d.disciplina} (student: ${d.student_id.substring(0, 8)}...)`).join(", ")}`
            );
            if (!dryRun) {
                const ids = orphanedPei.map(d => d.id);
                await sb.from("pei_disciplinas").delete().in("id", ids);
            }
        }

        // 2. avaliacoes_diagnosticas orphaned
        const { data: avaliacoes } = await sb
            .from("avaliacoes_diagnosticas")
            .select("id, student_id, disciplina")
            .eq("workspace_id", workspaceId);

        const orphanedAval = (avaliacoes || []).filter(a => !studentIdSet.has(a.student_id));
        report.orphaned_avaliacoes = orphanedAval.length;
        if (orphanedAval.length > 0) {
            report.details.push(
                `${orphanedAval.length} avaliacoes_diagnosticas órfãs: ${orphanedAval.map(a => `${a.disciplina} (student: ${a.student_id.substring(0, 8)}...)`).join(", ")}`
            );
            if (!dryRun) {
                const ids = orphanedAval.map(a => a.id);
                await sb.from("avaliacoes_diagnosticas").delete().in("id", ids);
            }
        }

        // 3. planos_ensino without any reference
        const { data: planos } = await sb
            .from("planos_ensino")
            .select("id, disciplina, professor_nome")
            .eq("workspace_id", workspaceId);

        const peiPlanoIds = new Set((peiDiscs || [])
            .map(d => (d as Record<string, unknown>).plano_ensino_id)
            .filter(Boolean) as string[]
        );
        const avalPlanoIds = new Set((avaliacoes || [])
            .map(a => (a as Record<string, unknown>).plano_ensino_id)
            .filter(Boolean) as string[]
        );

        const unlinkedPlanos = (planos || []).filter(
            p => !peiPlanoIds.has(p.id) && !avalPlanoIds.has(p.id)
        );
        report.unlinked_planos = unlinkedPlanos.length;
        if (unlinkedPlanos.length > 0) {
            report.details.push(
                `${unlinkedPlanos.length} planos_ensino sem vínculo: ${unlinkedPlanos.slice(0, 5).map(p => `${p.disciplina} (${p.professor_nome})`).join(", ")}${unlinkedPlanos.length > 5 ? ` +${unlinkedPlanos.length - 5} mais` : ""}`
            );
            // NOTE: Não deletamos planos sem vínculo automaticamente — eles podem ser do módulo Plano de Curso
            // e serem vinculados depois. Apenas reportamos.
        }

        // 4. Invalid plano_ensino_id references in pei_disciplinas
        const { data: peiWithPlano } = await sb
            .from("pei_disciplinas")
            .select("id, plano_ensino_id")
            .eq("workspace_id", workspaceId)
            .not("plano_ensino_id", "is", null);

        const planoIdSet = new Set((planos || []).map(p => p.id));
        const invalidPeiRefs = (peiWithPlano || []).filter(
            d => d.plano_ensino_id && !planoIdSet.has(d.plano_ensino_id)
        );
        report.invalid_plano_refs_pei = invalidPeiRefs.length;
        if (invalidPeiRefs.length > 0) {
            report.details.push(`${invalidPeiRefs.length} pei_disciplinas com plano_ensino_id inválido`);
            if (!dryRun) {
                for (const d of invalidPeiRefs) {
                    await sb.from("pei_disciplinas").update({ plano_ensino_id: null }).eq("id", d.id);
                }
            }
        }

        // 5. Invalid plano_ensino_id references in avaliacoes
        const { data: avalWithPlano } = await sb
            .from("avaliacoes_diagnosticas")
            .select("id, plano_ensino_id")
            .eq("workspace_id", workspaceId)
            .not("plano_ensino_id", "is", null);

        const invalidAvalRefs = (avalWithPlano || []).filter(
            a => a.plano_ensino_id && !planoIdSet.has(a.plano_ensino_id)
        );
        report.invalid_plano_refs_aval = invalidAvalRefs.length;
        if (invalidAvalRefs.length > 0) {
            report.details.push(`${invalidAvalRefs.length} avaliacoes com plano_ensino_id inválido`);
            if (!dryRun) {
                for (const a of invalidAvalRefs) {
                    await sb.from("avaliacoes_diagnosticas").update({ plano_ensino_id: null }).eq("id", a.id);
                }
            }
        }

        // Summary
        const totalOrphans = report.orphaned_pei_disciplinas + report.orphaned_avaliacoes +
            report.invalid_plano_refs_pei + report.invalid_plano_refs_aval;

        if (totalOrphans === 0 && report.unlinked_planos === 0) {
            report.details.push("✅ Nenhum dado órfão encontrado. Sistema limpo.");
        } else if (dryRun) {
            report.details.push(`⚠️ DRY RUN: ${totalOrphans} itens órfãos encontrados. Execute com dryRun: false para limpar.`);
        } else {
            report.details.push(`🧹 ${totalOrphans} itens órfãos limpos.`);
        }

        return NextResponse.json({ ok: true, report });
    } catch (err) {
        console.error("[admin/cleanup] Error:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Erro interno" },
            { status: 500 }
        );
    }
}
