import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
    const session = await getSession();
    if (!session?.is_platform_admin) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "schools";

    try {
        const sb = getSupabase();
        let csv = "";
        let filename = "";

        if (type === "schools") {
            const { data: workspaces } = await sb
                .from("workspaces")
                .select("id, name, pin, active, plan, credits_limit, segments, ai_engines, created_at")
                .order("name");

            csv = "Nome,PIN,Ativa,Plano,Limite Créditos,Segmentos,Motores IA,Criado em\n";
            (workspaces || []).forEach((ws: any) => {
                csv += `"${ws.name}","${ws.pin}",${ws.active !== false ? "Sim" : "Não"},"${ws.plan || "basic"}",${ws.credits_limit || "ilimitado"},"${(ws.segments || []).join("; ")}","${(ws.ai_engines || []).join("; ")}","${ws.created_at || ""}"\n`;
            });
            filename = "escolas_omnisfera.csv";

        } else if (type === "users") {
            const { data: workspaces } = await sb.from("workspaces").select("id, name");
            const wsMap: Record<string, string> = {};
            (workspaces || []).forEach((ws: any) => { wsMap[ws.id] = ws.name; });

            const { data: members } = await sb
                .from("workspace_members")
                .select("nome, email, role, workspace_id, active, link_type, created_at")
                .order("nome");

            csv = "Nome,Email,Escola,Papel,Ativo,Tipo Vínculo,Criado em\n";
            (members || []).forEach((m: any) => {
                csv += `"${m.nome || ""}","${m.email || ""}","${wsMap[m.workspace_id] || "—"}","${m.role || "member"}",${m.active !== false ? "Sim" : "Não"},"${m.link_type || "todos"}","${m.created_at || ""}"\n`;
            });
            filename = "usuarios_omnisfera.csv";

        } else if (type === "ia-usage") {
            const { data: workspaces } = await sb.from("workspaces").select("id, name");
            const wsMap: Record<string, string> = {};
            (workspaces || []).forEach((ws: any) => { wsMap[ws.id] = ws.name; });

            const { data: usage } = await sb
                .from("ia_usage")
                .select("workspace_id, engine, tokens_used, event_type, created_at")
                .order("created_at", { ascending: false })
                .limit(5000);

            csv = "Data,Escola,Motor IA,Tokens,Tipo Evento\n";
            (usage || []).forEach((u: any) => {
                csv += `"${u.created_at || ""}","${wsMap[u.workspace_id] || "—"}","${u.engine || ""}",${u.tokens_used || 0},"${u.event_type || ""}"\n`;
            });
            filename = "uso_ia_omnisfera.csv";

        } else {
            return NextResponse.json({ error: "Tipo de exportação inválido." }, { status: 400 });
        }

        // Add BOM for Excel UTF-8 compatibility
        const bom = "\uFEFF";
        return new NextResponse(bom + csv, {
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (err) {
        console.error("Export error:", err);
        return NextResponse.json({ error: "Erro ao exportar dados." }, { status: 500 });
    }
}
