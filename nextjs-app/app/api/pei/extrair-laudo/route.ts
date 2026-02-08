import { NextResponse } from "next/server";
import { chatCompletionText, getEngineError, type EngineId } from "@/lib/ai-engines";

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const pdfParse = await import("pdf-parse");
  // pdf-parse pode ser exportado como default ou named export dependendo da versão
  const parseFunction = (pdfParse as any).default || pdfParse;
  const result = await parseFunction(buffer);
  return (result?.text || "").trim();
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const engineRaw = formData.get("engine");
    const engine: EngineId = ["red", "blue", "green", "yellow", "orange"].includes(String(engineRaw || ""))
      ? (engineRaw as EngineId)
      : "red";

    const engineErr = getEngineError(engine);
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
    // Remover markdown code blocks se existirem
    const codeBlock = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlock) jsonStr = codeBlock[1].trim();
    
    // Tentar encontrar JSON no texto mesmo que tenha texto antes/depois
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];
    
    let parsed: {
      diagnostico?: string;
      medicamentos?: { nome?: string; posologia?: string }[];
    };
    
    try {
      parsed = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Erro ao fazer parse do JSON retornado pela IA:", parseError);
      console.error("Texto recebido:", raw.substring(0, 500));
      // Tentar extrair diagnóstico e medicamentos manualmente se o JSON falhar
      const diagnosticoMatch = raw.match(/(?:diagnóstico|diagnostico)[\s:]*([^,\n}]+)/i);
      const medicamentosMatch = raw.match(/(?:medicamentos|medicamento)[\s:]*\[?([^\]]+)\]?/i);
      
      parsed = {
        diagnostico: diagnosticoMatch ? diagnosticoMatch[1].trim() : "",
        medicamentos: medicamentosMatch 
          ? medicamentosMatch[1].split(",").map(m => {
              const parts = m.trim().split(/\s+-\s+/);
              return {
                nome: parts[0] || "",
                posologia: parts[1] || "",
              };
            })
          : [],
      };
    }

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
