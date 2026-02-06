import { NextResponse } from "next/server";
import { chatCompletionText, getEngineError } from "@/lib/ai-engines";
import type { EngineId } from "@/lib/ai-engines";

export async function POST(req: Request) {
  let body: { contexto?: string; sequencia?: string; engine?: string; estudante?: { nome?: string } };
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

  const prompt = `Especialista em Educação Infantil e AVD (Atividades de Vida Diária).
Crie sequências visuais e orientações para ROTINA E AUTONOMIA.
Contexto: ${body.contexto || "Rotina escolar"}. Sequência solicitada: ${body.sequencia || "Rotina de chegada"}.
Estudante: ${body.estudante?.nome || "criança"}.

Retorne: 1) Passo a passo numerado e ilustrativo; 2) Dicas de mediação; 3) Adaptações possíveis.
Use linguagem simples. NÃO inclua diagnóstico ou CID.`;

  try {
    const texto = await chatCompletionText(engine, [{ role: "user", content: prompt }], { temperature: 0.7 });
    return NextResponse.json({ texto: (texto || "").trim() });
  } catch (e) {
    console.error("Rotina AVD:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erro." }, { status: 500 });
  }
}
