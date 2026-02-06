import { NextResponse } from "next/server";
import { generateImageWithGemini } from "@/lib/gemini-image";
import OpenAI from "openai";
import { selectEngine } from "@/lib/engine-selector";

export async function POST(req: Request) {
  // Mapa mental sempre usa Gemini (yellow)
  const { engine, error: engineErr } = selectEngine("paee_mapa_mental", null, false);
  
  if (engineErr) {
    return NextResponse.json(
      { error: engineErr },
      { status: 500 }
    );
  }

  const geminiKey = (process.env.GEMINI_API_KEY || "").trim();
  const openaiKey = (process.env.OPENAI_API_KEY || "").trim();
  if (!geminiKey && !openaiKey) {
    return NextResponse.json(
      { error: "Configure GEMINI_API_KEY ou OPENAI_API_KEY para gerar o mapa mental." },
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
  const hiperfoco = (body.hiperfoco || "").trim() || "aprendizado";
  const roteiro = texto.slice(0, 4500);

  // Prompt alinhado ao Streamlit (gerar_imagem_jornada_gemini)
  const promptGemini =
    "Crie um MAPA MENTAL rico e visual a partir deste roteiro gamificado. " +
    "REGRA OBRIGATÓRIA PARA O TEXTO: use APENAS palavras e expressões em português que ESTEJAM NO ROTEIRO abaixo. " +
    "Não invente, não distorça e não adicione palavras; extraia os títulos das missões e as tarefas/etapas diretamente do texto. " +
    "Cada rótulo no mapa mental deve ser uma frase ou palavra curta retirada do roteiro (em português). " +
    `Estrutura: (1) Nó central com tema do roteiro${hiperfoco && hiperfoco !== "aprendizado" ? ` (ou tema: ${hiperfoco})` : ""}. (2) Ramos = cada missão (título extraído do roteiro). ` +
    "(3) Sub-ramos = tarefas/etapas de cada missão (texto extraído do roteiro). " +
    "Cores diferentes por ramo, ícones nos nós, linhas centro → missões → etapas. " +
    `Protagonista: ${nome}. ` +
    "Estilo: mapa mental colorido, organizado, fácil de ler. Proporção quadrada (1:1). " +
    "NÃO use inglês. Só português. NÃO invente nem distorça palavras; use somente as que aparecem no roteiro.\n\n" +
    "--- ROTEIRO GAMIFICADO (extraia daqui as palavras para os rótulos do mapa mental) ---\n\n" +
    `${roteiro}\n\n` +
    "--- Fim. Gere o mapa mental usando somente texto em português presente no roteiro acima. ---";

  // 1) Tentar Gemini (como no Streamlit)
  if (geminiKey) {
    try {
      const b64 = await generateImageWithGemini(promptGemini, {
        apiKey: geminiKey,
        timeoutMs: 90_000,
      });
      return NextResponse.json({ image: `data:image/png;base64,${b64}` });
    } catch (err) {
      console.error("PAEE mapa mental (Gemini):", err);
      // Fallback para DALL-E se houver chave OpenAI
      if (!openaiKey) {
        return NextResponse.json(
          { error: err instanceof Error ? err.message : "Erro ao gerar mapa mental com Gemini." },
          { status: 500 }
        );
      }
    }
  }

  // 2) Fallback DALL-E
  if (!openaiKey) {
    return NextResponse.json(
      { error: "Configure OPENAI_API_KEY para gerar o mapa mental (fallback)." },
      { status: 500 }
    );
  }

  const resumo = texto.slice(0, 800).replace(/\n/g, " ");
  const promptDalle = `Create a colorful MIND MAP illustration for an educational gamified journey.
Central node: theme for ${nome}. Branches: missions/stages from the journey. Sub-branches: tasks.
Style: flat vector, educational, clear labels. Colors per branch. Portuguese only. No English.
Content to visualize: ${resumo}`;

  try {
    const client = new OpenAI({ apiKey: openaiKey });
    const resp = await client.images.generate({
      model: "dall-e-3",
      prompt: promptDalle,
      size: "1024x1024",
      quality: "standard",
      n: 1,
      response_format: "b64_json",
    });

    const b64 = (resp.data?.[0] as { b64_json?: string })?.b64_json;
    if (!b64) return NextResponse.json({ error: "Sem imagem na resposta." }, { status: 500 });

    return NextResponse.json({ image: `data:image/png;base64,${b64}` });
  } catch (err) {
    console.error("PAEE mapa mental (DALL-E):", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao gerar mapa mental." },
      { status: 500 }
    );
  }
}
