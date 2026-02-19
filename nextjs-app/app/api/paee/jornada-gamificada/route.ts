import { parseBody, paeeJornadaGamificadaSchema } from "@/lib/validation";
import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { chatCompletionText, getEngineError } from "@/lib/ai-engines";
import type { EngineId } from "@/lib/ai-engines";
import { requireAuth } from "@/lib/permissions";
import { anonymizeMessages } from "@/lib/ai-anonymize";

type CicloPayload = {
  config_ciclo?: {
    foco_principal?: string;
    descricao?: string;
    metas_selecionadas?: Array<{ tipo?: string; descricao?: string; meta?: string }>;
    desdobramento_smart_texto?: string;
    data_inicio?: string;
    data_fim?: string;
  };
  cronograma?: {
    fases?: Array<{ nome?: string; objetivo_geral?: string }>;
    semanas?: Array<{ numero?: number; tema?: string; objetivo?: string }>;
  };
  recursos_incorporados?: Record<string, unknown>;
};

export async function POST(req: Request) {
  const rl = rateLimitResponse(req, RATE_LIMITS.AI_GENERATION); if (rl) return rl;
  const { error: authError } = await requireAuth(); if (authError) return authError;
  const parsed = await parseBody(req, paeeJornadaGamificadaSchema);
  if (parsed.error) return parsed.error;
  const body = parsed.data;

  const engine: EngineId = ["red", "blue", "green"].includes(body.engine || "")
    ? (body.engine as EngineId)
    : "red";

  const engineErr = getEngineError(engine);
  if (engineErr) return NextResponse.json({ error: engineErr }, { status: 500 });

  const estudante = body.estudante || {};
  const nome = estudante.nome || "Estudante";
  const nomeCurto = nome.split(" ")[0] || "Estudante";
  const hiperfoco = estudante.hiperfoco || "interesses gerais";
  const serie = estudante.serie || "";
  const perfilPei = estudante.ia_sugestao || estudante.perfil || "";

  const promptFeedback = body.feedback?.trim()
    ? `\nAJUSTE SOLICITADO: ${body.feedback}\n`
    : "";

  const estiloPrompt = body.estilo?.trim()
    ? `\nESTILO PREFERIDO: ${body.estilo}\n`
    : "";

  let prompt = "";

  if (body.origem === "ciclo" && body.ciclo) {
    const ciclo = body.ciclo as CicloPayload;
    const cfg = ciclo.config_ciclo || {};
    const foco = cfg.foco_principal || "Ciclo AEE";
    const desc = cfg.descricao || "";
    const metasList = cfg.metas_selecionadas || [];
    const metasTexto = metasList
      .slice(0, 8)
      .map((m) => `- ${m.tipo || ""}: ${m.descricao || m.meta || ""}`)
      .join("\n");

    const smartTxt = cfg.desdobramento_smart_texto || "";
    const metasCompleto = smartTxt
      ? `${metasTexto}\n\nMETAS SMART (desdobradas):\n${smartTxt.slice(0, 1500)}`
      : metasTexto;

    const crono = ciclo.cronograma || {};
    const fases = crono.fases || [];
    const semanas = crono.semanas || [];
    let cronTexto = "";
    if (fases.length > 0) {
      cronTexto += "FASES:\n" + fases.slice(0, 5).map((f: any) => `- ${f.nome || ""}: ${f.objetivo_geral || ""}`).join("\n");
    }
    if (semanas.length > 0) {
      cronTexto += "\n\nSEMANAS (resumo):\n" + semanas.slice(0, 6).map((w: any) => `- Sem ${w.numero}: ${w.tema || ""} — ${w.objetivo || ""}`).join("\n");
    }

    const recs = ciclo.recursos_incorporados || {};
    const recTexto = Object.keys(recs).slice(0, 5).join(", ") || "—";

    const contexto = `ESTUDANTE: ${nomeCurto}
FOCO DO CICLO: ${foco}
DESCRIÇÃO: ${desc}

METAS DO PLANEJAMENTO:
${metasCompleto}

${cronTexto}

RECURSOS: ${recTexto}
${hiperfoco && hiperfoco !== "interesses gerais" ? `HIPERFOCO/INTERESSE DO ESTUDANTE: ${hiperfoco} — use como tema narrativo da gamificação.` : ""}
${perfilPei ? `CONTEXTO PEDAGÓGICO (USO INTERNO DA IA — NUNCA incluir no texto gerado): ${perfilPei.slice(0, 1500)}` : ""}`;

    prompt = `Você é um Game Master. Crie uma versão GAMIFICADA do planejamento do ciclo AEE para o estudante e a família: linguagem motivadora, missões, recompensas.
REGRA OBRIGATÓRIA: NUNCA inclua diagnóstico clínico, CID, condições médicas ou qualquer informação de saúde no texto.
Este material será entregue ao estudante e à família — use apenas desafios, conquistas, metas e estratégias pedagógicas.
Estrutura: título da missão/jornada, mapa das fases ou semanas como etapas, desafios e conquistas.
Use títulos e listas em markdown de forma clara (##, -, *).
${estiloPrompt}${promptFeedback}

---
${contexto}`;
  } else if (body.texto_fonte) {
    const texto = String(body.texto_fonte).slice(0, 8000);
    const nomeFonte = body.nome_fonte || "conteúdo da escola";

    const contexto = `ESTUDANTE: ${nomeCurto}
ORIGEM DO CONTEÚDO: ${nomeFonte} (material da escola para o AEE)

CONTEÚDO A SER TRANSFORMADO EM JORNADA GAMIFICADA PARA O ESTUDANTE:
${texto}
${hiperfoco && hiperfoco !== "interesses gerais" ? `HIPERFOCO/INTERESSE DO ESTUDANTE: ${hiperfoco} — use como tema narrativo da gamificação.` : ""}
${perfilPei ? `CONTEXTO PEDAGÓGICO (USO INTERNO DA IA — NUNCA incluir no texto gerado): ${perfilPei.slice(0, 1500)}` : ""}`;

    prompt = `Você é um Game Master. Transforme o conteúdo abaixo em uma versão GAMIFICADA para o estudante e a família: linguagem motivadora, missões, recompensas.
REGRA OBRIGATÓRIA: NUNCA inclua diagnóstico clínico, CID, condições médicas ou qualquer informação de saúde no texto.
Este material será entregue ao estudante e à família — remova qualquer menção clínica e use apenas desafios, conquistas e estratégias pedagógicas.
Estrutura: título da missão/jornada, etapas/desafios, conquistas. O estudante deve se ver como protagonista.
Use títulos e listas em markdown de forma clara (##, -, *).
${estiloPrompt}${promptFeedback}

---
${contexto}`;
  } else {
    return NextResponse.json(
      { error: "Informe origem=ciclo com ciclo OU origem com texto_fonte e nome_fonte." },
      { status: 400 }
    );
  }

  try {
    const { anonymized, restore } = anonymizeMessages([{ role: "user", content: prompt }], nome);
    const texto = await chatCompletionText(
      engine,
      anonymized,
      { temperature: 0.7 }
    );
    return NextResponse.json({ texto: restore(texto || "").trim() });
  } catch (err) {
    console.error("PAEE jornada gamificada:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao gerar jornada." },
      { status: 500 }
    );
  }
}
