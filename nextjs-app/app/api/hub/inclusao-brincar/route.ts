import { NextResponse } from "next/server";
import { chatCompletionText, getEngineError } from "@/lib/ai-engines";
import type { EngineId } from "@/lib/ai-engines";

export async function POST(req: Request) {
  let body: { tema?: string; faixa?: string; engine?: string; estudante?: { nome?: string; hiperfoco?: string } };
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

  const prompt = `Especialista em Educação Infantil e INCLUSÃO NO BRINCAR.
Sugira brincadeiras ACESSÍVEIS para: ${body.tema || "brincadeiras em grupo"}.
Faixa etária: ${body.faixa || "3-5 anos"}.
Estudante: ${body.estudante?.nome || "criança"}. Hiperfoco: ${body.estudante?.hiperfoco || "não informado"}.

Retorne: 1) Nome da brincadeira; 2) Objetivos; 3) Materiais; 4) Passo a passo; 5) Adaptações para inclusão.
Use linguagem simples. NÃO inclua diagnóstico ou CID.`;

  try {
    const texto = await chatCompletionText(engine, [{ role: "user", content: prompt }], { temperature: 0.7 });
    return NextResponse.json({ texto: (texto || "").trim() });
  } catch (e) {
    console.error("Inclusão Brincar:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erro." }, { status: 500 });
  }
}
