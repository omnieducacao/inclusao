import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { parseBody, peiConsultoriaSchema } from "@/lib/validation";
import { NextResponse } from "next/server";
import { chatCompletionText, getEngineError } from "@/lib/ai-engines";
import type { EngineId } from "@/lib/ai-engines";
import { getSupabase } from "@/lib/supabase";
import { getSession } from "@/lib/session";
import {
  detectarNivelEnsino,
  carregarHabilidadesEFPorComponente,
  carregarHabilidadesEMPorArea,
  objetivosEIPorIdadeCampo,
} from "@/lib/bncc";
import { requireAuth } from "@/lib/permissions";

type PEIDataPayload = {
  nome?: string;
  serie?: string | null;
  historico?: string;
  diagnostico?: string;
  lista_medicamentos?: { nome?: string; posologia?: string }[];
  checklist_evidencias?: Record<string, boolean>;
  hiperfoco?: string;
  potencias?: string[];
  barreiras_selecionadas?: Record<string, string[]>;
  niveis_suporte?: Record<string, string>;
  estrategias_acesso?: string[];
  estrategias_ensino?: string[];
  estrategias_avaliacao?: string[];
  nivel_alfabetizacao?: string;
  habilidades_bncc_validadas?: Array<{ disciplina?: string; codigo?: string; descricao?: string; habilidade_completa?: string }>;
  habilidades_bncc_selecionadas?: Array<{ disciplina?: string; codigo?: string; descricao?: string; habilidade_completa?: string }>;
  bncc_ei_idade?: string;
  bncc_ei_campo?: string;
  bncc_ei_objetivos?: string[];
  orientacoes_especialistas?: string;
  [key: string]: unknown;
};

