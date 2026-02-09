import { NextResponse } from "next/server";
import { chatCompletionText, getEngineError, type EngineId } from "@/lib/ai-engines";

/**
 * Extrai texto do PDF usando pdfjs-dist (página por página, como o Streamlit faz com pypdf).
 * Versão server-side sem worker - compatível com Next.js e Render.
 */
async function extractTextFromPdf(buffer: Buffer, maxPages: number = 6): Promise<string> {
  // Importar pdfjs-dist sem worker (server-side)
  // Usar import dinâmico para evitar problemas de build
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfjsModule = await import("pdfjs-dist/legacy/build/pdf.mjs");
  // O módulo pdfjs-dist/legacy/build/pdf.mjs pode exportar como default ou named exports
  // Usar acesso via string para evitar erro de TypeScript no build
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfjs: any = (pdfjsModule as Record<string, any>)["default"] || pdfjsModule;

  // Desabilitar worker completamente - server-side não precisa
  // IMPORTANTE: Não tocar em GlobalWorkerOptions.workerSrc - isso causa erro de import "noworker"
  // Apenas usar disableWorker: true nas opções do getDocument é suficiente

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
    disableAutoFetch: true,
    disableStream: true,
    disableWorker: true, // Esta é a chave - desabilita o worker completamente
    verbosity: 0, // Reduzir logs no console
  } as Parameters<typeof pdfjs.getDocument>[0]);

  const pdf = await loadingTask.promise;
  const textoCompleto: string[] = [];
  const numPages = Math.min(pdf.numPages, maxPages);

  console.log(`📄 Processando PDF: ${numPages} de ${pdf.numPages} páginas`);

  for (let i = 1; i <= numPages; i++) {
    try {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pageText = (textContent.items as any[])
        .filter((item) => "str" in item && item.str)
        .map((item) => item.str)
        .join(" ")
        .trim();

      if (pageText) {
        textoCompleto.push(pageText);
        console.log(`  ✅ Página ${i}: ${pageText.length} chars`);
      }
    } catch (pageErr) {
      console.warn(`  ⚠️ Erro na página ${i}:`, pageErr instanceof Error ? pageErr.message : String(pageErr));
      continue;
    }
  }

  const textoFinal = textoCompleto.join("\n\n").trim();

  if (!textoFinal || textoFinal.length < 30) {
    throw new Error("PDF extraído mas texto muito curto ou vazio. O PDF pode ser uma imagem escaneada.");
  }

  console.log(`✅ Total extraído: ${textoFinal.length} chars de ${textoCompleto.length} páginas`);
  return textoFinal;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const engineRaw = formData.get("engine");
    const engine: EngineId = ["red", "blue", "green", "yellow", "orange"].includes(String(engineRaw || ""))
      ? (engineRaw as EngineId)
      : "orange"; // Streamlit usa gpt-4o-mini (orange) como padrão para laudos

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

    // Verificar tipo
    if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "O arquivo precisa ser um PDF." },
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
        { error: err instanceof Error ? err.message : "Não foi possível extrair texto do PDF." },
        { status: 400 }
      );
    }

    // Enviar para IA (mesmo prompt do Streamlit)
    const textoLimitado = textoPdf.slice(0, 6000);
    const prompt =
      "Analise este laudo médico/escolar. Extraia: 1) Diagnóstico; 2) Medicamentos. " +
      'Responda APENAS em JSON, sem markdown, sem backticks: { "diagnostico": "...", "medicamentos": [ {"nome": "...", "posologia": "..."} ] }. ' +
      "Se não houver medicamentos, retorne lista vazia. " +
      `Texto do laudo:\n\n${textoLimitado}`;

    const raw = (await chatCompletionText(engine, [{ role: "user", content: prompt }], { temperature: 0.2 })).trim();
    if (!raw) {
      return NextResponse.json(
        { error: "A IA não retornou dados válidos." },
        { status: 500 }
      );
    }

    // Parse do JSON (com fallbacks robustos)
    let jsonStr = raw;
    // Remover markdown code blocks se existirem
    const codeBlock = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlock) jsonStr = codeBlock[1].trim();

    // Encontrar JSON no texto
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    let parsed: {
      diagnostico?: string;
      medicamentos?: { nome?: string; posologia?: string }[];
    };

    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("Erro ao fazer parse do JSON. Texto recebido:", raw.substring(0, 500));
      // Fallback: extrair manualmente
      const diagnosticoMatch = raw.match(/(?:diagnóstico|diagnostico)[\s:"]*([^",\n}]+)/i);
      parsed = {
        diagnostico: diagnosticoMatch ? diagnosticoMatch[1].trim() : "",
        medicamentos: [],
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
