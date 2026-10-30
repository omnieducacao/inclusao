/**
 * Frente 6 · medicação. A Omnisfera só registra o que foi prescrito e o que foi dado: nunca sugere,
 * calcula ou corrige dose, nem comenta efeito (Anvisa, RDC 657/2022: não somos software de decisão clínica).
 * O nome da medicação é cifrado (lib/colunas-cifradas.ts).
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
  /** onda 105: unidades que restam (opcional), quantas por dose e quando a receita vence */
  estoque?: number | null;
  estoque_em?: string | null;
  por_dose?: number;
  receita_vence?: string | null;
};

/** Colunas de antes e depois da migração 105 (sem ela, a rota lê só as antigas). */
export const CAMPOS_MEDICACAO = "id, nome, dose, horarios, na_escola, prescrito_por, inicio, fim, lembrete, ativa, updated_at";
export const CAMPOS_MEDICACAO_105 = `${CAMPOS_MEDICACAO}, estoque, estoque_em, por_dose, receita_vence`;
export const CAMPOS_105 = ["estoque", "estoque_em", "por_dose", "receita_vence"] as const;

export type Previsao = { acaba_em: string | null; dias_restantes: number | null; receita_dias: number | null; avisar: boolean };

/**
 * Quando a medicação acaba, pela conta do horário: unidades contadas, menos as que os horários
 * gastaram desde a contagem. É uma conta de estoque, não de dose: o app nunca sugere nem muda dose.
 * Avisa com 7 dias (estoque) ou 15 dias (receita) de antecedência.
 */
export function previsaoDaMedicacao(
  m: { estoque?: number | string | null; estoque_em?: string | null; por_dose?: number | string | null; horarios?: string[] | null; receita_vence?: string | null },
  agora = Date.now(),
): Previsao {
  const DIA = 86_400_000;
  const hoje = Date.parse(new Date(agora - 3 * 3_600_000).toISOString().slice(0, 10));
  let acaba_em: string | null = null;
  let dias_restantes: number | null = null;
  const estoque = m.estoque === null || m.estoque === undefined ? null : Number(m.estoque);
  const porDia = (Number(m.por_dose) || 1) * (m.horarios?.length || 0);
  if (estoque !== null && Number.isFinite(estoque) && porDia > 0) {
    const desde = m.estoque_em ? Math.max(0, (agora - Date.parse(m.estoque_em)) / DIA) : 0;
    const resta = Math.max(0, estoque - desde * porDia);
    dias_restantes = Math.floor(resta / porDia);
    acaba_em = new Date(hoje + dias_restantes * DIA).toISOString().slice(0, 10);
  }
  const receita_dias = m.receita_vence ? Math.round((Date.parse(m.receita_vence) - hoje) / DIA) : null;
  const avisar = (dias_restantes !== null && dias_restantes <= 7) || (receita_dias !== null && receita_dias <= 15);
  return { acaba_em, dias_restantes, receita_dias, avisar };
}

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
    if (!nome || nome.length < 2) return { erro: "Informe o nome da medicação, como está na receita." };
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
  if (b.estoque !== undefined) {
    if (b.estoque === null || b.estoque === "") out.estoque = null;
    else {
      const n = Number(b.estoque);
      if (!Number.isFinite(n) || n < 0 || n > 99_999) return { erro: "Confira quantas unidades restam." };
      out.estoque = Math.round(n * 10) / 10;
    }
    out.estoque_em = new Date().toISOString();
  }
  if (b.por_dose !== undefined) {
    const n = Number(b.por_dose);
    if (!Number.isFinite(n) || n <= 0 || n > 100) return { erro: "Confira quantas unidades vão em cada vez, como está na receita." };
    out.por_dose = Math.round(n * 10) / 10;
  }
  if (b.receita_vence !== undefined) {
    const d = data(b.receita_vence);
    if (d === undefined) return { erro: "Confira a data em que a receita vence." };
    out.receita_vence = d;
  }
  if (out.inicio && out.fim && out.fim < out.inicio) return { erro: "O fim não pode ser antes do início." };
  return out;
}
