import type { PEIData } from "@/lib/pei";
import { detectarNivelEnsino } from "@/lib/pei";

export function calcularIdade(dataNasc: string | Date | undefined): string {
  if (!dataNasc) return "";
  const hoje = new Date();
  const nasc = typeof dataNasc === "string" ? new Date(dataNasc) : dataNasc;
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const mesDiff = hoje.getMonth() - nasc.getMonth();
  if (mesDiff < 0 || (mesDiff === 0 && hoje.getDate() < nasc.getDate())) {
    idade--;
  }
  return `${idade} anos`;
}

export function getHiperfocoEmoji(texto: string | undefined): string {
  if (!texto) return "🚀";
  const t = texto.toLowerCase();
  if (t.includes("jogo") || t.includes("game") || t.includes("minecraft") || t.includes("roblox")) return "🎮";
  if (t.includes("dino")) return "🦖";
  if (t.includes("fute") || t.includes("bola")) return "⚽";
  if (t.includes("desenho") || t.includes("arte")) return "🎨";
  if (t.includes("músic") || t.includes("music")) return "🎵";
  if (t.includes("anim") || t.includes("gato") || t.includes("cachorro")) return "🐾";
  if (t.includes("carro")) return "🏎️";
  if (t.includes("espaço") || t.includes("espaco")) return "🪐";
  return "🚀";
}

export function calcularComplexidadePei(dados: PEIData): [string, string, string] {
  const barreiras = dados.barreiras_selecionadas || {};
  const nBar = Object.values(barreiras).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
  const niveis = dados.niveis_suporte || {};
  const nSuporteAlto = Object.values(niveis).filter((v) => v === "Substancial" || v === "Muito Substancial").length;
  let recursos = 0;
  if (dados.rede_apoio && dados.rede_apoio.length > 0) recursos += 3;
  if (dados.lista_medicamentos && dados.lista_medicamentos.length > 0) recursos += 2;
  const saldo = nBar + nSuporteAlto - recursos;
  if (saldo <= 2) return ["FLUIDA", "#F0FFF4", "#276749"];
  if (saldo <= 7) return ["ATENÇÃO", "#FFFFF0", "#D69E2E"];
  return ["CRÍTICA", "#FFF5F5", "#C53030"];
}

