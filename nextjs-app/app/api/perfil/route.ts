import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

/**
 * GET /api/perfil
 * Retorna dados do membro logado: info pessoal, vínculos, permissões.
 *
 * PATCH /api/perfil
 * Altera a senha do próprio usuário.
 * Body: { senha_atual, nova_senha }
 */

export async function GET() {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const sb = getSupabase();
    const isMaster = session.user_role === "master";

    // Resolver member_id
    let memberId = (session.member as Record<string, unknown> | undefined)?.id as string | undefined;
    if (!memberId) {
        const { data: m } = await sb
            .from("workspace_members")
            .select("id")
            .eq("workspace_id", session.workspace_id)
            .eq("nome", session.usuario_nome)
            .maybeSingle();
        memberId = m?.id || undefined;
    }

    // Base profile data
    const profile: Record<string, unknown> = {
        nome: session.usuario_nome,
        workspace_name: session.workspace_name,
        user_role: session.user_role,
        is_master: isMaster,
        member_id: memberId,
    };

    // If member exists, get full data
    if (memberId) {
        const { data: member } = await sb
            .from("workspace_members")
            .select("id, nome, email, telefone, cargo, can_estudantes, can_pei, can_pei_professor, can_paee, can_hub, can_diario, can_avaliacao, can_gestao, link_type, active")
            .eq("id", memberId)
            .single();

        if (member) {
            profile.email = member.email;
            profile.telefone = member.telefone;
            profile.cargo = member.cargo;
            profile.link_type = member.link_type;
            profile.permissoes = {
                can_estudantes: member.can_estudantes,
                can_pei: member.can_pei,
                can_pei_professor: member.can_pei_professor,
                can_paee: member.can_paee,
                can_hub: member.can_hub,
                can_diario: member.can_diario,
                can_avaliacao: member.can_avaliacao,
                can_gestao: member.can_gestao,
            };
        }

        // Buscar teacher_assignments com join
        const { data: assignments } = await sb
            .from("teacher_assignments")
            .select("class_id, component_id")
            .eq("workspace_member_id", memberId);

        if (assignments?.length) {
            const classIds = [...new Set(assignments.map(a => a.class_id))];
            const componentIds = [...new Set(assignments.map(a => a.component_id).filter(Boolean))];

            const { data: classes } = await sb
                .from("classes")
                .select("id, grade_id, class_group")
                .in("id", classIds);

            const gradeIds = [...new Set((classes || []).map(c => c.grade_id).filter(Boolean))];
            const { data: grades } = gradeIds.length > 0
                ? await sb.from("grades").select("id, code, label").in("id", gradeIds)
                : { data: [] };

            const { data: components } = componentIds.length > 0
                ? await sb.from("components").select("id, label").in("id", componentIds)
                : { data: [] };

            const gradeMap = new Map((grades || []).map(g => [g.id, g]));
            const componentMap = new Map((components || []).map(c => [c.id, c.label]));
            const classMap = new Map((classes || []).map(c => [c.id, c]));

            const vinculos = assignments.map(a => {
                const cls = classMap.get(a.class_id);
                const grade = cls ? gradeMap.get(cls.grade_id) : null;
                const labelParts = (grade?.label || "").split(":");
                const serieLabel = labelParts.length > 1 ? labelParts[1].trim() : grade?.label || grade?.code || "";
                return {
                    componente: componentMap.get(a.component_id) || "Geral",
                    serie: serieLabel,
                    serieCode: grade?.code || "",
                    turma: cls?.class_group || "",
                };
            });

            profile.vinculos = vinculos;
        } else {
            profile.vinculos = [];
        }

        // Buscar student links (para tutores)
        const { data: studentLinks } = await sb
            .from("teacher_student_links")
            .select("student_id")
            .eq("workspace_member_id", memberId);

        if (studentLinks?.length) {
            const studentIds = studentLinks.map(s => s.student_id);
            const { data: students } = await sb
                .from("students")
                .select("id, name, grade, class_group")
                .in("id", studentIds);
            profile.alunos_vinculados = students || [];
        }
    } else if (isMaster) {
        // Master sem workspace_members row — dados do workspace_masters
        const { data: master } = await sb
            .from("workspace_masters")
            .select("email, telefone, cargo")
            .eq("workspace_id", session.workspace_id)
            .maybeSingle();

        if (master) {
            profile.email = master.email;
            profile.telefone = master.telefone;
            profile.cargo = master.cargo;
        }
        profile.permissoes = {
            can_estudantes: true,
            can_pei: true,
            can_pei_professor: true,
            can_paee: true,
            can_hub: true,
            can_diario: true,
            can_avaliacao: true,
            can_gestao: true,
        };
        profile.vinculos = [];
    }

    return NextResponse.json(profile);
}

export async function PATCH(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { senha_atual, nova_senha } = body as { senha_atual: string; nova_senha: string };

    if (!senha_atual || !nova_senha) {
        return NextResponse.json({ error: "Senha atual e nova senha são obrigatórias." }, { status: 400 });
    }
    if (nova_senha.length < 4) {
        return NextResponse.json({ error: "Nova senha deve ter no mínimo 4 caracteres." }, { status: 400 });
    }

    const sb = getSupabase();
    const isMaster = session.user_role === "master";

    if (isMaster) {
        // Master: atualizar workspace_masters
        const { data: master } = await sb
            .from("workspace_masters")
            .select("password_hash")
            .eq("workspace_id", session.workspace_id)
            .maybeSingle();

        if (!master?.password_hash || !bcrypt.compareSync(senha_atual, master.password_hash)) {
            return NextResponse.json({ error: "Senha atual incorreta." }, { status: 403 });
        }

        const newHash = bcrypt.hashSync(nova_senha, 10);
        const { error } = await sb
            .from("workspace_masters")
            .update({ password_hash: newHash })
            .eq("workspace_id", session.workspace_id);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ ok: true });
    }

    // Member: atualizar workspace_members
    let memberId = (session.member as Record<string, unknown> | undefined)?.id as string | undefined;
    if (!memberId) {
        const { data: m } = await sb
            .from("workspace_members")
            .select("id")
            .eq("workspace_id", session.workspace_id)
            .eq("nome", session.usuario_nome)
            .maybeSingle();
        memberId = m?.id || undefined;
    }

    if (!memberId) {
        return NextResponse.json({ error: "Membro não encontrado." }, { status: 404 });
    }

    const { data: member } = await sb
        .from("workspace_members")
        .select("password_hash")
        .eq("id", memberId)
        .single();

    if (!member?.password_hash || !bcrypt.compareSync(senha_atual, member.password_hash)) {
        return NextResponse.json({ error: "Senha atual incorreta." }, { status: 403 });
    }

    const newHash = bcrypt.hashSync(nova_senha, 10);
    const { error } = await sb
        .from("workspace_members")
        .update({ password_hash: newHash, updated_at: new Date().toISOString() })
        .eq("id", memberId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
