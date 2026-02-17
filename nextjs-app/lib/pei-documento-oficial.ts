/**
 * Serialização e prompt para gerar Documento Oficial do PEI via IA.
 * Transforma os dados estruturados do PEI em texto plano para a IA,
 * e gera o prompt que instrui a IA a reescrever como documento oficial.
 */

import type { PEIData } from "./pei";

/**
 * Serializa os dados do PEI em texto estruturado para envio à IA.
 */
export function serializarPeiParaTexto(dados: PEIData): string {
    const secoes: string[] = [];

    // 1. Identificação
    secoes.push("=== 1. IDENTIFICAÇÃO ===");
    secoes.push(`Nome: ${dados.nome || "Não informado"}`);
    if (dados.nasc) secoes.push(`Data de Nascimento: ${dados.nasc}`);
    if (dados.serie) secoes.push(`Série/Ano: ${dados.serie}`);
    if (dados.turma) secoes.push(`Turma: ${dados.turma}`);
    if (dados.matricula || (dados as { ra?: string }).ra) {
        secoes.push(`Matrícula/RA: ${dados.matricula || (dados as { ra?: string }).ra}`);
    }
    if (dados.nivel_alfabetizacao && dados.nivel_alfabetizacao !== "Nao se aplica (Educacao Infantil)") {
        secoes.push(`Nível de Alfabetização (Emília Ferreiro): ${dados.nivel_alfabetizacao}`);
    }

    // 2. Contexto e histórico
    if (dados.historico?.trim()) {
        secoes.push("\n=== 2. HISTÓRICO ESCOLAR ===");
        secoes.push(dados.historico.trim());
    }
    if (dados.familia?.trim()) {
        secoes.push("\n=== 3. DINÂMICA FAMILIAR ===");
        secoes.push(dados.familia.trim());
    }
    const compFam = (dados.composicao_familiar_tags || []).filter(Boolean) as string[];
    if (compFam.length) secoes.push(`Composição familiar: ${compFam.join(", ")}`);

    // 3. Diagnóstico
    secoes.push("\n=== 4. DIAGNÓSTICO E CONTEXTO CLÍNICO ===");
    secoes.push(`Diagnóstico: ${dados.diagnostico || "Em observação"}`);

    const detalhesDiag = (dados.detalhes_diagnostico || {}) as Record<string, string | string[]>;
    for (const [key, val] of Object.entries(detalhesDiag)) {
        if (!val || (typeof val === "string" && !val.trim()) || (Array.isArray(val) && val.length === 0)) continue;
        const label = key.replace(/_/g, " ");
        const value = Array.isArray(val) ? val.join(", ") : val;
        secoes.push(`  ${label}: ${value}`);
    }

    const meds = dados.lista_medicamentos || [];
    if (meds.length) {
        secoes.push("Medicações:");
        meds.forEach((m) => {
            const escola = m.escola ? " (administração na escola)" : "";
            secoes.push(`  - ${m.nome}${m.posologia ? ` — ${m.posologia}` : ""}${escola}`);
        });
    }

    const evidencias = dados.checklist_evidencias || {};
    const evidSel = Object.entries(evidencias).filter(([, v]) => v);
    if (evidSel.length) {
        secoes.push("Evidências pedagógicas observadas:");
        evidSel.forEach(([k]) => secoes.push(`  - ${k}`));
    }

    // 4. Potencialidades
    const potencias = (dados.potencias || []).filter(Boolean) as string[];
    const hiperfoco = dados.hiperfoco?.trim();
    if (potencias.length || hiperfoco) {
        secoes.push("\n=== 5. POTENCIALIDADES E INTERESSES ===");
        if (hiperfoco) secoes.push(`Hiperfoco/Interesse principal: ${hiperfoco}`);
        if (potencias.length) secoes.push(`Potencialidades: ${potencias.join(", ")}`);
    }

    // 5. Rede de apoio
    const rede = (dados.rede_apoio || []).filter(Boolean) as string[];
    const orientacoes = dados.orientacoes_especialistas?.trim();
    const orientacoesPorProf = dados.orientacoes_por_profissional || {};

    if (rede.length || orientacoes || Object.keys(orientacoesPorProf).length) {
        secoes.push("\n=== 6. REDE DE APOIO E ORIENTAÇÕES ===");
        if (rede.length) secoes.push(`Profissionais: ${rede.join(", ")}`);
        if (orientacoes) secoes.push(`Orientações gerais: ${orientacoes}`);
        Object.entries(orientacoesPorProf).forEach(([prof, txt]) => {
            if (typeof txt === "string" && txt.trim()) {
                secoes.push(`Orientações de ${prof}: ${txt.trim()}`);
            }
        });
    }

    // 6. Barreiras
    const barreiras = dados.barreiras_selecionadas || {};
    const niveis = dados.niveis_suporte || {};
    const temBarreiras = Object.values(barreiras).some((itens) => Array.isArray(itens) && itens.length > 0);

    if (temBarreiras) {
        secoes.push("\n=== 7. MAPEAMENTO DE BARREIRAS E NÍVEIS DE SUPORTE ===");
        Object.entries(barreiras).forEach(([area, itens]) => {
            if (Array.isArray(itens) && itens.length) {
                secoes.push(`${area}:`);
                itens.forEach((item: string) => {
                    const nivel = niveis[item] || niveis[`${area}_${item}`] || "Monitorado";
                    secoes.push(`  - ${item} (Nível: ${nivel})`);
                });
            }
        });
    }

    // 7. Estratégias
    const estAcesso = (dados.estrategias_acesso || []).filter(Boolean) as string[];
    const estEnsino = (dados.estrategias_ensino || []).filter(Boolean) as string[];
    const estAval = (dados.estrategias_avaliacao || []).filter(Boolean) as string[];

    if (estAcesso.length || estEnsino.length || estAval.length) {
        secoes.push("\n=== 8. PLANO DE AÇÃO — ESTRATÉGIAS ===");
        if (estAcesso.length) secoes.push(`Estratégias de Acesso: ${estAcesso.join("; ")}`);
        if (dados.outros_acesso?.trim()) secoes.push(`  Outras (acesso): ${dados.outros_acesso.trim()}`);
        if (estEnsino.length) secoes.push(`Estratégias de Ensino: ${estEnsino.join("; ")}`);
        if (dados.outros_ensino?.trim()) secoes.push(`  Outras (ensino): ${dados.outros_ensino.trim()}`);
        if (estAval.length) secoes.push(`Estratégias de Avaliação: ${estAval.join("; ")}`);
    }

    // 8. BNCC
    const habBncc = dados.habilidades_bncc_validadas || dados.habilidades_bncc_selecionadas || [];
    const bnccEI = dados.bncc_ei_objetivos || [];

    if ((Array.isArray(habBncc) && habBncc.length) || (Array.isArray(bnccEI) && bnccEI.length)) {
        secoes.push("\n=== 9. HABILIDADES BNCC ===");
        if (dados.bncc_ei_idade || dados.bncc_ei_campo) {
            secoes.push(`Educação Infantil: ${dados.bncc_ei_idade || ""} — Campo: ${dados.bncc_ei_campo || ""}`);
        }
        if (bnccEI.length) {
            secoes.push("Objetivos de Aprendizagem (EI):");
            bnccEI.forEach((obj) => secoes.push(`  - ${obj}`));
        }
        if (habBncc.length) {
            secoes.push("Habilidades por Componente:");
            habBncc.forEach((h) => {
                const hab = h as { codigo?: string; descricao?: string; habilidade_completa?: string; disciplina?: string };
                const disc = hab.disciplina || "Geral";
                const texto = hab.habilidade_completa || `${hab.codigo || ""} — ${hab.descricao || ""}`;
                secoes.push(`  - [${disc}] ${texto}`);
            });
        }
    }

    // 9. Consultoria IA (resumo do planejamento pedagógico)
    if (dados.ia_sugestao?.trim()) {
        secoes.push("\n=== 10. PLANEJAMENTO PEDAGÓGICO (SUGESTÕES IA) ===");
        secoes.push(dados.ia_sugestao.trim().replace(/\[.*?\]/g, "").slice(0, 4000));
    }

    // 10. Monitoramento
    if (dados.monitoramento_data || dados.status_meta || dados.parecer_geral) {
        secoes.push("\n=== 11. MONITORAMENTO ===");
        if (dados.monitoramento_data) secoes.push(`Data: ${dados.monitoramento_data}`);
        if (dados.status_meta) secoes.push(`Status da Meta: ${dados.status_meta}`);
        if (dados.parecer_geral) secoes.push(`Parecer: ${dados.parecer_geral}`);
        const prox = (dados.proximos_passos_select || []).filter(Boolean) as string[];
        if (prox.length) secoes.push(`Próximos passos: ${prox.join(", ")}`);
    }

    return secoes.join("\n");
}

