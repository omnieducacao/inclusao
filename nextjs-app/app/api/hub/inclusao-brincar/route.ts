import { NextResponse } from "next/server";
import { chatCompletionText } from "@/lib/ai-engines";
import { selectEngine, withFallback } from "@/lib/engine-selector";

export async function POST(req: Request) {
  let body: { tema?: string; faixa?: string; engine?: string; estudante?: { nome?: string; hiperfoco?: string } };
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

  const prompt = `Especialista em Educação Infantil e INCLUSÃO NO BRINCAR.
Sugira brincadeiras ACESSÍVEIS para: ${body.tema || "brincadeiras em grupo"}.
Faixa etária: ${body.faixa || "3-5 anos"}.
Estudante: ${body.estudante?.nome || "criança"}. Hiperfoco: ${body.estudante?.hiperfoco || "não informado"}.

Retorne: 1) Nome da brincadeira; 2) Objetivos; 3) Materiais; 4) Passo a passo; 5) Adaptações para inclusão.
Use linguagem simples. NÃO inclua diagnóstico ou CID.`;

  try {
    const texto = await withFallback("hub", body.engine, async (selectedEngine) => {
      return await chatCompletionText(selectedEngine, [{ role: "user", content: prompt }], { temperature: 0.7 });
    });
    return NextResponse.json({ texto: (texto || "").trim() });
  } catch (e) {
    console.error("Inclusão Brincar:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erro." }, { status: 500 });
  }
}
