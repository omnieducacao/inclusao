"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { StudentSelector } from "@/components/StudentSelector";
import { detectarNivelEnsino } from "@/lib/pei";
import { PEISummaryPanel } from "@/components/PEISummaryPanel";
import { LottieIcon } from "@/components/LottieIcon";
import { Card, Alert } from "@omni/ds";
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
  GraduationCap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Imports Dinâmicos (Lazy Loading para Code Splitting do Hub e redução de TTI)
const PapoDeMestre = dynamic(() => import("./components/HubPapoDeMestre").then(mod => mod.PapoDeMestre));
const RotinaAvdTool = dynamic(() => import("./components/HubRotinaAvd").then(mod => mod.RotinaAvdTool));
const InclusaoBrincarTool = dynamic(() => import("./components/HubInclusaoBrincar").then(mod => mod.InclusaoBrincarTool));
const EstudioVisual = dynamic(() => import("./components/HubEstudioVisual").then(mod => mod.EstudioVisual));
const PlanoAulaDua = dynamic(() => import("./components/HubPlanoAulaDua").then(mod => mod.PlanoAulaDua));
const RoteiroIndividual = dynamic(() => import("./components/HubRoteiroIndividual").then(mod => mod.RoteiroIndividual));
const DinamicaInclusiva = dynamic(() => import("./components/HubDinamicaInclusiva").then(mod => mod.DinamicaInclusiva));
const CriarDoZero = dynamic(() => import("./components/HubCriarDoZero").then(mod => mod.CriarDoZero));
const CriarItens = dynamic(() => import("./components/HubCriarItens").then(mod => mod.CriarItens));
const AdaptarProva = dynamic(() => import("./components/HubAdaptarProva").then(mod => mod.AdaptarProva));
const AdaptarAtividade = dynamic(() => import("./components/HubAdaptarAtividade").then(mod => mod.AdaptarAtividade));

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

type ToolIdEFEM = "adaptar-prova" | "adaptar-atividade" | "criar-zero" | "criar-itens" | "estudio-visual" | "papo-mestre" | "plano-aula" | "roteiro" | "dinamica";
type ToolIdEI = "criar-experiencia" | "estudio-visual" | "rotina-avd" | "inclusao-brincar";
type ToolId = ToolIdEFEM | ToolIdEI;
type EngineId = "red" | "blue" | "green" | "yellow" | "orange";

const TOOLS_EF_EM: { id: ToolIdEFEM; icon: LucideIcon; title: string; desc: string }[] = [
  { id: "adaptar-prova", icon: FileText, title: "Adaptar Prova", desc: "Upload DOCX, adaptação com DUA" },
  { id: "adaptar-atividade", icon: ImageIcon, title: "Adaptar Atividade", desc: "Imagem → OCR → IA adapta" },
  { id: "criar-zero", icon: Sparkles, title: "Criar Questões", desc: "Rápido: BNCC + assunto → questões" },
  { id: "criar-itens", icon: GraduationCap, title: "Criar Itens", desc: "Avançado: padrão INEP/BNI" },
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
  "criar-zero": "wired-outline-36-bulb-morph-turn-on",                  // lâmpada/criar questões
  "criar-itens": "wired-outline-406-study-graduation-hover-pinch",     // graduação/itens avançados
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
      className={`group relative flex flex-col text-left p-6 rounded-2xl border transition-all duration-300 min-h-[160px] cursor-pointer touch-manipulation ${isActive
        ? "border-(--omni-primary) shadow-(--omni-shadow-md) bg-white dark:bg-slate-800 scale-[1.01]"
        : "border-(--omni-border-default) bg-(--omni-bg-secondary) shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-(--omni-shadow-elevated) hover:-translate-y-1"
        }`}
    >
      {/* Ícone dentro do quadrado minimalista */}
      <div
        className="rounded-xl bg-white/20 flex items-center justify-center backdrop-blur shadow-xl relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 mb-3 w-[72px] h-[72px] p-1.5"
      >
        {lottieAnimation ? (
          <LottieIcon
            animation={lottieAnimation}
            size={60}
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
            <Alert variant="warning">
              <strong>Modo Educação Infantil</strong> — Ferramentas específicas para EI.
            </Alert>
          )}
          <Card className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
            <div>
              <div className="text-xs font-semibold text-(--omni-text-muted) uppercase tracking-wide">Nome</div>
              <div className="font-bold text-(--omni-text-primary)">{student.name}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-(--omni-text-muted) uppercase tracking-wide">Série</div>
              <div className="font-bold text-(--omni-text-primary)">{student.grade || "—"}</div>
            </div>
            <div className="col-span-2 md:col-span-2">
              <div className="text-xs font-semibold text-(--omni-text-muted) uppercase tracking-wide">Hiperfoco</div>
              <div className="font-bold text-(--omni-text-primary) truncate" title={String(hiperfoco)}>{String(hiperfoco)}</div>
            </div>
          </Card>
        </div>
      )}

      {!currentId && (
        <Alert variant="warning">
          Selecione um estudante para usar as ferramentas do Hub com contexto personalizado.
        </Alert>
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

      {activeTool === "criar-itens" && (
        <CriarItens student={student} engine={engine} onEngineChange={setEngine} onClose={() => setActiveTool(null)} />
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

      {activeTool && !["criar-zero", "criar-itens", "criar-experiencia", "papo-mestre", "plano-aula", "adaptar-prova", "adaptar-atividade", "estudio-visual", "roteiro", "dinamica", "rotina-avd", "inclusao-brincar"].includes(activeTool) && (
        <div className="p-6 rounded-2xl bg-linear-to-br from-slate-50 to-white min-h-[180px] shadow-sm border border-slate-200/60">
          <p className="text-slate-600">
            <strong>{TOOLS.find((t) => t.id === activeTool)?.title}</strong> — Em breve nesta versão.
          </p>
        </div>
      )}
    </div>
  );
}
