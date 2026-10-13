/**
 * Matriz Omni — matriz de avaliação diagnóstica do Ensino Fundamental (1º ao 9º ano).
 * Estrutura: componente → ano → eixo (unidade temática da BNCC) → descritor Omni →
 * habilidades da BNCC (códigos oficiais) → descritor do SAEB, quando existe (LP e MA, 5º e 9º).
 * Texto dos descritores é do OmniProf; fontes públicas: BNCC (MEC), Saeb–BNCC 2022 (Inep, Matemática) e SAEB 2001 (Inep, LP).
 * Revisão de out/2026 (todos os componentes): código no padrão do
 * Saeb — OMNI-MA5-N1.2 = 5º ano, Números, eixo cognitivo 1, descritor 2; OMNI-LP5-L2.3 = 5º ano, Leitura,
 * eixo cognitivo 2 (analisar), descritor 3; nas faixas, OMNI-AR15-M1.2 — com eixo cognitivo e nível de Bloom.
 * Os códigos antigos (OMNI-MA5-D01…) ficam em `substituidos`, para ler avaliações já gravadas.
 * Dados em data/matriz-omni/<SIGLA>.json, servidos só para quem está logado em /api/matriz-omni?sigla=XX.
 */

export type DescritorOmni = {
    codigo: string;
    ano: string;
    eixo: string;
    descritor: string;
    habilidades_bncc: string[];
    saeb: string[];
    evidencia: string;
    /** Eixo cognitivo do Saeb. Matemática: 1 compreender e aplicar, 2 resolver problemas e argumentar.
     *  Linguagens (LP, Arte, Educação Física, Inglês): 1 reconhecer, 2 analisar, 3 avaliar, 4 produzir.
     *  Ciências, História e Geografia: 1 (A), 2 (B), 3 (C) do Saeb de Ciências da Natureza / Humanas. */
    eixo_cognitivo?: number;
    /** Taxonomia de Bloom revisada: lembrar, entender, aplicar, analisar, avaliar, criar. */
    bloom?: string;
};

export type DescritorSubstituido = DescritorOmni & { substituido_por: string[] };

export type ComponenteOmni = { componente: string; sigla: string; descritores: DescritorOmni[]; substituidos?: DescritorSubstituido[] };

const EIXOS_COGNITIVOS: Record<string, Record<number, string>> = {
    MA: { 1: "Compreender e aplicar conceitos e procedimentos", 2: "Resolver problemas e argumentar" },
    LINGUAGENS: { 1: "Reconhecer", 2: "Analisar", 3: "Avaliar", 4: "Produzir" },
    CI: { 1: "A · Baixa complexidade (reconhecer, identificar)", 2: "B · Média complexidade (relacionar, explicar, analisar)", 3: "C · Alta complexidade (avaliar, justificar, propor)" },
    CH: { 1: "A · Reconhecimento e recuperação", 2: "B · Compreensão e análise", 3: "C · Avaliação e proposição" },
};

/** Nome do eixo cognitivo do Saeb para o descritor (pelo componente do código). */
export function nomeEixoCognitivo(codigo: string, n?: number): string | null {
    if (!n) return null;
    const sigla = siglaDoCodigo(codigo);
    const tabela = sigla === "MA" ? EIXOS_COGNITIVOS.MA
        : sigla && ["LP", "AR", "EF", "LI"].includes(sigla) ? EIXOS_COGNITIVOS.LINGUAGENS
        : sigla === "CI" ? EIXOS_COGNITIVOS.CI
        : sigla && ["HI", "GE"].includes(sigla) ? EIXOS_COGNITIVOS.CH : null;
    return tabela?.[n] ?? null;
}

/** Compatibilidade (Matemática). */
export const NOME_EIXO_COGNITIVO: Record<number, string> = EIXOS_COGNITIVOS.MA;

/** Código Omni válido: antigo (OMNI-MA5-D07) ou no padrão do Saeb (OMNI-MA5-N1.2, OMNI-LP5-L2.3, OMNI-AR15-M1.2). */
export const RE_CODIGO_OMNI = /^OMNI-([A-Z]{2})\d{1,2}-(?:D\d{2}|[A-Z][1-4]\.\d{1,2})$/;

/** Acha o descritor pelo código, inclusive os substituídos (avaliações antigas). */
export function descritorPorCodigo(comp: ComponenteOmni | null, codigo: string): DescritorOmni | DescritorSubstituido | null {
    if (!comp) return null;
    return comp.descritores.find((d) => d.codigo === codigo) || comp.substituidos?.find((d) => d.codigo === codigo) || null;
}

