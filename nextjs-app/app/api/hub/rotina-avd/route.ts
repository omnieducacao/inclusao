import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { chatCompletionText, getEngineError } from "@/lib/ai-engines";
import type { EngineId } from "@/lib/ai-engines";

export async function POST(req: Request) {
  const rl = rateLimitResponse(req, RATE_LIMITS.AI_GENERATION); if (rl) return rl;
  let body: {
    rotina_detalhada?: string;
    topico_foco?: string;
    feedback?: string;
    engine?: string;
    estudante?: { nome?: string; ia_sugestao?: string };
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }
  const engine: EngineId = ["red", "blue", "green", "yellow", "orange"].includes(body.engine || "")
    ? (body.engine as EngineId)
    : "red";
  const err = getEngineError(engine);
  if (err) return NextResponse.json({ error: err }, { status: 500 });

  const rotinaDetalhada = body.rotina_detalhada || "";
  const topicoFoco = body.topico_foco || "";
  const feedback = body.feedback || "";
  const estudanteNome = body.estudante?.nome || "criança";
  const perfilEstudante = body.estudante?.ia_sugestao || "";

  let prompt = `Especialista em Educação Infantil e ROTINA & PREVISIBILIDADE.
A rotina organiza o pensamento da criança. Analise esta rotina e sugira adaptações sensoriais e visuais.

ROTINA DA TURMA:
${rotinaDetalhada}

${topicoFoco ? `PONTO DE ATENÇÃO ESPECÍFICO: ${topicoFoco}` : ""}

${perfilEstudante ? `PERFIL DO ESTUDANTE: ${perfilEstudante}` : ""}
ESTUDANTE: ${estudanteNome}

${feedback ? `CORREÇÃO/REFINAMENTO: ${feedback}` : ""}

Retorne:
1) Análise da rotina identificando pontos de estresse potencial
2) Estratégias de antecipação visual e sensorial
3) Adaptações específicas para cada transição
4) Sequências visuais sugeridas
5) Dicas de mediação para o professor

Use linguagem simples e prática. NÃO inclua diagnóstico ou CID.`;

  try {
    const texto = await chatCompletionText(engine, [{ role: "user", content: prompt }], { temperature: 0.7 });
    return NextResponse.json({ texto: (texto || "").trim() });
  } catch (e) {
    console.error("Rotina AVD:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erro." }, { status: 500 });
  }
}
