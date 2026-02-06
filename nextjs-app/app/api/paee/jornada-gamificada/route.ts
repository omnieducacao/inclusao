import { NextResponse } from "next/server";
import { chatCompletionText, getEngineError } from "@/lib/ai-engines";
import type { EngineId } from "@/lib/ai-engines";

type CicloPayload = {
  config_ciclo?: {
    foco_principal?: string;
    descricao?: string;
    metas_selecionadas?: Array<{ meta?: string; descricao?: string }>;
  };
  cronograma?: Array<{ semana?: number; metas?: string[] }>;
};

export async function POST(req: Request) {
  let body: {
    origem: "ciclo" | "texto";
    engine?: string;
    ciclo?: CicloPayload;
    texto_fonte?: string;
    estudante?: { nome?: string; serie?: string; hiperfoco?: string };
    feedback?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const engine: EngineId = ["red", "blue", "green", "yellow", "orange"].includes(body.engine || "")
    ? (body.engine as EngineId)
    : "yellow";

  const engineErr = getEngineError(engine);
  if (engineErr) return NextResponse.json({ error: engineErr }, { status: 500 });

  const estudante = body.estudante || {};
  const nome = estudante.nome || "Estudante";
  const hiperfoco = estudante.hiperfoco || "interesses gerais";
  const serie = estudante.serie || "";

  const promptFeedback = body.feedback?.trim()
    ? `\nAJUSTE SOLICITADO: ${body.feedback}\n`
    : "";

  let prompt = "";

  if (body.origem === "ciclo" && body.ciclo) {
    const cfg = body.ciclo.config_ciclo || {};
    const foco = cfg.foco_principal || "aprendizagem";
    const desc = cfg.descricao || "";
    const metas = (cfg.metas_selecionadas || [])
      .map((m) => m.meta || m.descricao)
      .filter(Boolean);
    const crono = body.ciclo.cronograma || [];
    const semanasTxt = crono
      .slice(0, 12)
      .map((s) => `Semana ${s.semana}: ${(s.metas || []).join(", ")}`)
      .join("\n");

    prompt = `Crie uma MISSÃO GAMIFICADA para o estudante ${nome} (série: ${serie}). Hiperfoco: ${hiperfoco}.
${promptFeedback}
CONTEXTO DO CICLO:
- Foco: ${foco}
- Descrição: ${desc}
${metas.length ? `- Metas: ${metas.join("; ")}` : ""}
${semanasTxt ? `\nCRONOGRAMA:\n${semanasTxt}` : ""}

Estrutura: título da missão/jornada, mapa das fases ou semanas como etapas, desafios e conquistas.
REGRA: NUNCA inclua diagnóstico clínico, CID ou condições médicas. O material será entregue ao estudante e à família.
Use linguagem motivadora e lúdica. O estudante deve se ver como protagonista.`;
  } else if (body.origem === "texto" && body.texto_fonte) {
    const texto = String(body.texto_fonte).slice(0, 4000);
    prompt = `Transforme o conteúdo abaixo em uma MISSÃO GAMIFICADA para o estudante ${nome} (série: ${serie}). Hiperfoco: ${hiperfoco}.
${promptFeedback}
CONTEÚDO DE ORIGEM:
${texto}

Estrutura: título da missão, etapas/desafios, conquistas. O estudante deve se ver como protagonista.
REGRA: NUNCA inclua diagnóstico clínico ou CID. Use linguagem motivadora e lúdica.`;
  } else {
    return NextResponse.json(
      { error: "Informe origem=ciclo com ciclo OU origem=texto com texto_fonte." },
      { status: 400 }
    );
  }

  try {
    const texto = await chatCompletionText(
      engine,
      [{ role: "user", content: prompt }],
      { temperature: 0.7 }
    );
    return NextResponse.json({ texto: (texto || "").trim() });
  } catch (err) {
    console.error("PAEE jornada gamificada:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao gerar jornada." },
      { status: 500 }
    );
  }
}
