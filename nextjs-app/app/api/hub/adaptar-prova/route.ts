import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { chatCompletionText, getEngineError, type EngineId } from "@/lib/ai-engines";
import { adaptarPromptProva } from "@/lib/hub-prompts";

export async function POST(req: Request) {
  let texto = "";
  let materia = "Geral";
  let tema = "Geral";
  let tipo = "Prova";
  let checklist: Record<string, boolean> = {};
  let estudante: { hiperfoco?: string; perfil?: string } = {};
  let engine: EngineId = "red";
  let modoProfundo = false;
  let questoesComImagem: number[] = [];
  let unidadeTematica = "";
  let objetoConhecimento = "";

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const meta = formData.get("meta") as string | null;
    if (meta) {
      try {
        const parsed = JSON.parse(meta);
        materia = parsed.materia || materia;
        tema = parsed.tema || tema;
        tipo = parsed.tipo || tipo;
        checklist = parsed.checklist || {};
        estudante = parsed.estudante || {};
        modoProfundo = !!parsed.modo_profundo;
        unidadeTematica = parsed.unidade_tematica || "";
        objetoConhecimento = parsed.objeto_conhecimento || "";
        if (Array.isArray(parsed.questoes_com_imagem)) {
          questoesComImagem = parsed.questoes_com_imagem.filter((n: unknown) => typeof n === "number");
        }
        if (typeof parsed.texto === "string" && parsed.texto.length > 20) {
          texto = parsed.texto;
        }
        if (parsed.engine && ["red", "blue", "green", "yellow", "orange"].includes(parsed.engine)) {
          engine = parsed.engine;
        }
      } catch {
        // ignore
      }
    }

    if (!texto) {
      if (!file || !file.size) {
        return NextResponse.json(
          { error: "Envie um arquivo DOCX." },
          { status: 400 }
        );
      }
      const buf = Buffer.from(await file.arrayBuffer());
      const result = await mammoth.extractRawText({ buffer: buf });
      texto = (result.value || "").trim();
    }
    if (!texto || texto.length < 20) {
      return NextResponse.json(
        { error: "Não foi possível extrair texto do DOCX ou arquivo vazio." },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error("Adaptar Prova parse:", err);
    return NextResponse.json(
      { error: "Erro ao processar arquivo." },
      { status: 400 }
    );
  }

  // Usar prompt do arquivo separado (idêntico ao Streamlit)
  const prompt = adaptarPromptProva({
    aluno: {
      nome: estudante.nome || "",
      ia_sugestao: estudante.perfil || "",
      hiperfoco: estudante.hiperfoco || "Geral",
    },
    texto,
    materia,
    tema,
    tipo_atv: tipo,
    remover_resp: true, // Sempre remover respostas em adaptar-prova
    questoes_mapeadas: questoesComImagem.length > 0 ? questoesComImagem : [],
    modo_profundo: modoProfundo,
    checklist_adaptacao: checklist,
    questoes_com_imagem: questoesComImagem,
    unidade_tematica: unidadeTematica,
    objeto_conhecimento: objetoConhecimento,
  });

  const engineErr = getEngineError(engine);
  if (engineErr) {
    return NextResponse.json({ error: engineErr }, { status: 500 });
  }

  try {
    const fullText = await chatCompletionText(
      engine,
      [{ role: "user", content: prompt }],
      { temperature: modoProfundo ? 0.7 : 0.4 }
    );
    let analise = "Análise indisponível.";
    let atividade = fullText;

    if (fullText.includes("---DIVISOR---")) {
      const parts = fullText.split("---DIVISOR---");
      analise = parts[0].replace("[ANÁLISE PEDAGÓGICA]", "").trim();
      atividade = parts[1].replace("[ATIVIDADE]", "").trim();
    }

    return NextResponse.json({ analise, texto: atividade });
  } catch (err) {
    console.error("Adaptar Prova IA:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao adaptar." },
      { status: 500 }
    );
  }
}
