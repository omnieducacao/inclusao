/**
 * Onda 88: tira o nome do estudante de um texto que vai para um motor que não é a Omni IA
 * (hoje, só o gerador de imagem do mapa mental da jornada no PAEE). Troca o nome completo e
 * cada parte dele (3+ letras, sem "da", "dos"…) por "o estudante".
 */
const PARTICULAS = new Set(["da", "das", "de", "do", "dos", "e"]);

function escaparRegex(t: string): string {
  return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function semNome(texto: string, nome: string): string {
  const limpo = (nome || "").trim();
  if (!limpo) return texto;
  const partes = [limpo, ...limpo.split(/\s+/)]
    .map((p) => p.trim())
    .filter((p) => p.length >= 3 && !PARTICULAS.has(p.toLowerCase()));
  let saida = texto;
  for (const parte of [...new Set(partes)].sort((x, y) => y.length - x.length)) {
    saida = saida.replace(new RegExp(`(?<!\\p{L})${escaparRegex(parte)}(?!\\p{L})`, "giu"), "o estudante");
  }
  return saida;
}
