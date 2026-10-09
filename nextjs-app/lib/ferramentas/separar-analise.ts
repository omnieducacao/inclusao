/**
 * Separa a análise para o professor do material do estudante na resposta da IA.
 * O prompt pede "[ANÁLISE PEDAGÓGICA] … ---DIVISOR--- [ATIVIDADE] …", mas o modelo às vezes
 * troca o divisor por "---" ou só escreve os marcadores. Sem separar, a análise ia para o
 * material do estudante (achado no teste de produção da onda 14).
 */
export function separarAnalise(texto: string): { analise: string; material: string } {
  const bruto = (texto || "").trim();
  const limparAnalise = (s: string) => s.replace(/\[\s*AN[ÁA]LISE PEDAG[ÓO]GICA\s*\]/i, "").replace(/\n\s*-{3,}\s*$/, "").trim();
  const limparMaterial = (s: string) => s.replace(/^\s*\[\s*ATIVIDADE\s*\]/i, "").trim();

  if (bruto.includes("---DIVISOR---")) {
    const [antes, ...depois] = bruto.split("---DIVISOR---");
    return { analise: limparAnalise(antes), material: limparMaterial(depois.join("\n")) || bruto };
  }
  const marca = bruto.search(/\[\s*ATIVIDADE\s*\]/i);
  if (marca > 0) {
    return { analise: limparAnalise(bruto.slice(0, marca)), material: limparMaterial(bruto.slice(marca)) };
  }
  if (/^\s*\[\s*AN[ÁA]LISE PEDAG[ÓO]GICA\s*\]/i.test(bruto)) {
    // Só a análise marcada, sem o marcador da atividade: separa na primeira linha "---"
    const m = bruto.match(/\n\s*-{3,}\s*\n/);
    if (m && m.index !== undefined) {
      return { analise: limparAnalise(bruto.slice(0, m.index)), material: bruto.slice(m.index + m[0].length).trim() };
    }
  }
  return { analise: "", material: bruto };
}
