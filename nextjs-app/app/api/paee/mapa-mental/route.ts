import { parseBody, paeeMapaMentalSchema } from "@/lib/validation";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/permissions";

export async function POST(req: Request) {
  const { error: authError } = await requireAuth(); if (authError) return authError;
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Configure GEMINI_API_KEY para gerar o mapa mental. A geração usa Yellow (Gemini)." },
      { status: 500 }
    );
  }

  const parsed = await parseBody(req, paeeMapaMentalSchema);
  if (parsed.error) return parsed.error;
  const body = parsed.data;

  const texto = (body.texto || "").trim();
  if (!texto) {
    return NextResponse.json(
      { error: "Informe o texto da jornada. Gere a jornada primeiro." },
      { status: 400 }
    );
  }

  const nome = (body.nome || "").trim() || "estudante";
  const hiperfoco = (body.hiperfoco || "").trim() || "aprendizado";
  const roteiro = texto.slice(0, 4500);

  const prompt = `Crie um MAPA MENTAL rico e visual a partir deste roteiro gamificado.
REGRA OBRIGATÓRIA PARA O TEXTO: use APENAS palavras e expressões em português que ESTEJAM NO ROTEIRO abaixo.
Não invente, não distorça e não adicione palavras; extraia os títulos das missões e as tarefas/etapas diretamente do texto.
Cada rótulo no mapa mental deve ser uma frase ou palavra curta retirada do roteiro (em português).
Estrutura: (1) Nó central com tema do roteiro${hiperfoco && hiperfoco !== "aprendizado" ? ` (ou tema: ${hiperfoco})` : ""}. (2) Ramos = cada missão (título extraído do roteiro).
(3) Sub-ramos = tarefas/etapas de cada missão (texto extraído do roteiro).
Cores diferentes por ramo, ícones nos nós, linhas centro → missões → etapas.
Protagonista: ${nome}.
Estilo: mapa mental colorido, organizado, fácil de ler. Proporção quadrada (1:1).
NÃO use inglês. Só português. NÃO invente nem distorça palavras; use somente as que aparecem no roteiro.

--- ROTEIRO GAMIFICADO (extraia daqui as palavras para os rótulos do mapa mental) ---

${roteiro}

--- Fim. Gere o mapa mental usando somente texto em português presente no roteiro acima. ---`;

  try {
    // Usar @google/generative-ai (mesma biblioteca usada em ai-engines.ts)
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);

    // Para geração de imagens, precisamos usar a API REST diretamente ou a biblioteca google/genai
    // Por enquanto, vamos usar uma abordagem via fetch para a API REST do Gemini
    const models = ["gemini-3-pro-image-preview", "gemini-2.5-flash-image"];
    let lastError: Error | null = null;

    for (const modelId of models) {
      try {
        // Usar a API REST do Gemini para geração de imagens
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        });

        if (!response.ok) {
          if (response.status === 404) {
            continue; // Tentar próximo modelo
          }
          const errorText = await response.text();
          throw new Error(`API retornou ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        // Extrair imagem da resposta
        const candidates = data.candidates || [];
        if (candidates.length > 0) {
          const candidate = candidates[0];
          const content = candidate.content || {};
          const parts = content.parts || [];

          for (const part of parts) {
            if (part.inlineData) {
              const b64 = part.inlineData.data;
              return NextResponse.json({ image: `data:image/png;base64,${b64}` });
            }
          }
        }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        const errStr = String(err).toLowerCase();
        if (errStr.includes("404") || errStr.includes("not found")) {
          continue; // Tentar próximo modelo
        }
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    // Se chegou aqui, nenhum modelo funcionou
    throw lastError || new Error("Nenhum modelo de imagem disponível. Verifique se GEMINI_API_KEY está configurada corretamente.");
  } catch (err) {
    console.error("Erro ao gerar mapa mental com Gemini:", err);
    const errMsg = err instanceof Error ? err.message : String(err);
    if (errMsg.includes("API key not valid") || errMsg.includes("API_KEY_INVALID") || errMsg.includes("INVALID_ARGUMENT") || errMsg.includes("401")) {
      return NextResponse.json(
        {
          error:
            "A API rejeitou a chave Gemini. Confira: (1) Chave criada em aistudio.google.com/apikey (não use chave do Google Cloud Console nem da OpenAI). (2) Nome no .env: GEMINI_API_KEY.",
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: errMsg || "Erro ao gerar mapa mental. Configure GEMINI_API_KEY." },
      { status: 500 }
    );
  }
}