export function extrairMetasEstruturadas(texto: string | undefined): { Curto: string; Medio: string; Longo: string } {
  const metas = { Curto: "Definir...", Medio: "Definir...", Longo: "Definir..." };
  if (!texto) return metas;

  const limpar = (s: string) => s.replace(/\*\*/g, "").replace(/^[\-\*#●•]+\s*/, "").trim();

  // Encontrar a seção de METAS primeiro (### 4 ou ### 5 com METAS/SMART)
  const linhas = texto.split("\n");
  let dentroMetas = false;
  let secaoAtual: "curto" | "medio" | "longo" | null = null;

  for (const l of linhas) {
    const clean = limpar(l);
    const upper = clean.toUpperCase();

    // Detectar início da seção METAS
    if (upper.includes("META") && upper.includes("SMART") && (l.startsWith("#") || l.startsWith("**"))) {
      dentroMetas = true;
      continue;
    }

    // Detectar fim da seção METAS (próximo H3)
    if (dentroMetas && l.startsWith("###") && !upper.includes("META")) {
      break;
    }

    if (!dentroMetas) continue;
    if (!clean || clean.length < 3) continue;

    // Detectar sub-seção curto/médio/longo
    if (upper.includes("CURTO")) {
      secaoAtual = "curto";
      // Se tiver conteúdo na mesma linha após ":" 
      const afterColon = clean.split(":").slice(1).join(":").trim();
      if (afterColon && afterColon.length > 5) {
        metas.Curto = limpar(afterColon);
      }
      continue;
    }
    if (upper.includes("MÉDIO") || upper.includes("MEDIO")) {
      secaoAtual = "medio";
      const afterColon = clean.split(":").slice(1).join(":").trim();
      if (afterColon && afterColon.length > 5) {
        metas.Medio = limpar(afterColon);
      }
      continue;
    }
    if (upper.includes("LONGO")) {
      secaoAtual = "longo";
      const afterColon = clean.split(":").slice(1).join(":").trim();
      if (afterColon && afterColon.length > 5) {
        metas.Longo = limpar(afterColon);
      }
      continue;
    }

    // Acumular conteúdo da sub-seção (primeira linha descritiva relevante)
    if (secaoAtual && clean.length > 10) {
      // Se contém "O quê" ou "Descrição" ou é a primeira linha descritiva
      const isDescricao = upper.includes("O QUÊ") || upper.includes("O QUE") || upper.includes("DESCRI");
      const afterColon = clean.split(":").slice(1).join(":").trim();

      if (isDescricao && afterColon) {
        if (secaoAtual === "curto" && metas.Curto === "Definir...") metas.Curto = limpar(afterColon);
        if (secaoAtual === "medio" && metas.Medio === "Definir...") metas.Medio = limpar(afterColon);
        if (secaoAtual === "longo" && metas.Longo === "Definir...") metas.Longo = limpar(afterColon);
      } else if (!upper.includes("CRITÉRIO") && !upper.includes("PRAZO") && !upper.includes("RESPONSÁVEL") && !upper.includes("SUCESSO")) {
        // Primeira linha de conteúdo que não é um campo SMART
        if (secaoAtual === "curto" && metas.Curto === "Definir...") metas.Curto = clean.length > 80 ? clean.slice(0, 80) + "…" : clean;
        if (secaoAtual === "medio" && metas.Medio === "Definir...") metas.Medio = clean.length > 80 ? clean.slice(0, 80) + "…" : clean;
        if (secaoAtual === "longo" && metas.Longo === "Definir...") metas.Longo = clean.length > 80 ? clean.slice(0, 80) + "…" : clean;
      }
    }
  }
  return metas;
}

export function inferirComponentesImpactados(dados: PEIData): string[] {
  const barreiras = dados.barreiras_selecionadas || {};
  const serie = dados.serie || "";
  const nivel = detectarNivelEnsino(serie);
  // Detectar se é anos finais do fundamental (EFII)
  const serieLower = serie.toLowerCase();
  const isEFII = nivel === "EFII";
  const impactados = new Set<string>();

  // Leitura
  if (barreiras["Acadêmico"] && barreiras["Acadêmico"].some((b: string) => b.includes("Leitora"))) {
    impactados.add("Língua Portuguesa");
    impactados.add(nivel === "EM" ? "História/Sociologia/Filosofia" : "História/Geografia");
  }

  // Matemática
  if (barreiras["Acadêmico"] && barreiras["Acadêmico"].some((b: string) => b.includes("Matemático"))) {
    impactados.add("Matemática");
    if (nivel === "EM") {
      impactados.add("Física/Química/Biologia");
    } else if (isEFII) {
      impactados.add("Ciências");
    }
  }

  // Cognitivas (transversal)
  if (barreiras["Funções Cognitivas"] && barreiras["Funções Cognitivas"].length > 0) {
    impactados.add("Todas as áreas");
  }

  return Array.from(impactados);
}

export function getProIcon(nomeProfissional: string): string {
  const p = nomeProfissional.toLowerCase();
  if (p.includes("psic")) return "🧠";
  if (p.includes("fono")) return "🗣️";
  if (p.includes("terapeuta ocupacional") || p.includes("to")) return "🤲";
  if (p.includes("neuro")) return "🧬";
  if (p.includes("psiquiatra")) return "💊";
  if (p.includes("psicopedagogo")) return "📚";
  if (p.includes("professor") || p.includes("mediador")) return "👨‍🏫";
  if (p.includes("acompanhante") || p.includes("at")) return "🤝";
  if (p.includes("music")) return "🎵";
  if (p.includes("equo")) return "🐴";
  if (p.includes("oftalmo")) return "👁️";
  return "👤";
}

// Componente para range input com cores
