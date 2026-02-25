import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

/**
 * POST /api/pei/plano-ensino/sugestao-ia
 * Gera sugestões de objetivos, metodologia, recursos e avaliação
 * baseado nas habilidades BNCC selecionadas.
 *
 * A IA tanto seleciona tags das listas predefinidas quanto escreve
 * textos descritivos para os campos livres.
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

    const prompt = `Você é um especialista em educação inclusiva brasileira. Com base nas habilidades BNCC abaixo, gere um plano de curso detalhado.

IMPORTANTE: Além de selecionar itens das listas, você deve ESCREVER TEXTOS DESCRITIVOS nos campos de texto livre. Seja específico e contextualizado para a série e componente.

Contexto:
- Série: ${serie}
- Componente Curricular: ${componente}
- Unidade Temática: ${unidade}
- Objeto do Conhecimento: ${objeto}
- Habilidades BNCC:
${habsTexto}

Gere:

1. **objetivos** (array de strings): 3-5 verbos da Taxonomia de Bloom que se aplicam (ex: "Identificar", "Comparar")
2. **objetivos_texto** (string longa): Parágrafo detalhado descrevendo os objetivos de aprendizagem, contextualizados para a série ${serie} e o componente ${componente}. Inclua o que o aluno deve ser capaz de fazer ao final. Mínimo 3-4 frases completas.
3. **metodologias** (array): Selecione da lista: Aula Expositiva Dialogada, Metodologia Ativa, Aprendizagem Baseada em Problemas, Ensino Híbrido, Sala de Aula Invertida, Rotação por Estações, Gamificação, Aprendizagem Baseada em Projetos (PBL), Peer Instruction, Estudo de Caso, Aprendizagem Cooperativa, Trabalho em Grupo
4. **metodologia_texto** (string longa): Descreva COMO aplicar as metodologias selecionadas neste contexto. Detalhe a sequência de atividades, dinâmicas e estratégias pedagógicas. Mínimo 3-4 frases.
5. **recursos** (array): Selecione da lista: Livro Didático, Quadro/Giz, Projetor/Datashow, Lousa Digital, Tablets/Celulares, Internet, Material Maker (Papel, Cola, etc), Jogos Pedagógicos, Laboratório, Material Dourado, Fichas / Atividades Impressas, Vídeos Educativos, Mapas / Gráficos, Material Concreto, Material Adaptado, Recursos de CAA, Música / Áudio, Biblioteca
6. **avaliacoes** (array): Selecione da lista: Observação Direta, Registro Escrito, Portfólio, Autoavaliação, Avaliação por Pares, Prova Escrita, Trabalho em Grupo, Apresentação Oral, Produção Textual, Projeto, Participação em Aula, Exercícios Práticos, Roda de Conversa
7. **avaliacao_texto** (string longa): Descreva os critérios de avaliação, instrumentos a serem utilizados e como o professor deve observar o progresso dos alunos. Inclua indicadores de aprendizagem. Mínimo 3-4 frases.

Responda APENAS em formato JSON válido, sem markdown:
{
  "objetivos": ["verbo1", "verbo2", ...],
  "objetivos_texto": "Texto descritivo completo dos objetivos...",
  "metodologias": ["Met1", "Met2"],
  "metodologia_texto": "Descrição detalhada de como aplicar...",
  "recursos": ["Recurso1", "Recurso2"],
  "avaliacoes": ["Aval1", "Aval2"],
  "avaliacao_texto": "Descrição dos critérios e instrumentos..."
}`;

    try {
        // Use DeepSeek (OmniRed) as default
        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            // Fallback local: return generic suggestions
            return NextResponse.json({
                sugestao: {
                    objetivos: ["Identificar", "Comparar", "Analisar", "Aplicar"],
                    objetivos_texto: `Ao final desta sequência didática de ${componente} para ${serie}, espera-se que os alunos sejam capazes de identificar e compreender os conceitos fundamentais relacionados a "${objeto || unidade}". Os estudantes deverão demonstrar habilidade em comparar diferentes perspectivas e aplicar os conhecimentos adquiridos em situações práticas do cotidiano. O desenvolvimento do pensamento crítico e analítico será estimulado por meio de atividades contextualizadas.`,
                    metodologias: ["Aula Expositiva Dialogada", "Metodologia Ativa"],
                    metodologia_texto: `A abordagem pedagógica será centrada no aluno, utilizando Aula Expositiva Dialogada para apresentar conceitos-chave e contextualizar o conteúdo de ${objeto || unidade}. Em seguida, os alunos serão convidados a participar de atividades práticas baseadas em Metodologia Ativa, onde poderão explorar, experimentar e construir conhecimento de forma colaborativa. As estratégias incluirão discussões em grupo, resolução de problemas contextualizados e produção de materiais.`,
                    recursos: ["Livro Didático", "Quadro/Giz", "Projetor/Datashow"],
                    avaliacoes: ["Observação Direta", "Registro Escrito"],
                    avaliacao_texto: `A avaliação será processual e contínua, por meio de Observação Direta do engajamento e participação dos alunos durante as atividades. Serão utilizados Registros Escritos para acompanhar o progresso individual, incluindo produções textuais e resolução de exercícios. Os critérios avaliativos incluem: domínio dos conceitos trabalhados, capacidade de articular ideias, participação nas discussões e qualidade das produções. O professor deverá fornecer devolutivas constantes para orientar a aprendizagem.`,
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
                    { role: "system", content: "Você é um assistente pedagógico especialista em educação inclusiva brasileira. Responda apenas em JSON válido. Escreva textos descritivos, detalhados e contextualizados." },
                    { role: "user", content: prompt },
                ],
                temperature: 0.7,
                max_tokens: 1500,
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
                objetivos_texto: `Os alunos de ${serie} deverão desenvolver competências relacionadas a ${objeto || unidade || componente}, identificando conceitos fundamentais, comparando diferentes abordagens e analisando situações-problema de forma crítica e contextualizada.`,
                metodologias: ["Aula Expositiva Dialogada"],
                metodologia_texto: `Será utilizada uma abordagem mista, combinando exposição dos conceitos com atividades práticas e colaborativas, promovendo a construção ativa do conhecimento.`,
                recursos: ["Livro Didático", "Quadro/Giz"],
                avaliacoes: ["Observação Direta", "Registro Escrito"],
                avaliacao_texto: `A avaliação será contínua e formativa, utilizando observação direta e registros escritos para acompanhar o progresso dos alunos em relação aos objetivos propostos.`,
            },
        });
    }
}
