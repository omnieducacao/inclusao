/**
 * Frente 6 · medicação. A Omnisfera só registra o que foi prescrito e o que foi dado: nunca sugere,
 * calcula ou corrige dose, nem comenta efeito (Anvisa, RDC 657/2022: não somos software de decisão clínica).
 * O nome do remédio é cifrado (lib/colunas-cifradas.ts).
 */
export const HORARIO = /^([01]\d|2[0-3]):[0-5]\d$/;

export type DadosMedicacao = {
  nome?: string;
  dose?: string | null;
  horarios?: string[];
  na_escola?: boolean;
  prescrito_por?: string | null;
  inicio?: string | null;
  fim?: string | null;
  lembrete?: boolean;
};

function textoCurto(x: unknown, max: number): string | null {
  return typeof x === "string" && x.trim() ? x.trim().slice(0, max) : null;
}
function data(x: unknown): string | null | undefined {
  if (x === undefined) return undefined;
  if (x === null || x === "") return null;
  return typeof x === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x) && !Number.isNaN(Date.parse(x)) ? x : undefined;
}

/** Lê o corpo do app. `parcial` (edição): só os campos enviados. Devolve os dados ou a mensagem de erro. */
export function lerMedicacao(b: Record<string, unknown>, parcial = false): DadosMedicacao | { erro: string } {
  const out: DadosMedicacao = {};
  if (!parcial || b.nome !== undefined) {
    const nome = textoCurto(b.nome, 80);
    if (!nome || nome.length < 2) return { erro: "Informe o nome do remédio, como está na receita." };
    out.nome = nome;
  }
  if (b.dose !== undefined) out.dose = textoCurto(b.dose, 60);
  if (b.horarios !== undefined) {
    if (!Array.isArray(b.horarios) || b.horarios.length > 8 || !b.horarios.every((h) => typeof h === "string" && HORARIO.test(h))) {
      return { erro: "Horários no formato 07:00, até 8 por dia." };
    }
    out.horarios = [...new Set(b.horarios as string[])].sort();
  }
  if (b.na_escola !== undefined) out.na_escola = b.na_escola === true;
  if (b.lembrete !== undefined) out.lembrete = b.lembrete === true;
  if (b.prescrito_por !== undefined) out.prescrito_por = textoCurto(b.prescrito_por, 80);
  for (const campo of ["inicio", "fim"] as const) {
    const d = data(b[campo]);
    if (b[campo] !== undefined && d === undefined) return { erro: "Confira as datas de início e fim." };
    if (d !== undefined) out[campo] = d;
  }
  if (out.inicio && out.fim && out.fim < out.inicio) return { erro: "O fim não pode ser antes do início." };
  return out;
}
