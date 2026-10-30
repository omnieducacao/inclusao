/**
 * Frente 6 · onda 105: a agenda da criança.
 *
 * Um compromisso é uma consulta, terapia, data da escola, exame ou marco. Pode repetir toda
 * semana (a fono de terça), com datas puladas e uma data de fim. Quem vê:
 *  - a família (responsável) e o adolescente veem todos;
 *  - o membro da rede vê só os compromissos dele (membro_id).
 * Só a família cria, muda e cancela (propor horário fica para a onda 2).
 *
 * O calendário de fora (iCal) leva só título, hora e local, nunca observação nem saúde.
 */
import type { Acesso } from "@/lib/app/acesso";

export const TIPOS_COMPROMISSO = ["consulta", "terapia", "escola", "exame", "marco", "outro"] as const;
export type TipoCompromisso = (typeof TIPOS_COMPROMISSO)[number];

export type Compromisso = {
  id: string;
  crianca_id: string;
  tipo: TipoCompromisso;
  titulo: string;
  inicio: string;
  duracao_min: number;
  dia_inteiro: boolean;
  local: string | null;
  levar: string | null;
  quem_leva: string | null;
  observacao: string | null;
  repete: "nao" | "semanal";
  repete_ate: string | null;
  pulos: string[] | null;
  membro_id: string | null;
  lembrar_min: number[] | null;
  cancelado_em: string | null;
  updated_at?: string;
};

export type Ocorrencia = {
  compromisso_id: string;
  inicio: string;
  fim: string;
  data: string;
};

export const CAMPOS_COMPROMISSO =
  "id, crianca_id, tipo, titulo, inicio, duracao_min, dia_inteiro, local, levar, quem_leva, observacao, repete, repete_ate, pulos, membro_id, lembrar_min, cancelado_em, updated_at";

const DIA = 86_400_000;
const SEMANA = 7 * DIA;
const LEMBRETES_OK = [0, 15, 30, 60, 120, 1440, 2880];

function texto(x: unknown, max: number): string | null {
  return typeof x === "string" && x.trim() ? x.trim().slice(0, max) : null;
}
function dataIso(x: unknown): string | null | undefined {
  if (x === undefined) return undefined;
  if (x === null || x === "") return null;
  return typeof x === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x) && !Number.isNaN(Date.parse(x)) ? x : undefined;
}

/** Data (AAAA-MM-DD) no horário de Brasília de um instante. */
export function dataBrasilia(ms: number): string {
  return new Date(ms - 3 * 3_600_000).toISOString().slice(0, 10);
}

export type DadosCompromisso = Partial<Omit<Compromisso, "id" | "crianca_id" | "cancelado_em" | "updated_at" | "pulos">>;

/** Lê o corpo do app. `parcial` (edição): só os campos enviados. */
export function lerCompromisso(b: Record<string, unknown>, parcial = false): DadosCompromisso | { erro: string } {
  const out: DadosCompromisso = {};
  if (!parcial || b.titulo !== undefined) {
    const t = texto(b.titulo, 80);
    if (!t || t.length < 2) return { erro: "Dê um nome curto ao compromisso (ex.: Fono)." };
    out.titulo = t;
  }
  if (!parcial || b.tipo !== undefined) {
    const tipo = b.tipo ?? "outro";
    if (!(TIPOS_COMPROMISSO as readonly unknown[]).includes(tipo)) return { erro: "Tipo de compromisso desconhecido." };
    out.tipo = tipo as TipoCompromisso;
  }
  if (!parcial || b.inicio !== undefined) {
    const ms = typeof b.inicio === "string" ? Date.parse(b.inicio) : NaN;
    if (Number.isNaN(ms)) return { erro: "Informe o dia e a hora." };
    out.inicio = new Date(ms).toISOString();
  }
  if (b.duracao_min !== undefined) {
    const d = Number(b.duracao_min);
    if (!Number.isInteger(d) || d < 5 || d > 1440) return { erro: "A duração vai de 5 minutos a 24 horas." };
    out.duracao_min = d;
  }
  if (b.dia_inteiro !== undefined) out.dia_inteiro = b.dia_inteiro === true;
  for (const [campo, max] of [["local", 120], ["levar", 160], ["quem_leva", 60], ["observacao", 400]] as const) {
    if (b[campo] !== undefined) out[campo] = texto(b[campo], max);
  }
  if (b.repete !== undefined) {
    if (b.repete !== "nao" && b.repete !== "semanal") return { erro: "Repetição: não repete ou toda semana." };
    out.repete = b.repete;
  }
  if (b.repete_ate !== undefined) {
    const d = dataIso(b.repete_ate);
    if (d === undefined) return { erro: "Confira a data final da repetição." };
    out.repete_ate = d;
  }
  if (b.membro_id !== undefined) out.membro_id = typeof b.membro_id === "string" && b.membro_id ? b.membro_id : null;
  if (b.lembrar_min !== undefined) {
    if (!Array.isArray(b.lembrar_min) || b.lembrar_min.length > 3 || !b.lembrar_min.every((m) => LEMBRETES_OK.includes(m as number))) {
      return { erro: "Lembretes: na hora, 15 ou 30 minutos, 1 ou 2 horas, 1 ou 2 dias antes." };
    }
    out.lembrar_min = [...new Set(b.lembrar_min as number[])].sort((a, z) => z - a);
  }
  if (out.inicio && out.repete_ate && out.repete_ate < out.inicio.slice(0, 10)) return { erro: "A repetição não pode terminar antes de começar." };
  return out;
}

