"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { CabecalhoEstudante, EscolherEstudante } from "@/components/estudante/CabecalhoEstudante";
import { HubHistoricoEstudante } from "./components/HubHistoricoEstudante";
import { detectarNivelEnsino } from "@/lib/pei";
import { PEISummaryPanel } from "@/components/PEISummaryPanel";
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
import type { MesaDaFerramenta } from "./hub-types";

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

type Student = { id: string; name: string; grade?: string | null; class_group?: string | null };
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

type Publico = "estudante" | "professor";

const TOOLS_EF_EM: { id: ToolIdEFEM; icon: LucideIcon; title: string; desc: string; publico: Publico }[] = [
  { id: "adaptar-prova", icon: FileText, title: "Adaptar prova", desc: "Envie a prova em Word e receba a versão adaptada.", publico: "estudante" },
  { id: "adaptar-atividade", icon: ImageIcon, title: "Adaptar atividade", desc: "Tire foto da atividade e receba a versão adaptada.", publico: "estudante" },
  { id: "criar-zero", icon: Sparkles, title: "Criar questões", desc: "Escolha a habilidade da BNCC e o assunto.", publico: "estudante" },
  { id: "criar-itens", icon: GraduationCap, title: "Criar itens de prova", desc: "Itens no padrão do INEP, com mais controle.", publico: "estudante" },
  { id: "estudio-visual", icon: Palette, title: "Estúdio visual", desc: "Pictogramas e cenas para apoiar a comunicação.", publico: "estudante" },
  { id: "roteiro", icon: FileEdit, title: "Roteiro individual", desc: "Passo a passo da aula pensado para o estudante.", publico: "professor" },
  { id: "papo-mestre", icon: MessageSquare, title: "Papo de mestre", desc: "Como ligar o conteúdo ao que o estudante gosta.", publico: "professor" },
  { id: "dinamica", icon: Handshake, title: "Dinâmica inclusiva", desc: "Atividade em grupo em que todos participam.", publico: "professor" },
  { id: "plano-aula", icon: ClipboardList, title: "Plano de aula com DUA", desc: "Desenho Universal para a Aprendizagem na turma toda.", publico: "professor" },
];

const TOOLS_EI: { id: ToolIdEI; icon: LucideIcon; title: string; desc: string; publico: Publico }[] = [
  { id: "criar-experiencia", icon: Star, title: "Criar experiência", desc: "Campos de experiência e objetivos da BNCC.", publico: "professor" },
  { id: "estudio-visual", icon: Palette, title: "Estúdio visual e CAA", desc: "Pictogramas, cenas e comunicação alternativa.", publico: "estudante" },
  { id: "rotina-avd", icon: RefreshCw, title: "Rotina e AVD", desc: "Sequências visuais para atividades de vida diária.", publico: "estudante" },
  { id: "inclusao-brincar", icon: ToyBrick, title: "Inclusão no brincar", desc: "Brincadeiras em que todos participam.", publico: "professor" },
];

// Cartão de ferramenta: círculo do Hub (roxo), nome e o que ela entrega (design system: CartaoModulo)
function ToolCard({ tool, onClick }: { tool: { id: string; icon: LucideIcon; title: string; desc: string }; onClick: () => void }) {
  const Icon = tool.icon;
  return (
    <button type="button" onClick={onClick} className="omni-modulo omni-modulo--hub omni-cartao omni-cartao--plano"
      style={{ display: "flex", gap: "var(--space-4)", alignItems: "flex-start", textAlign: "left", width: "100%", height: "100%", cursor: "pointer" }}>
      <span className="omni-modulo__selo" aria-hidden style={{ width: 44, height: 44, flex: "none" }}><Icon /></span>
      <span style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
        <span style={{ font: "800 17px/22px var(--font-sans)", color: "var(--tinta)" }}>{tool.title}</span>
        <span style={{ font: "400 14px/20px var(--font-sans)", color: "var(--tinta-2)" }}>{tool.desc}</span>
      </span>
    </button>
  );
}


