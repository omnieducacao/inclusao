import { describe, it, expect } from "vitest";
import { corpoUpload } from "@/lib/google-drive";

describe("Onda 92 · corpo do envio ao Drive", () => {
  it("converte o Word em Google Doc dentro da pasta, sem a extensão no nome", async () => {
    const corpo = await corpoUpload("PEI_Estudante.docx", new Blob(["DOCX"]), "fronteira", "pasta123").text();
    expect(corpo).toContain("--fronteira\r\nContent-Type: application/json");
    expect(corpo).toContain('"name":"PEI_Estudante"');
    expect(corpo).toContain('"mimeType":"application/vnd.google-apps.document"');
    expect(corpo).toContain('"parents":["pasta123"]');
    expect(corpo).toContain("DOCX");
    expect(corpo.endsWith("\r\n--fronteira--")).toBe(true);
  });

  it("sem pasta, não manda parents", async () => {
    const corpo = await corpoUpload("x.docx", new Blob(["1"]), "f").text();
    expect(corpo).not.toContain("parents");
  });
});

describe("SCRUM-244 · Google Planilhas na Omnisfera", () => {
  it("o .xlsx vira planilha do Google dentro da pasta", async () => {
    const corpo = await corpoUpload("Diario_X.xlsx", new Blob(["x"]), "f", "pasta1", "planilhas").text();
    expect(corpo).toContain('"mimeType":"application/vnd.google-apps.spreadsheet"');
    expect(corpo).toContain('"name":"Diario_X"');
    expect(corpo).toContain("spreadsheetml.sheet");
  });
});
