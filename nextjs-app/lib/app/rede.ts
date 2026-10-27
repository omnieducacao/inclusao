/**
 * Frente 6 · a rede de apoio da criança. A família convida um profissional (fono, neurologista,
 * psicólogo…) ou um professor, escolhe o que ele vê e o que ele escreve, por quanto tempo, e pode
 * mudar ou revogar a qualquer momento. Cada concessão, mudança e revogação vira um consentimento
 * (LGPD, arts. 11 e 14: dado de saúde de criança, com consentimento específico do responsável).
 *
 * A escola cliente entra na rede por outro caminho (crianca_escolas): ela pede, a família aceita.
 */
import { randomBytes } from "node:crypto";
import { CATEGORIAS, ehCategoria, type Categoria } from "@/lib/app/acesso";

export const VERSAO_TERMO_REDE = "rede-v1-2026-10";
export const CONVITE_DIAS = 7;
/** Sem data informada, o acesso vale 1 ano; a família pode pôr até 2 anos e renovar depois. */
export const ACESSO_PADRAO_DIAS = 365;
export const ACESSO_MAXIMO_DIAS = 730;

export type TipoConvidado = "profissional" | "professor";
export type Permissao = { categoria: Categoria; ver: boolean; escrever: boolean };

/** O humor do adolescente fica entre ele e a família; o resumo só se lê. */
const NUNCA_PARA_A_REDE: Categoria[] = ["humor"];
const SO_LEITURA: Categoria[] = ["resumo", "sinais", "pei", "medicacao"];
/** Laudo só o profissional de saúde escreve; o professor não. */
const ESCREVE_POR_TIPO: Record<TipoConvidado, Categoria[]> = {
  profissional: ["orientacoes", "laudos"],
  professor: ["eventos_escola", "missoes", "orientacoes"],
};

/** O ponto de partida que a tela de convite mostra marcado (a tabela "Quem vê o quê" do doc). */
export const PADRAO_POR_TIPO: Record<TipoConvidado, Permissao[]> = {
  profissional: [
    { categoria: "eventos_casa", ver: true, escrever: false },
    { categoria: "eventos_escola", ver: true, escrever: false },
    { categoria: "medicacao", ver: true, escrever: false },
    { categoria: "laudos", ver: true, escrever: false },
    { categoria: "resumo", ver: true, escrever: false },
    { categoria: "orientacoes", ver: true, escrever: true },
    { categoria: "sinais", ver: true, escrever: false },
  ],
  professor: [
    { categoria: "eventos_escola", ver: true, escrever: true },
    { categoria: "pei", ver: true, escrever: false },
    { categoria: "missoes", ver: true, escrever: true },
    { categoria: "orientacoes", ver: true, escrever: false },
  ],
};

export function ehTipoConvidado(x: unknown): x is TipoConvidado {
  return x === "profissional" || x === "professor";
}

/**
 * Lê as permissões enviadas pelo app e aplica as travas: humor nunca vai para a rede, escrever
 * implica ver, e cada tipo só escreve no que faz sentido para ele. Sem lista: o padrão do tipo.
 */
export function normalizarPermissoes(tipo: TipoConvidado, entrada: unknown): Permissao[] {
  if (!Array.isArray(entrada)) return PADRAO_POR_TIPO[tipo].map((p) => ({ ...p }));
  const porCategoria = new Map<Categoria, Permissao>();
  for (const item of entrada) {
    if (!item || typeof item !== "object") continue;
    const { categoria, ver, escrever } = item as Record<string, unknown>;
    if (!ehCategoria(categoria) || NUNCA_PARA_A_REDE.includes(categoria)) continue;
    const podeEscrever = escrever === true && !SO_LEITURA.includes(categoria) && ESCREVE_POR_TIPO[tipo].includes(categoria);
    const podeVer = ver === true || podeEscrever;
    if (podeVer) porCategoria.set(categoria, { categoria, ver: true, escrever: podeEscrever });
  }
  return CATEGORIAS.filter((c) => porCategoria.has(c)).map((c) => porCategoria.get(c)!);
}

/** Data final do acesso (AAAA-MM-DD): padrão de 1 ano, nunca no passado nem além de 2 anos. */
export function acessoAte(entrada: unknown, agora = new Date()): string | null {
  const dia = (d: Date) => d.toISOString().slice(0, 10);
  const limite = new Date(agora.getTime() + ACESSO_MAXIMO_DIAS * 864e5);
  if (entrada === undefined || entrada === null || entrada === "") {
    return dia(new Date(agora.getTime() + ACESSO_PADRAO_DIAS * 864e5));
  }
  if (typeof entrada !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(entrada) || Number.isNaN(Date.parse(entrada))) return null;
  if (entrada < dia(agora) || entrada > dia(limite)) return null;
  return entrada;
}

/** Token do convite: vai no link que a família manda (WhatsApp, e-mail); no banco fica só o hash. */
export function novoTokenDeConvite(): string {
  return randomBytes(24).toString("base64url");
}

export function linkDoConvite(token: string): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL || "https://omnisfera.net").replace(/\/+$/, "");
  return `${base}/app/convite/${token}`;
}

export function linhasDePermissao(membroId: string, permissoes: Permissao[]) {
  return permissoes.map((p) => ({ membro_id: membroId, categoria: p.categoria, pode_ver: p.ver, pode_escrever: p.escrever }));
}

export function paraConsentimento(permissoes: Permissao[]) {
  return permissoes.map((p) => ({ categoria: p.categoria, ver: p.ver, escrever: p.escrever }));
}
