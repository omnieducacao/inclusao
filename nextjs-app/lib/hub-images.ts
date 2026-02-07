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
    const resp = await fetch(url, { timeout: 5000 });
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
 * 2. IA (DALL-E/Gemini) se prioridade="IA"
 * 3. Fallback para Unsplash se IA falhar
 * 
 * Retorna URL da imagem ou null
 */
export async function gerarImagemInteligente(
  prompt: string,
  prioridade: "BANCO" | "IA" = "IA",
  unsplashKey?: string,
  openaiKey?: string
): Promise<string | null> {
  // Se prioridade é BANCO, tenta Unsplash primeiro
  if (prioridade === "BANCO" && unsplashKey) {
    const termo = prompt.split(".")[0] || prompt;
    const urlBanco = await buscarImagemUnsplash(termo, unsplashKey);
    if (urlBanco) {
      return urlBanco;
    }
  }

  // Se prioridade é IA ou BANCO não retornou, tenta IA
  if (prioridade === "IA" && openaiKey) {
    try {
      // Importar OpenAI dinamicamente para uso no servidor
      const OpenAI = (await import("openai")).default;
      const client = new OpenAI({ apiKey: openaiKey });
      
      const didacticPrompt = `Educational textbook illustration, clean flat vector style, white background. CRITICAL RULE: STRICTLY NO TEXT, NO TYPOGRAPHY, NO ALPHABET, NO NUMBERS, NO LABELS inside the image. Just the visual representation of: ${prompt}`;
      
      const resp = await client.images.generate({
        model: "dall-e-3",
        prompt: didacticPrompt,
        size: "1024x1024",
        quality: "standard",
        n: 1,
        response_format: "b64_json",
      });

      if (resp.data && resp.data.length > 0 && "b64_json" in resp.data[0]) {
        const b64 = resp.data[0].b64_json;
        if (b64) {
          return `data:image/png;base64,${b64}`;
        }
      }
    } catch (error) {
      console.error("Erro ao gerar imagem IA:", error);
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
 * Baixa imagem de uma URL e retorna como base64
 */
export async function baixarImagemUrl(url: string): Promise<string | null> {
  try {
    const resp = await fetch(url, { timeout: 10000 });
    if (!resp.ok) return null;
    
    const blob = await resp.blob();
    const reader = new FileReader();
    
    return new Promise((resolve) => {
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Erro ao baixar imagem:", error);
    return null;
  }
}