const SIGLA: Record<string, string> = {
    "Língua Portuguesa": "LP",
    "Matemática": "MA",
    "Ciências": "CI",
    "História": "HI",
    "Geografia": "GE",
    "Arte": "AR",
    "Educação Física": "EF",
    "Língua Inglesa": "LI",
};

export function siglaOmni(componente: string): string | null {
    return SIGLA[componente?.trim()] ?? null;
}

/** Arte e Educação Física seguem as faixas da BNCC; as outras, ano a ano. Língua Inglesa começa no 6º. */
export const ANOS_MATRIZ_OMNI: Record<string, string[]> = {
    LI: ["6º ano", "7º ano", "8º ano", "9º ano"],
    PADRAO: ["1º ano", "2º ano", "3º ano", "4º ano", "5º ano", "6º ano", "7º ano", "8º ano", "9º ano"],
};

export function anosDaSiglaOmni(sigla: string): string[] {
    return ANOS_MATRIZ_OMNI[sigla] || ANOS_MATRIZ_OMNI.PADRAO;
}

/** Abre na última turma do professor, ou na primeira disciplina do perfil que tem Matriz Omni. */
export function turmaInicialMatrizOmni(opts: {
    ultima?: { ano?: string; componente?: string } | null;
    componentesPerfil?: string[];
}): { sigla: string; ano: string } {
    const tentar = (componente?: string, ano?: string): { sigla: string; ano: string } | null => {
        if (!componente) return null;
        const sigla = siglaOmni(componente);
        if (!sigla) return null;
        const anos = anosDaSiglaOmni(sigla);
        const escolhido = ano && anos.includes(ano) ? ano : anos[0];
        return { sigla, ano: escolhido };
    };
    return (
        tentar(opts.ultima?.componente, opts.ultima?.ano)
        || (opts.componentesPerfil || []).map((c) => tentar(c)).find(Boolean)
        || { sigla: "MA", ano: "5º ano" }
    );
}

/** "OMNI-MA5-D07" ou "OMNI-MA5-N1.2" → "MA". */
export function siglaDoCodigo(codigo: string): string | null {
    const m = RE_CODIGO_OMNI.exec(codigo || "");
    return m ? m[1] : null;
}

function numeroAno(ano: string): number | null {
    const m = /(\d)º/.exec(ano || "");
    return m ? Number(m[1]) : null;
}

/** O descritor vale para a turma? Aceita ano único ("5º ano") e faixa ("1º ao 5º ano", "8º e 9º ano"). */
export function valeParaAno(anoDescritor: string, anoTurma: string): boolean {
    const t = numeroAno(anoTurma);
    if (t == null) return false;
    const nums = [...anoDescritor.matchAll(/(\d)º/g)].map((m) => Number(m[1]));
    if (!nums.length) return false;
    if (nums.length === 1) return nums[0] === t;
    const [ini, fim] = [Math.min(...nums), Math.max(...nums)];
    return /\bao\b/.test(anoDescritor) ? t >= ini && t <= fim : nums.includes(t);
}

export function descritoresDoAno(comp: ComponenteOmni | null, anoTurma: string): DescritorOmni[] {
    return comp ? comp.descritores.filter((d) => valeParaAno(d.ano, anoTurma)) : [];
}

/** Bloco do prompt: o parâmetro do item na Matriz Omni, com o SAEB oficial quando houver. */
export function blocoParametroOmni(d: DescritorOmni, saeb: { codigo: string; texto: string }[]): string {
    return [
        "PARÂMETRO DO ITEM (Matriz Omni — avaliação diagnóstica):",
        `- ${d.codigo} (${d.ano}, eixo ${d.eixo}): ${d.descritor}`,
        ...(d.eixo_cognitivo ? [`- Eixo cognitivo (Saeb): ${nomeEixoCognitivo(d.codigo, d.eixo_cognitivo) ?? d.eixo_cognitivo}${d.bloom ? ` · nível de Bloom: ${d.bloom}` : ""}`] : []),
        `- Evidência esperada: ${d.evidencia}`,
        ...saeb.map((s) => `- Habilidade do Saeb relacionada ${s.codigo}: ${s.texto}`),
        "Todo item mede ESTE descritor. As habilidades da BNCC abaixo são as que ele cobre.",
    ].join("\n");
}
