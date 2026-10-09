/**
 * Matriz Omni — matriz de avaliação diagnóstica do Ensino Fundamental (1º ao 9º ano).
 * Estrutura: componente → ano → eixo (unidade temática da BNCC) → descritor Omni →
 * habilidades da BNCC (códigos oficiais) → descritor do SAEB, quando existe (LP e MA, 5º e 9º).
 * Texto dos descritores é do OmniProf; fontes públicas: BNCC (MEC) e SAEB 2001 (INEP).
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
};

export type ComponenteOmni = { componente: string; sigla: string; descritores: DescritorOmni[] };

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

/** "OMNI-MA5-D07" → "MA". */
export function siglaDoCodigo(codigo: string): string | null {
    const m = /^OMNI-([A-Z]{2})\d{1,2}-D\d{2}$/.exec(codigo || "");
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
        `- Evidência esperada: ${d.evidencia}`,
        ...saeb.map((s) => `- Descritor do SAEB relacionado ${s.codigo}: ${s.texto}`),
        "Todo item mede ESTE descritor. As habilidades da BNCC abaixo são as que ele cobre.",
    ].join("\n");
}
