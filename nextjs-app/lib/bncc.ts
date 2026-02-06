/**
 * BNCC - Base Nacional Comum Curricular
 * Parser e utilitários para EI, EF e EM.
 */
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");

function parseCSV(content: string, delimiter = ";"): Record<string, string>[] {
  const lines = content.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(delimiter).map((h) => h.trim());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, j) => {
      row[h] = values[j] ?? "";
    });
    rows.push(row);
  }
  return rows;
}

function getCell(row: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    const v = row[k] ?? row[k + " "] ?? "";
    if (v && String(v).trim()) return String(v).trim();
  }
  return "";
}

// --- EI ---
export type BnccEIRow = {
  idade: string;
  campo_experiencia: string;
  objetivo: string;
};

export function loadBnccEI(): BnccEIRow[] {
  const path = join(DATA_DIR, "bncc_ei.csv");
  try {
    const content = readFileSync(path, "utf-8");
    const rows = parseCSV(content);
    return rows
      .filter((r) => getCell(r, "Campo de Experiência", "Campo de Experiencia") && getCell(r, "OBJETIVOS DE APRENDIZAGEM E DESENVOLVIMENTO", "Objetivo de Aprendizagem", "Objetivo"))
      .map((r) => ({
        idade: getCell(r, "Idade"),
        campo_experiencia: getCell(r, "Campo de Experiência", "Campo de Experiencia"),
        objetivo: getCell(r, "OBJETIVOS DE APRENDIZAGEM E DESENVOLVIMENTO", "Objetivo de Aprendizagem", "Objetivo"),
      }));
  } catch {
    return [];
  }
}

export function faixasIdadeEI(): string[] {
  const rows = loadBnccEI();
  const seen = new Set<string>();
  const idades: string[] = [];
  for (const r of rows) {
    if (r.idade && !seen.has(r.idade)) {
      seen.add(r.idade);
      idades.push(r.idade);
    }
  }
  return idades.sort((a, b) => {
    const na = parseInt(a.match(/\d+/)?.[0] ?? "99", 10);
    const nb = parseInt(b.match(/\d+/)?.[0] ?? "99", 10);
    return na - nb;
  });
}

export function camposExperienciaEI(): string[] {
  const rows = loadBnccEI();
  const seen = new Set<string>();
  const campos: string[] = [];
  for (const r of rows) {
    if (r.campo_experiencia && !seen.has(r.campo_experiencia)) {
      seen.add(r.campo_experiencia);
      campos.push(r.campo_experiencia);
    }
  }
  return campos;
}

export function objetivosEIPorIdadeCampo(idade: string, campo: string): string[] {
  const rows = loadBnccEI();
  return rows
    .filter((r) => r.idade?.trim() === (idade || "").trim() && r.campo_experiencia?.trim() === (campo || "").trim())
    .map((r) => r.objetivo)
    .filter(Boolean);
}

// --- EF ---
export type BnccEFRow = {
  ano: string;
  disciplina: string;
  unidade_tematica: string;
  objeto_conhecimento: string;
  habilidade: string;
};

function extrairAnoSerieBncc(serie: string): string | null {
  if (!serie || typeof serie !== "string") return null;
  const s = serie.trim();
  const mEm = s.match(/(\d)\s*ª?\s*série/i) || (s.toLowerCase().includes("em") || s.toLowerCase().includes("médio") ? s.match(/(\d)/) : null);
  if (mEm) {
    const n = parseInt(mEm[1], 10);
    return `${n}EM`;
  }
  const m = s.match(/(\d\s*º)/);
  return m ? m[1].replace(/\s/g, "") : null;
}

function parseHab(hab: string): { codigo: string; descricao: string } {
  const match = (hab || "").match(/\(([A-Za-z0-9]+)\)\s*(.*)/);
  if (match) {
    return {
      codigo: match[1],
      descricao: (match[2] || "").trim().slice(0, 200) + ((match[2] || "").length > 200 ? "..." : ""),
    };
  }
  return { codigo: "(sem código)", descricao: (hab || "").slice(0, 200) };
}

export function loadBnccEF(): BnccEFRow[] {
  let path = join(DATA_DIR, "bncc_ef.csv");
  try {
    if (!existsSync(path)) path = join(DATA_DIR, "bncc.csv");
    const content = readFileSync(path, "utf-8");
    const rows = parseCSV(content);
    return rows
      .filter((r) => getCell(r, "Ano") && getCell(r, "Disciplina") && getCell(r, "Habilidade"))
      .map((r) => ({
        ano: getCell(r, "Ano"),
        disciplina: getCell(r, "Disciplina"),
        unidade_tematica: getCell(r, "Unidade Temática", "Unidade Tematica"),
        objeto_conhecimento: getCell(r, "Objeto do Conhecimento"),
        habilidade: getCell(r, "Habilidade"),
      }));
  } catch {
    return [];
  }
}

export function carregarHabilidadesEFPorComponente(serie: string): {
  ano_atual: Record<string, { codigo: string; descricao: string; habilidade_completa: string }[]>;
  anos_anteriores: Record<string, { codigo: string; descricao: string; habilidade_completa: string }[]>;
} {
  const anoSerie = extrairAnoSerieBncc(serie);
  if (!anoSerie || anoSerie.includes("EM")) return { ano_atual: {}, anos_anteriores: {} };
  const anoNum = parseInt(anoSerie.match(/\d+/)?.[0] ?? "0", 10) || 0;
  const raw = loadBnccEF();
  if (!raw.length) return { ano_atual: {}, anos_anteriores: {} };

  const anterioresStr = Array.from({ length: anoNum - 1 }, (_, i) => `${i + 1}º`);
  const ano_atual: Record<string, { codigo: string; descricao: string; habilidade_completa: string }[]> = {};
  const anos_anteriores: Record<string, { codigo: string; descricao: string; habilidade_completa: string }[]> = {};

  for (const r of raw) {
    const anoCelula = (r.ano || "").trim();
    const disc = (r.disciplina || "").trim();
    const hab = (r.habilidade || "").trim();
    if (!hab) continue;
    const { codigo, descricao } = parseHab(hab);
    const item = { codigo, descricao, habilidade_completa: hab };
    if (anoCelula.includes(anoSerie) || anoCelula.includes(anoSerie.replace("º", "º"))) {
      (ano_atual[disc] = ano_atual[disc] || []).push(item);
    } else if (anterioresStr.some((ant) => anoCelula.includes(ant))) {
      (anos_anteriores[disc] = anos_anteriores[disc] || []).push(item);
    }
  }
  return { ano_atual, anos_anteriores };
}