/**
 * Gera o prompt do sistema para reescrita como documento oficial.
 */
export function promptDocumentoOficial(textoSerializado: string): Array<{ role: string; content: string }> {
    const systemPrompt = `Você é um especialista em educação inclusiva e redação de documentos pedagógicos oficiais brasileiros.

Sua tarefa é transformar os dados estruturados de um PEI (Plano de Ensino Individualizado) em um DOCUMENTO OFICIAL fluido, coeso e profissional.

## REGRAS OBRIGATÓRIAS:

1. **Linguagem formal técnico-pedagógica** — redação em 3ª pessoa do singular
2. **Parágrafos coesos** — NÃO use bullet points nem listas. Escreva em prosa corrida, conectando as informações em parágrafos bem estruturados
3. **Estrutura do documento:**
   - IDENTIFICAÇÃO DO ESTUDANTE (parágrafo narrativo com dados pessoais e escolares)
   - DIAGNÓSTICO E CONTEXTO CLÍNICO (incluir medicações se houver)
   - POTENCIALIDADES E INTERESSES (destacar, começando pelas forças)
   - MAPEAMENTO DE BARREIRAS E NÍVEIS DE SUPORTE (descrever com clareza os domínios e níveis)
   - PLANO DE AÇÃO PEDAGÓGICO (estratégias de acesso, ensino e avaliação)
   - ALINHAMENTO CURRICULAR (BNCC) (habilidades selecionadas e justificativa)
   - MONITORAMENTO E ACOMPANHAMENTO (se houver dados)
   - CONSIDERAÇÕES FINAIS E ENCAMINHAMENTOS

4. **Fundamentação legal** — Citar artigos da Lei nº 13.146/2015 (LBI) e da Resolução CNE/CEB nº 4/2009 quando pertinente, de forma natural no texto
5. **PROIBIDO inventar dados** — use EXCLUSIVAMENTE as informações fornecidas. Se um campo estiver vazio, não o mencione
6. **Termos técnicos** — manter siglas e termos como DSM-5, CIF, CID-10, BNCC, DUA, AEE quando presentes nos dados
7. **Tom** — respeitoso, técnico, focado na potencialidade do estudante (modelo social da deficiência)
8. **Extensão** — entre 2 e 4 páginas A4 de texto corrido
9. **NÃO incluir** cabeçalho, rodapé, ou formatação markdown (##, **, etc.) — apenas texto puro com quebras de parágrafo
10. **Cada seção** deve começar com o título em CAIXA ALTA seguido de dois pontos e o texto na mesma linha ou linha seguinte

Exemplo de início:
"IDENTIFICAÇÃO DO ESTUDANTE: O(A) estudante [Nome], nascido(a) em [data], encontra-se regularmente matriculado(a) no [série/ano] da [escola], na turma [turma]..."`;

    return [
        { role: "system", content: systemPrompt },
        {
            role: "user",
            content: `Reescreva os dados abaixo como DOCUMENTO OFICIAL do PEI:\n\n${textoSerializado}`,
        },
    ];
}
