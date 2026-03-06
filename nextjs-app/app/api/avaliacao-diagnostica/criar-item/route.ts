import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { chatCompletionText, getEngineError, type EngineId } from "@/lib/ai-engines";
import { requireAuth } from "@/lib/permissions";
import { determinarTipoImagem, gerarInstrucaoImagemParaPrompt } from "@/lib/avaliacao-imagens";
import { anonymizeMessages } from "@/lib/ai-anonymize";
import {
    buildContextoAluno,
    buildPromptCompleto,
    mapDiagnosticoToPerfilNEE,
    nivelCognitivoAutomatico,
    REGRAS_NEE,
    SYSTEM_PROMPT_OMNISFERA,
} from "@/lib/omnisfera-prompts";
import { readFileSync } from "fs";
import { join } from "path";

// ── Cache BNCC completa ──────────────────────────────────────

interface BnccHabilidade {
    codigo: string;
    segmento: string;
    ano: string;
    disciplina: string;
    unidade_tematica: string;
    objeto_conhecimento: string;
    habilidade: string;
    nivel_cognitivo_saeb: string;
    prioridade_saeb: string;
    instrumento_avaliativo: string;
}

let cachedBncc: BnccHabilidade[] | null = null;
function loadBncc(): BnccHabilidade[] {
    if (!cachedBncc) {
        const raw = readFileSync(join(process.cwd(), "data", "bncc_completa.json"), "utf-8");
        cachedBncc = JSON.parse(raw);
    }
    return cachedBncc!;
}

/**
 * POST /api/avaliacao-diagnostica/criar-item
 *
 * Gera UMA ÚNICA questão diagnóstica para UMA habilidade.
 * Chamada múltiplas vezes pelo front-end em loop progressivo.
 *
 * Body:
 *   habilidade_codigo: string          — código BNCC (ex: "EF05LP01")
 *   habilidade_texto?: string          — texto da habilidade (fallback)
 *   disciplina: string
 *   serie: string
 *   gabarito_definido: string           — "A" | "B" | "C" | "D" (definido pelo sistema)
 *   nivel_dificuldade: string           — "facil" | "medio" | "dificil"
 *   numero_questao: number             — posição na avaliação (1, 2, 3...)
 *   total_questoes: number             — total de questões na avaliação
 *   diagnostico_aluno?: string
 *   nome_aluno?: string
 *   nivel_omnisfera_estimado?: number
 *   plano_ensino_contexto?: string
 *   alerta_nee?: string
 *   instrucao_uso_diagnostica?: string
 *   feedback_professor?: string             — feedback do professor para regeneração
 *   engine?: EngineId
 */