/** Quem vê o compromisso: família e adolescente, todos; o membro da rede, só os dele. */
export function podeVer(acesso: Acesso, c: Pick<Compromisso, "membro_id">): boolean {
  if (acesso.papel === "responsavel" || acesso.papel === "adolescente") return true;
  return !!acesso.membroId && c.membro_id === acesso.membroId;
}

/** O que cada papel recebe: o membro da rede não vê observação nem quem leva. */
export function paraQuemVe(acesso: Acesso, c: Compromisso): Partial<Compromisso> {
  if (acesso.papel === "membro") {
    const { observacao: _o, quem_leva: _q, ...resto } = c;
    void _o; void _q;
    return resto;
  }
  return c;
}

/** As vezes em que os compromissos acontecem entre `de` e `ate` (datas AAAA-MM-DD, inclusive). */
export function ocorrencias(lista: Compromisso[], de: string, ate: string, limite = 400): Ocorrencia[] {
  const ini = Date.parse(`${de}T00:00:00-03:00`);
  const fimJanela = Date.parse(`${ate}T23:59:59-03:00`);
  const out: Ocorrencia[] = [];
  for (const c of lista) {
    if (c.cancelado_em) continue;
    const primeiro = Date.parse(c.inicio);
    if (Number.isNaN(primeiro)) continue;
    const dur = (c.dia_inteiro ? 1440 : c.duracao_min || 60) * 60_000;
    const pulos = new Set(c.pulos || []);
    const ultimo = c.repete_ate ? Date.parse(`${c.repete_ate}T23:59:59-03:00`) : Infinity;
    if (c.repete !== "semanal") {
      if (primeiro + dur >= ini && primeiro <= fimJanela) out.push(oc(c, primeiro, dur));
      continue;
    }
    // pula direto para a primeira semana dentro da janela
    let t = primeiro;
    if (t < ini) t += Math.floor((ini - t) / SEMANA) * SEMANA;
    for (; t <= fimJanela && t <= ultimo && out.length < limite; t += SEMANA) {
      if (t + dur < ini) continue;
      if (pulos.has(dataBrasilia(t))) continue;
      out.push(oc(c, t, dur));
    }
  }
  return out.sort((a, z) => a.inicio.localeCompare(z.inicio)).slice(0, limite);
}

function oc(c: Compromisso, t: number, dur: number): Ocorrencia {
  return { compromisso_id: c.id, inicio: new Date(t).toISOString(), fim: new Date(t + dur).toISOString(), data: dataBrasilia(t) };
}

// ---------- calendário assinável (iCal, RFC 5545) ----------

function escIcs(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}
function quando(iso: string): string {
  return iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}
/** Linhas de no máximo 75 octetos, continuadas com espaço (a regra do iCal). */
function dobrar(linha: string): string {
  const partes: string[] = [];
  let resto = linha;
  while (Buffer.byteLength(resto, "utf8") > 75) {
    let n = 74;
    while (Buffer.byteLength(resto.slice(0, n), "utf8") > 74) n--;
    partes.push(resto.slice(0, n));
    resto = " " + resto.slice(n);
  }
  partes.push(resto);
  return partes.join("\r\n");
}

/**
 * O calendário de uma criança, já com as repetições abertas (30 dias para trás, 180 para a frente).
 * Cada evento leva só "Título · Nome" (primeiro nome), hora e local.
 */
export function gerarIcs(lista: Compromisso[], primeiroNome: string, agora = Date.now()): string {
  const de = dataBrasilia(agora - 30 * DIA);
  const ate = dataBrasilia(agora + 180 * DIA);
  const porId = new Map(lista.map((c) => [c.id, c]));
  const carimbo = quando(new Date(agora).toISOString());
  const linhas = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Omnisfera//Agenda da crianca//PT-BR", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    `X-WR-CALNAME:${escIcs(`Agenda · ${primeiroNome}`)}`, "X-WR-TIMEZONE:America/Sao_Paulo", "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
  ];
  for (const o of ocorrencias(lista, de, ate, 1000)) {
    const c = porId.get(o.compromisso_id)!;
    linhas.push("BEGIN:VEVENT", `UID:${c.id}-${o.data}@omnisfera.net`, `DTSTAMP:${carimbo}`);
    if (c.dia_inteiro) {
      const d = o.data.replace(/-/g, "");
      const seguinte = dataBrasilia(Date.parse(`${o.data}T12:00:00-03:00`) + DIA).replace(/-/g, "");
      linhas.push(`DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${seguinte}`);
    } else {
      linhas.push(`DTSTART:${quando(o.inicio)}`, `DTEND:${quando(o.fim)}`);
    }
    linhas.push(`SUMMARY:${escIcs(`${c.titulo} · ${primeiroNome}`)}`);
    if (c.local) linhas.push(`LOCATION:${escIcs(c.local)}`);
    linhas.push("END:VEVENT");
  }
  linhas.push("END:VCALENDAR");
  return linhas.map(dobrar).join("\r\n") + "\r\n";
}
