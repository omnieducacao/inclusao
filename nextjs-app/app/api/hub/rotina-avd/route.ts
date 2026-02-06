import { NextResponse } from "next/server";
import { chatCompletionText } from "@/lib/ai-engines";
import { selectEngine, withFallback } from "@/lib/engine-selector";

export async function POST(req: Request) {
  let body: { contexto?: string; sequencia?: string; engine?: string; estudante?: { nome?: string } };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }
  
  // Hub: DeepSeek (red) padrão, opções Kimi (blue) e Claude (green)
  const { engine, error: engineErr } = selectEngine("hub", body.engine, true);
  
  if (engineErr) {
    return NextResponse.json({ error: engineErr }, { status: 500 });
  }

  const prompt = `Especialista em Educação Infantil e AVD (Atividades de Vida Diária).
Crie sequências visuais e orientações para ROTINA E AUTONOMIA.
Contexto: ${body.contexto || "Rotina escolar"}. Sequência solicitada: ${body.sequencia || "Rotina de chegada"}.
Estudante: ${body.estudante?.nome || "criança"}.

Retorne: 1) Passo a passo numerado e ilustrativo; 2) Dicas de mediação; 3) Adaptações possíveis.
Use linguagem simples. NÃO inclua diagnóstico ou CID.`;

  try {
    const texto = await withFallback("hub", body.engine, async (selectedEngine) => {
      return await chatCompletionText(selectedEngine, [{ role: "user", content: prompt }], { temperature: 0.7 });
    });
    return NextResponse.json({ texto: (texto || "").trim() });
  } catch (e) {
    console.error("Rotina AVD:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erro." }, { status: 500 });
  }
}
