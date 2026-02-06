import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  const apiKey = (process.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Configure OPENAI_API_KEY para gerar o mapa mental (DALL-E)." },
      { status: 500 }
    );
  }

  let body: { texto: string; nome?: string; hiperfoco?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const texto = (body.texto || "").trim();
  if (!texto) {
    return NextResponse.json(
      { error: "Informe o texto da jornada. Gere a jornada primeiro." },
      { status: 400 }
    );
  }

  const nome = (body.nome || "").trim() || "Estudante";
  const resumo = texto.slice(0, 800).replace(/\n/g, " ");

  const prompt = `Create a colorful MIND MAP illustration for an educational gamified journey.
Central node: theme for ${nome}. Branches: missions/stages from the journey. Sub-branches: tasks.
Style: flat vector, educational, clear labels. Colors per branch. Portuguese only. No English.
Content to visualize: ${resumo}`;

  try {
    const client = new OpenAI({ apiKey });
    const resp = await client.images.generate({
      model: "dall-e-3",
      prompt,
      size: "1024x1024",
      quality: "standard",
      n: 1,
      response_format: "b64_json",
    });

    const b64 = (resp.data?.[0] as { b64_json?: string })?.b64_json;
    if (!b64) return NextResponse.json({ error: "Sem imagem na resposta." }, { status: 500 });

    return NextResponse.json({ image: `data:image/png;base64,${b64}` });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao gerar mapa mental." },
      { status: 500 }
    );
  }
}
