/**
 * Frente 6 · onda 106 · o registro de sessão de quem é da rede de apoio.
 *
 * Cada profissional registra no formato da área dele (o que trabalhou, como a criança respondeu, como
 * foi) e pode deixar a tarefa da semana, que vira uma missão em casa. A área vem da especialidade que
 * a família escreveu no convite ("Fonoaudióloga", "TO"…); sem especialidade, vale o tipo do membro.
 * O registro de sessão da psicologia nasce reservado: só quem escreveu e a família veem.
 * Tudo é registro: o app não interpreta, não diagnostica e não orienta dose (Anvisa, RDC 657/2022).
 */
import { lerEtapas } from "@/lib/app/conquistas";

export const AREAS = {
  fono: { rotulo: "Fonoaudiologia", trabalhado: "Objetivo de comunicação trabalhado", tarefa: "Exercício da semana", reservado: false },
  psicopedagogia: { rotulo: "Psicopedagogia", trabalhado: "Habilidade trabalhada", tarefa: "Atividade para casa", reservado: false },
  psicologia: { rotulo: "Psicologia", trabalhado: "Tema da sessão", tarefa: "Orientação para a família", reservado: true },
  to: { rotulo: "Terapia ocupacional", trabalhado: "Estratégia trabalhada", tarefa: "Estratégia para casa e escola", reservado: false },
  medicina: { rotulo: "Consulta médica", trabalhado: "Motivo da consulta", tarefa: "Próximos passos", reservado: false },
  professor: { rotulo: "Escola", trabalhado: "O que foi trabalhado", tarefa: "Para casa", reservado: false },
  outra: { rotulo: "Atendimento", trabalhado: "O que foi trabalhado", tarefa: "Para casa", reservado: false },
} as const;
export type Area = keyof typeof AREAS;

/** A área pela especialidade escrita pela família (sem acento e sem maiúscula). */
export function areaDoMembro(tipo: string | null | undefined, especialidade: string | null | undefined): Area {
  const e = (especialidade || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  if (/fono/.test(e)) return "fono";
  if (/psicoped/.test(e)) return "psicopedagogia";
  if (/psic/.test(e)) return "psicologia";
  if (/\bto\b|ocupacional/.test(e)) return "to";
  if (/medic|neuro|pediatr|psiquiatr|\bdra?\.?\b/.test(e)) return "medicina";
  if (tipo === "professor" || tipo === "escola" || /profess|pedagog|aee/.test(e)) return "professor";
  return "outra";
}

export const RESPOSTAS = ["bem", "parcial", "dificil"] as const;
export type Resposta = (typeof RESPOSTAS)[number];

export type DadosSessao = {
  como_foi: string;
  trabalhado: string | null;
  resposta: Resposta | null;
  reservado: boolean;
  quando: string;
  compromisso_id: string | null;
  tarefa: { titulo: string; etapas: ReturnType<typeof lerEtapas> & object } | null;
};

function texto(x: unknown, max: number): string | null {
  return typeof x === "string" && x.trim() ? x.trim().slice(0, max) : null;
}

export function lerSessao(b: Record<string, unknown>, area: Area): DadosSessao | { erro: string } {
  const como_foi = texto(b.como_foi, 1000);
  if (!como_foi || como_foi.length < 3) return { erro: "Conte em uma ou duas linhas como foi." };
  const resposta = b.resposta === undefined || b.resposta === null ? null : (RESPOSTAS as readonly unknown[]).includes(b.resposta) ? (b.resposta as Resposta) : undefined;
  if (resposta === undefined) return { erro: "Como a criança respondeu: bem, em parte ou com dificuldade." };
  const ms = typeof b.quando === "string" ? Date.parse(b.quando) : Date.now();
  if (Number.isNaN(ms) || ms > Date.now() + 5 * 60_000) return { erro: "A sessão não pode ser no futuro." };
  let tarefa: DadosSessao["tarefa"] = null;
  if (b.tarefa && typeof b.tarefa === "object") {
    const t = b.tarefa as Record<string, unknown>;
    const titulo = texto(t.titulo, 100);
    if (!titulo || titulo.length < 2) return { erro: "Dê um nome curto à tarefa da semana." };
    const etapas = lerEtapas(Array.isArray(t.etapas) && t.etapas.length ? t.etapas : [titulo]);
    if (!etapas || etapas.length > 5) return { erro: "A tarefa da semana tem de 1 a 5 passos." };
    tarefa = { titulo, etapas };
  }
  return {
    como_foi,
    trabalhado: texto(b.trabalhado, 160),
    resposta,
    reservado: b.reservado === undefined ? AREAS[area].reservado : b.reservado === true,
    quando: new Date(ms).toISOString(),
    compromisso_id: typeof b.compromisso_id === "string" && /^[0-9a-f-]{36}$/i.test(b.compromisso_id) ? b.compromisso_id : null,
    tarefa,
  };
}

/** Registro reservado: só quem escreveu e a família (responsável) veem. */
export function podeVerRegistro(r: { autor_pessoa_id?: string | null; dados?: unknown }, pessoaId: string, papel: string): boolean {
  const d = (r.dados || {}) as { reservado?: boolean };
  if (!d.reservado) return true;
  return papel === "responsavel" || r.autor_pessoa_id === pessoaId;
}
