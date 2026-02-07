/**
 * Utilitários para o Hub de Inclusão
 * Baseado em services/hub_bncc_utils.py e funções utilitárias do Streamlit
 */

/**
 * Garante tag de imagem no texto quando aplicável.
 * - tag_a_inserir=null: não adiciona nenhuma tag (Adaptar Atividade sem Passo 2).
 * - tag_a_inserir="IMG_2": adiciona [[IMG_2]] se não houver tag (Adaptar Atividade com Passo 2).
 * - tag_a_inserir="IMG_1" (default): adiciona [[IMG_1]] se não houver tag (comportamento legado).
 */
export function garantirTagImagem(
  texto: string,
  tagAInserir: string | null = "IMG_1"
): string {
  if (tagAInserir === null) {
    return texto;
  }
  
  const textoUpper = texto.toUpperCase();
  if (!textoUpper.includes("[[IMG") && !textoUpper.includes("[[GEN_IMG")) {
    const tag = `[[${tagAInserir}]]`;
    const match = texto.match(/(\n|\. )/);
    if (match && match.index !== undefined) {
      const pos = match.index + match[0].length;
      return texto.slice(0, pos) + "\n\n" + tag + "\n\n" + texto.slice(pos);
    }
    // Se não encontrou quebra de linha ou ponto, adiciona no início
    return tag + "\n\n" + texto;
  }
  
  return texto;
}

/**
 * Verifica se ano_busca está na célula Ano da BNCC.
 * A célula pode ter múltiplos anos: "1º, 2º, 3º, 4º, 5º" (ex: Arte, Língua Portuguesa).
 * Retorna True se ano_busca (ex: "3º") está na lista.
 */
export function anoCelulaContem(anoCelula: string, anoBusca: string): boolean {
  if (!anoBusca || !anoCelula) {
    return false;
  }
  const cell = String(anoCelula).trim();
  const busca = String(anoBusca).trim();
  const partes = cell.split(",").map((p) => p.trim());
  return partes.includes(busca);
}

/**
 * Extrai o ano/série no formato BNCC a partir do estudante (grade/serie do PEI).
 * Retorna ex: "3º", "7º", "1EM" ou null.
 */
export function extrairAnoBnccDoAluno(aluno: { serie?: string; grade?: string } | null): string | null {
  if (!aluno || typeof aluno !== "object") {
    return null;
  }
  const serie = (aluno.serie || aluno.grade || "").trim();
  if (!serie || typeof serie !== "string") {
    return null;
  }
  
  const s = serie.toLowerCase();
  
  // Verificar Ensino Médio
  const matchEM = s.match(/(\d)\s*ª?\s*série/);
  if (matchEM || s.includes("em") || s.includes("médio")) {
    const num = matchEM ? matchEM[1] : s.match(/(\d)/)?.[1];
    if (num) {
      return `${parseInt(num, 10)}EM`;
    }
  }
  
  // Verificar formato "Xº"
  const match = s.match(/(\d\s*º)/);
  return match ? match[1].replace(/\s/g, "") : null;
}

/**
 * Converte diferentes formatos de ano para um padrão ordenável.
 */
export function padronizarAno(anoStr: string): string {
  if (typeof anoStr !== "string") {
    anoStr = String(anoStr);
  }
  anoStr = anoStr.trim();
  
  const padroes: Array<[RegExp, "ano" | "em"]> = [
    [/(\d+)\s*º?\s*ano/i, "ano"],
    [/(\d+)\s*ª?\s*série/i, "ano"],
    [/(\d+)\s*em/i, "em"],
    [/ef\s*(\d+)/i, "ano"],
    [/(\d+)\s*período/i, "ano"],
    [/(\d+)\s*semestre/i, "ano"],
  ];
  
  for (const [padrao, tipo] of padroes) {
    const match = anoStr.match(padrao);
    if (match) {
      const num = match[1];
      if (tipo === "em") {
        return `${parseInt(num, 10).toString().padStart(2, "0")}EM`;
      }
      return parseInt(num, 10).toString().padStart(2, "0");
    }
  }
  
  return anoStr;
}

/**
 * Ordena anos de forma inteligente (1º, 2º, ..., 9º, 1EM, 2EM, 3EM).
 */
export function ordenarAnos(anosLista: string[]): string[] {
  const anosPadronizados = anosLista.map((ano) => ({
    padronizado: padronizarAno(String(ano)),
    original: ano,
  }));
  
  anosPadronizados.sort((a, b) => {
    if (a.padronizado < b.padronizado) return -1;
    if (a.padronizado > b.padronizado) return 1;
    return 0;
  });
  
  return anosPadronizados.map((item) => item.original);
}
