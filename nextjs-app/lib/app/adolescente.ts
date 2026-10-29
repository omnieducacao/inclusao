/**
 * Frente 6 · modo adolescente. A partir dos 12 anos (decisão do Rodrigo em 29/10/2026, igual ao ECA,
 * Estatuto da Criança e do Adolescente), a família pode dar ao filho o próprio
 * acesso: ele registra como se sente, vê as missões e as orientações; a família vê o humor só como
 * dia bom ou difícil, sem a frase.
 *
 * Como o adolescente entra: a família gera no app dela um código de 8 caracteres (vale 15 minutos,
 * uma vez) e o filho digita no celular dele. Não pedimos e-mail nem senha do adolescente (LGPD,
 * art. 14: o mínimo de dado de quem é menor). Se ele trocar de celular, a família gera outro código.
 */
import { randomInt } from "node:crypto";
import { hashToken } from "@/lib/app/sessao";

export const IDADE_MINIMA_ADOLESCENTE = 12;

/**
 * As três faixas do app (29/10/2026): até 5 anos, educação infantil (a família marca tudo);
 * de 6 a 11, anos iniciais e 6º ano (a família marca, a criança acompanha); a partir de 12,
 * o adolescente pode ter o próprio acesso. Cada faixa tem o seu estilo de insígnia.
 */
export type FaixaEtaria = "infantil" | "crianca" | "adolescente";
export function faixaEtaria(idade: number | null): FaixaEtaria | null {
  if (idade === null) return null;
  if (idade <= 5) return "infantil";
  if (idade < IDADE_MINIMA_ADOLESCENTE) return "crianca";
  return "adolescente";
}
export const CODIGO_MINUTOS = 15;
export const VERSAO_TERMO_ADOLESCENTE = "adolescente-v1-2026-10";
/** Sem 0/O, 1/I/L: fácil de ler em voz alta e de digitar. */
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function novoCodigo(): string {
  let s = "";
  for (let i = 0; i < 8; i++) s += ALFABETO[randomInt(ALFABETO.length)];
  return `${s.slice(0, 4)}-${s.slice(4)}`;
}

/** "k7p2 9qxm", "K7P2-9QXM" → "K7P29QXM"; formato errado → null. */
export function normalizarCodigo(x: unknown): string | null {
  if (typeof x !== "string") return null;
  const s = x.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return s.length === 8 && [...s].every((c) => ALFABETO.includes(c)) ? s : null;
}

export function hashDoCodigo(codigo: string): string {
  return hashToken(`adolescente:${codigo.replace(/-/g, "")}`);
}

export function idadeEm(nascimento: string | null, agora = new Date()): number | null {
  if (!nascimento || !/^\d{4}-\d{2}-\d{2}$/.test(nascimento)) return null;
  const [a, m, d] = nascimento.split("-").map(Number);
  let idade = agora.getUTCFullYear() - a;
  if (agora.getUTCMonth() + 1 < m || (agora.getUTCMonth() + 1 === m && agora.getUTCDate() < d)) idade -= 1;
  return idade;
}
