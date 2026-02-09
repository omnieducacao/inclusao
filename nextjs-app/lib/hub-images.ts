/**
 * Serviço de Geração de Imagens para o Hub
 * Baseado em services/hub_ia.py do Streamlit
 * Prioridade: BANCO (Unsplash) primeiro, depois IA (DALL-E/Gemini)
 */

/**
 * Busca imagem no Unsplash (banco de imagens)
 * Retorna URL da imagem ou null
 */
export async function buscarImagemUnsplash(
  query: string,
  accessKey: string
): Promise<string | null> {
  if (!accessKey?.trim()) {
    return null;
  }

  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&client_id=${accessKey}&lang=pt`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const resp = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!resp.ok) return null;
    
    const data = await resp.json();
    if (data?.results && data.results.length > 0) {
      return data.results[0].urls?.regular || null;
    }
  } catch (error) {
    console.error("Erro ao buscar imagem Unsplash:", error);
  }
  
  return null;
}

/**
 * Gera imagem inteligente com prioridade:
 * 1. BANCO (Unsplash) se prioridade="BANCO"
 * 2. IA (Gemini) se prioridade="IA"
 * 3. Fallback para Unsplash se IA falhar
 * 
 * Retorna URL da imagem ou base64
 */
export async function gerarImagemInteligente(
  prompt: string,
  prioridade: "BANCO" | "IA" = "IA",
  unsplashKey?: string,
  geminiKey?: string
): Promise<string | null> {
  // Se prioridade é BANCO, tenta Unsplash primeiro
  if (prioridade === "BANCO" && unsplashKey) {
    const termo = prompt.split(".")[0] || prompt;
    const urlBanco = await buscarImagemUnsplash(termo, unsplashKey);
    if (urlBanco) {
      return urlBanco;
    }
  }

  // Se prioridade é IA ou BANCO não retornou, tenta Gemini
  if (prioridade === "IA" && geminiKey) {
    try {
      // Usar Gemini para geração de imagens via API REST
      const models = ["gemini-2.5-flash-image", "gemini-3-pro-image-preview"];
      let lastError: Error | null = null;

      const didacticPrompt = `Educational textbook illustration, clean flat vector style, white background. CRITICAL RULE: STRICTLY NO TEXT, NO TYPOGRAPHY, NO ALPHABET, NO NUMBERS, NO LABELS inside the image. Just the visual representation of: ${prompt}`;

      for (const modelId of models) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${geminiKey}`;
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: didacticPrompt }] }],
            }),
          });

          if (!response.ok) {
            if (response.status === 404) {
              continue; // Tentar próximo modelo
            }
            const errorText = await response.text();
            let errorMessage = `API retornou ${response.status}: ${errorText}`;
            
            // Melhorar mensagem de erro para chave inválida
            if (response.status === 400 && errorText.includes("API key not valid")) {
              errorMessage = "GEMINI_API_KEY não é válida. Verifique se a chave está correta no Render e se tem permissões para geração de imagens.";
            }
            
            throw new Error(errorMessage);
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
                return `data:image/png;base64,${b64}`;
              }
            }
          }
        } catch (err: any) {
          const errStr = String(err).toLowerCase();
          if (errStr.includes("404") || errStr.includes("not found")) {
            lastError = err;
            continue; // Tentar próximo modelo
          }
          throw err;
        }
      }

      if (lastError) {
        throw lastError;
      }
    } catch (error) {
      console.error("Erro ao gerar imagem com Gemini:", error);
    }

    // Fallback para Unsplash se IA falhar
    if (unsplashKey) {
      const termo = prompt.split(".")[0] || prompt;
      return await buscarImagemUnsplash(termo, unsplashKey);
    }
  }

  return null;
}

/**
 * Baixa imagem de uma URL e retorna como base64 (funciona no servidor)
 */
export async function baixarImagemUrl(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const resp = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!resp.ok) {
      console.error(`Erro ao baixar imagem de ${url}: ${resp.status} ${resp.statusText}`);
      return null;
    }
    
    // No servidor, usar arrayBuffer e converter para base64
    const arrayBuffer = await resp.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const mimeType = resp.headers.get("content-type") || "image/jpeg";
    
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error("Erro ao baixar imagem:", error);
    return null;
  }
}
