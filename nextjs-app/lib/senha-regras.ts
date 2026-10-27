import { createHash } from "node:crypto";

/**
 * Regras para senha NOVA na Omnisfera (criar conta da equipe, da família, da coordenação, ou trocar a senha).
 * O login continua aceitando as senhas antigas: a regra só vale quando a senha é definida.
 *
 * A Omnisfera tem login próprio (não usa o login do Supabase), então a proteção "senha vazada"
 * do Supabase não se aplica aqui. Esta é a nossa versão, gratuita.
 */
export const SENHA_MINIMA = 8;

export const MSG_SENHA_CURTA = `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`;
export const MSG_SENHA_VAZADA =
  "Essa senha já apareceu em vazamentos de dados na internet, então outras pessoas podem conhecê-la. Escolha outra.";

/**
 * Quantas vezes a senha apareceu em vazamentos, pela base pública Have I Been Pwned.
 * A senha não sai do servidor: só os 5 primeiros caracteres do resumo SHA-1 vão na consulta
 * (técnica de anonimato k), e a comparação do resto acontece aqui.
 * Devolve null se não deu para conferir (serviço fora, sem rede): nesse caso a senha passa,
 * para a regra nunca travar a escola.
 */
export async function vezesEmVazamentos(senha: string, buscar: typeof fetch = fetch): Promise<number | null> {
  if (!senha) return null;
  const hash = createHash("sha1").update(senha, "utf8").digest("hex").toUpperCase();
  const prefixo = hash.slice(0, 5);
  const resto = hash.slice(5);
  const controle = new AbortController();
  const tempo = setTimeout(() => controle.abort(), 3000);
  try {
    const res = await buscar(`https://api.pwnedpasswords.com/range/${prefixo}`, {
      headers: { "Add-Padding": "true" },
      signal: controle.signal,
    });
    if (!res.ok) return null;
    const texto = await res.text();
    for (const linha of texto.split("\n")) {
      const [sufixo, vezes] = linha.trim().split(":");
      if (sufixo === resto) return Number.parseInt(vezes, 10) || 0;
    }
    return 0;
  } catch {
    return null;
  } finally {
    clearTimeout(tempo);
  }
}

/** Confere uma senha nova. Devolve a mensagem de erro para a tela, ou null se a senha serve. */
export async function checarSenhaNova(senha: string | null | undefined, buscar: typeof fetch = fetch): Promise<string | null> {
  const s = senha ?? "";
  if (s.length < SENHA_MINIMA) return MSG_SENHA_CURTA;
  const vezes = await vezesEmVazamentos(s, buscar);
  if (vezes && vezes > 0) return MSG_SENHA_VAZADA;
  return null;
}
