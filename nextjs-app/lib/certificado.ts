/**
 * Certificado de conclusão da formação (onda 53).
 *
 * Não é um curso: é a formação gratuita do site, em trilhas por papel. O certificado declara as horas
 * de estudo (leitura + perguntas de fixação, arredondadas) e é liberado no site quando a pessoa responde
 * às perguntas de todos os temas da sua trilha. O pedido vira um contato (lead, origem "certificado").
 */

export type TrilhaId = "prof" | "aee" | "coord";

export const TEMAS = [
  { slug: "lei", titulo: "Inclusão é direito: o que a lei garante", trilhas: ["prof", "aee", "coord"] },
  { slug: "conceitos", titulo: "Deficiência, barreira e capacitismo", trilhas: ["prof", "aee", "coord"] },
  { slug: "conhecer-o-estudante", titulo: "Conhecer o estudante, não o laudo", trilhas: ["prof", "aee", "coord"] },
  { slug: "autismo", titulo: "Estudantes autistas", trilhas: ["prof", "aee"] },
  { slug: "deficiencia-intelectual", titulo: "Deficiência intelectual", trilhas: ["prof", "aee"] },
  { slug: "dislexia-discalculia-tdah", titulo: "Dislexia, discalculia e TDAH", trilhas: ["prof", "aee", "coord"] },
  { slug: "altas-habilidades", titulo: "Altas habilidades/superdotação", trilhas: ["prof", "aee"] },
  { slug: "visual-surdez-fisica", titulo: "Deficiência visual, surdez e deficiência física", trilhas: ["prof", "aee"] },
  { slug: "dua-e-caa", titulo: "DUA e comunicação alternativa", trilhas: ["prof", "aee", "coord"] },
  { slug: "pei-e-aee", titulo: "PEI, AEE e o trabalho em rede", trilhas: ["prof", "aee", "coord"] },
  { slug: "adaptar-e-avaliar", titulo: "Adaptar atividades e avaliar sem avaliar a deficiência", trilhas: ["prof", "aee", "coord"] },
] as const satisfies readonly { slug: string; titulo: string; trilhas: readonly TrilhaId[] }[];

export const TRILHAS: Record<TrilhaId, { nome: string; horas: number; cargo: string }> = {
  prof: { nome: "Professor(a) regente", horas: 3, cargo: "Professor(a) regente" },
  aee: { nome: "Professor(a) do AEE", horas: 3, cargo: "Professor(a) do AEE" },
  coord: { nome: "Coordenação e gestão", horas: 2, cargo: "Coordenação" },
};

export const NOME_FORMACAO = "Formação em educação inclusiva";

export function trilhaValida(t: unknown): t is TrilhaId {
  return t === "prof" || t === "aee" || t === "coord";
}

export function temasDaTrilha(t: TrilhaId) {
  return TEMAS.filter((x) => (x.trilhas as readonly string[]).includes(t));
}

// Sem letras e números que se confundem (0/O, 1/I/L)
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** Código de verificação no formato OMNI-XXXX-XXXX. */
export function gerarCodigo(aleatorio: (n: number) => Uint8Array = (n) => crypto.getRandomValues(new Uint8Array(n))): string {
  const b = aleatorio(8);
  const c = Array.from(b, (x) => ALFABETO[x % ALFABETO.length]).join("");
  return `OMNI-${c.slice(0, 4)}-${c.slice(4, 8)}`;
}

export function codigoValido(c: unknown): c is string {
  return typeof c === "string" && /^OMNI-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/.test(c);
}

export type PedidoCertificado = {
  nome: string; email: string; escola: string; telefone: string | null; trilha: TrilhaId;
  /** atividade final: a mudança que a pessoa vai fazer na aula (onda 54) */
  reflexao: string;
};

const limpo = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");

export function validarPedido(body: unknown):
  | { ok: true; pedido: PedidoCertificado }
  | { ok: false; erros: Record<string, string> } {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const erros: Record<string, string> = {};
  const nome = limpo(b.nome, 120);
  const email = limpo(b.email, 160).toLowerCase();
  const escola = limpo(b.escola, 160);
  const telefone = limpo(b.telefone, 30);
  const reflexao = limpo(b.reflexao, 600);
  if (nome.length < 5 || !nome.includes(" ")) erros.nome = "Escreva o nome completo, como deve sair no certificado.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) erros.email = "Confira o e-mail.";
  if (escola.length < 3) erros.escola = "Escreva o nome da escola ou da rede.";
  if (telefone && telefone.replace(/\D/g, "").length < 10) erros.telefone = "Confira o número, com DDD.";
  if (!trilhaValida(b.trilha)) erros.trilha = "Escolha a trilha.";
  if (reflexao.length < 40) erros.reflexao = "Conte em duas ou três frases a mudança que você vai fazer.";
  if (b.consentimento !== true) erros.consentimento = "Para emitir o certificado, precisamos do seu de acordo.";
  if (Object.keys(erros).length) return { ok: false, erros };
  return { ok: true, pedido: { nome, email, escola, telefone: telefone || null, trilha: b.trilha as TrilhaId, reflexao } };
}

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

/** "15 de outubro de 2026", no fuso de Brasília. */
export function dataPorExtenso(iso: string): string {
  const d = new Date(new Date(iso).getTime() - 3 * 60 * 60 * 1000);
  return `${d.getUTCDate()} de ${MESES[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
}
