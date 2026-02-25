import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

/**
 * POST /api/pei/plano-ensino/sugestao-ia
 * Gera sugestões de objetivos, metodologia, recursos e avaliação
 * baseado nas habilidades BNCC selecionadas.
 */
export async function POST(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const {
        habilidades = [],
        descricoes = {},
        componente = "",
        unidade = "",
        objeto = "",
        serie = "",
    } = body as {
        habilidades: string[];
        descricoes: Record<string, string>;
        componente: string;
        unidade: string;
        objeto: string;
        serie: string;
    };

    if (habilidades.length === 0) {
        return NextResponse.json({ error: "Selecione ao menos uma habilidade" }, { status: 400 });
    }

    // Build context string
    const habsTexto = habilidades.map(h => `${h}: ${descricoes[h] || ""}`).join("\n");

    const prompt = `Você é um especialista em educação inclusiva brasileira. Com base nas habilidades BNCC abaixo, sugira:
1. Objetivos de aprendizagem (verbos da Taxonomia de Bloom, 3-5 objetivos concretos)
2. Metodologias adequadas (da lista: Aula Expositiva Dialogada, Metodologia Ativa, ABP, Ensino Híbrido, Sala de Aula Invertida, Rotação por Estações, Gamificação, PBL, Peer Instruction, Estudo de Caso, Aprendizagem Cooperativa, Trabalho em Grupo)
3. Recursos didáticos (da lista: Livro Didático, Quadro/Giz, Projetor/Datashow, Lousa Digital, Tablets/Celulares, Internet, Material Maker, Jogos Pedagógicos, Laboratório, Material Dourado, Fichas, Vídeos Educativos, Mapas/Gráficos, Material Concreto, Material Adaptado, CAA, Música/Áudio, Biblioteca)
4. Formas de avaliação (da lista: Observação Direta, Registro Escrito, Portfólio, Autoavaliação, Avaliação por Pares, Prova Escrita, Trabalho em Grupo, Apresentação Oral, Produção Textual, Projeto, Participação em Aula, Exercícios Práticos, Roda de Conversa)

Contexto:
- Série: ${serie}
- Componente Curricular: ${componente}
- Unidade Temática: ${unidade}
- Objeto do Conhecimento: ${objeto}
- Habilidades BNCC:
${habsTexto}

Responda APENAS em formato JSON válido, sem markdown:
{
  "objetivos": ["verbo + objetivo 1", "verbo + objetivo 2", ...],
  "objetivos_texto": "Texto descritivo dos objetivos",
  "metodologias": ["Metodologia 1", "Metodologia 2"],
  "recursos": ["Recurso 1", "Recurso 2"],
  "avaliacoes": ["Avaliação 1", "Avaliação 2"]
}`;

    try {
        // Use DeepSeek (OmniRed) as default
        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            // Fallback local: return generic suggestions based on simple heuristics
            return NextResponse.json({
                sugestao: {
                    objetivos: ["Identificar", "Comparar", "Analisar", "Aplicar"],
                    objetivos_texto: "",
                    metodologias: ["Aula Expositiva Dialogada", "Metodologia Ativa"],
                    recursos: ["Livro Didático", "Quadro/Giz", "Projetor/Datashow"],
                    avaliacoes: ["Observação Direta", "Registro Escrito"],
                },
            });
        }

        const res = await fetch("https://api.deepseek.com/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "Você é um assistente pedagógico. Responda apenas em JSON válido." },
                    { role: "user", content: prompt },
                ],
                temperature: 0.7,
                max_tokens: 800,
            }),
        });

        const data = await res.json();
        const content = data.choices?.[0]?.message?.content || "";

        // Parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const sugestao = JSON.parse(jsonMatch[0]);
            return NextResponse.json({ sugestao });
        }

        return NextResponse.json({ error: "Resposta inválida da IA" }, { status: 500 });
    } catch (err) {
        console.error("Sugestão IA error:", err);
        return NextResponse.json({
            sugestao: {
                objetivos: ["Identificar", "Comparar", "Analisar"],
                objetivos_texto: "",
                metodologias: ["Aula Expositiva Dialogada"],
                recursos: ["Livro Didático", "Quadro/Giz"],
                avaliacoes: ["Observação Direta", "Registro Escrito"],
            },
        });
    }
}
