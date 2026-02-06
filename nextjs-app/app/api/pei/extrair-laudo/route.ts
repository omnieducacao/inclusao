import { NextResponse } from "next/server";
import { chatCompletionText } from "@/lib/ai-engines";
import { selectEngine } from "@/lib/engine-selector";

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  return (result?.text || "").trim();
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    // Extrair laudo sempre usa ChatGPT (orange), sem opções
    const { engine, error: engineErr } = selectEngine("extrair_laudo", null, false);
    
    if (engineErr) {
      return NextResponse.json({ error: engineErr }, { status: 500 });
    }

    if (!file || !file.size) {
      return NextResponse.json(
        { error: "Envie um arquivo PDF." },
        { status: 400 }
      );
    }

    const buf = Buffer.from(await file.arrayBuffer());
    let textoPdf = "";

    try {
      textoPdf = await extractTextFromPdf(buf);
    } catch (err) {
      console.error("Erro ao extrair texto do PDF:", err);
      return NextResponse.json(
        { error: "Não foi possível extrair texto do PDF. Verifique se o arquivo é um PDF válido." },
        { status: 400 }
      );
    }

    if (!textoPdf || textoPdf.length < 50) {
      return NextResponse.json(
        { error: "O PDF está vazio ou não contém texto legível." },
        { status: 400 }
      );
    }

    const textoLimitado = textoPdf.slice(0, 6000);
    const prompt =
      "Analise este laudo médico/escolar. Extraia: 1) Diagnóstico; 2) Medicamentos. " +
      'Responda APENAS em JSON, sem markdown: { "diagnostico": "...", "medicamentos": [ {"nome": "...", "posologia": "..."} ] }. ' +
      `Texto: ${textoLimitado}`;

    const raw = (await chatCompletionText(engine, [{ role: "user", content: prompt }], { temperature: 0.2 })).trim();
    if (!raw) {
      return NextResponse.json(
        { error: "A IA não retornou dados válidos." },
        { status: 500 }
      );
    }

    let jsonStr = raw;
    const codeBlock = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlock) jsonStr = codeBlock[1].trim();
    const parsed = JSON.parse(jsonStr) as {
      diagnostico?: string;
      medicamentos?: { nome?: string; posologia?: string }[];
    };

    return NextResponse.json({
      diagnostico: parsed.diagnostico || "",
      medicamentos: Array.isArray(parsed.medicamentos)
        ? parsed.medicamentos.map((m) => ({
            nome: String(m.nome || "").trim(),
            posologia: String(m.posologia || "").trim(),
          }))
        : [],
    });
  } catch (err) {
    console.error("Erro extrair-laudo:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao processar laudo." },
      { status: 500 }
    );
  }
}