export async function POST(req: Request) {
    const rl = rateLimitResponse(req, RATE_LIMITS.AI_GENERATION); if (rl) return rl;
    const { error: authError } = await requireAuth(); if (authError) return authError;

    let body: Record<string, unknown>;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Body inválido" }, { status: 400 });
    }

    const disciplina = (body.disciplina as string) || "";
    const serie = (body.serie as string) || "";
    const habilidade_codigo = (body.habilidade_codigo as string) || "";
    const habilidade_texto = (body.habilidade_texto as string) || "";
    const gabarito_definido = (body.gabarito_definido as string) || "B";
    const nivel_dificuldade = (body.nivel_dificuldade as string) || "medio";
    const numero_questao = (body.numero_questao as number) || 1;
    const total_questoes = (body.total_questoes as number) || 10;
    const diagnostico_aluno = (body.diagnostico_aluno as string) || "";
    const nome_aluno = (body.nome_aluno as string) || "o estudante";
    const plano_ensino_contexto = (body.plano_ensino_contexto as string) || "";
    const alerta_nee = (body.alerta_nee as string) || "";
    const instrucao_uso_diagnostica = (body.instrucao_uso_diagnostica as string) || "";
    const nivel_omnisfera_estimado = (body.nivel_omnisfera_estimado as number) ?? 1;
    const barreiras_ativas = (body.barreiras_ativas as Record<string, boolean>) || {};
    const feedback_professor = (body.feedback_professor as string) || "";
    const engine: EngineId = ["red", "blue", "green", "yellow", "orange"].includes(body.engine as string || "")
        ? (body.engine as EngineId)
        : "red";

    if (!habilidade_codigo && !habilidade_texto && !disciplina) {
        return NextResponse.json({ error: "Informe uma habilidade ou disciplina." }, { status: 400 });
    }

    // ── Resolve habilidade from BNCC ──────────────────────────

    const bncc = loadBncc();
    let hab: {
        codigo: string;
        disciplina: string;
        unidade_tematica: string;
        objeto_conhecimento: string;
        habilidade: string;
        nivel_cognitivo_saeb?: string;
    };

    if (habilidade_codigo) {
        const codeMatch = habilidade_codigo.match(/(EF\d+\w+\d+|EI\d+\w+\d+)/i);
        const found = codeMatch ? bncc.find(h => h.codigo === codeMatch[1]) : null;
        if (found) {
            hab = {
                codigo: found.codigo,
                disciplina: found.disciplina,
                unidade_tematica: found.unidade_tematica,
                objeto_conhecimento: found.objeto_conhecimento,
                habilidade: found.habilidade,
                nivel_cognitivo_saeb: found.nivel_cognitivo_saeb,
            };
        } else {
            hab = {
                codigo: habilidade_codigo.slice(0, 20),
                disciplina,
                unidade_tematica: "",
                objeto_conhecimento: "",
                habilidade: habilidade_texto || habilidade_codigo,
            };
        }
    } else {
        hab = {
            codigo: `EF_${disciplina.toUpperCase().slice(0, 3)}`,
            disciplina,
            unidade_tematica: "Diagnóstica Geral",
            objeto_conhecimento: "Avaliação inicial",
            habilidade: habilidade_texto || `Avaliar nível do estudante em ${disciplina}`,
        };
    }

    // ── Build focused single-item prompt ─────────────────────

    const nivelCognitivo = nivelCognitivoAutomatico(nivel_omnisfera_estimado);
    const perfil = mapDiagnosticoToPerfilNEE(diagnostico_aluno);
    const regraNEE = REGRAS_NEE[perfil] || REGRAS_NEE.SEM_NEE;

    // ── Decisão de imagem baseada em barreiras do PEI ────────
    const decisaoImagem = determinarTipoImagem({
        perfilNEE: perfil,
        barreirasAtivas: barreiras_ativas,
        habilidadeCodigo: hab.codigo,
        habilidadeDescricao: hab.habilidade,
    });
    const instrucaoImagem = gerarInstrucaoImagemParaPrompt(decisaoImagem);

    const dificuldadeMap: Record<string, string> = {
        facil: `Nível fácil — suporte simples, distratores mais óbvios, verbo cognitivo básico (identificar, reconhecer)`,
        medio: `Nível médio — suporte moderado, distratores plausíveis, verbo cognitivo intermediário (comparar, classificar)`,
        dificil: `Nível difícil — suporte complexo, distratores sutis, verbo cognitivo avançado (analisar, avaliar)`,
    };

    const planoContext = plano_ensino_contexto
        ? `\n## PLANO DE ENSINO VINCULADO (use como contexto)\n${plano_ensino_contexto.slice(0, 1500)}`
        : '';

    const userPrompt = `
## CONTEXTO DO ESTUDANTE
Nome: ${nome_aluno}
Ano de matrícula: ${serie}
Perfil NEE: ${perfil} (${diagnostico_aluno || 'não informado'})
Nível Omnisfera estimado: ${nivel_omnisfera_estimado}

${regraNEE}

## TAREFA: GERAR 1 QUESTÃO DIAGNÓSTICA — MÚLTIPLA ESCOLHA

Esta é a questão ${numero_questao} de ${total_questoes} da avaliação.

HABILIDADE BNCC A AVALIAR:
[${hab.codigo}] ${hab.disciplina} — ${hab.unidade_tematica} / ${hab.objeto_conhecimento}
"${hab.habilidade}"
Nível Cognitivo SAEB: ${hab.nivel_cognitivo_saeb || nivelCognitivo}

DIFICULDADE DESTA QUESTÃO: ${dificuldadeMap[nivel_dificuldade] || dificuldadeMap.medio}

GABARITO DEFINIDO PELO SISTEMA: A resposta correta DEVE estar na letra ${gabarito_definido}.
Organize as alternativas para que a resposta correta esteja na posição ${gabarito_definido}.
${planoContext}

ESTRUTURA OBRIGATÓRIA (Guia CAEd/UFJF):
1. ENUNCIADO: instrução clara (máx. 2 sentenças) + TEXTO DE APOIO COMPLETO quando necessário
   - Se a questão precisa de um trecho de leitura, problema contextualizado, ou cenário: INCLUA NO ENUNCIADO
   - O enunciado DEVE conter TODO o texto que o estudante precisa ler
   - NÃO delegue o texto ao suporte_visual — suporte_visual é SÓ para IMAGENS
2. COMANDO: pergunta SEM negativas, SEM ambiguidade
3. ALTERNATIVAS: 4 opções paralelas em estrutura e comprimento
   - Gabarito inequívoco na posição ${gabarito_definido}
   - 3 distratores baseados em erros cognitivos reais
4. SUPORTE_VISUAL: SÓ para imagens (gráficos, ilustrações, mapas). O TEXTO vai no enunciado.

${instrucaoImagem}

## SCHEMA DE SAÍDA (JSON obrigatório — retorne SOMENTE este JSON):
{
  "id": "Q${numero_questao}",
  "habilidade_bncc_ref": "${hab.codigo}",
  "enunciado": "string — OBRIGATÓRIO: instrução + texto de apoio/leitura/cenário completo. TODO o texto que o estudante precisa ler vai aqui.",
  "comando": "string — a pergunta em si",
  "suporte_visual": {
    "necessario": true | false,
    "justificativa": "string — por que é ou não necessário",
    "tipo": "sequencia | comparacao | organizacao | concreto | simbolico | grafico | mapa | diagrama | tabela | ilustracao | fotografia | null",
    "descricao_para_geracao": "string ESPECÍFICA e DETALHADA para gerar esta imagem — incluir cores, disposição, quantidade de elementos | null",
    "texto_alternativo": "string — acessibilidade | null",
    "justificativa_pedagogica": "string — POR QUE esta imagem ajuda nesta barreira específica | null"
  },
  "alternativas": { "A": "string", "B": "string", "C": "string", "D": "string" },
  "gabarito": "${gabarito_definido}",
  "analise_distratores": {
    "A": "erro cognitivo que captura | gabarito",
    "B": "erro cognitivo que captura | gabarito",
    "C": "erro cognitivo que captura | gabarito",
    "D": "erro cognitivo que captura | gabarito"
  },
  "justificativa_pedagogica": "string",
  "instrucao_aplicacao_professor": "string — como aplicar e qual suporte oferecer",
  "adaptacao_nee_aplicada": "string",
  "nivel_suporte_recomendado": "S1|S2|S3|S4",
  "nivel_omnisfera_alvo": ${nivel_omnisfera_estimado},
  "nivel_bloom": "Lembrar|Compreender|Aplicar|Analisar|Avaliar|Criar",
  "tempo_estimado_minutos": number
}`.trim();

    let finalUser = userPrompt;
    if (alerta_nee) {
        finalUser += `\n\n--- ALERTA POR PERFIL NEE ---\n${alerta_nee}`;
    }
    if (instrucao_uso_diagnostica) {
        finalUser += `\n\n--- INSTRUÇÃO DE USO DIAGNÓSTICA ---\n${instrucao_uso_diagnostica}`;
    }
    if (feedback_professor) {
        finalUser += `\n\n━━━ ATENÇÃO: AJUSTE SOLICITADO PELO PROFESSOR ━━━
${feedback_professor}

Você DEVE gerar uma questão DIFERENTE da anterior, corrigindo o problema apontado.
Mantendo a mesma habilidade BNCC, gabarito na letra ${gabarito_definido} e nível de dificuldade.`;
    }

    const engineErr = getEngineError(engine);
    if (engineErr) return NextResponse.json({ error: engineErr }, { status: 500 });

    try {
        const { anonymized, restore } = anonymizeMessages(
            [
                { role: "system", content: SYSTEM_PROMPT_OMNISFERA },
                { role: "user", content: finalUser },
            ],
            nome_aluno !== "o estudante" ? nome_aluno : null
        );
        const textoRaw = await chatCompletionText(engine, anonymized, {
            temperature: 0.4,
            max_tokens: 2048,  // Single item needs less tokens
        });
        const texto = restore(textoRaw);

        // Parse JSON from response
        let questao = null;
        try {
            // Try direct JSON parse
            const cleaned = texto.replace(/```(?:json)?\s*([\s\S]*?)```/, "$1").trim();
            questao = JSON.parse(cleaned);
        } catch {
            // Try to extract JSON object
            try {
                const jsonMatch = texto.match(/\{[\s\S]*"id"[\s\S]*"gabarito"[\s\S]*\}/);
                if (jsonMatch) {
                    questao = JSON.parse(jsonMatch[0]);
                }
            } catch { /* give up on JSON parsing */ }
        }

        return NextResponse.json({
            questao,
            texto_raw: texto,
            habilidade: hab,
            gabarito_esperado: gabarito_definido,
            numero_questao,
        });
    } catch (err) {
        console.error("Avaliação Diagnóstica criar-item:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Erro ao gerar item diagnóstico." },
            { status: 500 }
        );
    }
}
