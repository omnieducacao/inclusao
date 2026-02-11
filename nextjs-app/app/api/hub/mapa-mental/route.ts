import { parseBody, hubMapaMentalSchema } from "@/lib/validation";
import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { chatCompletionText, type EngineId } from "@/lib/ai-engines";
import { gerarPromptMapaMentalImagem, gerarPromptMapaMentalHtml } from "@/lib/hub-prompts";
import { requireAuth } from "@/lib/permissions";

export async function POST(req: Request) {
  const rl = rateLimitResponse(req, RATE_LIMITS.AI_GENERATION); if (rl) return rl;
  const { error: authError } = await requireAuth(); if (authError) return authError;
    const parsed = await parseBody(req, hubMapaMentalSchema);
    if (parsed.error) return parsed.error;
    const body = parsed.data;

    const { tipo, materia, assunto, plano_texto, estudante, unidade_tematica, objeto_conhecimento } = body;

    if (!plano_texto?.trim()) {
        return NextResponse.json({ error: "Texto do plano é obrigatório." }, { status: 400 });
    }

    const params = {
        materia: materia || "Geral",
        assunto: assunto || "Geral",
        planoTexto: plano_texto,
        estudante,
        unidade_tematica,
        objeto_conhecimento,
    };

    // TIPO: IMAGEM (Gemini)
    if (tipo === "imagem") {
        const geminiKey = process.env.GEMINI_API_KEY || "";
        if (!geminiKey || geminiKey.trim().length < 20) {
            return NextResponse.json(
                { error: "GEMINI_API_KEY não configurada. Necessária para gerar imagem do mapa mental." },
                { status: 500 }
            );
        }

        const prompt = gerarPromptMapaMentalImagem(params);

        try {
            const models = ["gemini-2.5-flash-image", "gemini-3-pro-image-preview"];
            let lastError: Error | null = null;

            for (const modelId of models) {
                try {
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${geminiKey}`;
                    const response = await fetch(url, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                        }),
                    });

                    if (!response.ok) {
                        if (response.status === 404) continue;
                        const errorText = await response.text();
                        throw new Error(`API retornou ${response.status}: ${errorText}`);
                    }

                    const data = await response.json();
                    const candidates = data.candidates || [];
                    if (candidates.length > 0) {
                        const parts = candidates[0]?.content?.parts || [];
                        for (const part of parts) {
                            if (part.inlineData) {
                                return NextResponse.json({ image: `data:image/png;base64,${part.inlineData.data}` });
                            }
                        }
                    }
                } catch (err: any) {
                    const errStr = String(err).toLowerCase();
                    if (errStr.includes("404") || errStr.includes("not found")) {
                        lastError = err;
                        continue;
                    }
                    throw err;
                }
            }

            if (lastError) throw lastError;
            return NextResponse.json({ error: "Nenhum modelo Gemini disponível para geração de imagens." }, { status: 500 });
        } catch (err) {
            console.error("Mapa mental imagem:", err);
            return NextResponse.json(
                { error: err instanceof Error ? err.message : "Erro ao gerar mapa mental (imagem)." },
                { status: 500 }
            );
        }
    }

    // TIPO: HTML (Kimi / blue engine)
    if (tipo === "html") {
        const prompt = gerarPromptMapaMentalHtml(params);

        // Tentar blue (Kimi) primeiro, fallback para green (Claude), depois yellow (Gemini)
        const engines: EngineId[] = ["blue", "green", "yellow"];
        let lastError: Error | null = null;

        for (const engine of engines) {
            try {
                const html = await chatCompletionText(engine, [{ role: "user", content: prompt }], { temperature: 0.5 });

                // Extrair apenas o HTML (pode ter texto antes/depois)
                const htmlMatch = html.match(/<!DOCTYPE html>[\s\S]*<\/html>/i);
                const cleanHtml = htmlMatch ? htmlMatch[0] : html;

                if (cleanHtml.includes("<html") && cleanHtml.includes("</html>")) {
                    return NextResponse.json({ html: cleanHtml });
                }

                // Se não tem HTML válido, tentar próximo engine
                lastError = new Error("Resposta não contém HTML válido.");
                continue;
            } catch (err: any) {
                lastError = err instanceof Error ? err : new Error(String(err));
                console.warn(`Mapa mental HTML (${engine}):`, err);
                continue;
            }
        }

        return NextResponse.json(
            { error: lastError?.message || "Nenhuma engine disponível para gerar o mapa mental HTML." },
            { status: 500 }
        );
    }

    return NextResponse.json({ error: "Tipo inválido. Use 'imagem' ou 'html'." }, { status: 400 });
}
