import { NextResponse } from "next/server";
import { visionAdapt, getVisionError, getVisionApiKey, chatCompletionText, type EngineId } from "@/lib/ai-engines";
import { adaptarPromptAtividade } from "@/lib/hub-prompts";
import { garantirTagImagem } from "@/lib/hub-utils";
import { comprimirArquivoImagem } from "@/lib/image-compression";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4MB
const MAX_VISION_BYTES = 3 * 1024 * 1024; // 3MB (limite para APIs de visão)

export async function POST(req: Request) {
  const err = getVisionError();
  if (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }

  let imagemBase64 = "";
  let imagemSeparadaBase64: string | null = null;
  let mime = "image/jpeg";
  let materia = "Geral";
  let tema = "Geral";
  let tipo = "Atividade";
  let livroProfessor = false;
  let checklist: Record<string, boolean> = {};
  let estudante: { nome?: string; hiperfoco?: string; perfil?: string } = {};
  let modoProfundo = false;
  let engine: EngineId = "red";
  let unidadeTematica = "";
  let objetoConhecimento = "";

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const fileSeparado = formData.get("file_separado") as File | null;
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
        unidadeTematica = parsed.unidade_tematica || "";
        objetoConhecimento = parsed.objeto_conhecimento || "";
        estudante = parsed.estudante || {};
        modoProfundo = !!parsed.modo_profundo;
        if (["red", "blue", "green", "yellow", "orange"].includes(parsed.engine || "")) {
          engine = parsed.engine as EngineId;
        }
      } catch {
        // ignore
      }
    }

    // Comprimir imagem principal se necessário (importante para prints de tela grandes)
    const compressedBuffer = await comprimirArquivoImagem(file, MAX_VISION_BYTES);
    if (compressedBuffer.length > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "Imagem muito grande mesmo após compressão. Use até 4MB." },
        { status: 400 }
      );
    }
    imagemBase64 = compressedBuffer.toString("base64");
    mime = file.type || "image/jpeg";

    // Processar imagem separada (Passo 2) se houver
    if (fileSeparado && fileSeparado.size) {
      // Comprimir imagem separada também
      const compressedBufferSep = await comprimirArquivoImagem(fileSeparado, MAX_VISION_BYTES);
      if (compressedBufferSep.length > MAX_IMAGE_BYTES) {
        return NextResponse.json(
          { error: "Imagem separada muito grande mesmo após compressão. Use até 4MB." },
          { status: 400 }
        );
      }
      imagemSeparadaBase64 = compressedBufferSep.toString("base64");
    }
  } catch (err) {
    console.error("Adaptar Atividade parse:", err);
    return NextResponse.json(
      { error: "Erro ao processar imagem." },
      { status: 400 }
    );
  }

  const temImagemSeparada = !!imagemSeparadaBase64;

  // Usar prompt do arquivo separado (idêntico ao Streamlit)
  const prompt = adaptarPromptAtividade({
    aluno: {
      nome: estudante.nome || "",
      ia_sugestao: estudante.perfil || "",
      hiperfoco: estudante.hiperfoco || "Geral",
    },
    materia,
    tema,
    tipo_atv: tipo,
    livro_professor: livroProfessor,
    modo_profundo: modoProfundo,
    checklist_adaptacao: checklist,
    imagem_separada: temImagemSeparada,
    unidade_tematica: unidadeTematica,
    objeto_conhecimento: objetoConhecimento,
  });

  try {
    // Usar Gemini diretamente para suportar múltiplas imagens quando necessário
    const v = getVisionApiKey();
    if (!v) throw new Error(getVisionError() || "Chave de visão não configurada.");

    let fullText: string;

    if (v.engine === "yellow" && temImagemSeparada && imagemSeparadaBase64) {
      // Gemini suporta múltiplas imagens no mesmo request
      try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(v.key);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        const contents = [
          { text: prompt },
          {
            inlineData: {
              data: imagemBase64,
              mimeType: mime || "image/jpeg",
            },
          },
          { text: "IMAGEM RECORTADA SEPARADAMENTE PELO PROFESSOR (use tag [[IMG_2]] para inserir no local apropriado):" },
          {
            inlineData: {
              data: imagemSeparadaBase64,
              mimeType: mime || "image/jpeg",
            },
          },
        ];
        
        const result = await model.generateContent(contents);
        fullText = (result.response.text() || "").trim();
      } catch (geminiError) {
        console.error("Erro ao usar Gemini com múltiplas imagens, tentando fallback OpenAI:", geminiError);
        // Fallback: usar OpenAI gpt-4o que também suporta múltiplas imagens
        const openaiKeyRaw = process.env.OPENAI_API_KEY || "";
        if (openaiKeyRaw.startsWith("sk-or-")) {
          throw new Error(
            "OPENAI_API_KEY está configurada com uma chave do OpenRouter (sk-or-...). " +
            "Configure uma chave válida do OpenAI (sk-...) para usar visão com múltiplas imagens."
          );
        }
        const openaiKey = openaiKeyRaw.trim();
        if (openaiKey) {
          try {
            const OpenAI = (await import("openai")).default;
            const client = new OpenAI({ apiKey: openaiKey });
            const completion = await client.chat.completions.create({
              model: "gpt-4o",
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "text", text: prompt },
                    { type: "image_url", image_url: { url: `data:${mime};base64,${imagemBase64}` } },
                    { type: "text", text: "IMAGEM RECORTADA SEPARADAMENTE PELO PROFESSOR (use tag [[IMG_2]] para inserir no local apropriado):" },
                    { type: "image_url", image_url: { url: `data:${mime};base64,${imagemSeparadaBase64}` } },
                  ],
                },
              ],
              max_tokens: 4096,
              temperature: 0.4,
            });
            fullText = (completion.choices[0]?.message?.content || "").trim();
          } catch (openaiError) {
            console.error("Erro ao usar OpenAI como fallback:", openaiError);
            throw new Error(`Erro ao processar imagens: ${geminiError instanceof Error ? geminiError.message : String(geminiError)}`);
          }
        } else {
          throw new Error(`Gemini falhou e OpenAI não está configurado: ${geminiError instanceof Error ? geminiError.message : String(geminiError)}`);
        }
      }
    } else {
      // Usar visionAdapt padrão (uma imagem)
      fullText = await visionAdapt(prompt, imagemBase64, mime);
    }
    
    let analise = "Análise indisponível.";
    let atividade = fullText;

    if (fullText.includes("---DIVISOR---")) {
      const parts = fullText.split("---DIVISOR---");
      analise = parts[0].replace("[ANÁLISE PEDAGÓGICA]", "").trim();
      atividade = parts[1].replace("[ATIVIDADE]", "").trim();
    }

    // Aplicar garantir_tag_imagem se houver imagem separada (Passo 2)
    if (temImagemSeparada) {
      atividade = garantirTagImagem(atividade, "IMG_2");
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
