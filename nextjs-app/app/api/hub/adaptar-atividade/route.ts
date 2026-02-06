import { NextResponse } from "next/server";
import OpenAI from "openai";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4MB para gpt-4o

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) {
    return NextResponse.json(
      { error: "Configure OPENAI_API_KEY no ambiente." },
      { status: 500 }
    );
  }

  let imagemBase64 = "";
  let materia = "Geral";
  let tema = "Geral";
  let tipo = "Atividade";
  let livroProfessor = false;
  let checklist: Record<string, boolean> = {};
  let estudante: { hiperfoco?: string; perfil?: string } = {};

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const meta = formData.get("meta") as string | null;

    if (!file || !file.size) {
      return NextResponse.json(
        { error: "Envie uma imagem (PNG, JPG ou JPEG)." },
        { status: 400 }
      );
    }

    if (meta) {
      try {
        const parsed = JSON.parse(meta);
        materia = parsed.materia || materia;
        tema = parsed.tema || tema;
        tipo = parsed.tipo || tipo;
        livroProfessor = !!parsed.livro_professor;
        checklist = parsed.checklist || {};
        estudante = parsed.estudante || {};
      } catch {
        // ignore
      }
    }

    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);
    if (bytes.length > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "Imagem muito grande. Use até 4MB." },
        { status: 400 }
      );
    }
    imagemBase64 = Buffer.from(bytes).toString("base64");
    const mime = file.type || "image/jpeg";
  } catch (err) {
    console.error("Adaptar Atividade parse:", err);
    return NextResponse.json(
      { error: "Erro ao processar imagem." },
      { status: 400 }
    );
  }

  const necessidades: string[] = [];
  if (checklist.questoes_desafiadoras) necessidades.push("Aumentar o nível de desafio");
  else necessidades.push("Manter ou reduzir a dificuldade");
  if (!checklist.compreende_instrucoes_complexas) necessidades.push("Simplificar instruções");
  if (checklist.instrucoes_passo_a_passo) necessidades.push("Instruções passo a passo");
  if (checklist.dividir_em_etapas) necessidades.push("Dividir em etapas menores");
  if (checklist.paragrafos_curtos) necessidades.push("Parágrafos curtos");
  if (checklist.dicas_apoio) necessidades.push("Dicas de apoio");
  if (!checklist.compreende_figuras_linguagem) necessidades.push("Reduzir figuras de linguagem");
  if (checklist.descricao_imagens) necessidades.push("Descrição detalhada de imagens");

  const instrucoesChecklist =
    necessidades.length > 0
      ? `\nCHECKLIST: ${necessidades.join("; ")}\nAplique as adaptações de forma pontual.`
      : "";

  const hiperfoco = estudante.hiperfoco || "Geral";
  const perfil = (estudante.perfil || "").slice(0, 600);
  const instrucaoLivro = livroProfessor
    ? "ATENÇÃO: Imagem com respostas. Remova todo gabarito/respostas."
    : "";

  const prompt = `ATUAR COMO: Especialista em Acessibilidade e OCR.
1. Transcreva o texto da imagem. ${instrucaoLivro}
2. Adapte para o estudante. Perfil (PEI): ${perfil}
3. HIPERFOCO (${hiperfoco}): Use o hiperfoco do estudante quando possível.
${instrucoesChecklist}

SAÍDA OBRIGATÓRIA (Use EXATAMENTE este divisor):
[ANÁLISE PEDAGÓGICA]
...análise breve...
---DIVISOR---
[ATIVIDADE]
...atividade adaptada...

CONTEXTO: ${materia} | ${tema} | ${tipo}`;

  try {
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imagemBase64}`,
              },
            },
            { type: "text", text: prompt },
          ],
        },
      ],
      max_tokens: 4096,
      temperature: 0.4,
    });

    const fullText = (completion.choices[0]?.message?.content || "").trim();
    let analise = "Análise indisponível.";
    let atividade = fullText;

    if (fullText.includes("---DIVISOR---")) {
      const parts = fullText.split("---DIVISOR---");
      analise = parts[0].replace("[ANÁLISE PEDAGÓGICA]", "").trim();
      atividade = parts[1].replace("[ATIVIDADE]", "").trim();
    }

    return NextResponse.json({ analise, texto: atividade });
  } catch (err) {
    console.error("Adaptar Atividade IA:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao adaptar." },
      { status: 500 }
    );
  }
}
