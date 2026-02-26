import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { chatCompletionText, getEngineError } from "@/lib/ai-engines";
import { anonymizeMessages } from "@/lib/ai-anonymize";
import { ESCALA_OMNISFERA, NivelOmnisfera } from "@/lib/omnisfera-types";

/**
 * POST /api/pei/adaptar-plano
 *
 * Cruza Plano de Curso (da turma) + Diagnóstica (nível do aluno) + PEI data
 * para gerar sugestões individualizadas de adaptação.
 *
 * Body: { student_id, disciplina, serie, barreiras?, potencialidades?, diagnostico?, nivel_omnisfera? }
 */
export async function POST(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const {
        student_id,
        disciplina = "",
        serie = "",
        barreiras = {},
        potencialidades = [],
        diagnostico = "",
        nivel_omnisfera,
        nome_aluno = "o estudante",
    } = body as {
        student_id: string;
        disciplina: string;
        serie: string;
        barreiras: Record<string, string[]>;
        potencialidades: string[];
        diagnostico: string;
        nivel_omnisfera?: number;
        nome_aluno?: string;
    };

    if (!student_id) {
        return NextResponse.json({ error: "student_id obrigatório" }, { status: 400 });
    }

    const sb = getSupabase();

    // ── 1. Fetch Plano de Curso ──────────────────────────────────────────

    let planoContexto = "";
    let habsPlano: string[] = [];

    try {
        let query = sb
            .from("planos_ensino")
            .select("*")
            .eq("workspace_id", session.workspace_id);

        if (disciplina) query = query.eq("disciplina", disciplina);
        if (serie) query = query.eq("ano_serie", serie);

        const { data } = await query.order("updated_at", { ascending: false }).limit(1);
        if (data?.[0]) {
            const plano = data[0];
            habsPlano = (plano.habilidades_bncc || []) as string[];
            const conteudo = plano.conteudo || "";
            planoContexto = `Plano de Curso do professor (${plano.professor_nome || ""}):
Disciplina: ${plano.disciplina}, Série: ${plano.ano_serie}
Habilidades BNCC selecionadas: ${habsPlano.join(", ")}
${conteudo ? `Conteúdo: ${typeof conteudo === "string" ? conteudo.slice(0, 800) : JSON.stringify(conteudo).slice(0, 800)}` : ""}`;
        }
    } catch { /* table may not exist */ }

    // ── 2. Fetch Diagnóstica resultado ───────────────────────────────────

    let nivelDiag: number | null = nivel_omnisfera ?? null;
    let diagContexto = "";

    if (nivelDiag === null) {
        try {
            const { data: peis } = await sb
                .from("peis")
                .select("avaliacoes_diagnosticas")
                .eq("workspace_id", session.workspace_id)
                .eq("student_id", student_id)
                .order("updated_at", { ascending: false })
                .limit(1);

            if (peis?.[0]) {
                const avs = (peis[0].avaliacoes_diagnosticas || []) as Array<{
                    disciplina: string; nivel_omnisfera_identificado?: number; status?: string;
                }>;
                const match = avs.find(a =>
                    a.disciplina?.toLowerCase().includes(disciplina.toLowerCase()) ||
                    disciplina.toLowerCase().includes(a.disciplina?.toLowerCase() || "")
                );
                if (match?.nivel_omnisfera_identificado != null) {
                    nivelDiag = match.nivel_omnisfera_identificado;
                }
            }
        } catch { /* silent */ }
    }

    if (nivelDiag !== null) {
        const esc = ESCALA_OMNISFERA[nivelDiag as NivelOmnisfera];
        diagContexto = `Resultado da Diagnóstica: Nível Omnisfera ${nivelDiag} — ${esc?.label || ""} (${esc?.descricao || ""})
Suporte correspondente: ${esc?.suporte_correspondente || ""}
Instrumento recomendado: ${esc?.instrumento_recomendado || ""}`;
    }

    // ── 3. Build PEI context ────────────────────────────────────────────

    const barreirasTexto = Object.entries(barreiras)
        .filter(([, v]) => v?.length > 0)
        .map(([dom, items]) => `${dom}: ${items.join(", ")}`)
        .join("\n");

    const potTexto = potencialidades.length > 0 ? potencialidades.join(", ") : "não informadas";

    // ── 4. Generate AI suggestions ──────────────────────────────────────

    const prompt = `Você é um especialista em educação inclusiva brasileira.

CONTEXTO DO ESTUDANTE:
- Nome: ${nome_aluno}
- Série: ${serie}
- Diagnóstico: ${diagnostico || "não informado"}
${diagContexto ? `\n${diagContexto}` : ""}
- Potencialidades: ${potTexto}
${barreirasTexto ? `- Barreiras identificadas:\n${barreirasTexto}` : ""}

${planoContexto ? `\nPLANO DE CURSO DA TURMA:\n${planoContexto}` : ""}

COM BASE NO PLANO DE CURSO DA TURMA E NO NÍVEL DO ESTUDANTE, gere adaptações INDIVIDUALIZADAS para o PEI.

Responda APENAS em JSON válido:
{
  "resumo_adaptacao": "Parágrafo explicando POR QUE estas adaptações são necessárias para ESTE aluno",
  "estrategias_acesso": ["item1", "item2"],
  "estrategias_ensino": ["item1", "item2"],
  "estrategias_avaliacao": ["item1", "item2"],
  "objetivos_individualizados": "Parágrafo com os objetivos de aprendizagem adaptados para o nível do estudante",
  "metodologia_adaptada": "Como adaptar as metodologias do plano de curso para este aluno",
  "habilidades_prioritarias": ["hab1", "hab2"],
  "alertas": ["alerta1"]
}

Selecione ESTRATÉGIAS destas listas:
ACESSO: Tempo estendido, Local diferenciado, Material ampliado, Leitor/Ledor, Enunciado simplificado, Uso de tecnologia assistiva, Apoio do AEE, Uso de CAA, Prova oral, Material concreto, Atividade adaptada
ENSINO: Sequências curtas, Modelagem (exemplo resolvido), Apoio visual, Repetição espaçada, Instrução direta, Ensino multissensorial, Pareamento (peer tutoring), Ensino explícito, Adaptação do material
AVALIAÇÃO: Observação Direta, Registro Escrito, Portfólio, Autoavaliação, Avaliação por Pares, Apresentação Oral, Produção Textual, Exercícios Práticos, Roda de Conversa`;

    const engineErr = getEngineError("red");
    if (engineErr) {
        // Fallback local
        return NextResponse.json({
            sugestao: {
                resumo_adaptacao: `Com base no nível Omnisfera ${nivelDiag ?? "não identificado"} e no diagnóstico "${diagnostico || "não informado"}", o estudante necessita de adaptações que garantam acesso ao currículo comum enquanto respeitam suas barreiras e potencialidades individuais.`,
                estrategias_acesso: ["Tempo estendido", "Material ampliado", "Enunciado simplificado"],
                estrategias_ensino: ["Sequências curtas", "Apoio visual", "Modelagem (exemplo resolvido)"],
                estrategias_avaliacao: ["Observação Direta", "Registro Escrito", "Exercícios Práticos"],
                objetivos_individualizados: `Adaptar os objetivos do plano de curso para o nível ${nivelDiag ?? 1} da Escala Omnisfera, priorizando habilidades fundamentais e progressão gradual.`,
                metodologia_adaptada: "Utilizar abordagem multissensorial com apoio visual e sequências didáticas simplificadas.",
                habilidades_prioritarias: habsPlano.slice(0, 3),
                alertas: [],
            },
            plano_curso_encontrado: !!planoContexto,
            diagnostica_nivel: nivelDiag,
        });
    }

    try {
        const { anonymized, restore } = anonymizeMessages(
            [
                { role: "system", content: "Você é um especialista em educação inclusiva brasileira. Responda apenas em JSON válido." },
                { role: "user", content: prompt },
            ],
            nome_aluno !== "o estudante" ? nome_aluno : null
        );

        const textoRaw = await chatCompletionText("red", anonymized, { temperature: 0.5 });
        const texto = restore(textoRaw);

        // Parse JSON
        const jsonMatch = texto.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const sugestao = JSON.parse(jsonMatch[0]);
            return NextResponse.json({
                sugestao,
                plano_curso_encontrado: !!planoContexto,
                diagnostica_nivel: nivelDiag,
            });
        }

        return NextResponse.json({ error: "Resposta da IA não é JSON válido" }, { status: 500 });
    } catch (err) {
        console.error("adaptar-plano error:", err);
        return NextResponse.json({
            error: err instanceof Error ? err.message : "Erro ao gerar adaptações",
        }, { status: 500 });
    }
}