function buildPrompt(dados: PEIDataPayload, modoPratico: boolean, feedback?: string, dossieSintetico?: string): { system: string; user: string } {
  const evid = Object.entries(dados.checklist_evidencias || {})
    .filter(([, v]) => v)
    .map(([k]) => `- ${k.replace("?", "")}`)
    .join("\n");
  const listaMeds = Array.isArray(dados.lista_medicamentos) ? dados.lista_medicamentos : [];
  const medsInfo = listaMeds.length
    ? listaMeds
      .map((m: { nome?: string; posologia?: string }) => `- ${m.nome || ""} (${m.posologia || ""}).`)
      .join("\n")
    : "Nenhuma medicação informada.";
  const serie = dados.serie || "";
  const nivel = detectarNivelEnsino(serie);

  // Sinalizar segmento e abordagem da IA baseado no nível
  const segmentoInfo: Record<string, { nome: string; abordagem: string }> = {
    EI: {
      nome: "Educação Infantil",
      abordagem: "ABORDAGEM IA (EI): Foco em Campos de Experiência (BNCC), rotina estruturante, desenvolvimento sensório-motor e socioemocional. Use linguagem lúdica e concreta."
    },
    EF: {
      nome: "Ensino Fundamental",
      abordagem: "ABORDAGEM IA (EF): Foco em alfabetização, numeracia, habilidades basais (anos iniciais) ou autonomia, funções executivas e aprofundamento conceitual (anos finais)."
    },
    EM: {
      nome: "Ensino Médio / EJA",
      abordagem: "ABORDAGEM IA (EM): Foco em projeto de vida, áreas do conhecimento, estratégias de estudo e preparação para vida adulta/mercado de trabalho."
    }
  };
  const infoSegmento = segmentoInfo[nivel] || { nome: "Não identificado", abordagem: "" };

  const hiperfocoTxt = dados.hiperfoco
    ? `HIPERFOCO DO ESTUDANTE: ${dados.hiperfoco}`
    : "Hiperfoco: Não identificado.";
  const alfabetizacao = dados.nivel_alfabetizacao || "Não Avaliado";

  // Barreiras
  const barreiras = dados.barreiras_selecionadas || {};
  const barreirasTxt = Object.entries(barreiras)
    .filter(([, v]) => v && v.length)
    .map(([area, lst]) => `${area}: ${(lst || []).join(", ")}`)
    .join("\n");

  if (modoPratico) {
    // Detalhes condicionais do diagnóstico
    const detalhesDiagMP = (dados.detalhes_diagnostico || {}) as Record<string, string | string[]>;
    const detalhesDiagMPTxt = Object.entries(detalhesDiagMP)
      .filter(([, v]) => v && (typeof v === "string" ? v.trim() : (v as string[]).length > 0))
      .map(([k, v]) => `  - ${k.replace(/_/g, " ")}: ${Array.isArray(v) ? v.join(", ") : v}`)
      .join("\n");
    const potenciasMPTxt = Array.isArray(dados.potencias) && dados.potencias.length
      ? `POTENCIALIDADES: ${dados.potencias.join(", ")}`
      : "";
    const redeApoioMPTxt = Array.isArray(dados.rede_apoio) && dados.rede_apoio.length
      ? `REDE DE APOIO: ${dados.rede_apoio.join(", ")}`
      : "";

    const system = `Especialista em Inclusão Escolar e DUA.
GUIA PRÁTICO PARA SALA DE AULA.
Use Markdown simples. Seja objetivo e aplicável.

ESTRUTURA:
### 1. ENTENDENDO O ESTUDANTE: Resumo do perfil, diagnóstico e como impacta o dia a dia em sala.
### 2. ADAPTAÇÕES IMEDIATAS: O que fazer AGORA na sala de aula (lugar, materiais, rotina).
### 3. ESTRATÉGIAS DE MEDIAÇÃO: Como mediar as atividades (fragmentação, scaffolding, instruções passo a passo).
### 4. ACESSIBILIDADE: Adaptações de acesso (visual, auditivo, motor, cognitivo).
### 5. METAS SMART PRÁTICAS: 3 metas concretas e mensuráveis (curto, médio, longo prazo) com critério de sucesso.
### 6. DICAS DO DIA: 5 dicas rápidas para a rotina diária.
### 7. 🧩 CHECKLIST DE ADAPTAÇÃO E ACESSIBILIDADE:
**A. Mediação (Triângulo de Ouro):** Instruções passo a passo, Fragmentação de tarefas, Scaffolding
**B. Acessibilidade:** Inferências/figuras de linguagem, Descrição de imagens, Adaptação visual, Adequação de desafio`;

    const promptFeedback = feedback ? `\n\nAJUSTE SOLICITADO PELO PROFESSOR: ${feedback}` : "";

    const user = `ALUNO: ${dados.nome || ""} | SÉRIE: ${serie} | DIAGNÓSTICO: ${dados.diagnostico || "em observação"}
${detalhesDiagMPTxt ? `DETALHAMENTO CLÍNICO:\n${detalhesDiagMPTxt}` : ""}
${hiperfocoTxt}
${potenciasMPTxt}
${redeApoioMPTxt}
MEDS: ${medsInfo}
EVIDÊNCIAS: ${evid || "Nenhuma"}
BARREIRAS: ${barreirasTxt || "Não mapeadas"}
ESTRATÉGIAS ACESSO: ${(dados.estrategias_acesso || []).join(", ")}
ESTRATÉGIAS ENSINO: ${(dados.estrategias_ensino || []).join(", ")}
ESTRATÉGIAS AVALIAÇÃO: ${(dados.estrategias_avaliacao || []).join(", ")}
ORIENTAÇÕES ESPECIALISTAS: ${(dados.orientacoes_especialistas || "").slice(0, 500)}
NÍVEL DE ALFABETIZAÇÃO: ${alfabetizacao}

Crie um GUIA PRÁTICO para sala de aula com adaptações concretas baseadas em TODOS os dados acima.${promptFeedback}${dossieSintetico ? `\n\n${dossieSintetico}` : ""}`;

    return { system, user };
  }

  if (nivel === "EI") {
    const idade = dados.bncc_ei_idade || "";
    const campo = dados.bncc_ei_campo || "";
    const objList = dados.bncc_ei_objetivos || objetivosEIPorIdadeCampo(idade, campo);
    const objTxt = objList.length ? objList.map((o) => `- ${o}`).join("\n") : "(não selecionados)";

    // Detalhes condicionais para EI
    const detalhesDiagEI = (dados.detalhes_diagnostico || {}) as Record<string, string | string[]>;
    const detalhesDiagEITxt = Object.entries(detalhesDiagEI)
      .filter(([, v]) => v && (typeof v === "string" ? v.trim() : (v as string[]).length > 0))
      .map(([k, v]) => `  - ${k.replace(/_/g, " ")}: ${Array.isArray(v) ? v.join(", ") : v}`)
      .join("\n");
    const potenciasEITxt = Array.isArray(dados.potencias) && dados.potencias.length
      ? `POTENCIALIDADES: ${dados.potencias.join(", ")}`
      : "";
    const redeApoioEITxt = Array.isArray(dados.rede_apoio) && dados.rede_apoio.length
      ? `REDE DE APOIO: ${dados.rede_apoio.join(", ")}`
      : "";

    const system = `Especialista em EDUCAÇÃO INFANTIL e BNCC.
MISSÃO: Criar PEI Técnico Oficial COMPLETO e PERSONALIZADO.
${infoSegmento.abordagem}

Use Markdown simples. Use títulos H3 (###). Evite tabelas.

ESTRUTURA OBRIGATÓRIA:

[PERFIL_NARRATIVO] Inicie com "👤 QUEM É O ESTUDANTE?". Parágrafo humanizado incluindo diagnóstico, hiperfoco, potências e nível de desenvolvimento. ${hiperfocoTxt}. [/PERFIL_NARRATIVO]

### 1. 🏥 DIAGNÓSTICO E IMPACTO: Cite diagnóstico (e CID se disponível), impactos na aprendizagem, cuidados.
${detalhesDiagEITxt ? `Use os detalhes clínicos fornecidos para PERSONALIZAR o impacto e as estratégias.` : ""}

### 2. 🌟 AVALIAÇÃO DE REPERTÓRIO:
[MAPEAMENTO_BNCC_EI] Use APENAS:
- Faixa de idade: ${idade || "não informada"}
- Campo de Experiência: ${campo || "não informado"}
- Objetivos de Aprendizagem (cite EXATAMENTE):
${objTxt}
[/MAPEAMENTO_BNCC_EI]

### 3. 🚀 ESTRATÉGIAS DE INTERVENÇÃO: Estratégias de acolhimento, rotina, adaptação sensorial. Inclua as estratégias já selecionadas pelo professor e AMPLIE.

### 4. 🎯 METAS SMART: Crie metas ESPECÍFICAS, MENSURÁVEIS, ATINGÍVEIS, RELEVANTES e com PRAZO.
Para cada meta inclua OBRIGATORIAMENTE:
- **O quê**: descrição clara
- **Critério de sucesso**: como medir
- **Prazo**: período específico
- **Responsável**: quem acompanha
- **Curto prazo** (2 meses) | **Médio** (1 semestre) | **Longo** (1 ano)
Baseie nas BARREIRAS, POTENCIALIDADES e OBJETIVOS BNCC EI do estudante.

### 5. ⚠️ PONTOS DE ATENÇÃO FARMACOLÓGICA: [ANALISE_FARMA] Se houver medicação, cite efeitos colaterais para atenção pedagógica. [/ANALISE_FARMA]

### 6. 🧩 CHECKLIST DE ADAPTAÇÃO: Mediação (instruções passo a passo, fragmentação, scaffolding), Acessibilidade (inferências, imagens, visual, desafio).`;

    const promptFeedback = feedback ? `\n\nAJUSTE SOLICITADO PELO PROFESSOR: ${feedback}` : "";

    const user = `ALUNO: ${dados.nome || ""} | SÉRIE: ${serie} | SEGMENTO: Educação Infantil
HISTÓRICO: ${(dados.historico || "").slice(0, 500)}
DIAGNÓSTICO: ${dados.diagnostico || "em observação"}
${detalhesDiagEITxt ? `DETALHAMENTO CLÍNICO:\n${detalhesDiagEITxt}` : ""}
MEDS: ${medsInfo}
${hiperfocoTxt}
${potenciasEITxt}
${redeApoioEITxt}
NÍVEL DE ALFABETIZAÇÃO: ${alfabetizacao}
EVIDÊNCIAS OBSERVADAS: ${evid || "Nenhuma"}
BARREIRAS: ${barreirasTxt || "Não mapeadas"}
ESTRATÉGIAS ACESSO: ${(dados.estrategias_acesso || []).join(", ")}
ESTRATÉGIAS ENSINO: ${(dados.estrategias_ensino || []).join(", ")}
ORIENTAÇÕES ESPECIALISTAS: ${(dados.orientacoes_especialistas || "").slice(0, 500)}${promptFeedback}${dossieSintetico ? `\n\n${dossieSintetico}` : ""}`;

    return { system, user };
  }

  // EF / EM
  const habValidadas = dados.habilidades_bncc_validadas || dados.habilidades_bncc_selecionadas || [];
  let habTxt = "";
  if (habValidadas.length && Array.isArray(habValidadas)) {
    habTxt = habValidadas
      .filter((h) => h && typeof h === "object")
      .map(
        (h: { disciplina?: string; codigo?: string; descricao?: string; habilidade_completa?: string }) =>
          `- ${h.disciplina || ""}: ${h.codigo || ""} — ${h.habilidade_completa || h.descricao || ""}`
      )
      .join("\n");
  }
  if (!habTxt.trim() && serie) {
    const blocos = nivel === "EM"
      ? carregarHabilidadesEMPorArea(serie)
      : carregarHabilidadesEFPorComponente(serie);
    const anoAtual = blocos.ano_atual || {};
    const ant = blocos.anos_anteriores || {};
    const flat = (r: Record<string, unknown[]>) =>
      Object.entries(r).flatMap(([d, lst]) =>
        (Array.isArray(lst) ? lst : []).map((h: unknown) => {
          const hab = h as { codigo?: string; habilidade_completa?: string };
          return `${d}: ${hab.codigo || ""} — ${hab.habilidade_completa || ""}`;
        })
      );
    habTxt = [...flat(ant), ...flat(anoAtual)].map((l) => `- ${l}`).join("\n");
  }
  const promptLiteracia =
    alfabetizacao &&
      !alfabetizacao.includes("Alfabético") &&
      alfabetizacao !== "Não se aplica (Educação Infantil)"
      ? `[ATENÇÃO ALFABETIZAÇÃO] Fase: ${alfabetizacao}. Inclua 2 ações de consciência fonológica. [/ATENÇÃO ALFABETIZAÇÃO]`
      : "";

  // Dados completos para contextualizar a IA
  const potenciasTxt = Array.isArray(dados.potencias) && dados.potencias.length
    ? `POTENCIALIDADES: ${dados.potencias.join(", ")}`
    : "POTENCIALIDADES: Não identificadas.";
  const redeApoioTxt = Array.isArray(dados.rede_apoio) && dados.rede_apoio.length
    ? `REDE DE APOIO: ${dados.rede_apoio.join(", ")}`
    : "REDE DE APOIO: Não informada.";
  const estratAcessoTxt = Array.isArray(dados.estrategias_acesso) && dados.estrategias_acesso.length
    ? `ESTRATÉGIAS DE ACESSO: ${dados.estrategias_acesso.join(", ")}`
    : "";
  const estratEnsinoTxt = Array.isArray(dados.estrategias_ensino) && dados.estrategias_ensino.length
    ? `ESTRATÉGIAS DE ENSINO: ${dados.estrategias_ensino.join(", ")}`
    : "";
  const estratAvalTxt = Array.isArray(dados.estrategias_avaliacao) && dados.estrategias_avaliacao.length
    ? `ESTRATÉGIAS DE AVALIAÇÃO: ${dados.estrategias_avaliacao.join(", ")}`
    : "";
  const orientacoesTxt = dados.orientacoes_especialistas
    ? `ORIENTAÇÕES DE ESPECIALISTAS: ${(dados.orientacoes_especialistas).slice(0, 500)}`
    : "";

  // Detalhes condicionais do diagnóstico (TEA nível suporte, TDAH tipo, etc.)
  const detalhesDiag = (dados.detalhes_diagnostico || {}) as Record<string, string | string[]>;
  const detalhesDiagTxt = Object.entries(detalhesDiag)
    .filter(([, v]) => v && (typeof v === "string" ? v.trim() : (v as string[]).length > 0))
    .map(([k, v]) => `  - ${k.replace(/_/g, " ")}: ${Array.isArray(v) ? v.join(", ") : v}`)
    .join("\n");

  const system = `Especialista em Inclusão Escolar e BNCC.
MISSÃO: Criar PEI Técnico Oficial COMPLETO e PERSONALIZADO.
${infoSegmento.abordagem}

REGRA CRÍTICA (Avaliação de Repertório): Cite SOMENTE habilidades da lista fornecida. Ao citar, reproduza EXATAMENTE: código e descrição COMPLETA. Proibido parafrasear.

Use Markdown simples. Use títulos H3 (###). Evite tabelas.

ESTRUTURA OBRIGATÓRIA:

[PERFIL_NARRATIVO] Inicie com "👤 QUEM É O ESTUDANTE?". Parágrafo humanizado incluindo: diagnóstico, hiperfoco, potências, rede de apoio, composição familiar, nível de alfabetização. ${hiperfocoTxt}. [/PERFIL_NARRATIVO]

### 1. 🏥 DIAGNÓSTICO E IMPACTO: Cite diagnóstico (e CID se disponível), impactos na aprendizagem, cuidados.
${detalhesDiagTxt ? `Use os detalhes clínicos fornecidos (nível de suporte, tipo, comunicação etc.) para PERSONALIZAR o impacto e as estratégias.` : ""}

### 2. 🌟 AVALIAÇÃO DE REPERTÓRIO:
[MAPEAMENTO_BNCC] Cite SOMENTE habilidades da lista abaixo. Reproduza EXATAMENTE código + descrição. NÃO invente outras.
[HABILIDADES]
${habTxt || "(use habilidades do ano/série do estudante conforme BNCC)"}
[/HABILIDADES]
[/MAPEAMENTO_BNCC]

### 3. 🚀 ESTRATÉGIAS DE INTERVENÇÃO: Adaptações curriculares e de acesso. Inclua as estratégias já selecionadas pelo professor e AMPLIE com sugestões complementares. ${promptLiteracia}

### 4. 📊 COMPONENTES QUE MERECEM ATENÇÃO: Quadro com componente, nível (Alta|Média|Monitoramento), motivos ligando diagnóstico + barreiras às habilidades.

### 5. 🎯 METAS SMART: Crie metas ESPECÍFICAS, MENSURÁVEIS, ATINGÍVEIS, RELEVANTES e com PRAZO definido.
Para cada meta inclua OBRIGATORIAMENTE:
- **O quê**: descrição clara da habilidade ou comportamento alvo
- **Critério de sucesso**: como medir (ex: "em 3 de 5 tentativas", "com 80% de acerto")
- **Prazo**: data ou período específico
- **Responsável**: quem acompanha (professor, AEE, família)
- **Meta de curto prazo** (2 meses): foco em adaptações imediatas
- **Meta de médio prazo** (1 semestre): foco em consolidação
- **Meta de longo prazo** (1 ano): foco em autonomia e generalização
Baseie as metas nas BARREIRAS, POTENCIALIDADES e HABILIDADES BNCC do estudante.

### 6. ⚠️ PONTOS DE ATENÇÃO FARMACOLÓGICA: [ANALISE_FARMA] Se houver medicação, cite efeitos colaterais para atenção pedagógica. [/ANALISE_FARMA]

### 7. 🧩 CHECKLIST DE ADAPTAÇÃO E ACESSIBILIDADE:
**A. Mediação (Triângulo de Ouro):** Instruções passo a passo, Fragmentação de tarefas, Scaffolding
**B. Acessibilidade:** Inferências/figuras de linguagem, Descrição de imagens, Adaptação visual, Adequação de desafio`;

  const promptFeedback = feedback ? `\n\nAJUSTE SOLICITADO PELO PROFESSOR: ${feedback}` : "";

  const user = `ALUNO: ${dados.nome || ""} | SÉRIE: ${serie} | SEGMENTO: ${infoSegmento.nome}
HISTÓRICO: ${(dados.historico || "").slice(0, 500)}
DIAGNÓSTICO: ${dados.diagnostico || "em observação"}
${detalhesDiagTxt ? `DETALHAMENTO CLÍNICO:\n${detalhesDiagTxt}` : ""}
MEDS: ${medsInfo}
${hiperfocoTxt}
${potenciasTxt}
${redeApoioTxt}
NÍVEL DE ALFABETIZAÇÃO: ${alfabetizacao}
EVIDÊNCIAS OBSERVADAS: ${evid || "Nenhuma"}
BARREIRAS: ${barreirasTxt || "Não mapeadas"}
NÍVEIS SUPORTE: ${JSON.stringify(dados.niveis_suporte || {})}
${estratAcessoTxt}
${estratEnsinoTxt}
${estratAvalTxt}
${orientacoesTxt}

[LISTA DE HABILIDADES PERMITIDAS — cite SOMENTE estas, COPIANDO EXATAMENTE:]
${habTxt || "(carregue do contexto BNCC do ano/série)"}${promptFeedback}${dossieSintetico ? `\n\n${dossieSintetico}` : ""}`;

  return { system, user };
}


