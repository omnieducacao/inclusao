import { NextResponse } from "next/server";
import { chatCompletionText } from "@/lib/ai-engines";
import { selectEngine, withFallback } from "@/lib/engine-selector";
import {
  detectarNivelEnsino,
  carregarHabilidadesEFPorComponente,
  carregarHabilidadesEMPorArea,
  objetivosEIPorIdadeCampo,
} from "@/lib/bncc";

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

function buildPrompt(dados: PEIDataPayload, modoPratico: boolean): { system: string; user: string } {
  const evid = Object.entries(dados.checklist_evidencias || {})
    .filter(([, v]) => v)
    .map(([k]) => `- ${k.replace("?", "")}`)
    .join("\n");
  const medsInfo = (dados.lista_medicamentos || []).length
    ? (dados.lista_medicamentos || [])
        .map((m) => `- ${m.nome || ""} (${m.posologia || ""}).`)
        .join("\n")
    : "Nenhuma medicação informada.";
  const serie = dados.serie || "";
  const nivel = detectarNivelEnsino(serie);
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
    const system = `Especialista em Inclusão Escolar e DUA.
GUIA PRÁTICO PARA SALA DE AULA.
Use Markdown simples. Seja objetivo e aplicável.

### 7. 🧩 CHECKLIST DE ADAPTAÇÃO E ACESSIBILIDADE:
**A. Mediação (Triângulo de Ouro):** Instruções passo a passo, Fragmentação de tarefas, Scaffolding
**B. Acessibilidade:** Inferências/figuras de linguagem, Descrição de imagens, Adaptação visual, Adequação de desafio`;

    const user = `ALUNO: ${dados.nome || ""} | SÉRIE: ${serie} | DIAGNÓSTICO: ${dados.diagnostico || "em observação"}
${hiperfocoTxt}
MEDS: ${medsInfo}
EVIDÊNCIAS: ${evid || "Nenhuma"}
BARREIRAS: ${barreirasTxt || "Não mapeadas"}
ESTRATÉGIAS ACESSO: ${(dados.estrategias_acesso || []).join(", ")}
ESTRATÉGIAS ENSINO: ${(dados.estrategias_ensino || []).join(", ")}
ESTRATÉGIAS AVALIAÇÃO: ${(dados.estrategias_avaliacao || []).join(", ")}
ORIENTAÇÕES ESPECIALISTAS: ${(dados.orientacoes_especialistas || "").slice(0, 500)}

Crie um GUIA PRÁTICO para sala de aula com adaptações concretas baseadas nos dados acima.`;

    return { system, user };
  }

  if (nivel === "EI") {
    const idade = dados.bncc_ei_idade || "";
    const campo = dados.bncc_ei_campo || "";
    const objList = dados.bncc_ei_objetivos || objetivosEIPorIdadeCampo(idade, campo);
    const objTxt = objList.length ? objList.map((o) => `- ${o}`).join("\n") : "(não selecionados)";

    const system = `Especialista em EDUCAÇÃO INFANTIL e BNCC.
MISSÃO: Criar PEI Técnico Oficial.
Use Markdown simples. Use títulos H3 (###). Evite tabelas.

ESTRUTURA OBRIGATÓRIA:

[PERFIL_NARRATIVO] Inicie com "👤 QUEM É O ESTUDANTE?". Parágrafo humanizado. ${hiperfocoTxt}. [/PERFIL_NARRATIVO]

### 1. 🏥 DIAGNÓSTICO E IMPACTO: Cite diagnóstico (e CID se disponível), impactos na aprendizagem, cuidados.

### 2. 🌟 AVALIAÇÃO DE REPERTÓRIO:
[MAPEAMENTO_BNCC_EI] Use APENAS:
- Faixa de idade: ${idade || "não informada"}
- Campo de Experiência: ${campo || "não informado"}
- Objetivos de Aprendizagem (cite EXATAMENTE):
${objTxt}
[/MAPEAMENTO_BNCC_EI]

### 3. 🚀 ESTRATÉGIAS DE INTERVENÇÃO: Estratégias de acolhimento, rotina, adaptação sensorial.

### 4. 🎯 METAS SMART: Meta curto prazo (2 meses), médio (1 semestre), longo (1 ano). Específicas, mensuráveis, personalizadas.

### 5. ⚠️ PONTOS DE ATENÇÃO FARMACOLÓGICA: [ANALISE_FARMA] Se houver medicação, cite efeitos colaterais para atenção pedagógica. [/ANALISE_FARMA]

### 6. 🧩 CHECKLIST DE ADAPTAÇÃO: Mediação (instruções passo a passo, fragmentação, scaffolding), Acessibilidade (inferências, imagens, visual, desafio).`;

    const user = `ALUNO: ${dados.nome || ""} | SÉRIE: ${serie} | HISTÓRICO: ${(dados.historico || "").slice(0, 500)}
DIAGNÓSTICO: ${dados.diagnostico || "em observação"}
MEDS: ${medsInfo}
EVIDÊNCIAS: ${evid || "Nenhuma"}`;

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
        (lst || []).map((h: { codigo?: string; habilidade_completa?: string }) => `${d}: ${h.codigo || ""} — ${h.habilidade_completa || ""}`)
      );
    habTxt = [...flat(ant), ...flat(anoAtual)].map((l) => `- ${l}`).join("\n");
  }
  const promptLiteracia =
    alfabetizacao &&
    !alfabetizacao.includes("Alfabético") &&
    alfabetizacao !== "Não se aplica (Educação Infantil)"
      ? `[ATENÇÃO ALFABETIZAÇÃO] Fase: ${alfabetizacao}. Inclua 2 ações de consciência fonológica. [/ATENÇÃO ALFABETIZAÇÃO]`
      : "";

  const system = `Especialista em Inclusão Escolar e BNCC.
MISSÃO: Criar PEI Técnico Oficial.
REGRA CRÍTICA (Avaliação de Repertório): Cite SOMENTE habilidades da lista fornecida. Ao citar, reproduza EXATAMENTE: código e descrição COMPLETA. Proibido parafrasear.

Use Markdown simples. Use títulos H3 (###). Evite tabelas.

ESTRUTURA OBRIGATÓRIA:

[PERFIL_NARRATIVO] Inicie com "👤 QUEM É O ESTUDANTE?". Parágrafo humanizado. ${hiperfocoTxt}. [/PERFIL_NARRATIVO]

### 1. 🏥 DIAGNÓSTICO E IMPACTO: Cite diagnóstico (e CID se disponível), impactos na aprendizagem, cuidados.

### 2. 🌟 AVALIAÇÃO DE REPERTÓRIO:
[MAPEAMENTO_BNCC] Cite SOMENTE habilidades da lista abaixo. Reproduza EXATAMENTE código + descrição. NÃO invente outras.
[HABILIDADES]
${habTxt || "(use habilidades do ano/série do estudante conforme BNCC)"}
[/HABILIDADES]
[/MAPEAMENTO_BNCC]

### 3. 🚀 ESTRATÉGIAS DE INTERVENÇÃO: Adaptações curriculares e de acesso. ${promptLiteracia}

### 4. 📊 COMPONENTES QUE MERECEM ATENÇÃO: Quadro com componente, nível (Alta|Média|Monitoramento), motivos ligando diagnóstico + barreiras às habilidades.

### 5. 🎯 METAS SMART: Meta curto prazo (2 meses), médio (1 semestre), longo (1 ano). Específicas, mensuráveis, personalizadas.

### 6. ⚠️ PONTOS DE ATENÇÃO FARMACOLÓGICA: [ANALISE_FARMA] Se houver medicação, cite efeitos colaterais para atenção pedagógica. [/ANALISE_FARMA]

### 7. 🧩 CHECKLIST DE ADAPTAÇÃO: Mediação (instruções passo a passo, fragmentação, scaffolding), Acessibilidade (inferências, imagens, visual, desafio).`;

  const user = `ALUNO: ${dados.nome || ""} | SÉRIE: ${serie} | HISTÓRICO: ${(dados.historico || "").slice(0, 500)}
DIAGNÓSTICO: ${dados.diagnostico || "em observação"}
MEDS: ${medsInfo}
EVIDÊNCIAS: ${evid || "Nenhuma"}
BARREIRAS: ${barreirasTxt || "Não mapeadas"}
NÍVEIS SUPORTE: ${JSON.stringify(dados.niveis_suporte || {})}

[LISTA DE HABILIDADES PERMITIDAS — cite SOMENTE estas, COPIANDO EXATAMENTE:]
${habTxt || "(carregue do contexto BNCC do ano/série)"}`;

  return { system, user };
}

export async function POST(req: Request) {
  let dados: PEIDataPayload = {};
  let modoPratico = false;

  try {
    const body = await req.json();
    dados = (body.peiData || body) as PEIDataPayload;
    modoPratico = !!body.modo_pratico;
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  // PEI: DeepSeek (red) padrão, opções Kimi (blue) e Claude (green)
  const { engine, error: engineErr } = selectEngine("pei", null, true);
  
  if (engineErr) {
    return NextResponse.json({ error: engineErr }, { status: 500 });
  }

  if (!dados.serie && !dados.nome) {
    return NextResponse.json(
      { error: "Selecione a Série/Ano na aba Estudante para ativar a Consultoria." },
      { status: 400 }
    );
  }

  const { system, user } = buildPrompt(dados, modoPratico);

  try {
    // Usa fallback automático se o motor padrão falhar
    const texto = await withFallback("pei", null, async (selectedEngine) => {
      return await chatCompletionText(
        selectedEngine,
        [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        { temperature: 0.7 }
      );
    });
    return NextResponse.json({ texto: (texto || "").trim() });
  } catch (err) {
    console.error("PEI Consultoria IA:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao gerar relatório." },
      { status: 500 }
    );
  }
}