export type EstruturaBnccEF = {
  disciplinas: string[];
  porDisciplina: Record<
    string,
    {
      unidades: string[];
      porUnidade: Record<string, { objetos: string[]; porObjeto: Record<string, { codigo: string; descricao: string; habilidade_completa: string }[]> }>;
    }
  >;
};

/** Estrutura hierárquica EF: disciplina → unidade temática → objeto do conhecimento → habilidades */
export function carregarEstruturaEF(serie: string): EstruturaBnccEF {
  const anoSerie = extrairAnoSerieBncc(serie);
  if (!anoSerie || anoSerie.includes("EM")) return { disciplinas: [], porDisciplina: {} };
  const raw = loadBnccEF();
  const porDisciplina: Record<string, Record<string, Record<string, { codigo: string; descricao: string; habilidade_completa: string }[]>>> = {};
  const disciplinas = new Set<string>();

  for (const r of raw) {
    const anoCelula = (r.ano || "").trim();
    if (!anoCelula.includes(anoSerie) && !anoSerie.split("").some((c) => anoCelula.includes(c))) continue;
    const disc = (r.disciplina || "").trim();
    const unidade = (r.unidade_tematica || "").trim() || "(sem unidade)";
    const objeto = (r.objeto_conhecimento || "").trim() || "(sem objeto)";
    const hab = (r.habilidade || "").trim();
    if (!disc || !hab) continue;
    disciplinas.add(disc);
    if (!porDisciplina[disc]) porDisciplina[disc] = {};
    if (!porDisciplina[disc][unidade]) porDisciplina[disc][unidade] = {};
    if (!porDisciplina[disc][unidade][objeto]) porDisciplina[disc][unidade][objeto] = [];
    const { codigo, descricao } = parseHab(hab);
    porDisciplina[disc][unidade][objeto].push({ codigo, descricao, habilidade_completa: hab });
  }

  const result: EstruturaBnccEF = { disciplinas: [...disciplinas].sort(), porDisciplina: {} };

  for (const disc of result.disciplinas) {
    const unids = Object.keys(porDisciplina[disc] || {}).sort();
    const porUnidade: Record<string, { objetos: string[]; porObjeto: Record<string, { codigo: string; descricao: string; habilidade_completa: string }[]> }> = {};
    for (const u of unids) {
      const objs = Object.keys(porDisciplina[disc][u] || {}).sort();
      porUnidade[u] = { objetos: objs, porObjeto: porDisciplina[disc][u] };
    }
    result.porDisciplina[disc] = { unidades: unids, porUnidade };
  }
  return result;
}

// --- EM ---
export type BnccEMRow = {
  area: string;
  componente: string;
  serie: string;
  unidade: string;
  habilidade: string;
};

function parseHabEM(hab: string): { codigo: string; descricao: string } {
  const match = (hab || "").trim().match(/\(?(EM\d+[A-Z0-9]+)\)?\s*(.*)/);
  if (match) return { codigo: match[1].trim(), descricao: (match[2] || "").trim() };
  return { codigo: "", descricao: hab };
}

export function loadBnccEM(): BnccEMRow[] {
  const path = join(DATA_DIR, "bncc_em.csv");
  try {
    const content = readFileSync(path, "utf-8");
    const rows = parseCSV(content);
    return rows
      .filter((r) => getCell(r, "Habilidade"))
      .map((r) => ({
        area: getCell(r, "Área de conhecimento", "Área", "Area"),
        componente: getCell(r, "Componente"),
        serie: getCell(r, "Série", "Serie"),
        unidade: getCell(r, "Unidade Temática", "Unidade Tematica"),
        habilidade: getCell(r, "Habilidade"),
      }));
  } catch {
    return [];
  }
}

export function carregarHabilidadesEMPorArea(serie?: string): {
  ano_atual: Record<string, { codigo: string; descricao: string; habilidade_completa: string; disciplina: string }[]>;
  anos_anteriores: Record<string, { codigo: string; descricao: string; habilidade_completa: string; disciplina: string }[]>;
} {
  const raw = loadBnccEM();
  const ano_atual: Record<string, { codigo: string; descricao: string; habilidade_completa: string; disciplina: string }[]> = {};
  for (const r of raw) {
    const a = (r.area || "").trim() || "Geral";
    const { codigo, descricao } = parseHabEM(r.habilidade);
    (ano_atual[a] = ano_atual[a] || []).push({
      codigo,
      descricao,
      habilidade_completa: r.habilidade,
      disciplina: a,
    });
  }
  return { ano_atual, anos_anteriores: {} };
}

// --- Helpers para detectar nível ---
export function detectarNivelEnsino(serie: string): "EI" | "EF" | "EM" | "" {
  if (!serie) return "";
  const s = serie.toLowerCase();
  if (s.includes("infantil")) return "EI";
  if (s.includes("série") || s.includes("em") || s.includes("médio") || s.includes("eja")) return "EM";
  return "EF";
}
