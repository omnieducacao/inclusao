"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { StudentSelector } from "@/components/StudentSelector";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { EngineSelector } from "@/components/EngineSelector";
import { ImageCropper } from "@/components/ImageCropper";
import { detectarNivelEnsino } from "@/lib/pei";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { DocxDownloadButton } from "@/components/DocxDownloadButton";
// pptx-export removido — substituído por Mapa Mental
import { getColorClasses } from "@/lib/colors";
import { PEISummaryPanel } from "@/components/PEISummaryPanel";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";
import { LottieIcon } from "@/components/LottieIcon";
import {
  FileText,
  Image as ImageIcon,
  Sparkles,
  Palette,
  FileEdit,
  MessageSquare,
  Handshake,
  ClipboardList,
  Star,
  RefreshCw,
  ToyBrick,
  BookOpen,
  Loader2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Student = { id: string; name: string };
type StudentFull = Student & {
  grade?: string | null;
  pei_data?: Record<string, unknown>;
};

type Props = {
  students: Student[];
  studentId: string | null;
  student: StudentFull | null;
};

/** Estrutura BNCC para dropdowns (componente → unidade → objeto → habilidades) */
type EstruturaBncc = {
  disciplinas: string[];
  porDisciplina: Record<string, {
    unidades: string[];
    porUnidade: Record<string, {
      objetos: string[];
      porObjeto: Record<string, { codigo: string; descricao: string; habilidade_completa?: string }[]>;
    }>;
  }>;
} | null;

type ToolIdEFEM = "adaptar-prova" | "adaptar-atividade" | "criar-zero" | "estudio-visual" | "papo-mestre" | "plano-aula" | "roteiro" | "dinamica";
type ToolIdEI = "criar-experiencia" | "estudio-visual" | "rotina-avd" | "inclusao-brincar";
type ToolId = ToolIdEFEM | ToolIdEI;
type EngineId = "red" | "blue" | "green" | "yellow" | "orange";

const TOOLS_EF_EM: { id: ToolIdEFEM; icon: LucideIcon; title: string; desc: string }[] = [
  { id: "adaptar-prova", icon: FileText, title: "Adaptar Prova", desc: "Upload DOCX, adaptação com DUA" },
  { id: "adaptar-atividade", icon: ImageIcon, title: "Adaptar Atividade", desc: "Imagem → OCR → IA adapta" },
  { id: "criar-zero", icon: Sparkles, title: "Criar do Zero", desc: "BNCC + assunto → atividade gerada" },
  { id: "estudio-visual", icon: Palette, title: "Estúdio Visual", desc: "Pictogramas, cenas sociais" },
  { id: "roteiro", icon: FileEdit, title: "Roteiro Individual", desc: "Passo a passo de aula personalizado" },
  { id: "papo-mestre", icon: MessageSquare, title: "Papo de Mestre", desc: "Sugestões de mediação" },
  { id: "dinamica", icon: Handshake, title: "Dinâmica Inclusiva", desc: "Atividades em grupo DUA" },
  { id: "plano-aula", icon: ClipboardList, title: "Plano de Aula DUA", desc: "Desenho Universal" },
];

const TOOLS_EI: { id: ToolIdEI; icon: LucideIcon; title: string; desc: string }[] = [
  { id: "criar-experiencia", icon: Star, title: "Criar Experiência", desc: "BNCC EI: campos e objetivos" },
  { id: "estudio-visual", icon: Palette, title: "Estúdio Visual & CAA", desc: "Pictogramas, cenas, símbolos" },
  { id: "rotina-avd", icon: RefreshCw, title: "Rotina & AVD", desc: "Sequências e autonomia" },
  { id: "inclusao-brincar", icon: ToyBrick, title: "Inclusão no Brincar", desc: "Brincadeiras acessíveis" },
];

// Mapeamento de ícones Lottie distintos para cada ferramenta do Hub
const HUB_LOTTIE_MAP: Record<string, string> = {
  "adaptar-prova": "wired-outline-967-questionnaire-hover-pinch",       // questionário/prova
  "adaptar-atividade": "wired-outline-35-edit-hover-circle",            // editar/adaptar
  "criar-zero": "wired-outline-36-bulb-morph-turn-on",                  // lâmpada/criar do zero
  "estudio-visual": "wired-outline-3077-polaroids-photos-hover-pinch",  // polaroids/estúdio visual
  "roteiro": "wired-outline-1020-rules-book-guideline-hover-flutter",   // guia/roteiro
  "papo-mestre": "wired-outline-981-consultation-hover-conversation-alt", // conversação/papo de mestre
  "dinamica": "wired-outline-957-team-work-hover-pinch",                // trabalho em equipe
  "plano-aula": "wired-outline-738-notebook-2-hover-pinch",            // notebook/plano
  "criar-experiencia": "wired-outline-458-goal-target-hover-hit",       // objetivo/alvo
  "rotina-avd": "wired-outline-153-bar-chart-hover-pinch",             // rotina/gráfico
  "inclusao-brincar": "wired-outline-529-boy-girl-children-hover-pinch", // crianças/brincar
};

// Componente para card de ferramenta com ícone distinto por recurso
function ToolCard({
  tool,
  isActive,
  onClick
}: {
  tool: { id: string; icon: LucideIcon; title: string; desc: string };
  isActive: boolean;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = tool.icon;
  const lottieAnimation = HUB_LOTTIE_MAP[tool.id];

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group text-left p-6 rounded-2xl transition-all duration-300 bg-gradient-to-br min-h-[160px] flex flex-col ${isActive
        ? "border-cyan-500 from-cyan-50 to-white shadow-md scale-[1.01]"
        : "border-slate-200 from-slate-50 to-white hover:border-slate-300 hover:shadow-lg hover:scale-[1.01]"
        }`}
    >
      {/* Ícone dentro do quadrado minimalista */}
      <div
        className="rounded-xl bg-white/20 flex items-center justify-center backdrop-blur shadow-xl relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 mb-3"
        style={{ width: '72px', height: '72px', padding: '6px' }}
      >
        {lottieAnimation ? (
          <LottieIcon
            animation={lottieAnimation}
            size={60}
            loop={isHovered}
            autoplay={isHovered}
            className="transition-all duration-300"
          />
        ) : (
          <Icon className="w-10 h-10 text-cyan-600" />
        )}
      </div>
      <div className="font-bold text-slate-800 text-base">{tool.title}</div>
      <div className="text-sm text-slate-600 mt-1">{tool.desc}</div>
    </button>
  );
}

export function HubClient({ students, studentId, student }: Props) {
  const searchParams = useSearchParams();
  const currentId = studentId || searchParams?.get("student") || null;
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [engine, setEngine] = useState<EngineId>("red");

  const peiData = student?.pei_data || {};
  const hiperfoco = (peiData.hiperfoco as string) || (peiData.interesses as string) || "Interesses gerais";
  const serie = (student?.grade as string) || (peiData.serie as string) || "";
  const isEI = detectarNivelEnsino(serie) === "EI";
  const TOOLS = isEI ? TOOLS_EI : TOOLS_EF_EM;

  return (
    <div className="space-y-6">
      <StudentSelector students={students} currentId={currentId} placeholder="Selecione o estudante" />

      {currentId && student && (
        <PEISummaryPanel peiData={peiData} studentName={student.name} />
      )}

      {currentId && student && (
        <div className="space-y-2">
          {isEI && (
            <div className="px-4 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              <Star className="w-4 h-4 inline mr-1" />
              <strong>Modo Educação Infantil</strong> — Ferramentas específicas para EI.
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl" style={{ backgroundColor: getColorClasses("cyan").bg, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(226,232,240,0.6)' }}>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nome</div>
              <div className="font-bold text-slate-800">{student.name}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Série</div>
              <div className="font-bold text-slate-800">{student.grade || "—"}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Hiperfoco</div>
              <div className="font-bold text-slate-800 truncate" title={String(hiperfoco)}>{String(hiperfoco)}</div>
            </div>
          </div>
        </div>
      )}

      {!currentId && (
        <div className="bg-amber-50 text-amber-800 p-4 rounded-lg">
          Selecione um estudante para usar as ferramentas do Hub com contexto personalizado.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TOOLS.map((t) => (
          <ToolCard
            key={t.id}
            tool={t}
            isActive={activeTool === t.id}
            onClick={() => setActiveTool(activeTool === t.id ? null : t.id)}
          />
        ))}
      </div>

      {activeTool === "criar-zero" && (
        <CriarDoZero student={student} engine={engine} onEngineChange={setEngine} onClose={() => setActiveTool(null)} />
      )}

      {activeTool === "papo-mestre" && (
        <PapoDeMestre student={student} hiperfoco={hiperfoco} engine={engine} onEngineChange={setEngine} onClose={() => setActiveTool(null)} />
      )}

      {activeTool === "plano-aula" && (
        <PlanoAulaDua student={student} engine={engine} onEngineChange={setEngine} onClose={() => setActiveTool(null)} />
      )}

      {activeTool === "adaptar-prova" && (
        <AdaptarProva student={student} hiperfoco={hiperfoco} engine={engine} onEngineChange={setEngine} onClose={() => setActiveTool(null)} />
      )}

      {activeTool === "adaptar-atividade" && (
        <AdaptarAtividade student={student} hiperfoco={hiperfoco} engine={engine} onEngineChange={setEngine} onClose={() => setActiveTool(null)} />
      )}

      {activeTool === "estudio-visual" && (
        <EstudioVisual student={student} hiperfoco={hiperfoco} onClose={() => setActiveTool(null)} />
      )}

      {activeTool === "criar-experiencia" && (
        <CriarDoZero student={student} engine={engine} onEngineChange={setEngine} onClose={() => setActiveTool(null)} eiMode />
      )}

      {activeTool === "rotina-avd" && (
        <RotinaAvdTool student={student} engine={engine} onEngineChange={setEngine} onClose={() => setActiveTool(null)} />
      )}
      {activeTool === "inclusao-brincar" && (
        <InclusaoBrincarTool student={student} engine={engine} onEngineChange={setEngine} onClose={() => setActiveTool(null)} />
      )}

      {activeTool === "roteiro" && (
        <RoteiroIndividual student={student} engine={engine} onEngineChange={setEngine} onClose={() => setActiveTool(null)} />
      )}

      {activeTool === "dinamica" && (
        <DinamicaInclusiva student={student} engine={engine} onEngineChange={setEngine} onClose={() => setActiveTool(null)} />
      )}

      {activeTool && !["criar-zero", "criar-experiencia", "papo-mestre", "plano-aula", "adaptar-prova", "adaptar-atividade", "estudio-visual", "roteiro", "dinamica", "rotina-avd", "inclusao-brincar"].includes(activeTool) && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white min-h-[180px]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(226,232,240,0.6)' }}>
          <p className="text-slate-600">
            <strong>{TOOLS.find((t) => t.id === activeTool)?.title}</strong> — Em breve nesta versão.
          </p>
        </div>
      )}
    </div>
  );
}

// Taxonomia de Bloom - Estrutura completa com domínios e verbos
const TAXONOMIA_BLOOM: Record<string, string[]> = {
  "1. Lembrar (Memorizar)": ["Citar", "Definir", "Identificar", "Listar", "Nomear", "Reconhecer", "Recordar", "Relacionar", "Repetir", "Sublinhar"],
  "2. Entender (Compreender)": ["Classificar", "Descrever", "Discutir", "Explicar", "Expressar", "Identificar", "Localizar", "Narrar", "Reafirmar", "Reportar", "Resumir", "Traduzir"],
  "3. Aplicar": ["Aplicar", "Demonstrar", "Dramatizar", "Empregar", "Esboçar", "Ilustrar", "Interpretar", "Operar", "Praticar", "Programar", "Usar"],
  "4. Analisar": ["Analisar", "Calcular", "Categorizar", "Comparar", "Contrastar", "Criticar", "Diferenciar", "Discriminar", "Distinguir", "Examinar", "Experimentar", "Testar"],
  "5. Avaliar": ["Argumentar", "Avaliar", "Defender", "Escolher", "Estimar", "Julgar", "Prever", "Selecionar", "Suportar", "Validar", "Valorizar"],
  "6. Criar": ["Compor", "Construir", "Criar", "Desenhar", "Desenvolver", "Formular", "Investigar", "Planejar", "Produzir", "Propor"]
};

function CriarDoZero({
  student,
  engine,
  onEngineChange,
  onClose,
  eiMode = false,
}: {
  student: StudentFull | null;
  engine: EngineId;
  onEngineChange: (e: EngineId) => void;
  onClose: () => void;
  eiMode?: boolean;
}) {
  const [serie, setSerie] = useState("");
  const [componentes, setComponentes] = useState<Record<string, { codigo: string; descricao: string }[]>>({});
  const [estruturaBncc, setEstruturaBncc] = useState<EstruturaBncc>(null);
  const [componenteSel, setComponenteSel] = useState("");
  const [unidadeSel, setUnidadeSel] = useState("");
  const [objetoSel, setObjetoSel] = useState("");
  const [eiFaixas, setEiFaixas] = useState<string[]>([]);
  const [eiCampos, setEiCampos] = useState<string[]>([]);
  const [eiObjetivos, setEiObjetivos] = useState<string[]>([]);
  const [eiIdade, setEiIdade] = useState("");
  const [eiCampo, setEiCampo] = useState("");
  const [assunto, setAssunto] = useState("");
  const [habilidadesSel, setHabilidadesSel] = useState<string[]>([]);
  // Taxonomia de Bloom - estrutura completa
  const [usarBloom, setUsarBloom] = useState(false);
  const [dominioBloomSel, setDominioBloomSel] = useState<string>("");
  const [verbosBloomSel, setVerbosBloomSel] = useState<Record<string, string[]>>({});
  // Configuração de questões
  const [qtdQuestoes, setQtdQuestoes] = useState(5);
  const [tipoQuestao, setTipoQuestao] = useState<"Objetiva" | "Discursiva">("Objetiva");
  const [usarImagens, setUsarImagens] = useState(true);
  const [qtdImagens, setQtdImagens] = useState(0);
  const [checklist, setChecklist] = useState<ChecklistAdaptacao>({});
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [mapaImagensResultado, setMapaImagensResultado] = useState<Record<number, string>>({});
  const [erro, setErro] = useState<string | null>(null);
  const [validado, setValidado] = useState(false);

  const serieAluno = student?.grade || "";
  const peiData = student?.pei_data || {};

  // Carregar BNCC do PEI quando disponível
  useEffect(() => {
    if (!peiData || !student) return;

    // Carregar habilidades BNCC validadas do PEI
    const habValidadas = (peiData.habilidades_bncc_validadas || peiData.habilidades_bncc_selecionadas || []) as Array<{ codigo?: string; descricao?: string; habilidade_completa?: string }>;
    if (habValidadas.length > 0) {
      const habsFormatadas = habValidadas.map((h) => {
        if (typeof h === "string") return h;
        return h.habilidade_completa || `${h.codigo || ""} — ${h.descricao || ""}`;
      }).filter(Boolean);
      setHabilidadesSel(habsFormatadas);
    }

    // Carregar EI do PEI
    if (eiMode) {
      const idadePei = peiData.bncc_ei_idade as string;
      const campoPei = peiData.bncc_ei_campo as string;
      const objetivosPei = (peiData.bncc_ei_objetivos || []) as string[];
      if (idadePei) setEiIdade(idadePei);
      if (campoPei) setEiCampo(campoPei);
      if (objetivosPei.length > 0) setEiObjetivos(objetivosPei);
    }
  }, [peiData, student, eiMode]);

  useEffect(() => {
    if (eiMode) {
      fetch("/api/bncc/ei")
        .then((r) => r.json())
        .then((d) => {
          setEiFaixas(d.faixas || []);
          setEiCampos(d.campos || []);
        })
        .catch(() => { });
      return;
    }
    if (!serieAluno) return;
    setSerie(serieAluno);
    Promise.all([
      fetch(`/api/bncc/ef?serie=${encodeURIComponent(serieAluno)}`).then((r) => r.json()),
      fetch(`/api/bncc/ef?serie=${encodeURIComponent(serieAluno)}&estrutura=1`).then((r) => r.json()),
    ])
      .then(([d, e]) => {
        setComponentes(d.ano_atual || {});
        setEstruturaBncc(e.disciplinas ? e : null);
      })
      .catch(() => {
        setComponentes({});
        setEstruturaBncc(null);
      });
  }, [serieAluno, eiMode]);

  useEffect(() => {
    if (!eiMode || !eiIdade || !eiCampo) {
      setEiObjetivos([]);
      return;
    }
    fetch(`/api/bncc/ei?idade=${encodeURIComponent(eiIdade)}&campo=${encodeURIComponent(eiCampo)}`)
      .then((r) => r.json())
      .then((d) => setEiObjetivos(d.objetivos || []))
      .catch(() => setEiObjetivos([]));
  }, [eiMode, eiIdade, eiCampo]);

  const discData = estruturaBncc?.porDisciplina?.[componenteSel];
  const unidadeDataRaw = componenteSel && discData?.porUnidade?.[unidadeSel];
  const unidadeData = unidadeDataRaw && typeof unidadeDataRaw === "object" && "objetos" in unidadeDataRaw ? unidadeDataRaw : null;
  const habsDoObjeto = objetoSel && unidadeData && "porObjeto" in unidadeData ? unidadeData.porObjeto?.[objetoSel] : undefined;

  const todasHabilidades = eiMode
    ? eiObjetivos
    : habsDoObjeto
      ? habsDoObjeto.map((h) => `${componenteSel}: ${h.codigo} — ${h.descricao}`)
      : unidadeData
        ? Object.entries(unidadeData.porObjeto || {}).flatMap(([, habs]) =>
          (habs || []).map((h) => `${componenteSel}: ${h.codigo} — ${h.descricao}`)
        )
        : discData
          ? Object.values(discData.porUnidade || {}).flatMap((v) =>
            Object.values(v.porObjeto || {}).flatMap((habList) =>
              (habList || []).map((h) => `${componenteSel}: ${h.codigo} — ${h.descricao}`)
            )
          )
          : Object.entries(componentes).flatMap(([disc, habs]) =>
            (habs || []).map((h) => `${disc}: ${h.codigo} — ${h.descricao}`)
          );

  // Verificar se BNCC está preenchida corretamente
  const temBnccPreenchida = eiMode
    ? (eiIdade && eiCampo && eiObjetivos.length > 0)
    : habilidadesSel.length > 0;

  // Combinar todos os verbos Bloom selecionados
  const verbosBloomFinais = usarBloom
    ? Object.values(verbosBloomSel).flat()
    : [];

  // Atualizar qtdImagens quando qtdQuestoes mudar
  useEffect(() => {
    if (qtdImagens > qtdQuestoes) {
      setQtdImagens(Math.max(0, qtdQuestoes));
    } else if (usarImagens && qtdImagens === 0 && qtdQuestoes > 1) {
      // Inicializar com metade das questões quando usarImagens é marcado
      setQtdImagens(Math.floor(qtdQuestoes / 2));
    }
  }, [qtdQuestoes, qtdImagens, usarImagens]);

  const gerar = async () => {
    // Validação: Assunto só é obrigatório se não tiver BNCC preenchida
    if (!assunto.trim() && !temBnccPreenchida) {
      setErro("Informe o assunto ou selecione habilidades BNCC.");
      return;
    }

    // Validação adicional para modo EI
    if (eiMode && (!eiIdade || !eiCampo || eiObjetivos.length === 0)) {
      setErro("No modo Educação Infantil, preencha idade, campo e objetivos BNCC.");
      return;
    }
    setLoading(true);
    setErro(null);
    setResultado(null);
    setMapaImagensResultado({});
    setValidado(false);
    aiLoadingStart(engine || "green", "hub");
    try {
      const res = await fetch("/api/hub/criar-atividade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assunto: assunto.trim() || undefined,
          engine,
          ei_mode: eiMode,
          ei_idade: eiMode ? eiIdade : undefined,
          ei_campo: eiMode ? eiCampo : undefined,
          ei_objetivos: eiMode && eiObjetivos.length > 0 ? eiObjetivos : undefined,
          habilidades: !eiMode && habilidadesSel.length > 0 ? habilidadesSel : undefined,
          verbos_bloom: usarBloom && verbosBloomFinais.length > 0 ? verbosBloomFinais : undefined,
          qtd_questoes: qtdQuestoes,
          tipo_questao: tipoQuestao,
          qtd_imagens: usarImagens ? qtdImagens : 0,
          checklist_adaptacao: Object.keys(checklist).length > 0 ? checklist : undefined,
          estudante: student ? { nome: student.name, serie: student.grade, hiperfoco: (student.pei_data as Record<string, unknown>)?.hiperfoco } : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar");
      let textoFinal = data.texto || "Atividade gerada.";

      // Processar divisor se existir (separar análise e atividade)
      if (textoFinal.includes("---DIVISOR---")) {
        const parts = textoFinal.split("---DIVISOR---");
        const analise = parts[0]?.replace("[ANÁLISE PEDAGÓGICA]", "").trim() || "";
        const atividade = parts[1]?.replace("[ATIVIDADE]", "").trim() || textoFinal;
        textoFinal = analise ? `## Análise Pedagógica\n\n${analise}\n\n---\n\n## Atividade\n\n${atividade}` : atividade;
      }

      let mapa: Record<number, string> = {};
      if (usarImagens && qtdImagens > 0) {
        const genImgRegex = /\[\[GEN_IMG:\s*([^\]]+)\]\]/gi;
        const termos: string[] = [];
        let m: RegExpExecArray | null;
        while ((m = genImgRegex.exec(textoFinal)) !== null) {
          termos.push(m[1].trim());
        }

        // Se não encontrou tags suficientes, criar termos genéricos para garantir número solicitado
        while (termos.length < qtdImagens) {
          termos.push(`ilustração educacional ${termos.length + 1}`);
        }

        // Prioridade: BANCO (Unsplash) primeiro; Gemini como fallback garantido
        for (let i = 0; i < termos.length && i < qtdImagens; i++) {
          let imagemGerada = false;
          let tentativas = 0;
          const maxTentativas = 2; // Unsplash + Gemini

          while (!imagemGerada && tentativas < maxTentativas) {
            try {
              const prioridade = tentativas === 0 ? "BANCO" : "IA";
              console.log(`🖼️ Gerando imagem ${i + 1}/${qtdImagens} para: "${termos[i]}" (${prioridade})`);

              const imgRes = await fetch("/api/hub/gerar-imagem", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: termos[i], prioridade }),
              });

              const imgData = await imgRes.json();

              if (imgRes.ok && imgData.image) {
                // Remove o prefixo data:image se existir e valida base64
                const imgStr = imgData.image as string;
                let base64 = imgStr;

                // Se já tem prefixo data:image, remover
                if (imgStr.startsWith("data:image")) {
                  base64 = imgStr.replace(/^data:image\/\w+;base64,/, "");
                }

                // Validar que é base64 válido (mínimo 100 caracteres para ser uma imagem válida)
                if (base64 && base64.length > 100) {
                  mapa[i + 1] = base64;
                  imagemGerada = true;
                  console.log(`  ✅ Imagem ${i + 1} gerada com sucesso (${Math.round(base64.length / 1024)}KB)`);
                } else {
                  console.warn(`  ⚠️ Imagem ${i + 1} gerada mas base64 inválido (${base64?.length || 0} chars), tentando novamente...`);
                }
              } else {
                const errorMsg = imgData.error || "Resposta sem imagem";
                if (tentativas === 0) {
                  console.log(`  ⚠️ Unsplash não retornou imagem, tentando Gemini...`);
                } else {
                  console.warn(`  ❌ Falha ao gerar imagem ${i + 1} com Gemini:`, errorMsg);
                }
              }
            } catch (error) {
              console.error(`  ❌ Erro ao gerar imagem ${i + 1} (tentativa ${tentativas + 1}):`, error);
            }

            tentativas++;
          }

          if (!imagemGerada) {
            console.warn(`  ⚠️ Não foi possível gerar imagem ${i + 1} após ${maxTentativas} tentativas`);
          }
        }

        console.log(`📊 Total de imagens geradas: ${Object.keys(mapa).length} de ${qtdImagens} solicitadas`);

        // Se faltaram imagens, tentar gerar com termos genéricos
        if (Object.keys(mapa).length < qtdImagens) {
          const faltam = qtdImagens - Object.keys(mapa).length;
          console.log(`⚠️ Faltam ${faltam} imagem(ns), tentando gerar com Gemini...`);

          for (let f = 0; f < faltam; f++) {
            const idx = Object.keys(mapa).length + 1;
            const termoGenerico = `ilustração educacional ${idx}`;
            try {
              const imgRes = await fetch("/api/hub/gerar-imagem", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: termoGenerico, prioridade: "IA" }),
              });
              const imgData = await imgRes.json();

              if (imgRes.ok && imgData.image) {
                const imgStr = imgData.image as string;
                let base64 = imgStr.startsWith("data:image")
                  ? imgStr.replace(/^data:image\/\w+;base64,/, "")
                  : imgStr;

                if (base64 && base64.length > 100) {
                  mapa[idx] = base64;
                  console.log(`  ✅ Imagem ${idx} gerada como fallback`);
                }
              }
            } catch (error) {
              console.error(`  ❌ Erro ao gerar imagem fallback ${idx}:`, error);
            }
          }
        }
        let idx = 0;
        textoFinal = textoFinal.replace(/\[\[GEN_IMG:\s*[^\]]+\]\]/gi, () => {
          idx++;
          return `[[IMG_${idx}]]`;
        });
      }
      setMapaImagensResultado(mapa);
      setResultado(textoFinal);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao gerar atividade.");
    } finally {
      setLoading(false);
      aiLoadingStop();
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-50 to-white space-y-4 min-h-[200px]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(226,232,240,0.6)' }}>
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800">{eiMode ? "Criar Experiência (EI)" : "Criar do Zero"}</h3>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">
          Fechar
        </button>
      </div>
      <EngineSelector value={engine} onChange={onEngineChange} />
      {!eiMode && estruturaBncc && estruturaBncc.disciplinas.length > 0 && (
        <details className="border border-slate-200 rounded-lg" open>
          <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-slate-700 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            BNCC: Unidade e Objeto
          </summary>
          <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Série (ano BNCC)</label>
              <input
                type="text"
                value={serieAluno || ""}
                readOnly
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Componente</label>
              <select
                value={componenteSel}
                onChange={(e) => {
                  setComponenteSel(e.target.value);
                  setUnidadeSel("");
                  setObjetoSel("");
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              >
                <option value="">Todos</option>
                {estruturaBncc?.disciplinas?.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Unidade Temática</label>
              <select
                value={unidadeSel}
                onChange={(e) => {
                  setUnidadeSel(e.target.value);
                  setObjetoSel("");
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                disabled={!componenteSel}
              >
                <option value="">Todas</option>
                {(discData?.unidades || []).map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Objeto do Conhecimento</label>
              <select
                value={objetoSel}
                onChange={(e) => setObjetoSel(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                disabled={!unidadeSel}
              >
                <option value="">Todos</option>
                {(unidadeData && typeof unidadeData === "object" && "objetos" in unidadeData ? unidadeData.objetos : []).map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
        </details>
      )}
      {eiMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Faixa de Idade</label>
            <select value={eiIdade} onChange={(e) => setEiIdade(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg">
              <option value="">Selecione</option>
              {eiFaixas.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Campo de Experiência</label>
            <select value={eiCampo} onChange={(e) => setEiCampo(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg">
              <option value="">Selecione</option>
              {eiCampos.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {eiMode ? "Objetivos de Aprendizagem" : "Habilidades BNCC"}
          {temBnccPreenchida && (
            <span className="text-xs text-emerald-600 ml-2">(carregadas do PEI)</span>
          )}
        </label>
        <select
          multiple
          value={habilidadesSel}
          onChange={(e) => setHabilidadesSel(Array.from(e.target.selectedOptions, (o) => o.value))}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg min-h-[100px]"
        >
          {todasHabilidades.slice(0, 120).map((h, i) => (
            <option key={i} value={h}>{h}</option>
          ))}
        </select>
        <p className="text-xs text-slate-500 mt-1">Segure Ctrl/Cmd para múltipla seleção.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {eiMode ? "Assunto / tema da experiência" : "Assunto / tema"}
          {temBnccPreenchida && (
            <span className="text-xs text-emerald-600 ml-2">(opcional - BNCC já preenchida)</span>
          )}
        </label>
        <input
          type="text"
          value={assunto}
          onChange={(e) => setAssunto(e.target.value)}
          placeholder={temBnccPreenchida ? "Opcional quando BNCC está preenchida" : "Ex: Frações, Sistema Solar..."}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg"
        />
        {temBnccPreenchida && habilidadesSel.length > 0 && (
          <p className="text-xs text-emerald-600 mt-1">
            ✓ {habilidadesSel.length} habilidade(s) BNCC do PEI carregada(s)
          </p>
        )}
      </div>

      {/* Configuração de Questões */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade de Questões</label>
          <input
            type="range"
            min={1}
            max={10}
            value={qtdQuestoes}
            onChange={(e) => setQtdQuestoes(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-center text-sm text-slate-600 mt-1">{qtdQuestoes} questão(ões)</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Questão</label>
          <select
            value={tipoQuestao}
            onChange={(e) => setTipoQuestao(e.target.value as "Objetiva" | "Discursiva")}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
          >
            <option value="Objetiva">Objetiva</option>
            <option value="Discursiva">Discursiva</option>
          </select>
        </div>
        <div>
          <label className="flex items-center gap-2 mb-1">
            <input
              type="checkbox"
              checked={usarImagens}
              onChange={(e) => {
                setUsarImagens(e.target.checked);
                if (!e.target.checked) {
                  setQtdImagens(0);
                } else if (qtdImagens === 0 && qtdQuestoes > 1) {
                  // Inicializar com metade das questões (como no Streamlit)
                  setQtdImagens(Math.floor(qtdQuestoes / 2));
                }
              }}
            />
            <span className="text-sm font-medium text-slate-700">Incluir Imagens?</span>
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Qtd. Imagens</label>
          <input
            type="range"
            min={0}
            max={qtdQuestoes}
            value={qtdImagens}
            onChange={(e) => setQtdImagens(Number(e.target.value))}
            disabled={!usarImagens}
            className="w-full"
          />
          <div className="text-center text-sm text-slate-600 mt-1">{qtdImagens} imagem(ns)</div>
        </div>
      </div>

      {/* Taxonomia de Bloom e Checklist lado a lado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Taxonomia de Bloom */}
        <details className="border border-slate-200 rounded-lg">
          <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-slate-700">
            🧠 Taxonomia de Bloom (opcional)
          </summary>
          <div className="p-4 space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={usarBloom}
                onChange={(e) => {
                  setUsarBloom(e.target.checked);
                  if (!e.target.checked) {
                    setDominioBloomSel("");
                    setVerbosBloomSel({});
                  } else if (!dominioBloomSel && Object.keys(TAXONOMIA_BLOOM).length > 0) {
                    setDominioBloomSel(Object.keys(TAXONOMIA_BLOOM)[0]);
                  }
                }}
              />
              <span className="text-sm">Usar Taxonomia de Bloom (Revisada)</span>
            </label>
            {usarBloom && (
              <>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Categoria Cognitiva:</label>
                  <select
                    value={dominioBloomSel}
                    onChange={(e) => {
                      setDominioBloomSel(e.target.value);
                      if (!verbosBloomSel[e.target.value]) {
                        setVerbosBloomSel((prev) => ({ ...prev, [e.target.value]: [] }));
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="">Selecione uma categoria</option>
                    {Object.keys(TAXONOMIA_BLOOM).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                {dominioBloomSel && TAXONOMIA_BLOOM[dominioBloomSel] && (
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Verbos de '{dominioBloomSel}':</label>
                    <select
                      multiple
                      value={verbosBloomSel[dominioBloomSel] || []}
                      onChange={(e) => {
                        const selecionados = Array.from(e.target.selectedOptions, (o) => o.value);
                        setVerbosBloomSel((prev) => ({ ...prev, [dominioBloomSel]: selecionados }));
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm min-h-[120px]"
                    >
                      {TAXONOMIA_BLOOM[dominioBloomSel].map((verbo) => (
                        <option key={verbo} value={verbo}>{verbo}</option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">Segure Ctrl/Cmd para múltipla seleção.</p>
                  </div>
                )}
                {verbosBloomFinais.length > 0 && (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-sm">
                    <strong>Verbos selecionados:</strong> {verbosBloomFinais.join(", ")}
                  </div>
                )}
              </>
            )}
          </div>
        </details>

        {/* Checklist de Adaptação */}
        <details className="border border-slate-200 rounded-lg">
          <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-slate-700">
            Checklist de Adaptação (PEI)
          </summary>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            {[
              { k: "questoes_desafiadoras", l: "Questões mais desafiadoras" },
              { k: "compreende_instrucoes_complexas", l: "Compreende instruções complexas" },
              { k: "instrucoes_passo_a_passo", l: "Instruções passo a passo" },
              { k: "dividir_em_etapas", l: "Dividir em etapas" },
              { k: "paragrafos_curtos", l: "Parágrafos curtos" },
              { k: "dicas_apoio", l: "Dicas de apoio" },
              { k: "compreende_figuras_linguagem", l: "Compreende figuras de linguagem" },
              { k: "descricao_imagens", l: "Descrição de imagens" },
            ].map(({ k, l }) => (
              <label key={k} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!checklist[k as keyof ChecklistAdaptacao]}
                  onChange={(e) => setChecklist((c) => ({ ...c, [k]: e.target.checked }))}
                />
                {l}
              </label>
            ))}
          </div>
        </details>
      </div>

      <button
        type="button"
        onClick={gerar}
        disabled={loading}
        className="px-4 py-2 bg-cyan-600 text-white rounded-lg disabled:opacity-50"
      >
        {loading ? "Gerando…" : "Gerar atividade"}
      </button>
      {erro && <div className="text-red-600 text-sm">{erro}</div>}
      {resultado && (
        <div className="space-y-4">
          {validado && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm font-medium">
              ✅ ATIVIDADE VALIDADA E PRONTA PARA USO
            </div>
          )}
          {!validado && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setValidado(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
              >
                ✅ Validar Atividade
              </button>
              <button
                type="button"
                onClick={() => {
                  setResultado(null);
                  setValidado(false);
                }}
                className="px-4 py-2 bg-slate-400 text-white rounded-lg hover:bg-slate-500 text-sm"
              >
                🗑️ Descartar
              </button>
            </div>
          )}
          <div className="p-6 rounded-xl bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
              <span className="text-base font-semibold text-slate-800">Atividade Criada</span>
              <span className="flex gap-2">
                <DocxDownloadButton
                  texto={resultado}
                  titulo="Atividade Criada"
                  filename={`Atividade_${assunto.replace(/\s/g, "_")}_${new Date().toISOString().slice(0, 10)}.docx`}
                  mapaImagens={Object.keys(mapaImagensResultado).length > 0 ? mapaImagensResultado : undefined}
                />
                <PdfDownloadButton text={resultado} filename={`Atividade_${assunto.replace(/\s/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`} title="Atividade Criada" />
              </span>
            </div>
            <FormattedTextDisplay texto={resultado} mapaImagens={Object.keys(mapaImagensResultado).length > 0 ? mapaImagensResultado : undefined} />
          </div>
        </div>
      )}
    </div>
  );
}

const COMPONENTES = ["Língua Portuguesa", "Matemática", "Arte", "Ciências", "Educação Física", "Geografia", "História", "Língua Inglesa", "Ensino Religioso"];

// Metodologias para Plano de Aula
const METODOLOGIAS = [
  "Aula Expositiva Dialogada",
  "Metodologia Ativa",
  "Aprendizagem Baseada em Problemas",
  "Ensino Híbrido",
  "Sala de Aula Invertida",
  "Rotação por Estações",
];

// Técnicas Ativas (aparece quando "Metodologia Ativa" é selecionada)
const TECNICAS_ATIVAS = [
  "Gamificação",
  "Sala de Aula Invertida",
  "Aprendizagem Baseada em Projetos (PBL)",
  "Rotação por Estações",
  "Peer Instruction",
  "Estudo de Caso",
  "Aprendizagem Cooperativa",
];

// Recursos disponíveis
const RECURSOS_DISPONIVEIS = [
  "Quadro/Giz",
  "Projetor/Datashow",
  "Lousa Digital",
  "Tablets/Celulares",
  "Internet",
  "Materiais Maker (Papel, Cola, etc)",
  "Jogos de Tabuleiro",
  "Laboratório",
  "Material Dourado",
  "Recursos de CAA",
  "Vídeos Educativos",
];

function PapoDeMestre({
  student,
  hiperfoco,
  engine,
  onEngineChange,
  onClose,
}: {
  student: StudentFull | null;
  hiperfoco: string;
  engine: EngineId;
  onEngineChange: (e: EngineId) => void;
  onClose: () => void;
}) {
  const [materia, setMateria] = useState("Língua Portuguesa");
  const [assunto, setAssunto] = useState("");
  const [temaTurma, setTemaTurma] = useState("");
  const [hiperfocoEditavel, setHiperfocoEditavel] = useState(hiperfoco);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [validado, setValidado] = useState(false);

  // Atualizar hiperfoco editável quando o prop mudar (ex: mudança de estudante)
  useEffect(() => {
    setHiperfocoEditavel(hiperfoco);
  }, [hiperfoco]);

  const gerar = async () => {
    if (!assunto.trim()) {
      setErro("Informe o assunto da aula.");
      return;
    }
    setLoading(true);
    setErro(null);
    setResultado(null);
    setValidado(false);
    aiLoadingStart(engine || "green", "hub");
    try {
      const res = await fetch("/api/hub/papo-mestre", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materia,
          assunto,
          engine,
          hiperfoco,
          tema_turma: temaTurma || undefined,
          nome_estudante: student?.name || "o estudante",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar");
      setResultado(data.texto || "");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao gerar conexões.");
    } finally {
      setLoading(false);
      aiLoadingStop();
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-50 to-white space-y-4 min-h-[200px]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(226,232,240,0.6)' }}>
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Papo de Mestre — Conexões para Engajamento</h3>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">
          Fechar
        </button>
      </div>
      <p className="text-sm text-slate-600">
        Use o hiperfoco como ponte (estratégia DUA) para conectar o estudante ao conteúdo.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Componente Curricular</label>
          <select value={materia} onChange={(e) => setMateria(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg">
            {COMPONENTES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Assunto da aula *</label>
          <input
            type="text"
            value={assunto}
            onChange={(e) => setAssunto(e.target.value)}
            placeholder="Ex: Frações, Sistema Solar..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Hiperfoco do estudante</label>
          <input
            type="text"
            value={hiperfocoEditavel}
            onChange={(e) => setHiperfocoEditavel(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
          />
          <p className="text-xs text-slate-500 mt-1">Pré-preenchido com o hiperfoco do estudante. Você pode editar ou apagar se necessário.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Interesse da turma (DUA, opcional)</label>
          <input
            type="text"
            value={temaTurma}
            onChange={(e) => setTemaTurma(e.target.value)}
            placeholder="Ex: Minecraft, Copa do Mundo..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
          />
        </div>
      </div>
      <button
        type="button"
        onClick={gerar}
        disabled={loading}
        className="px-4 py-2 bg-cyan-600 text-white rounded-lg disabled:opacity-50"
      >
        {loading ? "Gerando…" : "Criar conexões"}
      </button>
      {erro && <div className="text-red-600 text-sm">{erro}</div>}
      {resultado && (
        <div className="space-y-4">
          {validado && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm font-medium">
              ✅ CONEXÕES VALIDADAS E PRONTAS PARA USO
            </div>
          )}
          {!validado && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setValidado(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
              >
                ✅ Validar Conexões
              </button>
              <button
                type="button"
                onClick={() => {
                  setResultado(null);
                  setValidado(false);
                }}
                className="px-4 py-2 bg-slate-400 text-white rounded-lg hover:bg-slate-500 text-sm"
              >
                🗑️ Descartar
              </button>
            </div>
          )}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(226,232,240,0.6)' }}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
              <span className="text-base font-semibold text-slate-800">Conexões para Engajamento</span>
              <span className="flex gap-2">
                <DocxDownloadButton texto={resultado} titulo="Papo de Mestre" filename={`Papo_Mestre_${new Date().toISOString().slice(0, 10)}.docx`} />
                <PdfDownloadButton text={resultado} filename={`Papo_Mestre_${new Date().toISOString().slice(0, 10)}.pdf`} title="Papo de Mestre" />
              </span>
            </div>
            <FormattedTextDisplay texto={resultado} />
          </div>
        </div>
      )}
    </div>
  );
}

function PlanoAulaDua({
  student,
  engine,
  onEngineChange,
  onClose,
}: {
  student: StudentFull | null;
  engine: EngineId;
  onEngineChange: (e: EngineId) => void;
  onClose: () => void;
}) {
  const [materia, setMateria] = useState("Língua Portuguesa");
  const [assunto, setAssunto] = useState("");
  const [serie, setSerie] = useState("");
  const [duracao, setDuracao] = useState(50);
  const [metodologia, setMetodologia] = useState("Aula Expositiva Dialogada");
  const [tecnicaAtiva, setTecnicaAtiva] = useState("");
  const [recursos, setRecursos] = useState<string[]>([]);
  const [qtdAlunos, setQtdAlunos] = useState(30);
  const [componentes, setComponentes] = useState<Record<string, { codigo: string; descricao: string }[]>>({});
  const [estruturaBncc, setEstruturaBncc] = useState<EstruturaBncc>(null);
  const [componenteSel, setComponenteSel] = useState("");
  const [unidadeSel, setUnidadeSel] = useState("");
  const [objetoSel, setObjetoSel] = useState("");
  const [habilidadesSel, setHabilidadesSel] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [validado, setValidado] = useState(false);
  const [loadingMapa, setLoadingMapa] = useState<"html" | null>(null);
  const [mapaHtml, setMapaHtml] = useState<string | null>(null);
  const [mapaErro, setMapaErro] = useState<string | null>(null);

  const peiData = student?.pei_data || {};
  const hiperfoco = (peiData.hiperfoco as string) || (peiData.interesses as string) || "";
  const serieAluno = student?.grade || "";

  useEffect(() => {
    if (serieAluno) {
      setSerie(serieAluno);
    }
  }, [serieAluno]);

  useEffect(() => {
    if (!serie) return;
    Promise.all([
      fetch(`/api/bncc/ef?serie=${encodeURIComponent(serie)}`).then((r) => r.json()),
      fetch(`/api/bncc/ef?serie=${encodeURIComponent(serie)}&estrutura=1`).then((r) => r.json()),
    ])
      .then(([d, e]) => {
        setComponentes(d.ano_atual || d || {});
        setEstruturaBncc(e.disciplinas ? e : null);
      })
      .catch(() => { setComponentes({}); setEstruturaBncc(null); });
  }, [serie]);

  const discDataP = estruturaBncc?.porDisciplina?.[componenteSel];
  const unidadeDataPRaw = componenteSel && discDataP?.porUnidade?.[unidadeSel];
  const unidadeDataP = unidadeDataPRaw && typeof unidadeDataPRaw === "object" && "objetos" in unidadeDataPRaw ? unidadeDataPRaw : null;
  const habsDoObjetoP = objetoSel && unidadeDataP && "porObjeto" in unidadeDataP ? unidadeDataP.porObjeto?.[objetoSel] : undefined;
  const todasHabilidadesPlano = habsDoObjetoP
    ? habsDoObjetoP.map((h) => `${componenteSel}: ${h.codigo} — ${h.descricao}`)
    : unidadeDataP
      ? Object.entries(unidadeDataP.porObjeto || {}).flatMap(([, habs]) => (habs || []).map((h) => `${componenteSel}: ${h.codigo} — ${h.descricao}`))
      : discDataP
        ? Object.values(discDataP.porUnidade || {}).flatMap((v) => Object.values(v.porObjeto || {}).flatMap((habList) => (habList || []).map((h) => `${componenteSel}: ${h.codigo} — ${h.descricao}`)))
        : Object.entries(componentes).flatMap(([disc, habs]) => (habs || []).map((h) => `${disc}: ${h.codigo} — ${h.descricao}`));

  const temBnccPreenchida = habilidadesSel.length > 0;

  const gerar = async () => {
    if (!assunto.trim() && !temBnccPreenchida) {
      setErro("Informe o assunto ou selecione habilidades BNCC.");
      return;
    }
    setLoading(true);
    setErro(null);
    setResultado(null);
    setValidado(false);
    aiLoadingStart(engine || "green", "hub");
    try {
      const res = await fetch("/api/hub/plano-aula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materia,
          assunto: assunto.trim() || undefined,
          duracao_minutos: duracao,
          metodologia,
          tecnica: metodologia === "Metodologia Ativa" && tecnicaAtiva ? tecnicaAtiva : undefined,
          qtd_alunos: qtdAlunos,
          recursos: recursos.length > 0 ? recursos : undefined,
          habilidades_bncc: habilidadesSel.length > 0 ? habilidadesSel : undefined,
          unidade_tematica: unidadeSel || undefined,
          objeto_conhecimento: objetoSel || undefined,
          estudante: student
            ? { nome: student.name, hiperfoco, perfil: (peiData.ia_sugestao as string)?.slice(0, 500) || undefined }
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar");
      setResultado(data.texto || "");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao gerar plano.");
    } finally {
      setLoading(false);
      aiLoadingStop();
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-50 to-white space-y-4 min-h-[200px]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(226,232,240,0.6)' }}>
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Plano de Aula DUA</h3>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">
          Fechar
        </button>
      </div>
      <EngineSelector value={engine} onChange={onEngineChange} />

      {/* Módulo BNCC - PRIMEIRO */}
      {estruturaBncc && estruturaBncc.disciplinas.length > 0 && (
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            BNCC: Componente Curricular, Unidade e Objeto
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Série (ano BNCC)</label>
              <input
                type="text"
                value={serieAluno || ""}
                readOnly
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Componente Curricular</label>
              <select
                value={componenteSel || materia}
                onChange={(e) => {
                  const val = e.target.value;
                  setComponenteSel(val);
                  setMateria(val);
                  setUnidadeSel("");
                  setObjetoSel("");
                }}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">Selecione...</option>
                {estruturaBncc?.disciplinas?.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Unidade Temática</label>
              <select value={unidadeSel} onChange={(e) => { setUnidadeSel(e.target.value); setObjetoSel(""); }} className="w-full px-3 py-2 border rounded-lg text-sm" disabled={!componenteSel}>
                <option value="">Todas</option>
                {(discDataP?.unidades || []).map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Objeto do Conhecimento</label>
              <select value={objetoSel} onChange={(e) => setObjetoSel(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" disabled={!unidadeSel}>
                <option value="">Todos</option>
                {(unidadeDataP && typeof unidadeDataP === "object" && "objetos" in unidadeDataP ? unidadeDataP.objetos : []).map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Habilidades BNCC (opcional)</label>
            <select multiple value={habilidadesSel} onChange={(e) => setHabilidadesSel(Array.from(e.target.selectedOptions, (o) => o.value))} className="w-full px-3 py-2 border rounded-lg text-sm min-h-[60px]">
              {todasHabilidadesPlano.slice(0, 60).map((h, i) => <option key={i} value={h}>{h}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Componente Curricular (fallback se BNCC não disponível) */}
      {(!estruturaBncc || estruturaBncc.disciplinas.length === 0) && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Componente Curricular</label>
          <select value={materia} onChange={(e) => setMateria(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg">
            {COMPONENTES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {/* Configuração Metodológica */}
      <div className="border-t border-slate-200 pt-4">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Configuração Metodológica</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Metodologia</label>
            <select
              value={metodologia}
              onChange={(e) => {
                setMetodologia(e.target.value);
                if (e.target.value !== "Metodologia Ativa") {
                  setTecnicaAtiva("");
                }
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            >
              {METODOLOGIAS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            {metodologia === "Metodologia Ativa" ? (
              <>
                <label className="block text-sm font-medium text-slate-700 mb-1">Técnica Ativa</label>
                <select
                  value={tecnicaAtiva}
                  onChange={(e) => setTecnicaAtiva(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                >
                  <option value="">Selecione uma técnica</option>
                  {TECNICAS_ATIVAS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </>
            ) : (
              <div className="mt-6 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-xs text-slate-600">
                  <strong>Metodologia selecionada:</strong> {metodologia}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Qtd Estudantes</label>
          <input
            type="number"
            min={1}
            value={qtdAlunos}
            onChange={(e) => setQtdAlunos(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Duração da aula</label>
          <select
            value={duracao}
            onChange={(e) => setDuracao(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
          >
            <option value={50}>50 minutos (1 aula)</option>
            <option value={100}>100 minutos (2 aulas)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Recursos Disponíveis</label>
          <select
            multiple
            value={recursos}
            onChange={(e) => {
              const selecionados = Array.from(e.target.selectedOptions, (o) => o.value);
              setRecursos(selecionados);
            }}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm min-h-[100px]"
          >
            {RECURSOS_DISPONIVEIS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <p className="text-xs text-slate-500 mt-1">Segure Ctrl/Cmd para múltipla seleção.</p>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Assunto / Tema
          {temBnccPreenchida ? (
            <span className="text-xs text-emerald-600 ml-2 font-normal">(opcional - BNCC já preenchida)</span>
          ) : (
            <span className="text-xs text-red-600 ml-2 font-normal">*</span>
          )}
        </label>
        <input
          type="text"
          value={assunto}
          onChange={(e) => setAssunto(e.target.value)}
          placeholder={temBnccPreenchida ? "Opcional quando BNCC está preenchida" : "Ex: Frações equivalentes..."}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg"
        />
        {temBnccPreenchida && habilidadesSel.length > 0 && (
          <p className="text-xs text-emerald-600 mt-1">
            ✓ {habilidadesSel.length} habilidade(s) BNCC selecionada(s)
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={gerar}
        disabled={loading}
        className="px-4 py-2 bg-cyan-600 text-white rounded-lg disabled:opacity-50"
      >
        {loading ? "Gerando…" : "Gerar plano de aula"}
      </button>
      {erro && <div className="text-red-600 text-sm">{erro}</div>}
      {resultado && (
        <div className="space-y-4">
          {validado && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm font-medium">
              ✅ PLANO VALIDADO E PRONTO PARA USO
            </div>
          )}
          {!validado && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setValidado(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
              >
                ✅ Validar Plano
              </button>
              <button
                type="button"
                onClick={() => {
                  setResultado(null);
                  setValidado(false);
                }}
                className="px-4 py-2 bg-slate-400 text-white rounded-lg hover:bg-slate-500 text-sm"
              >
                🗑️ Descartar
              </button>
            </div>
          )}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(226,232,240,0.6)' }}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
              <span className="text-base font-semibold text-slate-800">Plano de Aula DUA</span>
              <span className="flex gap-2 flex-wrap">
                {(() => {
                  const { getDataBrasiliaISO } = require("@/lib/date-utils");
                  const dataStr = getDataBrasiliaISO();
                  return (
                    <>
                      <DocxDownloadButton texto={resultado} titulo="Plano de Aula DUA" filename={`Plano_Aula_${dataStr}.docx`} />
                      <PdfDownloadButton text={resultado} filename={`Plano_Aula_${dataStr}.pdf`} title="Plano de Aula DUA" />
                    </>
                  );
                })()}
                <button
                  type="button"
                  disabled={!!loadingMapa}
                  onClick={async () => {
                    setLoadingMapa("html");
                    setMapaErro(null);
                    setMapaHtml(null);
                    try {
                      const res = await fetch("/api/hub/mapa-mental", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          tipo: "html",
                          materia: componenteSel || materia,
                          assunto: assunto || "Geral",
                          plano_texto: resultado,
                          estudante: student ? { nome: student.name, hiperfoco } : undefined,
                          unidade_tematica: unidadeSel || undefined,
                          objeto_conhecimento: objetoSel || undefined,
                        }),
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error || "Erro");
                      setMapaHtml(data.html);
                    } catch (e) {
                      setMapaErro(e instanceof Error ? e.message : "Erro ao gerar mapa mental.");
                    } finally {
                      setLoadingMapa(null);
                    }
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {loadingMapa === "html" ? "Gerando…" : "🧠 Mapa Mental"}
                </button>
              </span>
            </div>
            {mapaErro && <div className="text-red-600 text-sm mb-3">{mapaErro}</div>}
            {mapaHtml && (
              <div className="mb-4 rounded-xl border border-indigo-200 overflow-hidden">
                <div className="flex justify-between items-center px-4 py-2 bg-indigo-50 border-b border-indigo-200">
                  <span className="text-sm font-medium text-indigo-800">🧠 Mapa Mental do Conteúdo</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const blob = new Blob([mapaHtml], { type: "text/html" });
                        const url = URL.createObjectURL(blob);
                        window.open(url, "_blank");
                        setTimeout(() => URL.revokeObjectURL(url), 60000);
                      }}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs hover:bg-indigo-200"
                    >
                      🔗 Abrir em nova aba
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapaHtml(null)}
                      className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs hover:bg-slate-200"
                    >
                      ✕ Fechar
                    </button>
                  </div>
                </div>
                <iframe
                  srcDoc={mapaHtml}
                  title="Mapa Mental"
                  className="w-full border-0"
                  style={{ height: "600px" }}
                  sandbox="allow-scripts"
                />
              </div>
            )}
            <FormattedTextDisplay texto={resultado} />
          </div>
        </div>
      )}
    </div>
  );
}

type ChecklistAdaptacao = {
  questoes_desafiadoras?: boolean;
  compreende_instrucoes_complexas?: boolean;
  instrucoes_passo_a_passo?: boolean;
  dividir_em_etapas?: boolean;
  paragrafos_curtos?: boolean;
  dicas_apoio?: boolean;
  compreende_figuras_linguagem?: boolean;
  descricao_imagens?: boolean;
};

function RotinaAvdTool({
  student,
  engine,
  onEngineChange,
  onClose,
}: {
  student: StudentFull | null;
  engine: EngineId;
  onEngineChange: (e: EngineId) => void;
  onClose: () => void;
}) {
  const [rotinaDetalhada, setRotinaDetalhada] = useState("");
  const [topicoFoco, setTopicoFoco] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [validado, setValidado] = useState(false);
  const [feedback, setFeedback] = useState("");

  const gerar = async (refazer = false) => {
    if (!rotinaDetalhada.trim()) {
      setErro("Descreva a rotina da turma.");
      return;
    }
    setLoading(true);
    setErro(null);
    setResultado(null);
    setValidado(false);
    try {
      const peiData = student?.pei_data || {};
      const res = await fetch("/api/hub/rotina-avd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rotina_detalhada: rotinaDetalhada,
          topico_foco: topicoFoco || undefined,
          feedback: refazer ? feedback : undefined,
          engine,
          estudante: student ? { nome: student.name, ia_sugestao: (peiData.ia_sugestao as string)?.slice(0, 300) } : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro");
      setResultado(data.texto || "");
      if (refazer) setFeedback("");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-50 to-white space-y-4 min-h-[200px]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(226,232,240,0.6)' }}>
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Rotina & Previsibilidade
        </h3>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">Fechar</button>
      </div>
      <p className="text-sm text-slate-600">A rotina organiza o pensamento da criança. Use esta ferramenta para identificar pontos de estresse e criar estratégias de antecipação.</p>
      <EngineSelector value={engine} onChange={onEngineChange} />
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Descreva a Rotina da Turma *</label>
        <textarea
          value={rotinaDetalhada}
          onChange={(e) => setRotinaDetalhada(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="Ex:&#10;8:00 - Chegada e Acolhida&#10;8:30 - Roda de Conversa&#10;9:00 - Lanche&#10;..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Ponto de Atenção (Opcional)</label>
        <input
          type="text"
          value={topicoFoco}
          onChange={(e) => setTopicoFoco(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="Ex: Transição para o parque"
        />
      </div>
      <button type="button" onClick={() => gerar(false)} disabled={loading} className="px-4 py-2 bg-cyan-600 text-white rounded-lg disabled:opacity-50">
        {loading ? "Analisando…" : "📝 ANALISAR E ADAPTAR ROTINA"}
      </button>
      {erro && <p className="text-red-600 text-sm">{erro}</p>}
      {resultado && (
        <div className="space-y-4">
          {validado && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm font-medium">
              ✅ ROTINA VALIDADA!
            </div>
          )}
          {!validado && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setValidado(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
              >
                ✅ Validar Rotina
              </button>
              <details className="flex-1 border border-slate-200 rounded p-2">
                <summary className="text-sm cursor-pointer text-slate-600">🔄 Refazer adaptação</summary>
                <div className="mt-2 flex flex-wrap gap-2 items-center">
                  <input
                    type="text"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="O que ajustar na rotina?"
                    className="flex-1 min-w-[120px] px-2 py-1 border rounded text-sm"
                  />
                  <button type="button" onClick={() => gerar(true)} disabled={loading} className="px-3 py-1 bg-slate-200 rounded text-sm hover:bg-slate-300">
                    Refazer Rotina
                  </button>
                </div>
              </details>
            </div>
          )}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(226,232,240,0.6)' }}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
              <span className="text-base font-semibold text-slate-800">Rotina & Previsibilidade</span>
              <span className="flex gap-2">
                <DocxDownloadButton texto={resultado} titulo="Rotina e AVD" filename={`Rotina_AVD_${new Date().toISOString().slice(0, 10)}.docx`} />
                <PdfDownloadButton text={resultado} filename={`Rotina_AVD_${new Date().toISOString().slice(0, 10)}.pdf`} title="Rotina e AVD" />
              </span>
            </div>
            <FormattedTextDisplay texto={resultado} />
          </div>
        </div>
      )}
    </div>
  );
}

function InclusaoBrincarTool({
  student,
  engine,
  onEngineChange,
  onClose,
}: {
  student: StudentFull | null;
  engine: EngineId;
  onEngineChange: (e: EngineId) => void;
  onClose: () => void;
}) {
  const peiData = student?.pei_data || {};
  const hiperfoco = (peiData.hiperfoco as string) || "";
  const [tema, setTema] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [validado, setValidado] = useState(false);
  const [feedback, setFeedback] = useState("");

  const gerar = async (refazer = false) => {
    if (!tema.trim()) {
      setErro("Informe o tema/momento.");
      return;
    }
    setLoading(true);
    setErro(null);
    setResultado(null);
    setValidado(false);
    try {
      const res = await fetch("/api/hub/inclusao-brincar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tema,
          feedback: refazer ? feedback : undefined,
          engine,
          estudante: student ? { nome: student.name, hiperfoco, ia_sugestao: (peiData.ia_sugestao as string)?.slice(0, 500) || undefined } : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro");
      setResultado(data.texto || "");
      if (refazer) setFeedback("");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-50 to-white space-y-4 min-h-[200px]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(226,232,240,0.6)' }}>
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <ToyBrick className="w-5 h-5" />
          Mediação Social
        </h3>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">Fechar</button>
      </div>
      <p className="text-sm text-slate-600">Se a criança brinca isolada, o objetivo não é forçar a interação, mas criar pontes através do interesse dela. A IA criará uma brincadeira onde ela é protagonista.</p>
      <EngineSelector value={engine} onChange={onEngineChange} />
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Tema/Momento *</label>
        <input
          type="text"
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="Ex: Brincadeira de massinha"
        />
      </div>
      <button type="button" onClick={() => gerar(false)} disabled={loading} className="px-4 py-2 bg-cyan-600 text-white rounded-lg disabled:opacity-50">
        {loading ? "Criando ponte social…" : "🤝 GERAR DINÂMICA"}
      </button>
      {erro && <p className="text-red-600 text-sm">{erro}</p>}
      {resultado && (
        <div className="space-y-4">
          {validado && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm font-medium">
              ✅ DINÂMICA VALIDADA!
            </div>
          )}
          {!validado && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setValidado(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
              >
                ✅ Validar Dinâmica
              </button>
              <details className="flex-1 border border-slate-200 rounded p-2">
                <summary className="text-sm cursor-pointer text-slate-600">🔄 Refazer dinâmica</summary>
                <div className="mt-2 flex flex-wrap gap-2 items-center">
                  <input
                    type="text"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="O que ajustar?"
                    className="flex-1 min-w-[120px] px-2 py-1 border rounded text-sm"
                  />
                  <button type="button" onClick={() => gerar(true)} disabled={loading} className="px-3 py-1 bg-slate-200 rounded text-sm hover:bg-slate-300">
                    Refazer Dinâmica
                  </button>
                </div>
              </details>
            </div>
          )}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(226,232,240,0.6)' }}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
              <span className="text-base font-semibold text-slate-800">Inclusão no Brincar</span>
              <span className="flex gap-2">
                <DocxDownloadButton texto={resultado} titulo="Inclusão no Brincar" filename={`Inclusao_Brincar_${new Date().toISOString().slice(0, 10)}.docx`} />
                <PdfDownloadButton text={resultado} filename={`Inclusao_Brincar_${new Date().toISOString().slice(0, 10)}.pdf`} title="Inclusão no Brincar" />
              </span>
            </div>
            <FormattedTextDisplay texto={resultado} />
          </div>
        </div>
      )}
    </div>
  );
}

function AdaptarProva({
  student,
  hiperfoco,
  engine,
  onEngineChange,
  onClose,
}: {
  student: StudentFull | null;
  hiperfoco: string;
  engine: EngineId;
  onEngineChange: (e: EngineId) => void;
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [docxExtraido, setDocxExtraido] = useState<{ texto: string; imagens: { base64: string; contentType: string }[] } | null>(null);
  const [mapaQuestoes, setMapaQuestoes] = useState<Record<number, number>>({});
  const [materia, setMateria] = useState("Língua Portuguesa");
  const [tema, setTema] = useState("");
  const [serie, setSerie] = useState("");
  const [componentes, setComponentes] = useState<Record<string, { codigo: string; descricao: string }[]>>({});
  const [estruturaBncc, setEstruturaBncc] = useState<EstruturaBncc>(null);
  const [componenteSel, setComponenteSel] = useState("");
  const [unidadeSel, setUnidadeSel] = useState("");
  const [objetoSel, setObjetoSel] = useState("");
  const [modoProfundo, setModoProfundo] = useState(false);
  const [tipo, setTipo] = useState("Prova");
  const [checklist, setChecklist] = useState<ChecklistAdaptacao>({});
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [resultado, setResultado] = useState<{ analise: string; texto: string } | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [validado, setValidado] = useState(false);
  const [refazendo, setRefazendo] = useState(false);

  const peiData = student?.pei_data || {};
  const serieAluno = student?.grade || "";

  useEffect(() => {
    if (serieAluno) {
      setSerie(serieAluno);
    }
  }, [serieAluno]);

  useEffect(() => {
    if (!serie?.trim()) return;
    Promise.all([
      fetch(`/api/bncc/ef?serie=${encodeURIComponent(serie)}`).then((r) => r.json()),
      fetch(`/api/bncc/ef?serie=${encodeURIComponent(serie)}&estrutura=1`).then((r) => r.json()),
    ])
      .then(([d, e]) => {
        setComponentes(d.ano_atual || d || {});
        setEstruturaBncc(e.disciplinas ? e : null);
      })
      .catch(() => {
        setComponentes({});
        setEstruturaBncc(null);
      });
  }, [serie]);

  const discDataP = estruturaBncc?.porDisciplina?.[componenteSel];
  const unidadeDataPRaw = componenteSel && discDataP?.porUnidade?.[unidadeSel];
  const unidadeDataP = unidadeDataPRaw && typeof unidadeDataPRaw === "object" && "objetos" in unidadeDataPRaw ? unidadeDataPRaw : null;

  const handleFileChange = async (f: File | null) => {
    setFile(f);
    setDocxExtraido(null);
    setMapaQuestoes({});
    setResultado(null);
    if (!f) return;
    setExtracting(true);
    setErro(null);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/hub/extrair-docx", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao extrair");
      setDocxExtraido({ texto: data.texto, imagens: data.imagens || [] });
      setMapaQuestoes({});
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao extrair DOCX.");
    } finally {
      setExtracting(false);
    }
  };

  const gerar = async (usarModoProfundo = false) => {
    const texto = docxExtraido?.texto;
    if (!texto && !file) {
      setErro("Selecione um arquivo DOCX.");
      return;
    }
    setLoading(true);
    setErro(null);
    setResultado(null);
    setValidado(false);
    aiLoadingStart(engine || "green", "hub");
    try {
      const questoesComImagem = [...new Set(Object.values(mapaQuestoes).filter((q) => q > 0))];
      const formData = new FormData();
      if (file) formData.append("file", file);
      formData.append(
        "meta",
        JSON.stringify({
          materia: componenteSel || materia,
          tema: tema || undefined,
          tipo,
          checklist,
          engine,
          modo_profundo: usarModoProfundo || modoProfundo,
          unidade_tematica: unidadeSel || undefined,
          objeto_conhecimento: objetoSel || undefined,
          estudante: student ? { nome: student.name, hiperfoco, perfil: (peiData.ia_sugestao as string)?.slice(0, 1000) || undefined } : { hiperfoco, perfil: (peiData.ia_sugestao as string)?.slice(0, 1000) || undefined },
          texto: texto || undefined,
          questoes_com_imagem: questoesComImagem,
        })
      );
      const res = await fetch("/api/hub/adaptar-prova", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao adaptar");
      setResultado({ analise: data.analise || "", texto: data.texto || "" });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao adaptar.");
    } finally {
      setLoading(false);
      setRefazendo(false);
      aiLoadingStop();
    }
  };

  // Mapear imagens extraídas do DOCX para as questões adaptadas
  const mapaImagensParaDocx: Record<number, string> = {};
  let textoComImagensParaDocx = resultado?.texto || "";

  if (docxExtraido?.imagens?.length && resultado?.texto) {
    for (const [imgIdxStr, questao] of Object.entries(mapaQuestoes)) {
      if (questao > 0) {
        const idx = parseInt(imgIdxStr, 10);
        const img = docxExtraido.imagens[idx];
        // Garantir que a imagem existe e tem base64 válido
        if (img?.base64 && typeof img.base64 === "string" && img.base64.length > 0) {
          // Remover prefixo data: se existir
          const base64Clean = img.base64.replace(/^data:image\/\w+;base64,/, "");
          if (base64Clean.length > 0) {
            mapaImagensParaDocx[questao] = base64Clean;
          }
        }
      }
    }

    // Garantir que o texto tenha as tags [[IMG_N]] para as questões mapeadas
    // Se não tiver, adicionar após o número da questão
    textoComImagensParaDocx = resultado.texto;
    const questoesComImagem = Object.values(mapaQuestoes).filter((q) => q > 0);

    // Primeiro, verificar se a IA já inseriu as tags
    const tagsExistentes = questoesComImagem.filter((q) => textoComImagensParaDocx.includes(`[[IMG_${q}]]`));

    // Para questões sem tag, inserir de forma mais robusta
    for (const questao of questoesComImagem) {
      const tag = `[[IMG_${questao}]]`;
      // Verificar se a tag já existe no texto (com variações possíveis)
      const tagVariations = [
        tag,
        tag.replace(/\[\[/g, "[").replace(/\]\]/g, "]"),
        `IMG_${questao}`,
        `[Imagem ${questao}]`,
      ];
      const temTag = tagVariations.some((t) => textoComImagensParaDocx.includes(t));

      if (!temTag) {
        // Tentar encontrar a questão no texto — patterns com regex correto
        const patterns = [
          new RegExp(`(Questão\\s+${questao})\\b`, "gi"),
          new RegExp(`(\\b${questao}\\.)\\s`, "gi"),
          new RegExp(`(\\b${questao}\\))\\s`, "gi"),
        ];

        let inserido = false;
        for (const pattern of patterns) {
          const match = pattern.exec(textoComImagensParaDocx);
          if (match && match.index !== undefined) {
            // A partir da posição do match, encontrar o final do enunciado
            const inicio = match.index + match[0].length;
            const restoTexto = textoComImagensParaDocx.slice(inicio);

            // Procurar o ponto de inserção: logo antes das alternativas ou da próxima questão
            const altMatch = restoTexto.match(/\n\s*[a-eA-E]\s*\)/);
            const proxQuestaoMatch = restoTexto.match(/\n\s*(?:Questão\s+\d+|\d+\.|\d+\))/i);
            const quebraLinhaIdx = restoTexto.indexOf("\n");

            let posicaoRelativa: number;
            if (altMatch && altMatch.index !== undefined) {
              // Inserir logo antes das alternativas
              posicaoRelativa = altMatch.index;
            } else if (proxQuestaoMatch && proxQuestaoMatch.index !== undefined) {
              // Inserir antes da próxima questão
              posicaoRelativa = proxQuestaoMatch.index;
            } else if (quebraLinhaIdx >= 0) {
              // Inserir após a primeira linha do enunciado
              posicaoRelativa = quebraLinhaIdx;
            } else {
              posicaoRelativa = Math.min(restoTexto.length, 200);
            }

            const posicaoInsercao = inicio + posicaoRelativa;
            textoComImagensParaDocx = textoComImagensParaDocx.slice(0, posicaoInsercao) + `\n${tag}\n` + textoComImagensParaDocx.slice(posicaoInsercao);
            inserido = true;
            break;
          }
        }

        // Fallback: adicionar no final do texto (não no início!)
        if (!inserido) {
          textoComImagensParaDocx = `${textoComImagensParaDocx}\n\n${tag}`;
        }
      }
    }
  }
  const temDados = !!docxExtraido?.texto || !!file;

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-50 to-white space-y-4 min-h-[200px]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(226,232,240,0.6)' }}>
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Adaptar Prova (DUA)</h3>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">
          Fechar
        </button>
      </div>
      <p className="text-sm text-slate-600">Transforme provas padrão em avaliações acessíveis.</p>
      <EngineSelector value={engine} onChange={onEngineChange} />
      {estruturaBncc && estruturaBncc.disciplinas.length > 0 && (
        <details className="border border-slate-200 rounded-lg" open>
          <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-slate-700 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            BNCC: Unidade e Objeto
          </summary>
          <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Série (ano BNCC)</label>
              <input
                type="text"
                value={serieAluno || ""}
                readOnly
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Componente</label>
              <select
                value={componenteSel}
                onChange={(e) => {
                  setComponenteSel(e.target.value);
                  setUnidadeSel("");
                  setObjetoSel("");
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              >
                <option value="">Todos</option>
                {estruturaBncc?.disciplinas?.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Unidade Temática</label>
              <select
                value={unidadeSel}
                onChange={(e) => {
                  setUnidadeSel(e.target.value);
                  setObjetoSel("");
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                disabled={!componenteSel}
              >
                <option value="">Todas</option>
                {(discDataP?.unidades || []).map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Objeto do Conhecimento</label>
              <select
                value={objetoSel}
                onChange={(e) => setObjetoSel(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                disabled={!unidadeSel}
              >
                <option value="">Todos</option>
                {(unidadeDataP && typeof unidadeDataP === "object" && "objetos" in unidadeDataP ? unidadeDataP.objetos : []).map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
        </details>
      )}
      {(!estruturaBncc || !estruturaBncc.disciplinas.length) && (
        <details className="border border-slate-200 rounded-lg" open>
          <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-slate-700 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            BNCC
          </summary>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Série (ano BNCC)</label>
              <input
                type="text"
                value={serieAluno || ""}
                readOnly
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Componente</label>
              <select value={materia} onChange={(e) => setMateria(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                {(Object.keys(componentes).length ? Object.keys(componentes) : COMPONENTES).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </details>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Tema / Assunto
          <span className="text-xs text-slate-500 ml-2 font-normal">(opcional)</span>
        </label>
        <input
          type="text"
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          placeholder="Ex: Frações equivalentes (opcional)"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Arquivo DOCX *</label>
        <input
          type="file"
          accept=".docx"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-100 file:text-cyan-800"
        />
        {extracting && <p className="text-sm text-amber-600 mt-1">Extraindo texto e imagens…</p>}
        {docxExtraido?.imagens?.length ? (
          <p className="text-sm text-emerald-600 mt-1">{docxExtraido.imagens.length} imagem(ns) encontrada(s).</p>
        ) : null}
      </div>
      {docxExtraido?.imagens?.length ? (
        <details className="border border-slate-200 rounded-lg" open>
          <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-slate-700">Mapeamento de imagens</summary>
          <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
            {docxExtraido.imagens.map((img, i) => (
              <div key={i} className="flex flex-col gap-2">
                <img src={`data:${img.contentType};base64,${img.base64}`} alt="" className="max-w-[80px] max-h-[80px] object-contain border rounded" />
                <label className="text-xs text-slate-600">
                  Pertence à questão:
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={mapaQuestoes[i] ?? 0}
                    onChange={(e) => setMapaQuestoes((m) => ({ ...m, [i]: parseInt(e.target.value, 10) || 0 }))}
                    className="ml-1 w-14 px-2 py-1 border rounded text-sm"
                  />
                </label>
              </div>
            ))}
          </div>
        </details>
      ) : null}
      <div className="flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg">
            <option value="Prova">Prova</option>
            <option value="Tarefa">Tarefa</option>
            <option value="Avaliação">Avaliação</option>
          </select>
        </div>
        <label className="flex items-center gap-2 self-end">
          <input type="checkbox" checked={modoProfundo} onChange={(e) => setModoProfundo(e.target.checked)} />
          <span className="text-sm">Modo profundo (análise mais detalhada)</span>
        </label>
      </div>
      <details className="border border-slate-200 rounded-lg">
        <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-slate-700">Checklist de adaptação (PEI)</summary>
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          {[
            { k: "questoes_desafiadoras", l: "Questões mais desafiadoras" },
            { k: "compreende_instrucoes_complexas", l: "Compreende instruções complexas" },
            { k: "instrucoes_passo_a_passo", l: "Instruções passo a passo" },
            { k: "dividir_em_etapas", l: "Dividir em etapas" },
            { k: "paragrafos_curtos", l: "Parágrafos curtos" },
            { k: "dicas_apoio", l: "Dicas de apoio" },
            { k: "compreende_figuras_linguagem", l: "Compreende figuras de linguagem" },
            { k: "descricao_imagens", l: "Descrição de imagens" },
          ].map(({ k, l }) => (
            <label key={k} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!checklist[k as keyof ChecklistAdaptacao]}
                onChange={(e) => setChecklist((c) => ({ ...c, [k]: e.target.checked }))}
              />
              {l}
            </label>
          ))}
        </div>
      </details>
      <button
        type="button"
        onClick={() => gerar()}
        disabled={loading || !temDados}
        className="px-4 py-2 bg-cyan-600 text-white rounded-lg disabled:opacity-50"
      >
        {loading ? "Adaptando…" : "Adaptar prova"}
      </button>
      {erro && <div className="text-red-600 text-sm">{erro}</div>}
      {resultado && (
        <div className="space-y-4">
          {validado && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm font-medium">
              ✅ ATIVIDADE VALIDADA E PRONTA PARA USO
            </div>
          )}
          {!validado && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setValidado(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
              >
                ✅ Validar
              </button>
              <button
                type="button"
                onClick={() => {
                  setRefazendo(true);
                  gerar(true);
                }}
                disabled={refazendo}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm disabled:opacity-50"
              >
                {refazendo ? "Refazendo…" : "🔄 Refazer (+Profundo)"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setResultado(null);
                  setValidado(false);
                }}
                className="px-4 py-2 bg-slate-400 text-white rounded-lg hover:bg-slate-500 text-sm"
              >
                🗑️ Descartar
              </button>
            </div>
          )}
          {resultado.analise && (
            <div className="p-4 rounded-lg bg-slate-100 border border-slate-200">
              <div className="text-xs font-semibold text-slate-600 uppercase mb-3">Análise Pedagógica</div>
              <FormattedTextDisplay texto={resultado.analise} />
            </div>
          )}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(226,232,240,0.6)' }}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
              <span className="text-base font-semibold text-slate-800">Prova Adaptada (DUA)</span>
              <span className="flex gap-2">
                <DocxDownloadButton
                  texto={`${resultado.analise}\n\n---\n\n${textoComImagensParaDocx}`}
                  titulo="Prova Adaptada (DUA)"
                  filename={`Prova_Adaptada_${new Date().toISOString().slice(0, 10)}.docx`}
                  mapaImagens={Object.keys(mapaImagensParaDocx).length > 0 ? mapaImagensParaDocx : undefined}
                />
                <PdfDownloadButton
                  text={`${resultado.analise}\n\n---\n\n${textoComImagensParaDocx}`}
                  filename={`Prova_Adaptada_${new Date().toISOString().slice(0, 10)}.pdf`}
                  title="Prova Adaptada (DUA)"
                />
              </span>
            </div>
            <FormattedTextDisplay texto={textoComImagensParaDocx} mapaImagens={Object.keys(mapaImagensParaDocx).length > 0 ? mapaImagensParaDocx : undefined} />
          </div>
        </div>
      )}
    </div>
  );
}

function RoteiroIndividual({
  student,
  engine,
  onEngineChange,
  onClose,
}: {
  student: StudentFull | null;
  engine: EngineId;
  onEngineChange: (e: EngineId) => void;
  onClose: () => void;
}) {
  const [materia, setMateria] = useState("Língua Portuguesa");
  const [assunto, setAssunto] = useState("");
  const [serie, setSerie] = useState("");
  const [componentes, setComponentes] = useState<Record<string, { codigo: string; descricao: string }[]>>({});
  const [estruturaBncc, setEstruturaBncc] = useState<EstruturaBncc>(null);
  const [componenteSel, setComponenteSel] = useState("");
  const [unidadeSel, setUnidadeSel] = useState("");
  const [objetoSel, setObjetoSel] = useState("");
  const [habilidadesSel, setHabilidadesSel] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [validado, setValidado] = useState(false);

  const serieAluno = student?.grade || "";

  useEffect(() => {
    if (serieAluno) {
      setSerie(serieAluno);
    }
  }, [serieAluno]);

  useEffect(() => {
    if (!serie) return;
    Promise.all([
      fetch(`/api/bncc/ef?serie=${encodeURIComponent(serie)}`).then((r) => r.json()),
      fetch(`/api/bncc/ef?serie=${encodeURIComponent(serie)}&estrutura=1`).then((r) => r.json()),
    ])
      .then(([d, e]) => {
        setComponentes(d.ano_atual || d || {});
        setEstruturaBncc(e.disciplinas ? e : null);
      })
      .catch(() => {
        setComponentes({});
        setEstruturaBncc(null);
      });
  }, [serie]);

  const discData = estruturaBncc?.porDisciplina?.[componenteSel];
  const unidadeDataRaw = componenteSel && discData?.porUnidade?.[unidadeSel];
  const unidadeData = unidadeDataRaw && typeof unidadeDataRaw === "object" && "objetos" in unidadeDataRaw ? unidadeDataRaw : null;
  const habsDoObjeto = objetoSel && unidadeData && "porObjeto" in unidadeData ? unidadeData.porObjeto?.[objetoSel] : undefined;
  const todasHabilidades = habsDoObjeto
    ? habsDoObjeto.map((h) => `${componenteSel}: ${h.codigo} — ${h.descricao}`)
    : unidadeData
      ? Object.entries(unidadeData.porObjeto || {}).flatMap(([, habs]) =>
        (habs || []).map((h) => `${componenteSel}: ${h.codigo} — ${h.descricao}`)
      )
      : discData
        ? Object.values(discData.porUnidade || {}).flatMap((v) =>
          Object.values(v.porObjeto || {}).flatMap((habList) =>
            (habList || []).map((h) => `${componenteSel}: ${h.codigo} — ${h.descricao}`)
          )
        )
        : Object.entries(componentes).flatMap(([disc, habs]) =>
          (habs || []).map((h) => `${disc}: ${h.codigo} — ${h.descricao}`)
        );

  const temBnccPreenchida = habilidadesSel.length > 0;

  const gerar = async () => {
    if (!assunto.trim() && !temBnccPreenchida) {
      setErro("Informe o assunto ou selecione habilidades BNCC.");
      return;
    }
    setLoading(true);
    setErro(null);
    setResultado(null);
    setValidado(false);
    try {
      const peiData = student?.pei_data || {};
      const res = await fetch("/api/hub/roteiro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aluno: { nome: student?.name, ia_sugestao: (peiData.ia_sugestao as string)?.slice(0, 500), hiperfoco: (peiData.hiperfoco as string) || "Geral" },
          materia,
          assunto: assunto.trim() || undefined,
          ano: serieAluno || serie || undefined,
          habilidades_bncc: habilidadesSel.length > 0 ? habilidadesSel : undefined,
          engine,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar");
      setResultado(data.texto || "");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao gerar roteiro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-50 to-white space-y-4 min-h-[200px]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(226,232,240,0.6)' }}>
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Roteiro de Aula Individualizado</h3>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">Fechar</button>
      </div>
      <p className="text-sm text-slate-600">Passo a passo de aula específico para o estudante, usando o hiperfoco.</p>
      <EngineSelector value={engine} onChange={onEngineChange} />

      {/* Módulo BNCC - PRIMEIRO */}
      {estruturaBncc && estruturaBncc.disciplinas.length > 0 && (
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            BNCC: Componente Curricular, Unidade e Objeto
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Série (ano BNCC)</label>
              <input
                type="text"
                value={serieAluno || ""}
                readOnly
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Componente Curricular</label>
              <select
                value={componenteSel || materia}
                onChange={(e) => {
                  const val = e.target.value;
                  setComponenteSel(val);
                  setMateria(val);
                  setUnidadeSel("");
                  setObjetoSel("");
                }}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">Selecione...</option>
                {estruturaBncc?.disciplinas?.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Unidade Temática</label>
              <select value={unidadeSel} onChange={(e) => { setUnidadeSel(e.target.value); setObjetoSel(""); }} className="w-full px-3 py-2 border rounded-lg text-sm" disabled={!componenteSel}>
                <option value="">Todas</option>
                {(discData?.unidades || []).map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Objeto do Conhecimento</label>
              <select value={objetoSel} onChange={(e) => setObjetoSel(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" disabled={!unidadeSel}>
                <option value="">Todos</option>
                {(unidadeData && typeof unidadeData === "object" && "objetos" in unidadeData ? unidadeData.objetos : []).map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Habilidades BNCC (opcional)</label>
            <select multiple value={habilidadesSel} onChange={(e) => setHabilidadesSel(Array.from(e.target.selectedOptions, (o) => o.value))} className="w-full px-3 py-2 border rounded-lg text-sm min-h-[60px]">
              {todasHabilidades.slice(0, 60).map((h, i) => <option key={i} value={h}>{h}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Componente Curricular (fallback se BNCC não disponível) */}
      {(!estruturaBncc || estruturaBncc.disciplinas.length === 0) && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Componente Curricular</label>
          <select value={materia} onChange={(e) => setMateria(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg">
            {Object.keys(componentes).length ? Object.keys(componentes).map((c) => <option key={c} value={c}>{c}</option>) : COMPONENTES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Assunto
          {temBnccPreenchida ? (
            <span className="text-xs text-emerald-600 ml-2 font-normal">(opcional - BNCC já preenchida)</span>
          ) : (
            <span className="text-xs text-red-600 ml-2 font-normal">*</span>
          )}
        </label>
        <input
          type="text"
          value={assunto}
          onChange={(e) => setAssunto(e.target.value)}
          placeholder={temBnccPreenchida ? "Opcional quando BNCC está preenchida" : "Ex: Frações equivalentes"}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg"
        />
        {temBnccPreenchida && habilidadesSel.length > 0 && (
          <p className="text-xs text-emerald-600 mt-1">
            ✓ {habilidadesSel.length} habilidade(s) BNCC selecionada(s)
          </p>
        )}
      </div>
      <button type="button" onClick={gerar} disabled={loading} className="px-4 py-2 bg-cyan-600 text-white rounded-lg disabled:opacity-50">
        {loading ? "Gerando…" : "Gerar Roteiro"}
      </button>
      {erro && <p className="text-red-600 text-sm">{erro}</p>}
      {resultado && (
        <div className="space-y-4">
          {validado && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm font-medium">
              ✅ ROTEIRO VALIDADO E PRONTO PARA USO
            </div>
          )}
          {!validado && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setValidado(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
              >
                ✅ Validar Roteiro
              </button>
              <button
                type="button"
                onClick={() => {
                  setResultado(null);
                  setValidado(false);
                }}
                className="px-4 py-2 bg-slate-400 text-white rounded-lg hover:bg-slate-500 text-sm"
              >
                🗑️ Descartar
              </button>
            </div>
          )}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(226,232,240,0.6)' }}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
              <span className="text-base font-semibold text-slate-800">Roteiro Individual</span>
              <span className="flex gap-2">
                <DocxDownloadButton texto={resultado} titulo="Roteiro de Aula" filename={`Roteiro_${assunto.replace(/\s/g, "_")}_${new Date().toISOString().slice(0, 10)}.docx`} />
                <PdfDownloadButton text={resultado} filename={`Roteiro_${assunto.replace(/\s/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`} title="Roteiro de Aula" />
              </span>
            </div>
            <FormattedTextDisplay texto={resultado} />
          </div>
        </div>
      )}
    </div>
  );
}

function DinamicaInclusiva({
  student,
  engine,
  onEngineChange,
  onClose,
}: {
  student: StudentFull | null;
  engine: EngineId;
  onEngineChange: (e: EngineId) => void;
  onClose: () => void;
}) {
  const [materia, setMateria] = useState("Língua Portuguesa");
  const [assunto, setAssunto] = useState("");
  const [qtdAlunos, setQtdAlunos] = useState(25);
  const [caracteristicas, setCaracteristicas] = useState("");
  const [serie, setSerie] = useState("");
  const [componentes, setComponentes] = useState<Record<string, { codigo: string; descricao: string }[]>>({});
  const [estruturaBncc, setEstruturaBncc] = useState<EstruturaBncc>(null);
  const [componenteSel, setComponenteSel] = useState("");
  const [unidadeSel, setUnidadeSel] = useState("");
  const [objetoSel, setObjetoSel] = useState("");
  const [habilidadesSel, setHabilidadesSel] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [validado, setValidado] = useState(false);

  const serieAluno = student?.grade || "";

  useEffect(() => {
    if (serieAluno) {
      setSerie(serieAluno);
    }
  }, [serieAluno]);

  useEffect(() => {
    if (!serie) return;
    Promise.all([
      fetch(`/api/bncc/ef?serie=${encodeURIComponent(serie)}`).then((r) => r.json()),
      fetch(`/api/bncc/ef?serie=${encodeURIComponent(serie)}&estrutura=1`).then((r) => r.json()),
    ])
      .then(([d, e]) => {
        setComponentes(d.ano_atual || d || {});
        setEstruturaBncc(e.disciplinas ? e : null);
      })
      .catch(() => {
        setComponentes({});
        setEstruturaBncc(null);
      });
  }, [serie]);

  const discDataD = estruturaBncc?.porDisciplina?.[componenteSel];
  const unidadeDataDRaw = componenteSel && discDataD?.porUnidade?.[unidadeSel];
  const unidadeDataD = unidadeDataDRaw && typeof unidadeDataDRaw === "object" && "objetos" in unidadeDataDRaw ? unidadeDataDRaw : null;
  const habsDoObjetoD = objetoSel && unidadeDataD && "porObjeto" in unidadeDataD ? unidadeDataD.porObjeto?.[objetoSel] : undefined;
  const todasHabilidades = habsDoObjetoD
    ? habsDoObjetoD.map((h) => `${componenteSel}: ${h.codigo} — ${h.descricao}`)
    : unidadeDataD
      ? Object.entries(unidadeDataD.porObjeto || {}).flatMap(([, habs]) =>
        (habs || []).map((h) => `${componenteSel}: ${h.codigo} — ${h.descricao}`)
      )
      : discDataD
        ? Object.values(discDataD.porUnidade || {}).flatMap((v) =>
          Object.values(v.porObjeto || {}).flatMap((habList) =>
            (habList || []).map((h) => `${componenteSel}: ${h.codigo} — ${h.descricao}`)
          )
        )
        : Object.entries(componentes).flatMap(([disc, habs]) =>
          (habs || []).map((h) => `${disc}: ${h.codigo} — ${h.descricao}`)
        );

  const temBnccPreenchida = habilidadesSel.length > 0;

  const gerar = async () => {
    if (!assunto.trim() && !temBnccPreenchida) {
      setErro("Informe o assunto ou selecione habilidades BNCC.");
      return;
    }
    setLoading(true);
    setErro(null);
    setResultado(null);
    setValidado(false);
    try {
      const peiData = student?.pei_data || {};
      const materiaFinal = componenteSel || materia;
      const res = await fetch("/api/hub/dinamica", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aluno: { nome: student?.name, ia_sugestao: (peiData.ia_sugestao as string)?.slice(0, 800) || undefined, hiperfoco: (peiData.hiperfoco as string) || "Geral" },
          materia: materiaFinal,
          assunto: assunto.trim() || undefined,
          qtd_alunos: qtdAlunos,
          caracteristicas_turma: caracteristicas || undefined,
          ano: serieAluno || serie || undefined,
          habilidades_bncc: habilidadesSel.length > 0 ? habilidadesSel : undefined,
          engine,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar");
      setResultado(data.texto || "");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao gerar dinâmica.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-50 to-white space-y-4 min-h-[200px]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(226,232,240,0.6)' }}>
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Dinâmica Inclusiva</h3>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">Fechar</button>
      </div>
      <p className="text-sm text-slate-600">Atividades em grupo onde todos participam, respeitando as singularidades.</p>
      <EngineSelector value={engine} onChange={onEngineChange} />

      {/* Módulo BNCC - PRIMEIRO */}
      {estruturaBncc && estruturaBncc.disciplinas.length > 0 && (
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            BNCC: Componente Curricular, Unidade e Objeto
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Série (ano BNCC)</label>
              <input
                type="text"
                value={serieAluno || ""}
                readOnly
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Componente Curricular</label>
              <select
                value={componenteSel || materia}
                onChange={(e) => {
                  const val = e.target.value;
                  setComponenteSel(val);
                  setMateria(val);
                  setUnidadeSel("");
                  setObjetoSel("");
                }}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">Selecione...</option>
                {estruturaBncc?.disciplinas?.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Unidade Temática</label>
              <select value={unidadeSel} onChange={(e) => { setUnidadeSel(e.target.value); setObjetoSel(""); }} className="w-full px-3 py-2 border rounded-lg text-sm" disabled={!componenteSel}>
                <option value="">Todas</option>
                {(discDataD?.unidades || []).map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Objeto do Conhecimento</label>
              <select value={objetoSel} onChange={(e) => setObjetoSel(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" disabled={!unidadeSel}>
                <option value="">Todos</option>
                {(unidadeDataD && typeof unidadeDataD === "object" && "objetos" in unidadeDataD ? unidadeDataD.objetos : []).map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Habilidades BNCC (opcional)</label>
            <select multiple value={habilidadesSel} onChange={(e) => setHabilidadesSel(Array.from(e.target.selectedOptions, (o) => o.value))} className="w-full px-3 py-2 border rounded-lg text-sm min-h-[60px]">
              {todasHabilidades.slice(0, 60).map((h, i) => <option key={i} value={h}>{h}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Componente Curricular (fallback se BNCC não disponível) */}
      {(!estruturaBncc || estruturaBncc.disciplinas.length === 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Série (ano BNCC)</label>
            <input
              type="text"
              value={serieAluno || ""}
              readOnly
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Componente Curricular</label>
            <select value={materia} onChange={(e) => setMateria(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg">
              {Object.keys(componentes).length ? Object.keys(componentes).map((c) => <option key={c} value={c}>{c}</option>) : COMPONENTES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nº de estudantes</label>
          <input type="number" min={5} max={50} value={qtdAlunos} onChange={(e) => setQtdAlunos(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Características da turma (opcional)</label>
          <input type="text" value={caracteristicas} onChange={(e) => setCaracteristicas(e.target.value)} placeholder="Ex: Turma agitada, gostam de competição" className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Assunto
          {temBnccPreenchida ? (
            <span className="text-xs text-emerald-600 ml-2 font-normal">(opcional - BNCC já preenchida)</span>
          ) : (
            <span className="text-xs text-red-600 ml-2 font-normal">*</span>
          )}
        </label>
        <input
          type="text"
          value={assunto}
          onChange={(e) => setAssunto(e.target.value)}
          placeholder={temBnccPreenchida ? "Opcional quando BNCC está preenchida" : "Ex: Trabalho em equipe"}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg"
        />
        {temBnccPreenchida && habilidadesSel.length > 0 && (
          <p className="text-xs text-emerald-600 mt-1">
            ✓ {habilidadesSel.length} habilidade(s) BNCC selecionada(s)
          </p>
        )}
      </div>
      <button type="button" onClick={gerar} disabled={loading} className="px-4 py-2 bg-cyan-600 text-white rounded-lg disabled:opacity-50">
        {loading ? "Gerando…" : "Criar Dinâmica"}
      </button>
      {erro && <p className="text-red-600 text-sm">{erro}</p>}
      {resultado && (
        <div className="p-6 rounded-xl bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
            <span className="text-base font-semibold text-slate-800">Dinâmica Inclusiva</span>
            <span className="flex gap-2">
              <DocxDownloadButton texto={resultado} titulo="Dinâmica Inclusiva" filename={`Dinamica_${assunto.replace(/\s/g, "_")}_${new Date().toISOString().slice(0, 10)}.docx`} />
              <PdfDownloadButton text={resultado} filename={`Dinamica_${assunto.replace(/\s/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`} title="Dinâmica Inclusiva" />
            </span>
          </div>
          <FormattedTextDisplay texto={resultado} />
        </div>
      )}
    </div>
  );
}

function EstudioVisual({
  student,
  hiperfoco: hiperfocoProp,
  onClose,
}: {
  student: StudentFull | null;
  hiperfoco?: string;
  onClose: () => void;
}) {
  const peiData = student?.pei_data || {};
  const hiperfoco = hiperfocoProp || (peiData.hiperfoco as string) || "";

  return (
    <div className="p-6 rounded-2xl bg-white space-y-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(226,232,240,0.6)' }}>
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Estúdio Visual & CAA</h3>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">
          Fechar
        </button>
      </div>
      <p className="text-sm text-slate-600">
        Gere ilustrações educacionais e pictogramas CAA. Usa OmniOrange (OpenAI) para imagens.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <IlustracaoSection hiperfoco={hiperfoco} />
        <PictogramaCaaSection />
      </div>
    </div>
  );
}

function IlustracaoSection({ hiperfoco }: { hiperfoco: string }) {
  const [descricao, setDescricao] = useState("");
  const [usarHiperfoco, setUsarHiperfoco] = useState(!!hiperfoco);
  const [tema, setTema] = useState(hiperfoco);
  const [loading, setLoading] = useState(false);
  const [imagem, setImagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [validado, setValidado] = useState(false);

  const gerar = async (refazer = false) => {
    const prompt = (usarHiperfoco && tema ? `Tema da ilustração: ${tema}. ` : "") + (descricao || "Ilustração educacional") + ". Context: Education.";
    if (!prompt.trim() || (!descricao.trim() && !usarHiperfoco)) {
      setErro("Descreva a imagem ou use o hiperfoco.");
      return;
    }
    setLoading(true);
    setErro(null);
    setValidado(false);
    try {
      const res = await fetch("/api/hub/estudio-imagem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "ilustracao", prompt, feedback: refazer ? feedback : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar");
      setImagem(data.image || null);
      if (refazer) setFeedback("");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao gerar imagem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3">
      <h4 className="font-medium text-slate-800">🖼️ Ilustração</h4>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={usarHiperfoco} onChange={(e) => setUsarHiperfoco(e.target.checked)} />
        <span className="text-sm">Usar hiperfoco do estudante como tema da ilustração</span>
      </label>
      {usarHiperfoco && (
        <input
          type="text"
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          placeholder="Tema da ilustração (edite se quiser)"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
        />
      )}
      <textarea
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        placeholder="Ex: Sistema Solar simplificado com planetas coloridos..."
        rows={3}
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
      />
      <button
        type="button"
        onClick={() => gerar(false)}
        disabled={loading}
        className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm disabled:opacity-50"
      >
        {loading ? "Desenhando…" : "🎨 Gerar Imagem"}
      </button>
      {imagem && (
        <div className="space-y-2">
          <img src={imagem} alt="Ilustração" className="max-w-full rounded-lg border" />
          {validado && (
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-sm font-medium">
              ✅ Imagem validada!
            </div>
          )}
          {!validado && (
            <div className="space-y-2">
              <details className="border border-slate-200 rounded p-2">
                <summary className="text-sm cursor-pointer text-slate-600">🔄 Refazer Cena</summary>
                <div className="mt-2 flex flex-wrap gap-2 items-center">
                  <input
                    type="text"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Ajuste (ex: mais cores, menos detalhes)"
                    className="flex-1 min-w-[120px] px-2 py-1 border rounded text-sm"
                  />
                  <button type="button" onClick={() => gerar(true)} disabled={loading} className="px-3 py-1 bg-slate-200 rounded text-sm hover:bg-slate-300">
                    Refazer
                  </button>
                </div>
              </details>
              <button type="button" onClick={() => setValidado(true)} className="w-full px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700">
                ✅ Validar
              </button>
            </div>
          )}
        </div>
      )}
      {erro && <p className="text-red-600 text-sm">{erro}</p>}
    </div>
  );
}

function PictogramaCaaSection() {
  const [conceito, setConceito] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagem, setImagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [validado, setValidado] = useState(false);

  const gerar = async (refazer = false) => {
    if (!conceito.trim()) {
      setErro("Informe o conceito.");
      return;
    }
    setLoading(true);
    setErro(null);
    setValidado(false);
    try {
      const res = await fetch("/api/hub/estudio-imagem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "caa", prompt: conceito, feedback: refazer ? feedback : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar");
      setImagem(data.image || null);
      if (refazer) setFeedback("");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao gerar pictograma.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3">
      <h4 className="font-medium text-slate-800">🗣️ Símbolo CAA</h4>
      <input
        type="text"
        value={conceito}
        onChange={(e) => setConceito(e.target.value)}
        placeholder="Ex: Silêncio, Banheiro, Água..."
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
      />
      <button
        type="button"
        onClick={() => gerar(false)}
        disabled={loading}
        className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm disabled:opacity-50"
      >
        {loading ? "Criando símbolo…" : "🧩 Gerar Pictograma"}
      </button>
      {imagem && (
        <div className="space-y-2">
          <img src={imagem} alt="Pictograma CAA" className="max-w-[300px] rounded-lg border" />
          {validado && (
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-sm font-medium">
              ✅ Pictograma validado!
            </div>
          )}
          {!validado && (
            <div className="space-y-2">
              <details className="border border-slate-200 rounded p-2">
                <summary className="text-sm cursor-pointer text-slate-600">🔄 Refazer Picto</summary>
                <div className="mt-2 flex flex-wrap gap-2 items-center">
                  <input
                    type="text"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Ajuste"
                    className="flex-1 min-w-[120px] px-2 py-1 border rounded text-sm"
                  />
                  <button type="button" onClick={() => gerar(true)} disabled={loading} className="px-3 py-1 bg-slate-200 rounded text-sm hover:bg-slate-300">
                    Refazer
                  </button>
                </div>
              </details>
              <button type="button" onClick={() => setValidado(true)} className="w-full px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700">
                ✅ Validar
              </button>
            </div>
          )}
        </div>
      )}
      {erro && <p className="text-red-600 text-sm">{erro}</p>}
    </div>
  );
}

function AdaptarAtividade({
  student,
  hiperfoco,
  engine,
  onEngineChange,
  onClose,
}: {
  student: StudentFull | null;
  hiperfoco: string;
  engine: EngineId;
  onEngineChange: (e: EngineId) => void;
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [temImagemSeparada, setTemImagemSeparada] = useState(false);
  const [imagemSeparadaPreviewUrl, setImagemSeparadaPreviewUrl] = useState<string | null>(null);
  const [imagemSeparadaCropped, setImagemSeparadaCropped] = useState<File | null>(null);
  const [showImagemSeparadaCropper, setShowImagemSeparadaCropper] = useState(false);
  const [materia, setMateria] = useState("Língua Portuguesa");
  const [tema, setTema] = useState("");
  const [serie, setSerie] = useState("");
  const [componentes, setComponentes] = useState<Record<string, { codigo: string; descricao: string }[]>>({});
  const [estruturaBncc, setEstruturaBncc] = useState<EstruturaBncc>(null);
  const [componenteSel, setComponenteSel] = useState("");
  const [unidadeSel, setUnidadeSel] = useState("");
  const [objetoSel, setObjetoSel] = useState("");
  const [modoProfundo, setModoProfundo] = useState(false);
  const [tipo, setTipo] = useState("Atividade");
  const [livroProfessor, setLivroProfessor] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistAdaptacao>({});
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<{ analise: string; texto: string } | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [validado, setValidado] = useState(false);
  const [refazendo, setRefazendo] = useState(false);
  const [mapaImagensAdaptar, setMapaImagensAdaptar] = useState<Record<number, string>>({});

  const peiData = student?.pei_data || {};
  const serieAluno = student?.grade || "";


  useEffect(() => {
    if (serieAluno) {
      setSerie(serieAluno);
    }
  }, [serieAluno]);

  useEffect(() => {
    if (!serie?.trim()) return;
    Promise.all([
      fetch(`/api/bncc/ef?serie=${encodeURIComponent(serie)}`).then((r) => r.json()),
      fetch(`/api/bncc/ef?serie=${encodeURIComponent(serie)}&estrutura=1`).then((r) => r.json()),
    ])
      .then(([d, e]) => {
        setComponentes(d.ano_atual || d || {});
        setEstruturaBncc(e.disciplinas ? e : null);
      })
      .catch(() => {
        setComponentes({});
        setEstruturaBncc(null);
      });
  }, [serie]);

  const discData = estruturaBncc?.porDisciplina?.[componenteSel];
  const unidadeDataRaw = componenteSel && discData?.porUnidade?.[unidadeSel];
  const unidadeData = unidadeDataRaw && typeof unidadeDataRaw === "object" && "objetos" in unidadeDataRaw ? unidadeDataRaw : null;

  const handleFileSelect = (f: File | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCroppedFile(null);
    setShowCropper(false);
    setFile(f);
    if (f) {
      setPreviewUrl(URL.createObjectURL(f));
      setShowCropper(true);
    }
  };

  const handleCropComplete = (blob: Blob, mime: string) => {
    const f = new File([blob], "questao.jpg", { type: mime });
    setCroppedFile(f);
    setShowCropper(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleImagemSeparadaCropComplete = (blob: Blob, mime: string) => {
    try {
      const f = new File([blob], "imagem_separada.jpg", { type: mime });
      // Fechar o cropper primeiro
      setShowImagemSeparadaCropper(false);
      // Limpar preview URL imediatamente
      if (imagemSeparadaPreviewUrl) {
        URL.revokeObjectURL(imagemSeparadaPreviewUrl);
        setImagemSeparadaPreviewUrl(null);
      }
      // Depois atualizar a imagem recortada
      setImagemSeparadaCropped(f);
      console.log("✅ Imagem separada recortada e cropper fechado");
    } catch (error) {
      console.error("Erro ao processar recorte de imagem separada:", error);
      setShowImagemSeparadaCropper(false);
    }
  };

  const imagemParaEnvio = croppedFile || file;
  // IMPORTANTE: imagemSeparadaParaEnvio deve ser APENAS imagemSeparadaCropped (não imagemSeparadaFile)
  // O fluxo é: questão recortada → imagem da questão recortada
  const imagemSeparadaParaEnvio = imagemSeparadaCropped;

  const gerar = async (usarModoProfundo = false) => {
    if (!imagemParaEnvio) {
      setErro("Selecione uma imagem.");
      return;
    }
    setLoading(true);
    setErro(null);
    setResultado(null);
    setValidado(false);
    try {
      const formData = new FormData();
      formData.append("file", imagemParaEnvio);
      if (temImagemSeparada && imagemSeparadaParaEnvio) {
        formData.append("file_separado", imagemSeparadaParaEnvio);
      }
      formData.append(
        "meta",
        JSON.stringify({
          materia: componenteSel || materia,
          tema: tema || undefined,
          tipo,
          livro_professor: livroProfessor,
          checklist,
          modo_profundo: usarModoProfundo || modoProfundo,
          engine,
          unidade_tematica: unidadeSel || undefined,
          objeto_conhecimento: objetoSel || undefined,
          estudante: student ? { nome: student.name, hiperfoco, perfil: (peiData.ia_sugestao as string)?.slice(0, 1000) || undefined } : { hiperfoco, perfil: (peiData.ia_sugestao as string)?.slice(0, 1000) || undefined },
        })
      );
      const res = await fetch("/api/hub/adaptar-atividade", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        console.error("Erro na API adaptar-atividade:", data);
        throw new Error(data.error || "Erro ao adaptar");
      }

      // Processar imagens se houver imagem separada
      const novoMapa: Record<number, string> = {};
      if (temImagemSeparada && imagemSeparadaParaEnvio) {
        try {
          const reader = new FileReader();
          await new Promise<void>((resolve, reject) => {
            reader.onload = () => {
              const base64 = (reader.result as string).split(",")[1];
              novoMapa[2] = base64; // IMG_2 para imagem separada
              resolve();
            };
            reader.onerror = reject;
            reader.readAsDataURL(imagemSeparadaParaEnvio);
          });
        } catch (err) {
          console.error("Erro ao processar imagem separada:", err);
        }
      }

      // Se houver IMG_1 no texto (imagem principal), processar também
      if (croppedFile && data.texto?.includes("[[IMG_1]]")) {
        try {
          const reader = new FileReader();
          await new Promise<void>((resolve, reject) => {
            reader.onload = () => {
              const base64 = (reader.result as string).split(",")[1];
              novoMapa[1] = base64;
              resolve();
            };
            reader.onerror = reject;
            reader.readAsDataURL(croppedFile);
          });
        } catch (err) {
          console.error("Erro ao processar imagem principal:", err);
        }
      }

      setMapaImagensAdaptar(novoMapa);
      setResultado({ analise: data.analise || "", texto: data.texto || "" });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao adaptar.");
    } finally {
      setLoading(false);
      setRefazendo(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-50 to-white space-y-4 min-h-[200px]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(226,232,240,0.6)' }}>
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Adaptar Atividade (OCR + IA)</h3>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">
          Fechar
        </button>
      </div>
      <EngineSelector value={engine} onChange={onEngineChange} />
      <p className="text-sm text-slate-600">Tire foto da atividade. A IA extrai o texto e adapta com DUA.</p>
      {estruturaBncc && estruturaBncc.disciplinas.length > 0 && (
        <details className="border border-slate-200 rounded-lg" open>
          <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-slate-700 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            BNCC: Unidade e Objeto
          </summary>
          <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Série (ano BNCC)</label>
              <input
                type="text"
                value={serieAluno || ""}
                readOnly
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-600 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Componente</label>
              <select
                value={componenteSel}
                onChange={(e) => {
                  setComponenteSel(e.target.value);
                  setUnidadeSel("");
                  setObjetoSel("");
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              >
                <option value="">Todos</option>
                {estruturaBncc?.disciplinas?.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Unidade Temática</label>
              <select
                value={unidadeSel}
                onChange={(e) => {
                  setUnidadeSel(e.target.value);
                  setObjetoSel("");
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                disabled={!componenteSel}
              >
                <option value="">Todas</option>
                {(discData?.unidades || []).map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Objeto do Conhecimento</label>
              <select
                value={objetoSel}
                onChange={(e) => setObjetoSel(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                disabled={!unidadeSel}
              >
                <option value="">Todos</option>
                {(unidadeData && typeof unidadeData === "object" && "objetos" in unidadeData ? unidadeData.objetos : []).map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
        </details>
      )}
      {(!estruturaBncc || !estruturaBncc.disciplinas.length) && (
        <details className="border border-slate-200 rounded-lg" open>
          <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-slate-700 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            BNCC
          </summary>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Série (ano BNCC)</label>
              <input
                type="text"
                value={serie}
                onChange={(e) => setSerie(e.target.value)}
                placeholder="Ex: 5º Ano (EFAI)"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Componente</label>
              <select
                value={materia}
                onChange={(e) => setMateria(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              >
                {(Object.keys(componentes).length ? Object.keys(componentes) : COMPONENTES).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </details>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Tema / Assunto
          <span className="text-xs text-slate-500 ml-2 font-normal">(opcional)</span>
        </label>
        <input
          type="text"
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          placeholder="Ex: Frações equivalentes (opcional)"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Imagem (PNG/JPG) *</label>
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
          className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-100 file:text-cyan-800"
        />
        <p className="text-xs text-slate-500 mt-1">Máx. 4MB. Recorte a área da questão para melhor resultado.</p>
        {showCropper && previewUrl && (
          <div className="mt-4 p-4 rounded-lg border border-slate-200 bg-slate-50">
            <ImageCropper
              src={previewUrl}
              caption="Recorte a área da questão ou atividade"
              onCropComplete={handleCropComplete}
            />
            <div className="mt-2 flex gap-4">
              <button type="button" onClick={() => { if (file) { setCroppedFile(file); setShowCropper(false); if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(null); } }} className="text-sm text-slate-600 hover:text-slate-800">
                Usar imagem inteira
              </button>
              <button type="button" onClick={() => handleFileSelect(null)} className="text-sm text-slate-500 hover:text-slate-700">
                Cancelar
              </button>
            </div>
          </div>
        )}
        {croppedFile && !showCropper && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-emerald-600">✓ Recorte aplicado</span>
            <button type="button" onClick={() => { setCroppedFile(null); if (file) { setPreviewUrl(URL.createObjectURL(file)); setShowCropper(true); } }} className="text-sm text-cyan-600 hover:text-cyan-800">
              Refazer recorte
            </button>
          </div>
        )}
      </div>
      {croppedFile && !showCropper && (
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
          <label className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={temImagemSeparada}
              disabled={!croppedFile}
              onChange={(e) => {
                if (!croppedFile) {
                  alert("Por favor, primeiro recorte a questão antes de recortar a imagem separada.");
                  return;
                }
                setTemImagemSeparada(e.target.checked);
                if (e.target.checked) {
                  // IMPORTANTE: Usar APENAS a imagem já recortada (croppedFile) para o segundo recorte
                  // O fluxo é: foto completa → recortar questão → recortar imagem da questão recortada
                  if (!imagemSeparadaPreviewUrl && !showImagemSeparadaCropper) {
                    const url = URL.createObjectURL(croppedFile);
                    setImagemSeparadaPreviewUrl(url);
                    setShowImagemSeparadaCropper(true);
                  }
                } else {
                  setImagemSeparadaCropped(null);
                  if (imagemSeparadaPreviewUrl) {
                    URL.revokeObjectURL(imagemSeparadaPreviewUrl);
                    setImagemSeparadaPreviewUrl(null);
                  }
                  setShowImagemSeparadaCropper(false);
                }
              }}
            />
            <span className="text-sm font-medium text-slate-700">
              🖼️ Passo 2: Recortar Imagem (Opcional)
            </span>
          </label>
          <p className="text-xs text-slate-600 mb-3">
            Se a questão tem imagem e você quer recortá-la separadamente para melhor qualidade, marque acima. A imagem da questão recortada será usada para recortar apenas a imagem.
          </p>
          {temImagemSeparada && (
            <div>
              {showImagemSeparadaCropper && imagemSeparadaPreviewUrl && (
                <div className="mt-4 p-4 rounded-lg border border-slate-200 bg-white">
                  <ImageCropper
                    src={imagemSeparadaPreviewUrl}
                    caption="Recorte apenas a área da imagem na questão"
                    onCropComplete={handleImagemSeparadaCropComplete}
                  />
                  <div className="mt-2 flex gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        // Usar a imagem da questão recortada (croppedFile) como imagem separada inteira
                        if (croppedFile) {
                          setImagemSeparadaCropped(croppedFile);
                          setShowImagemSeparadaCropper(false);
                          if (imagemSeparadaPreviewUrl) {
                            URL.revokeObjectURL(imagemSeparadaPreviewUrl);
                            setImagemSeparadaPreviewUrl(null);
                          }
                        }
                      }}
                      className="text-sm text-slate-600 hover:text-slate-800"
                    >
                      Usar questão recortada inteira
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTemImagemSeparada(false);
                        setImagemSeparadaCropped(null);
                        if (imagemSeparadaPreviewUrl) {
                          URL.revokeObjectURL(imagemSeparadaPreviewUrl);
                          setImagemSeparadaPreviewUrl(null);
                        }
                        setShowImagemSeparadaCropper(false);
                      }}
                      className="text-sm text-slate-500 hover:text-slate-700"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
              {imagemSeparadaCropped && !showImagemSeparadaCropper && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-emerald-600">✓ Imagem separada recortada</span>
                  <button
                    type="button"
                    onClick={() => {
                      setImagemSeparadaCropped(null);
                      // Usar APENAS croppedFile (questão recortada) para refazer o recorte da imagem
                      if (croppedFile) {
                        const url = URL.createObjectURL(croppedFile);
                        setImagemSeparadaPreviewUrl(url);
                        setShowImagemSeparadaCropper(true);
                      }
                    }}
                    className="text-sm text-cyan-600 hover:text-cyan-800"
                  >
                    Refazer recorte
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg">
            <option value="Atividade">Atividade</option>
            <option value="Tarefa">Tarefa</option>
            <option value="Exercício">Exercício</option>
          </select>
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={modoProfundo} onChange={(e) => setModoProfundo(e.target.checked)} />
          <span className="text-sm">Modo profundo (análise mais detalhada)</span>
        </label>
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={livroProfessor} onChange={(e) => setLivroProfessor(e.target.checked)} />
        <span className="text-sm">É foto do Livro do Professor? (a IA removerá respostas)</span>
      </label>
      <details className="border border-slate-200 rounded-lg">
        <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-slate-700">Checklist de adaptação (PEI)</summary>
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          {[
            { k: "questoes_desafiadoras", l: "Questões mais desafiadoras" },
            { k: "compreende_instrucoes_complexas", l: "Compreende instruções complexas" },
            { k: "instrucoes_passo_a_passo", l: "Instruções passo a passo" },
            { k: "dividir_em_etapas", l: "Dividir em etapas" },
            { k: "paragrafos_curtos", l: "Parágrafos curtos" },
            { k: "dicas_apoio", l: "Dicas de apoio" },
            { k: "compreende_figuras_linguagem", l: "Compreende figuras de linguagem" },
            { k: "descricao_imagens", l: "Descrição de imagens" },
          ].map(({ k, l }) => (
            <label key={k} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!checklist[k as keyof ChecklistAdaptacao]}
                onChange={(e) => setChecklist((c) => ({ ...c, [k]: e.target.checked }))}
              />
              {l}
            </label>
          ))}
        </div>
      </details>
      <button
        type="button"
        onClick={() => gerar()}
        disabled={loading || !imagemParaEnvio}
        className="px-4 py-2 bg-cyan-600 text-white rounded-lg disabled:opacity-50"
      >
        {loading ? "Adaptando…" : "Adaptar atividade"}
      </button>
      {erro && <div className="text-red-600 text-sm">{erro}</div>}
      {resultado && (
        <div className="space-y-4">
          {validado && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm font-medium">
              ✅ ATIVIDADE VALIDADA E PRONTA PARA USO
            </div>
          )}
          {!validado && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setValidado(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
              >
                ✅ Validar
              </button>
              <button
                type="button"
                onClick={() => {
                  setRefazendo(true);
                  gerar(true);
                }}
                disabled={refazendo}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm disabled:opacity-50"
              >
                {refazendo ? "Refazendo…" : "🔄 Refazer (+Profundo)"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setResultado(null);
                  setValidado(false);
                }}
                className="px-4 py-2 bg-slate-400 text-white rounded-lg hover:bg-slate-500 text-sm"
              >
                🗑️ Descartar
              </button>
            </div>
          )}
          {resultado.analise && (
            <div className="p-4 rounded-lg bg-slate-100 border border-slate-200">
              <div className="text-xs font-semibold text-slate-600 uppercase mb-3">Análise Pedagógica</div>
              <FormattedTextDisplay texto={resultado.analise} />
            </div>
          )}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(226,232,240,0.6)' }}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
              <span className="text-base font-semibold text-slate-800">Atividade Adaptada (DUA)</span>
              <span className="flex gap-2">
                <DocxDownloadButton
                  texto={`${resultado.analise}\n\n---\n\n${resultado.texto}`}
                  titulo="Atividade Adaptada (DUA)"
                  filename={`Atividade_Adaptada_${new Date().toISOString().slice(0, 10)}.docx`}
                  mapaImagens={Object.keys(mapaImagensAdaptar).length > 0 ? mapaImagensAdaptar : undefined}
                />
                <PdfDownloadButton
                  text={`${resultado.analise}\n\n---\n\n${resultado.texto}`}
                  filename={`Atividade_${new Date().toISOString().slice(0, 10)}.pdf`}
                  title="Atividade Adaptada (DUA)"
                />
              </span>
            </div>
            <FormattedTextDisplay texto={resultado.texto} mapaImagens={mapaImagensAdaptar} />
          </div>
        </div>
      )}
    </div>
  );
}
