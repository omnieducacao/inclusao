/**
 * Formata PEIData como texto completo para exportação DOCX/PDF.
 */
import type { PEIData } from "./pei";

function limpar(s: string | undefined | null): string {
  if (s == null || typeof s !== "string") return "";
  return String(s)
    .replace(/[\u007F-\uFFFF]/g, (c) => (/[\u00C0-\u024F]/.test(c) ? c : "?"))
    .replace(/\r\n/g, "\n")
    .trim();
}

function formatarData(val: string | Date | undefined): string {
  if (!val) return "—";
  if (typeof val === "string") {
    const d = new Date(val);
    return isNaN(d.getTime()) ? val : d.toLocaleDateString("pt-BR");
  }
  return (val as Date).toLocaleDateString?.("pt-BR") ?? String(val);
}

export function peiDataToFullText(dados: PEIData): string {
  const sections: string[] = [];

  sections.push("PEI — PLANO DE ENSINO INDIVIDUALIZADO");
  sections.push("");

  // 1. Identificação
  sections.push("1. IDENTIFICAÇÃO E CONTEXTO");
  sections.push(`Estudante: ${limpar(dados.nome) || "—"}`);
  sections.push(`Data de Nascimento: ${formatarData(dados.nasc as string)}`);
  sections.push(`Série/Ano: ${limpar(dados.serie) || "—"}`);
  sections.push(`Turma: ${limpar(dados.turma) || "—"}`);
  sections.push(`Matrícula/RA: ${limpar(dados.matricula) || limpar((dados as { ra?: string }).ra) || "—"}`);
  if (limpar(dados.historico)) {
    sections.push("");
    sections.push("Histórico Escolar:");
    sections.push(limpar(dados.historico));
  }
  if (limpar(dados.familia)) {
    sections.push("");
    sections.push("Dinâmica Familiar:");
    sections.push(limpar(dados.familia));
  }
  const compFam = dados.composicao_familiar_tags?.filter(Boolean) || [];
  if (compFam.length) {
    sections.push("");
    sections.push("Composição Familiar: " + compFam.join(", "));
  }
  sections.push("");
  sections.push("---");
  sections.push("");

  // 2. Diagnóstico
  sections.push("2. DIAGNÓSTICO E CONTEXTO CLÍNICO");
  sections.push("Diagnóstico:");
  sections.push(limpar(dados.diagnostico) || "—");
  const meds = dados.lista_medicamentos || [];
  if (meds.length) {
    sections.push("");
    sections.push("Medicações em Uso:");
    meds.forEach((m) => {
      const escola = m.escola ? " (uso na escola)" : "";
      sections.push(`- ${limpar(m.nome)} - ${limpar(m.posologia)}${escola}`);
    });
  }
  sections.push("");
  sections.push("---");
  sections.push("");

  // 3. Potencialidades
  sections.push("3. POTENCIALIDADES E INTERESSES");
  if (limpar(dados.hiperfoco)) {
    sections.push("Hiperfoco/Interesse Principal:");
    sections.push(limpar(dados.hiperfoco));
    sections.push("");
  }
  const potencias = dados.potencias?.filter(Boolean) || [];
  if (potencias.length) {
    sections.push("Potencialidades:");
    potencias.forEach((p) => sections.push(`• ${limpar(p)}`));
  }
  sections.push("");
  sections.push("---");
  sections.push("");

  // 4. Rede de Apoio
  sections.push("4. REDE DE APOIO E ORIENTAÇÕES");
  const rede = dados.rede_apoio?.filter(Boolean) || [];
  if (rede.length) {
    sections.push("Profissionais da Rede:");
    rede.forEach((r) => sections.push(`• ${limpar(r)}`));
    sections.push("");
  }
  if (limpar(dados.orientacoes_especialistas)) {
    sections.push("Orientações Gerais dos Especialistas:");
    sections.push(limpar(dados.orientacoes_especialistas));
  }
  const orientPorProf = dados.orientacoes_por_profissional || {};
  Object.entries(orientPorProf).forEach(([prof, txt]) => {
    if (limpar(txt)) {
      sections.push("");
      sections.push(`Orientações - ${prof}:`);
      sections.push(limpar(txt));
    }
  });
  sections.push("");
  sections.push("---");
  sections.push("");

  // 5. Barreiras
  sections.push("5. MAPEAMENTO DE BARREIRAS E NÍVEIS DE SUPORTE");
  const barreiras = dados.barreiras_selecionadas || {};
  const niveis = dados.niveis_suporte || {};
  Object.entries(barreiras).forEach(([area, itens]) => {
    if (itens?.length) {
      sections.push(area + ":");
      itens.forEach((item) => {
        const niv = niveis[item] || "—";
        sections.push(`• ${limpar(item)} (Nível: ${niv})`);
      });
      sections.push("");
    }
  });
  sections.push("---");
  sections.push("");

  // 6. Plano de Ação
  sections.push("6. PLANO DE AÇÃO - ESTRATÉGIAS");
  const estAcesso = dados.estrategias_acesso?.filter(Boolean) || [];
  if (estAcesso.length) {
    sections.push("Estratégias de Acesso:");
    estAcesso.forEach((e) => sections.push(`• ${limpar(e)}`));
    sections.push("");
  }
  if (limpar(dados.outros_acesso)) {
    sections.push("Outros (acesso): " + limpar(dados.outros_acesso));
    sections.push("");
  }
  const estEnsino = dados.estrategias_ensino?.filter(Boolean) || [];
  if (estEnsino.length) {
    sections.push("Estratégias de Ensino:");
    estEnsino.forEach((e) => sections.push(`• ${limpar(e)}`));
    sections.push("");
  }
  if (limpar(dados.outros_ensino)) {
    sections.push("Outros (ensino): " + limpar(dados.outros_ensino));
    sections.push("");
  }
  const estAval = dados.estrategias_avaliacao?.filter(Boolean) || [];
  if (estAval.length) {
    sections.push("Estratégias de Avaliação:");
    estAval.forEach((e) => sections.push(`• ${limpar(e)}`));
  }
  sections.push("");
  sections.push("---");
  sections.push("");

  // 7. Planejamento Pedagógico (ia_sugestao)
  sections.push("7. PLANEJAMENTO PEDAGÓGICO DETALHADO");
  const motor = dados.consultoria_engine || "red";
  const motorNome: Record<string, string> = {
    red: "OmniRed (DeepSeek)",
    blue: "OmniBlue (Kimi)",
    green: "OmniGreen (Claude)",
    yellow: "OmniYellow (Gemini)",
    orange: "OmniOrange (OpenAI)",
  };
  sections.push(`(Gerado por ${motorNome[motor] || motor})`);
  sections.push("");
  sections.push(limpar(dados.ia_sugestao) || "(Gere o relatório na aba Consultoria IA)");
  sections.push("");
  sections.push("---");
  sections.push("");

  // 8. Monitoramento
  sections.push("8. MONITORAMENTO E ACOMPANHAMENTO");
  sections.push(`Data do Monitoramento: ${formatarData(dados.monitoramento_data as string)}`);
  sections.push(`Status da Meta: ${limpar(dados.status_meta) || "—"}`);
  sections.push("");
  sections.push("Parecer Geral:");
  sections.push(limpar(dados.parecer_geral) || "—");
  const proximos = dados.proximos_passos_select?.filter(Boolean) || [];
  if (proximos.length) {
    sections.push("");
    sections.push("Próximos Passos:");
    proximos.forEach((p) => sections.push(`• ${limpar(p)}`));
  }

  return sections.join("\n");
}
