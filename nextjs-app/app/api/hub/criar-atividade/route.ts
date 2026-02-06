import { NextResponse } from "next/server";
import { chatCompletionText, getEngineError, type EngineId } from "@/lib/ai-engines";

export async function POST(req: Request) {
  let body: {
    assunto?: string;
    engine?: string;
    habilidades?: string[];
    ei_mode?: boolean;
    ei_idade?: string;
    ei_campo?: string;
    ei_objetivos?: string[];
    estudante?: { nome?: string; serie?: string; hiperfoco?: string };
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const assunto = (body.assunto || "").trim();
  if (!assunto) {
    return NextResponse.json({ error: "Informe o assunto." }, { status: 400 });
  }

  const habilidades = body.habilidades || [];
  const eiMode = !!body.ei_mode;
  const eiObjetivos = body.ei_objetivos || [];
  const estudante = body.estudante || {};
  const engine: EngineId = ["red", "blue", "green", "yellow", "orange"].includes(body.engine || "")
    ? (body.engine as EngineId)
    : "red";
  const ctxEstudante = estudante.nome
    ? `Estudante: ${estudante.nome}. Série: ${estudante.serie || "-"}. Interesses: ${estudante.hiperfoco || "gerais"}.`
    : "";

  const habParaPrompt = eiMode ? eiObjetivos : habilidades;
  const prompt = `Você é um especialista em DUA (Desenho Universal para Aprendizagem) e inclusão.
${eiMode ? "Modo EDUCAÇÃO INFANTIL: use linguagem lúdica, atividades sensoriais e brincadeiras. Campos de experiência e objetivos BNCC EI." : ""}

${ctxEstudante ? `Contexto do estudante: ${ctxEstudante}\n` : ""}
Crie uma atividade pedagógica sobre: **${assunto}**
${eiMode && body.ei_idade ? `Faixa de idade: ${body.ei_idade}. Campo de experiência: ${body.ei_campo || "-"}.\n` : ""}
${habParaPrompt.length > 0 ? `\n${eiMode ? "Objetivos de Aprendizagem" : "Habilidades BNCC"} a contemplar:\n${habParaPrompt.map((h) => `- ${h}`).join("\n")}` : ""}

Regras:
- Seja didático e acessível.
- Se houver contexto do estudante, adapte a linguagem e os exemplos ao perfil.
- NÃO inclua diagnóstico ou CID em nenhum material.
- Retorne a atividade pronta para uso (enunciados, orientações, se aplicável).`;

  const engineErr = getEngineError(engine);
  if (engineErr) return NextResponse.json({ error: engineErr }, { status: 500 });

  try {
    const texto = await chatCompletionText(engine, [{ role: "user", content: prompt }], { temperature: 0.7 });
    return NextResponse.json({ texto });
  } catch (err) {
    console.error("Hub criar-atividade:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao gerar atividade." },
      { status: 500 }
    );
  }
}
