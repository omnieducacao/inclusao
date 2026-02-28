import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { chatCompletionText, getEngineErrorWithWorkspace, type EngineId } from "@/lib/ai-engines";
import {
    buildContextoAluno,
    buildPromptCompleto,
    templatePerfilFuncionamento,
} from "@/lib/omnisfera-prompts";

export async function POST(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const {
        nome,
        serie,
        diagnostico,
        dimensoes_avaliadas,
        habilidades_curriculares,
        engine = "red",
    } = body;

    if (!nome || !serie || !diagnostico) {
        return NextResponse.json({ error: "Campos obrigatórios: nome, serie, diagnostico" }, { status: 400 });
    }

    // Fallback: se nenhum dado, usar dimensão geral com nível inferido do diagnóstico
    let dims = dimensoes_avaliadas || [];
    const habs = habilidades_curriculares || [];
    if (dims.length === 0 && habs.length === 0) {
        dims = [{ dimensao: "Geral", nivel_observado: 2, observacao: "Avaliação inicial — use os dados da diagnóstica para inferir o perfil." }];
    }

    // LGPD: only first name
    const nomePrimeiro = nome.split(" ")[0];

    // Build 3-layer prompt
    const camada2 = buildContextoAluno({
        nome: nomePrimeiro,
        serie,
        diagnostico,
    });

    const camada3 = templatePerfilFuncionamento({
        nome: nomePrimeiro,
        serie,
        diagnostico,
        dimensoes_avaliadas: dims,
        habilidades_curriculares: habs,
    });

    const { system, user } = buildPromptCompleto(camada2, camada3);

    const wsId = session?.simulating_workspace_id || session?.workspace_id;
    const engineErr = await getEngineErrorWithWorkspace(engine as EngineId, wsId);
    if (engineErr) {
        return NextResponse.json({ error: engineErr }, { status: 500 });
    }

    try {
        const messages = [
            { role: "system" as const, content: system },
            { role: "user" as const, content: user },
        ];

        const aiResponse = await chatCompletionText(engine, messages, {
            temperature: 0.4,
            source: "avaliacao-diagnostica-perfil-funcionamento",
        });

        // Parse JSON from response
        let result: unknown = null;
        try {
            let clean = aiResponse;
            const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) clean = jsonMatch[1];

            // Find JSON object
            const objStart = clean.indexOf("{");
            const objEnd = clean.lastIndexOf("}");
            if (objStart >= 0 && objEnd > objStart) {
                clean = clean.slice(objStart, objEnd + 1);
            }
            result = JSON.parse(clean);
        } catch {
            result = { raw: aiResponse };
        }

        return NextResponse.json({
            perfil: result,
            tipo: "perfil_funcionamento",
        });
    } catch (err: unknown) {
        console.error("Erro ao gerar perfil de funcionamento:", err);
        return NextResponse.json({
            error: "Erro ao gerar perfil",
            detail: err instanceof Error ? err.message : String(err),
        }, { status: 500 });
    }
}