const TODAS_IDS = ["criar-zero", "criar-itens", "criar-experiencia", "papo-mestre", "plano-aula", "adaptar-prova", "adaptar-atividade", "estudio-visual", "roteiro", "dinamica", "rotina-avd", "inclusao-brincar"];

export function HubClient({ students, studentId, student }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentId = studentId || searchParams?.get("student") || null;
  const [engine, setEngine] = useState<EngineId>("red");
  const peiData = student?.pei_data || {};
  const hiperfoco = (peiData.hiperfoco as string) || (peiData.interesses as string) || "Interesses gerais";
  const serie = (student?.grade as string) || (peiData.serie as string) || "";
  const isEI = detectarNivelEnsino(serie) === "EI";
  const TOOLS = isEI ? TOOLS_EI : TOOLS_EF_EM;

  // Onda 8: cada ferramenta tem a sua tela (?ferramenta=adaptar-prova). Voltar para a lista não
  // apaga o que foi gerado: a ferramenta aberta continua montada, só fica escondida.
  const daUrl = (searchParams?.get("ferramenta") || searchParams?.get("tool")) as ToolId | null;
  const activeTool: ToolId | null = daUrl && TOOLS.some((t) => t.id === daUrl) ? daUrl : null;
  const [abertas, setAbertas] = useState<ToolId[]>(activeTool ? [activeTool] : []);
  useEffect(() => {
    if (activeTool && !abertas.includes(activeTool)) setAbertas((a) => [...a, activeTool]);
  }, [activeTool, abertas]);

  function abrir(id: ToolId | null) {
    const p = new URLSearchParams(searchParams?.toString() || "");
    if (id) p.set("ferramenta", id); else p.delete("ferramenta");
    router.push(`${pathname}?${p.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  const voltar = () => abrir(null);
  const ferramenta = TOOLS.find((t) => t.id === activeTool);
  const mostra = (id: ToolId) => abertas.includes(id);
  const oculto = (id: ToolId) => activeTool !== id;
  // Onda 14: cada ferramenta monta a sua mesa (cabeçalho, ferramentas irmãs, painel e resultado).
  const mesa = (id: ToolId): MesaDaFerramenta => {
    const t = TOOLS.find((x) => x.id === id) || TOOLS[0];
    return {
      trilha: t.publico === "estudante" ? "Material para o estudante" : "Apoio para você planejar",
      titulo: t.title,
      descricao: t.desc,
      icone: t.icon,
      atual: t.id,
      irmas: TOOLS.filter((x) => x.publico === t.publico).map((x) => ({ id: x.id, titulo: x.title })),
      onIrma: (novo) => abrir(novo as ToolId),
      onVoltar: voltar,
    };
  };

  return (
    <div className="space-y-6">
      {currentId && student ? (
        <CabecalhoEstudante students={students} student={{ ...student, pei_data: peiData }} />
      ) : (
        <EscolherEstudante students={students} texto="Os materiais que você criar ficam guardados no histórico dele. Dá para usar as ferramentas sem estudante, só que sem o perfil dele." naoEncontrado={Boolean(currentId)} />
      )}

      {ferramenta ? null : (
        <>
          {currentId && student && <PEISummaryPanel peiData={peiData} studentName={student.name} />}
          {isEI && (
            <div className="omni-aviso omni-aviso--info">
              <div><div className="omni-aviso__texto">Mostrando as ferramentas da Educação Infantil, pela série do estudante.</div></div>
            </div>
          )}
          {(["estudante", "professor"] as Publico[]).map((pub) => {
            const lista = TOOLS.filter((t) => t.publico === pub);
            if (lista.length === 0) return null;
            return (
              <section key={pub} aria-labelledby={`hub-${pub}`} className="space-y-3">
                <div>
                  <h2 id={`hub-${pub}`} style={{ margin: 0, font: "800 20px/26px var(--font-sans)", color: "var(--tinta)" }}>
                    {pub === "estudante" ? "Material para o estudante" : "Apoio para você planejar"}
                  </h2>
                  <p className="omni-apoio" style={{ margin: 0 }}>
                    {pub === "estudante" ? "Vira um arquivo para imprimir ou entregar ao estudante." : "Orientações para o professor; não é para entregar ao estudante."}
                  </p>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {lista.map((t) => <li key={t.id}><ToolCard tool={t} onClick={() => abrir(t.id)} /></li>)}
                </ul>
              </section>
            );
          })}
          {currentId && student && (
            <HubHistoricoEstudante studentId={currentId} nome={student.name} atualizar={abertas.length} />
          )}
        </>
      )}

      {mostra("criar-zero") && <div key={`criar-zero-${currentId}`} hidden={oculto("criar-zero")}><CriarDoZero student={student} engine={engine} onEngineChange={setEngine} mesa={mesa("criar-zero")} /></div>}
      {mostra("criar-itens") && <div key={`criar-itens-${currentId}`} hidden={oculto("criar-itens")}><CriarItens student={student} engine={engine} onEngineChange={setEngine} mesa={mesa("criar-itens")} /></div>}
      {mostra("papo-mestre") && <div key={`papo-mestre-${currentId}`} hidden={oculto("papo-mestre")}><PapoDeMestre student={student} hiperfoco={hiperfoco} engine={engine} onEngineChange={setEngine} mesa={mesa("papo-mestre")} /></div>}
      {mostra("plano-aula") && <div key={`plano-aula-${currentId}`} hidden={oculto("plano-aula")}><PlanoAulaDua student={student} engine={engine} onEngineChange={setEngine} mesa={mesa("plano-aula")} /></div>}
      {mostra("adaptar-prova") && <div key={`adaptar-prova-${currentId}`} hidden={oculto("adaptar-prova")}><AdaptarProva student={student} hiperfoco={hiperfoco} engine={engine} onEngineChange={setEngine} mesa={mesa("adaptar-prova")} /></div>}
      {mostra("adaptar-atividade") && <div key={`adaptar-atividade-${currentId}`} hidden={oculto("adaptar-atividade")}><AdaptarAtividade student={student} hiperfoco={hiperfoco} engine={engine} onEngineChange={setEngine} mesa={mesa("adaptar-atividade")} /></div>}
      {mostra("estudio-visual") && <div key={`estudio-visual-${currentId}`} hidden={oculto("estudio-visual")}><EstudioVisual student={student} hiperfoco={hiperfoco} mesa={mesa("estudio-visual")} /></div>}
      {mostra("criar-experiencia") && <div key={`criar-experiencia-${currentId}`} hidden={oculto("criar-experiencia")}><CriarDoZero student={student} engine={engine} onEngineChange={setEngine} mesa={mesa("criar-experiencia")} eiMode /></div>}
      {mostra("rotina-avd") && <div key={`rotina-avd-${currentId}`} hidden={oculto("rotina-avd")}><RotinaAvdTool student={student} engine={engine} onEngineChange={setEngine} mesa={mesa("rotina-avd")} /></div>}
      {mostra("inclusao-brincar") && <div key={`inclusao-brincar-${currentId}`} hidden={oculto("inclusao-brincar")}><InclusaoBrincarTool student={student} engine={engine} onEngineChange={setEngine} mesa={mesa("inclusao-brincar")} /></div>}
      {mostra("roteiro") && <div key={`roteiro-${currentId}`} hidden={oculto("roteiro")}><RoteiroIndividual student={student} engine={engine} onEngineChange={setEngine} mesa={mesa("roteiro")} /></div>}
      {mostra("dinamica") && <div key={`dinamica-${currentId}`} hidden={oculto("dinamica")}><DinamicaInclusiva student={student} engine={engine} onEngineChange={setEngine} mesa={mesa("dinamica")} /></div>}

      {activeTool && !TODAS_IDS.includes(activeTool) && (
        <p className="omni-apoio">Esta ferramenta ainda não está disponível.</p>
      )}
    </div>
  );
}
