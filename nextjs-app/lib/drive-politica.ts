/**
 * Onda 92 · SCRUM-243: regra da escola para "Salvar no Drive". Pura, usada no servidor (que decide) e na tela.
 */
export type PoliticaDrive = "desligado" | "dominio" | "qualquer";

export function normalizarPolitica(v: unknown): PoliticaDrive {
  return v === "desligado" || v === "dominio" ? v : "qualquer";
}

/** "@Escola.com.br " → "escola.com.br"; vazio quando não parece um domínio. */
export function normalizarDominio(v: unknown): string {
  const d = String(v ?? "").trim().toLowerCase().replace(/^@/, "");
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(d) ? d : "";
}

export function dominioDoEmail(email: string): string {
  return normalizarDominio(email.split("@")[1] ?? "");
}

export function podeSalvarNoDrive(politica: PoliticaDrive, dominioEscola: string, dominioConta: string): { ok: true } | { ok: false; motivo: string } {
  if (politica === "desligado") return { ok: false, motivo: "A escola desligou o salvamento no Google Drive." };
  if (politica === "dominio") {
    if (!dominioEscola) return { ok: false, motivo: "A escola ainda não informou o domínio de e-mail permitido." };
    if (dominioConta !== dominioEscola) return { ok: false, motivo: `A escola só permite salvar em contas @${dominioEscola}.` };
  }
  return { ok: true };
}
