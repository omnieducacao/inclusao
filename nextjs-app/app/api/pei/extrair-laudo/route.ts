import { NextResponse } from "next/server";
import OpenAI from "openai";

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  return (result?.text || "").trim();
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) {
    return NextResponse.json(
      { error: "Configure OPENAI_API_KEY no ambiente." },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

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
    const client = new OpenAI({ apiKey });

    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content:
            "Analise este laudo médico/escolar. Extraia: 1) Diagnóstico; 2) Medicamentos. " +
            'Responda em JSON no formato: { "diagnostico": "...", "medicamentos": [ {"nome": "...", "posologia": "..."} ] }. ' +
            `Texto: ${textoLimitado}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const raw = res.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json(
        { error: "A IA não retornou dados válidos." },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(raw) as {
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
