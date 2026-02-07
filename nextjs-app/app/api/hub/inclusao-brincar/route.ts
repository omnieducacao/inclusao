import { NextResponse } from "next/server";
import { chatCompletionText, getEngineError } from "@/lib/ai-engines";
import type { EngineId } from "@/lib/ai-engines";

export async function POST(req: Request) {
  let body: {
    tema?: string;
    feedback?: string;
    engine?: string;
    estudante?: { nome?: string; hiperfoco?: string; ia_sugestao?: string };
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

  const tema = body.tema || "";
  const feedback = body.feedback || "";
  const estudanteNome = body.estudante?.nome || "criança";
  const hiperfoco = body.estudante?.hiperfoco || "";
  const perfilEstudante = body.estudante?.ia_sugestao || "";

  let prompt = `Especialista em Educação Infantil e MEDIAÇÃO SOCIAL.
Se a criança brinca isolada, o objetivo não é forçar a interação, mas criar pontes através do interesse dela.
A IA criará uma brincadeira onde ela é protagonista.

TEMA/MOMENTO: ${tema}

ESTUDANTE: ${estudanteNome}
${hiperfoco ? `HIPERFOCO/INTERESSE: ${hiperfoco}` : ""}
${perfilEstudante ? `PERFIL: ${perfilEstudante}` : ""}

${feedback ? `CORREÇÃO/REFINAMENTO: ${feedback}` : ""}

Retorne:
1) Nome da brincadeira (usando o hiperfoco/interesse como ponte)
2) Objetivos pedagógicos e sociais
3) Materiais necessários (simples e acessíveis)
4) Passo a passo detalhado da brincadeira
5) Adaptações específicas para inclusão
6) Estratégias de mediação para o professor facilitar a interação

Use linguagem simples e prática. NÃO inclua diagnóstico ou CID.`;

  try {
    const texto = await chatCompletionText(engine, [{ role: "user", content: prompt }], { temperature: 0.7 });
    return NextResponse.json({ texto: (texto || "").trim() });
  } catch (e) {
    console.error("Inclusão Brincar:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erro." }, { status: 500 });
  }
}
