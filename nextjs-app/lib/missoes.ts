/**
 * Missões do estudante (10/10/2026, onda 6 do mapa da plataforma).
 * Saem das metas do PEI: a escola cria com ajuda da IA e aprova; o estudante vê pela conta da família,
 * marca "consegui"; a escola confirma e a missão vira conquista.
 */
export type StatusMissao = "aprovada" | "feita" | "confirmada" | "arquivada";
export type OndeMissao = "casa" | "escola" | "casa e escola";
export type Missao = {
  id: string; titulo: string; passos: string[]; meta: string | null; onde: OndeMissao; status: StatusMissao;
  feita_em: string | null; nota_familia: string | null; confirmada_em: string | null; created_at: string;
};
export type SugestaoMissao = { titulo: string; passos: string[]; meta: string; onde: OndeMissao; porque: string };

export const ONDE: OndeMissao[] = ["casa", "escola", "casa e escola"];
export const LIMITES = { titulo: 80, passo: 140, passos: 4, meta: 300, nota: 300 };

/** Próximo status permitido para cada ação; null quando a ação não vale naquele estado. */
export function proximoStatus(atual: StatusMissao, acao: string, quem: "escola" | "familia"): StatusMissao | null {
  if (quem === "familia") return acao === "feita" && atual === "aprovada" ? "feita" : null;
  if (acao === "confirmar" && (atual === "feita" || atual === "aprovada")) return "confirmada";
  if (acao === "reabrir" && (atual === "feita" || atual === "confirmada" || atual === "arquivada")) return "aprovada";
  if (acao === "arquivar" && atual !== "arquivada") return "arquivada";
  return null;
}

const corta = (s: unknown, n: number) => (typeof s === "string" ? s.replace(/\s+/g, " ").trim().slice(0, n) : "");

/** Limpa uma missão vinda da tela ou da IA; null quando falta o título. */
export function normalizarMissao(m: unknown): Omit<SugestaoMissao, "porque"> & { porque?: string } | null {
  if (!m || typeof m !== "object") return null;
  const o = m as Record<string, unknown>;
  const titulo = corta(o.titulo, LIMITES.titulo);
  if (!titulo) return null;
  const passos = (Array.isArray(o.passos) ? o.passos : []).map((p) => corta(p, LIMITES.passo)).filter(Boolean).slice(0, LIMITES.passos);
  const onde = ONDE.includes(o.onde as OndeMissao) ? (o.onde as OndeMissao) : "casa";
  return { titulo, passos, meta: corta(o.meta, LIMITES.meta), onde, porque: corta(o.porque, 300) || undefined };
}

/** Lê a resposta da IA: espera um JSON com uma lista de missões, mas aceita texto em volta. */
export function lerSugestoes(texto: string): SugestaoMissao[] {
  const bruto = (texto || "").trim();
  const ini = bruto.indexOf("["), fim = bruto.lastIndexOf("]");
  if (ini < 0 || fim <= ini) return [];
  try {
    const lista = JSON.parse(bruto.slice(ini, fim + 1));
    if (!Array.isArray(lista)) return [];
    return lista.map(normalizarMissao).filter(Boolean).slice(0, 5).map((m) => ({ ...m!, porque: m!.porque || "" }));
  } catch {
    return [];
  }
}

export function promptMissoes(p: {
  serie: string; metas: { curto: string; medio: string; longo: string }; interesse: string;
  potencialidades: string; estrategias: string; quantas: number;
}): string {
  return `Você ajuda uma escola inclusiva a transformar as metas do PEI (Plano Educacional Individualizado) de um estudante em missões curtas, que ele faz em casa com a família ou na escola.

Estudante: ESTUDANTE, ${p.serie || "série não informada"}.
O que ele gosta: ${p.interesse || "não informado"}.
Potencialidades: ${p.potencialidades || "não informadas"}.
Estratégias que funcionam: ${p.estrategias || "não informadas"}.

Metas do PEI:
- Curto prazo: ${p.metas.curto || "não definida"}
- Médio prazo: ${p.metas.medio || "não definida"}
- Longo prazo: ${p.metas.longo || "não definida"}

Crie ${p.quantas} missões, priorizando a meta de curto prazo. Regras:
- Fale direto com o estudante, em frases curtas e positivas, no nível de leitura da idade dele.
- Cada missão cabe em 10 a 20 minutos e tem de 2 a 4 passos concretos e observáveis.
- Use o que ele gosta para dar vontade de fazer, sem virar só brincadeira: a missão precisa treinar a meta.
- Nada de diagnóstico, rótulo, nota ou comparação com colegas. Nada que dependa de comprar material.
- "onde" é "casa", "escola" ou "casa e escola".
- "meta" repete, em poucas palavras, qual meta do PEI a missão treina.
- "porque" é uma frase para o professor explicando a escolha (o estudante não vê).

Responda só com um JSON, sem texto antes ou depois, neste formato:
[{"titulo": "...", "passos": ["...", "..."], "meta": "...", "onde": "casa", "porque": "..."}]`;
}
