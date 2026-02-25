import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { chatCompletionText } from "@/lib/ai-engines";
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

    if (!dimensoes_avaliadas?.length && !habilidades_curriculares?.length) {
        return NextResponse.json({
            error: "Forneça dimensoes_avaliadas ou habilidades_curriculares",
        }, { status: 400 });
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
        dimensoes_avaliadas: dimensoes_avaliadas || [],
        habilidades_curriculares: habilidades_curriculares || [],
    });

    const { system, user } = buildPromptCompleto(camada2, camada3);

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
