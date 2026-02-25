import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { chatCompletionText } from "@/lib/ai-engines";
import {
    buildContextoAluno,
    buildPromptCompleto,
    templateEstrategiasPraticas,
} from "@/lib/omnisfera-prompts";

export async function POST(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const {
        nome,
        diagnostico,
        serie,
        dimensoes_com_dificuldade,
        engine = "red",
    } = body;

    if (!nome || !diagnostico || !dimensoes_com_dificuldade?.length) {
        return NextResponse.json({
            error: "Campos obrigatórios: nome, diagnostico, dimensoes_com_dificuldade",
        }, { status: 400 });
    }

    // LGPD: only first name
    const nomeAnon = nome.split(" ")[0];

    // Build 3-layer prompt
    const camada2 = buildContextoAluno({
        nome: nomeAnon,
        serie: serie || "",
        diagnostico,
    });

    const camada3 = templateEstrategiasPraticas({
        nome: nomeAnon,
        diagnostico,
        dimensoes_com_dificuldade,
    });

    const { system, user } = buildPromptCompleto(camada2, camada3);

    try {
        const messages = [
            { role: "system" as const, content: system },
            { role: "user" as const, content: user },
        ];

        const aiResponse = await chatCompletionText(engine, messages, {
            temperature: 0.5,
            source: "avaliacao-diagnostica-estrategias-praticas",
        });

        // Parse JSON
        let result: unknown = null;
        try {
            let clean = aiResponse;
            const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) clean = jsonMatch[1];

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
            estrategias: result,
            tipo: "estrategias_praticas",
        });
    } catch (err: unknown) {
        console.error("Erro ao gerar estratégias práticas:", err);
        return NextResponse.json({
            error: "Erro ao gerar estratégias",
            detail: err instanceof Error ? err.message : String(err),
        }, { status: 500 });
    }
}
