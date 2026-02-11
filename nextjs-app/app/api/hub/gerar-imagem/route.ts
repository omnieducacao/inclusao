import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { gerarImagemInteligente, baixarImagemUrl } from "@/lib/hub-images";

export async function POST(req: Request) {
  const rl = rateLimitResponse(req, RATE_LIMITS.AI_IMAGE); if (rl) return rl;
  let body: { prompt: string; prioridade?: "BANCO" | "IA" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const { prompt, prioridade = "BANCO" } = body;
  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Informe o prompt." }, { status: 400 });
  }

  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY || "";
  const geminiKey = process.env.GEMINI_API_KEY || "";

  try {
    // Prioridade: BANCO (Unsplash) primeiro; Gemini só em último caso
    let urlOuBase64 = await gerarImagemInteligente(prompt, prioridade, unsplashKey, geminiKey);
    
    // Se não encontrou no banco e prioridade era BANCO, tenta Gemini
    if (!urlOuBase64 && prioridade === "BANCO") {
      urlOuBase64 = await gerarImagemInteligente(prompt, "IA", unsplashKey, geminiKey);
    }
    
    if (!urlOuBase64) {
      return NextResponse.json({ error: "Não foi possível gerar a imagem." }, { status: 500 });
    }

    // Se for URL, baixa e converte para base64
    if (urlOuBase64.startsWith("http")) {
      const base64 = await baixarImagemUrl(urlOuBase64);
      if (!base64) {
        return NextResponse.json({ error: "Erro ao baixar imagem." }, { status: 500 });
      }
      return NextResponse.json({ image: base64 });
    }

    // Já é base64
    return NextResponse.json({ image: urlOuBase64 });
  } catch (err) {
    console.error("Erro ao gerar imagem:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao gerar imagem." },
      { status: 500 }
    );
  }
}