// Allow up to 60s for AI generation (Vercel default is 10s)
export const maxDuration = 60;

export async function POST(req: Request) {
  const rl = rateLimitResponse(req, RATE_LIMITS.AI_GENERATION); if (rl) return rl;
  const { error: authError } = await requireAuth(); if (authError) return authError;
  let dados: PEIDataPayload = {};
  let engine: EngineId = "red";
  let modoPratico = false;

  const parsed = await parseBody(req, peiConsultoriaSchema);
  if (parsed.error) return parsed.error;
  const body = parsed.data;
  dados = (body.peiData || body) as PEIDataPayload;
  engine = (body.engine || "red") as EngineId;
  modoPratico = !!body.modo_pratico;
  const feedback = body.feedback || undefined;

  const engineErr = getEngineError(engine);
  if (engineErr) {
    return NextResponse.json({ error: engineErr }, { status: 500 });
  }

  if (!dados.serie && !dados.nome) {
    return NextResponse.json(
      { error: "Selecione a Série/Ano na aba Estudante para ativar a Consultoria." },
      { status: 400 }
    );
  }

  // --- MONTAGEM DO DOSSIÊ SINTÉTICO (G1) ---
  const studentId = body.studentId as string | undefined;
  const paeeData = body.paeeData as Record<string, unknown> | undefined;
  const dailyLogs = body.dailyLogs as Record<string, unknown>[] | undefined;

  let dossieSintetico = "";
  try {
    if (studentId) {
      const session = await getSession();
      if (session?.workspace_id) {
        let txtDiag = "";
        const sb = getSupabase();
        const { data: avaliacoes } = await sb
          .from("avaliacoes_diagnosticas")
          .select("disciplina, nivel_omnisfera_identificado")
          .eq("student_id", studentId)
          .eq("workspace_id", session.workspace_id)
          .not("nivel_omnisfera_identificado", "is", null)
          .order("created_at", { ascending: false })
          .limit(3);

        if (avaliacoes && avaliacoes.length > 0) {
          txtDiag = "\nAVALIAÇÃO DIAGNÓSTICA OMNISFERA:\n" + avaliacoes.map((a: any) => {
            return `- ${a.disciplina}: Nivel Identificado = ${a.nivel_omnisfera_identificado} (0 a 4)`;
          }).join("\n");
        }

        let txtPaee = "";
        if (paeeData) {
          const barreirasTexto = paeeData.barreirasDetalhes ? String(paeeData.barreirasDetalhes).slice(0, 300) : "";
          const tecTexto = paeeData.tec_assistiva ? String(paeeData.tec_assistiva).slice(0, 200) : "";
          if (barreirasTexto || tecTexto) {
            txtPaee = `\nPAEE (Especialista):\n${barreirasTexto ? `- Mapeamento de Barreiras: ${barreirasTexto}\n` : ""}${tecTexto ? `- Tecnologia Assistiva: ${tecTexto}\n` : ""}`;
          }
        }

        let txtDiario = "";
        if (dailyLogs && Array.isArray(dailyLogs) && dailyLogs.length > 0) {
          const lastLogs = dailyLogs.slice(-5);
          txtDiario = "\nDIÁRIO DE BORDO (Últimas 5 sessões):\n" + lastLogs.map((l: any) => {
            return `- ${l.data_sessao || "Sem data"}: ${l.atividade_principal ? String(l.atividade_principal).slice(0, 100) : ""} (Engajamento: ${l.engajamento_aluno || "N/A"}/5)`;
          }).join("\n");
        }

        if (txtPaee || txtDiario || txtDiag) {
          dossieSintetico = `[CONTEXTO HISTÓRICO DO ESTUDANTE (Leitura Obrigatória para Consistência Técnica)]\nIncorpore as informações abaixo de forma subliminar nas estratégias do PEI, criando uma continuidade pedagógica perfeita de ponta a ponta.${txtDiag}${txtPaee}${txtDiario}\n[/CONTEXTO HISTÓRICO]`;
        }
      }
    }
  } catch (err) {
    console.warn("Dossiê Sintético (G1) abortado silenciosamente:", err);
  }

  const { system, user } = buildPrompt(dados, modoPratico, feedback, dossieSintetico);

  try {
    const texto = await chatCompletionText(
      engine,
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      { temperature: 0.7 }
    );
    return NextResponse.json({ texto: (texto || "").trim() });
  } catch (err) {
    console.error("PEI Consultoria IA:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao gerar relatório." },
      { status: 500 }
    );
  }
}
