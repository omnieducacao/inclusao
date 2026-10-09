import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { listStudentsDaSessao } from "@/lib/students";
import { logger } from "@/lib/logger";

/**
 * GET /api/search?q=texto
 * Busca estudantes (só os do vínculo de quem busca) e, para coordenação, membros da escola.
 *
 * Onda 1: a busca usava a tabela "members", que não existe, e procurava o diagnóstico no texto
 * criptografado. Agora filtra em memória sobre a lista já descriptografada e limitada ao vínculo.
 */
function normalizar(t: string): string {
    return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.workspace_id) {
            return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        }

        const q = req.nextUrl.searchParams.get("q")?.trim();
        if (!q || q.length < 2) {
            return NextResponse.json({ students: [], members: [] });
        }
        const termo = normalizar(q);

        const estudantes = await listStudentsDaSessao(session);
        const porNome = estudantes.filter((s) => normalizar(s.name || "").includes(termo));
        const idsNome = new Set(porNome.map((s) => s.id));
        const porDiagnostico = estudantes.filter((s) => {
            if (idsNome.has(s.id)) return false;
            const diag = String((s.pei_data as Record<string, unknown> | undefined)?.diagnostico || s.diagnosis || "");
            return normalizar(diag).includes(termo);
        });
        const students = [...porNome.slice(0, 10), ...porDiagnostico.slice(0, 5)].slice(0, 10).map((s) => ({
            id: s.id,
            name: s.name,
            subtitle: [s.grade, s.class_group].filter(Boolean).join(" — "),
            diagnosis: String((s.pei_data as Record<string, unknown> | undefined)?.diagnostico || ""),
            type: "student" as const,
        }));

        // Membros: só coordenação, direção e admin
        let members: { id: string; name: string; subtitle: string; role: string; type: "member" }[] = [];
        const papel = String((session.member as Record<string, unknown> | undefined)?.papel || "");
        const podeVerEquipe =
            session.user_role === "master" || session.is_platform_admin || papel === "coordenacao" || papel === "direcao";
        if (podeVerEquipe) {
            const { data } = await getSupabase()
                .from("workspace_members")
                .select("id, nome, email, papel")
                .eq("workspace_id", session.workspace_id)
                .limit(500);
            members = ((data || []) as { id: string; nome: string; email: string; papel: string }[])
                .filter((m) => normalizar(`${m.nome} ${m.email}`).includes(termo))
                .slice(0, 10)
                .map((m) => ({ id: m.id, name: m.nome, subtitle: m.email, role: m.papel, type: "member" as const }));
        }

        return NextResponse.json({ students, members });
    } catch (err) {
        logger.error({ err }, "GET /api/search");
        return NextResponse.json({ error: "Erro na busca" }, { status: 500 });
    }
}
