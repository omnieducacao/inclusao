import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { requireAuth } from "@/lib/permissions";

export async function POST(req: Request) {
  const { error: authError } = await requireAuth(); if (authError) return authError;
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file || !file.size) {
      return NextResponse.json(
        { error: "Envie um arquivo DOCX." },
        { status: 400 }
      );
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const imagens: { base64: string; contentType: string }[] = [];

    const result = await mammoth.convertToHtml(
      { buffer: buf },
      {
        convertImage: mammoth.images.imgElement(async (image) => {
          const buffer = await image.read("base64");
          const contentType = image.contentType || "image/png";
          imagens.push({ base64: buffer, contentType });
          return {
            src: `data:${contentType};base64,${buffer}`,
          };
        }),
      }
    );

    const texto = (result.value || "")
      .replace(/<[^>]+>/g, "\n")
      .replace(/\n{2,}/g, "\n")
      .trim();

    if (!texto || texto.length < 10) {
      return NextResponse.json(
        { error: "Não foi possível extrair texto do DOCX." },
        { status: 400 }
      );
    }

    return NextResponse.json({ texto, imagens });
  } catch (err) {
    console.error("Extrair DOCX:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao extrair." },
      { status: 500 }
    );
  }
}
