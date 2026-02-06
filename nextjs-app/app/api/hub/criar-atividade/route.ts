import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) {
    return NextResponse.json(
      { error: "Configure OPENAI_API_KEY no ambiente." },
      { status: 500 }
    );
  }

  let body: {
    assunto?: string;
    habilidades?: string[];
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
  const estudante = body.estudante || {};
  const ctxEstudante = estudante.nome
    ? `Estudante: ${estudante.nome}. Série: ${estudante.serie || "-"}. Interesses: ${estudante.hiperfoco || "gerais"}.`
    : "";

  const prompt = `Você é um especialista em DUA (Desenho Universal para Aprendizagem) e inclusão.

${ctxEstudante ? `Contexto do estudante: ${ctxEstudante}\n` : ""}
Crie uma atividade pedagógica sobre: **${assunto}**
${habilidades.length > 0 ? `\nHabilidades BNCC a contemplar:\n${habilidades.map((h) => `- ${h}`).join("\n")}` : ""}

Regras:
- Seja didático e acessível.
- Se houver contexto do estudante, adapte a linguagem e os exemplos ao perfil.
- NÃO inclua diagnóstico ou CID em nenhum material.
- Retorne a atividade pronta para uso (enunciados, orientações, se aplicável).`;

  try {
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const texto = completion.choices[0]?.message?.content?.trim() || "";
    return NextResponse.json({ texto });
  } catch (err) {
    console.error("Hub criar-atividade:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao gerar atividade." },
      { status: 500 }
    );
  }
}
