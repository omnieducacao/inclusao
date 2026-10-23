/**
 * SCRUM-231: índice cego do e-mail de login.
 *
 * O e-mail fica cifrado no banco (a cifra muda a cada gravação, então não dá para procurar por ela).
 * Para achar a pessoa no login e garantir que o e-mail não se repete, guardamos também
 * email_hash = HMAC-SHA256(e-mail normalizado), com uma chave derivada da ENCRYPTION_KEY. Sem a chave,
 * o resumo não revela o e-mail nem dá para testar e-mails um a um.
 *
 * Durante uma rotação (ENCRYPTION_KEY_ANTERIOR definida), indicesDoEmail devolve também o resumo
 * com a chave anterior, para o login seguir funcionando até a recriptografia terminar.
 */
import { createHash, createHmac } from "crypto";

export function normalizarEmail(email: string | null | undefined): string {
  return (email || "").trim().toLowerCase();
}

function chaveDoIndice(hex: string): Buffer {
  // chave própria do índice, derivada da chave de cifra (não é a mesma chave)
  return createHash("sha256").update(`omnisfera-indice-cego:${hex}`).digest();
}

function resumo(email: string, hex: string): string {
  return "e:" + createHmac("sha256", chaveDoIndice(hex)).update(normalizarEmail(email)).digest("hex");
}

function chaveAtual(): string {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) throw new Error("ENCRYPTION_KEY ausente ou inválida: o índice do e-mail precisa dela.");
  return hex;
}

/** Índice do e-mail com a chave atual (o que se grava). */
export function indiceDoEmail(email: string | null | undefined): string | null {
  const e = normalizarEmail(email);
  if (!e) return null;
  return resumo(e, chaveAtual());
}

/** Índices aceitos na busca: o atual e, durante uma rotação, o da chave anterior. */
export function indicesDoEmail(email: string | null | undefined): string[] {
  const e = normalizarEmail(email);
  if (!e) return [];
  const lista = [resumo(e, chaveAtual())];
  const anterior = process.env.ENCRYPTION_KEY_ANTERIOR;
  if (anterior && /^[0-9a-fA-F]{64}$/.test(anterior)) lista.push(resumo(e, anterior));
  return lista;
}

/** Para o script de rotação: índice com uma chave dada (hex de 64). */
export function indiceComChave(email: string, hex: string): string {
  return resumo(email, hex);
}
