"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { StudentSelector } from "@/components/StudentSelector";
import { EngineSelector } from "@/components/EngineSelector";
import { ImageCropper } from "@/components/ImageCropper";
import { detectarNivelEnsino } from "@/lib/pei";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { DocxDownloadButton } from "@/components/DocxDownloadButton";
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

export function HubClient({ students, studentId, student }: Props) {
  const searchParams = useSearchParams();
  const currentId = studentId || searchParams.get("student");
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
        <div className="space-y-2">
          {isEI && (
            <div className="px-4 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              <Star className="w-4 h-4 inline mr-1" />
              <strong>Modo Educação Infantil</strong> — Ferramentas específicas para EI.
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTool(activeTool === t.id ? null : t.id)}
              className={`group text-left p-6 rounded-xl border-2 transition-all duration-300 bg-gradient-to-br min-h-[160px] flex flex-col ${
                activeTool === t.id
                  ? "border-cyan-500 from-cyan-50 to-white shadow-md scale-[1.02]"
                  : "border-slate-200 from-slate-50 to-white hover:border-slate-300 hover:shadow-lg hover:scale-[1.02]"
              }`}
            >
              <Icon className={`w-12 h-12 mb-3 transition-all duration-300 ${
                activeTool === t.id ? "text-cyan-600" : "text-slate-600 group-hover:text-cyan-600 group-hover:scale-110"
              }`} />
              <div className="font-bold text-slate-800 text-base">{t.title}</div>
              <div className="text-sm text-slate-600 mt-1">{t.desc}</div>
            </button>
          );
        })}
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
        <AdaptarAtividade student={student} hiperfoco={hiperfoco} onClose={() => setActiveTool(null)} />
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
        <div className="p-6 rounded-xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white min-h-[180px]">
          <p className="text-slate-600">
            <strong>{TOOLS.find((t) => t.id === activeTool)?.title}</strong> — Em breve nesta versão.
          </p>
        </div>
      )}
    </div>
  );
}

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
  const [usarImagens, setUsarImagens] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [mapaImagensResultado, setMapaImagensResultado] = useState<Record<number, string>>({});
  const [erro, setErro] = useState<string | null>(null);

  const serieAluno = student?.grade || "";

  useEffect(() => {
    if (eiMode) {
      fetch("/api/bncc/ei")
        .then((r) => r.json())
        .then((d) => {
          setEiFaixas(d.faixas || []);
          setEiCampos(d.campos || []);
        })
        .catch(() => {});
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
  const unidadeData = componenteSel && discData?.porUnidade?.[unidadeSel];
  const habsDoObjeto = objetoSel && unidadeData && typeof unidadeData === "object" && "porObjeto" in unidadeData ? unidadeData.porObjeto?.[objetoSel] : undefined;

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

  const gerar = async () => {
    if (!assunto.trim()) {
      setErro("Informe o assunto.");
      return;
    }
    setLoading(true);
    setErro(null);
    setResultado(null);
    setMapaImagensResultado({});
    try {
      const res = await fetch("/api/hub/criar-atividade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assunto,
          engine,
          ei_mode: eiMode,
          ei_idade: eiMode ? eiIdade : undefined,
          ei_campo: eiMode ? eiCampo : undefined,
          ei_objetivos: eiMode && habilidadesSel.length ? habilidadesSel : undefined,
          habilidades: !eiMode && habilidadesSel.length > 0 ? habilidadesSel : undefined,
          estudante: student ? { nome: student.name, serie: student.grade, hiperfoco: (student.pei_data as Record<string, unknown>)?.hiperfoco } : undefined,
          usar_imagens: usarImagens,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar");
      let textoFinal = data.texto || "Atividade gerada.";
      let mapa: Record<number, string> = {};
      if (usarImagens) {
        const genImgRegex = /\[\[GEN_IMG:\s*([^\]]+)\]\]/gi;
        const termos: string[] = [];
        let m: RegExpExecArray | null;
        while ((m = genImgRegex.exec(textoFinal)) !== null) {
          termos.push(m[1].trim());
        }
        for (let i = 0; i < termos.length; i++) {
          try {
            const imgRes = await fetch("/api/hub/estudio-imagem", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ tipo: "ilustracao", prompt: termos[i] }),
            });
            const imgData = await imgRes.json();
            if (imgRes.ok && imgData.image) {
              const base64 = (imgData.image as string).replace(/^data:image\/\w+;base64,/, "");
              mapa[i + 1] = base64;
            }
          } catch {
            // ignora falha em uma imagem
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
    }
  };

  return (
    <div className="p-6 rounded-xl border-2 border-slate-200 bg-gradient-to-br from-cyan-50 to-white space-y-4 shadow-sm min-h-[200px]">
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
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
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
                {estruturaBncc.disciplinas.map((d) => (
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
                {(unidadeData?.objetos || []).map((o) => (
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
        <label className="block text-sm font-medium text-slate-700 mb-1">{eiMode ? "Assunto / tema da experiência" : "Assunto / tema"}</label>
        <input
          type="text"
          value={assunto}
          onChange={(e) => setAssunto(e.target.value)}
          placeholder="Ex: Frações, Sistema Solar..."
          className="w-full px-3 py-2 border border-slate-200 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{eiMode ? "Objetivos de Aprendizagem (opcional)" : "Habilidades BNCC (opcional)"}</label>
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
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={usarImagens} onChange={(e) => setUsarImagens(e.target.checked)} />
        <span className="text-sm">Incluir imagens ilustrativas (IA gera descrições; imagens via DALL-E)</span>
      </label>
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
        <div className="p-4 rounded-lg bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700">Resultado</span>
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
          <pre className="whitespace-pre-wrap text-sm text-slate-600">{resultado}</pre>
        </div>
      )}
    </div>
  );
}

const COMPONENTES = ["Língua Portuguesa", "Matemática", "Arte", "Ciências", "Educação Física", "Geografia", "História", "Língua Inglesa", "Ensino Religioso"];

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
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const gerar = async () => {
    if (!assunto.trim()) {
      setErro("Informe o assunto da aula.");
      return;
    }
    setLoading(true);
    setErro(null);
    setResultado(null);
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
    }
  };

  return (
    <div className="p-6 rounded-xl border-2 border-slate-200 bg-gradient-to-br from-cyan-50 to-white space-y-4 shadow-sm min-h-[200px]">
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
            value={hiperfoco}
            readOnly
            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
          />
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
        <div className="p-4 rounded-lg bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700">Conexões para engajamento</span>
            <span className="flex gap-2">
              <DocxDownloadButton texto={resultado} titulo="Papo de Mestre" filename={`Papo_Mestre_${new Date().toISOString().slice(0, 10)}.docx`} />
              <PdfDownloadButton text={resultado} filename={`Papo_Mestre_${new Date().toISOString().slice(0, 10)}.pdf`} title="Papo de Mestre" />
            </span>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-slate-600">{resultado}</pre>
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
  const [serie, setSerie] = useState(student?.grade || "");
  const [duracao, setDuracao] = useState(50);
  const [metodologia, setMetodologia] = useState("Metodologias ativas");
  const [qtdAlunos, setQtdAlunos] = useState(25);
  const [componentes, setComponentes] = useState<Record<string, { codigo: string; descricao: string }[]>>({});
  const [estruturaBncc, setEstruturaBncc] = useState<EstruturaBncc>(null);
  const [componenteSel, setComponenteSel] = useState("");
  const [unidadeSel, setUnidadeSel] = useState("");
  const [objetoSel, setObjetoSel] = useState("");
  const [habilidadesSel, setHabilidadesSel] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const peiData = student?.pei_data || {};
  const hiperfoco = (peiData.hiperfoco as string) || (peiData.interesses as string) || "";

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
  const unidadeDataP = componenteSel && discDataP?.porUnidade?.[unidadeSel];
  const habsDoObjetoP = objetoSel && unidadeDataP?.porObjeto?.[objetoSel];
  const todasHabilidadesPlano = habsDoObjetoP
    ? habsDoObjetoP.map((h) => `${componenteSel}: ${h.codigo} — ${h.descricao}`)
    : unidadeDataP
      ? Object.entries(unidadeDataP.porObjeto || {}).flatMap(([, habs]) => (habs || []).map((h) => `${componenteSel}: ${h.codigo} — ${h.descricao}`))
      : discDataP
        ? Object.values(discDataP.porUnidade || {}).flatMap((v) => Object.values(v.porObjeto || {}).flatMap((habList) => (habList || []).map((h) => `${componenteSel}: ${h.codigo} — ${h.descricao}`)))
        : Object.entries(componentes).flatMap(([disc, habs]) => (habs || []).map((h) => `${disc}: ${h.codigo} — ${h.descricao}`));

  const gerar = async () => {
    if (!assunto.trim()) {
      setErro("Informe o assunto da aula.");
      return;
    }
    setLoading(true);
    setErro(null);
    setResultado(null);
    try {
      const res = await fetch("/api/hub/plano-aula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materia,
          assunto,
          duracao_minutos: duracao,
          metodologia,
          qtd_alunos: qtdAlunos,
          recursos: ["Quadro", "Material impresso", "Projetor", "Computador"],
          habilidades_bncc: habilidadesSel.length > 0 ? habilidadesSel : undefined,
          estudante: student
            ? { nome: student.name, hiperfoco, perfil: (peiData.ia_sugestao as string)?.slice(0, 300) }
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
    }
  };

  return (
    <div className="p-6 rounded-xl border-2 border-slate-200 bg-gradient-to-br from-cyan-50 to-white space-y-4 shadow-sm min-h-[200px]">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Plano de Aula DUA</h3>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">
          Fechar
        </button>
      </div>
      <EngineSelector value={engine} onChange={onEngineChange} />
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
          <label className="block text-sm font-medium text-slate-700 mb-1">Assunto / Tema *</label>
          <input
            type="text"
            value={assunto}
            onChange={(e) => setAssunto(e.target.value)}
            placeholder="Ex: Frações equivalentes..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Duração (min)</label>
          <select value={duracao} onChange={(e) => setDuracao(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg">
            <option value={50}>50 min (1 aula)</option>
            <option value={100}>100 min (2 aulas)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade de alunos</label>
          <input type="number" min={5} max={50} value={qtdAlunos} onChange={(e) => setQtdAlunos(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Metodologia</label>
          <input
            type="text"
            value={metodologia}
            onChange={(e) => setMetodologia(e.target.value)}
            placeholder="Ex: Sala de aula invertida, Aprendizagem baseada em projetos..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
          />
        </div>
      </div>
      {estruturaBncc && estruturaBncc.disciplinas.length > 0 && (
        <details className="border border-slate-200 rounded-lg">
          <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-slate-700 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            BNCC: Unidade e Objeto (opcional)
          </summary>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Componente</label>
              <select value={componenteSel} onChange={(e) => { setComponenteSel(e.target.value); setUnidadeSel(""); setObjetoSel(""); }} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">Todos</option>
                {estruturaBncc.disciplinas.map((d) => <option key={d} value={d}>{d}</option>)}
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
                {(unidadeDataP?.objetos || []).map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div className="px-4 pb-4">
            <label className="block text-xs text-slate-600 mb-1">Habilidades BNCC (opcional)</label>
            <select multiple value={habilidadesSel} onChange={(e) => setHabilidadesSel(Array.from(e.target.selectedOptions, (o) => o.value))} className="w-full px-3 py-2 border rounded-lg text-sm min-h-[60px]">
              {todasHabilidadesPlano.slice(0, 60).map((h, i) => <option key={i} value={h}>{h}</option>)}
            </select>
          </div>
        </details>
      )}
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
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 overflow-x-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700">Plano de Aula DUA</span>
            <span className="flex gap-2">
              <DocxDownloadButton texto={resultado} titulo="Plano de Aula DUA" filename={`Plano_Aula_${new Date().toISOString().slice(0, 10)}.docx`} />
              <PdfDownloadButton text={resultado} filename={`Plano_Aula_${new Date().toISOString().slice(0, 10)}.pdf`} title="Plano de Aula DUA" />
            </span>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-slate-600">{resultado}</pre>
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
  const [contexto, setContexto] = useState("Rotina escolar");
  const [sequencia, setSequencia] = useState("Rotina de chegada, lanche, saída");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const gerar = async () => {
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch("/api/hub/rotina-avd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contexto,
          sequencia,
          engine,
          estudante: student ? { nome: student.name } : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro");
      setResultado(data.texto || "");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-xl border-2 border-slate-200 bg-gradient-to-br from-cyan-50 to-white space-y-4 shadow-sm min-h-[200px]">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Rotina & AVD
        </h3>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">Fechar</button>
      </div>
      <p className="text-sm text-slate-600">Sequências e orientações para autonomia e rotina.</p>
      <EngineSelector value={engine} onChange={onEngineChange} />
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Contexto</label>
        <input type="text" value={contexto} onChange={(e) => setContexto(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Ex: Rotina escolar" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Sequência solicitada</label>
        <textarea value={sequencia} onChange={(e) => setSequencia(e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-lg" placeholder="Ex: Rotina de chegada, lanche..." />
      </div>
      <button type="button" onClick={gerar} disabled={loading} className="px-4 py-2 bg-cyan-600 text-white rounded-lg disabled:opacity-50">
        {loading ? "Gerando…" : "Gerar orientações"}
      </button>
      {erro && <p className="text-red-600 text-sm">{erro}</p>}
      {resultado && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <DocxDownloadButton texto={resultado} titulo="Rotina e AVD" filename={`Rotina_AVD_${new Date().toISOString().slice(0, 10)}.docx`} />
            <PdfDownloadButton text={resultado} filename={`Rotina_AVD_${new Date().toISOString().slice(0, 10)}.pdf`} title="Rotina e AVD" />
          </div>
          <pre className="whitespace-pre-wrap text-sm text-slate-600 p-4 rounded-lg bg-slate-50 border">{resultado}</pre>
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
  const [tema, setTema] = useState("Brincadeiras em grupo");
  const [faixa, setFaixa] = useState("3-5 anos");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const gerar = async () => {
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch("/api/hub/inclusao-brincar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tema,
          faixa,
          engine,
          estudante: student ? { nome: student.name, hiperfoco } : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro");
      setResultado(data.texto || "");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-xl border-2 border-slate-200 bg-gradient-to-br from-cyan-50 to-white space-y-4 shadow-sm min-h-[200px]">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <ToyBrick className="w-5 h-5" />
          Inclusão no Brincar
        </h3>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">Fechar</button>
      </div>
      <p className="text-sm text-slate-600">Brincadeiras acessíveis para Educação Infantil.</p>
      <EngineSelector value={engine} onChange={onEngineChange} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tema / tipo de brincadeira</label>
          <input type="text" value={tema} onChange={(e) => setTema(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Ex: Brincadeiras em grupo" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Faixa etária</label>
          <select value={faixa} onChange={(e) => setFaixa(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
            <option value="0-2 anos">0-2 anos</option>
            <option value="3-5 anos">3-5 anos</option>
            <option value="4-5 anos">4-5 anos</option>
          </select>
        </div>
      </div>
      <button type="button" onClick={gerar} disabled={loading} className="px-4 py-2 bg-cyan-600 text-white rounded-lg disabled:opacity-50">
        {loading ? "Gerando…" : "Gerar brincadeiras"}
      </button>
      {erro && <p className="text-red-600 text-sm">{erro}</p>}
      {resultado && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <DocxDownloadButton texto={resultado} titulo="Inclusão no Brincar" filename={`Inclusao_Brincar_${new Date().toISOString().slice(0, 10)}.docx`} />
            <PdfDownloadButton text={resultado} filename={`Inclusao_Brincar_${new Date().toISOString().slice(0, 10)}.pdf`} title="Inclusão no Brincar" />
          </div>
          <pre className="whitespace-pre-wrap text-sm text-slate-600 p-4 rounded-lg bg-slate-50 border">{resultado}</pre>
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
  const [serie, setSerie] = useState(student?.grade || "");
  const [componentes, setComponentes] = useState<Record<string, unknown[]>>({});
  const [modoProfundo, setModoProfundo] = useState(false);
  const [tipo, setTipo] = useState("Prova");
  const [checklist, setChecklist] = useState<ChecklistAdaptacao>({});
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [resultado, setResultado] = useState<{ analise: string; texto: string } | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const peiData = student?.pei_data || {};

  useEffect(() => {
    if (!serie?.trim()) return;
    fetch(`/api/bncc/ef?serie=${encodeURIComponent(serie)}`)
      .then((r) => r.json())
      .then((d) => setComponentes(d.ano_atual || d || {}))
      .catch(() => setComponentes({}));
  }, [serie]);

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

  const gerar = async () => {
    const texto = docxExtraido?.texto;
    if (!texto && !file) {
      setErro("Selecione um arquivo DOCX.");
      return;
    }
    setLoading(true);
    setErro(null);
    setResultado(null);
    try {
      const questoesComImagem = [...new Set(Object.values(mapaQuestoes).filter((q) => q > 0))];
      const formData = new FormData();
      if (file) formData.append("file", file);
      formData.append(
        "meta",
        JSON.stringify({
          materia,
          tema: tema || materia,
          tipo,
          checklist,
          engine,
          modo_profundo: modoProfundo,
          estudante: { hiperfoco, perfil: (peiData.ia_sugestao as string)?.slice(0, 800) },
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
    }
  };

  const mapaImagensParaDocx: Record<number, string> = {};
  if (docxExtraido?.imagens?.length) {
    for (const [imgIdxStr, questao] of Object.entries(mapaQuestoes)) {
      if (questao > 0) {
        const idx = parseInt(imgIdxStr, 10);
        const img = docxExtraido.imagens[idx];
        if (img?.base64) mapaImagensParaDocx[questao] = img.base64;
      }
    }
  }
  const temDados = !!docxExtraido?.texto || !!file;

  return (
    <div className="p-6 rounded-xl border-2 border-slate-200 bg-gradient-to-br from-cyan-50 to-white space-y-4 shadow-sm min-h-[200px]">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Adaptar Prova (DUA)</h3>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">
          Fechar
        </button>
      </div>
      <p className="text-sm text-slate-600">Transforme provas padrão em avaliações acessíveis.</p>
      <EngineSelector value={engine} onChange={onEngineChange} />
      <details className="border border-slate-200 rounded-lg" open>
        <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-slate-700 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          BNCC e Assunto
        </summary>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-600 mb-1">Série (ano BNCC)</label>
            <input type="text" value={serie} onChange={(e) => setSerie(e.target.value)} placeholder="Ex: 5º Ano (EFAI)" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Componente</label>
            <select value={materia} onChange={(e) => setMateria(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
              {(Object.keys(componentes).length ? Object.keys(componentes) : COMPONENTES).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-slate-600 mb-1">Tema / Assunto</label>
            <input type="text" value={tema} onChange={(e) => setTema(e.target.value)} placeholder="Ex: Frações equivalentes" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          </div>
        </div>
      </details>
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
        onClick={gerar}
        disabled={loading || !temDados}
        className="px-4 py-2 bg-cyan-600 text-white rounded-lg disabled:opacity-50"
      >
        {loading ? "Adaptando…" : "Adaptar prova"}
      </button>
      {erro && <div className="text-red-600 text-sm">{erro}</div>}
      {resultado && (
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-slate-100 border border-slate-200">
            <div className="text-xs font-semibold text-slate-600 uppercase mb-1">Análise</div>
            <pre className="whitespace-pre-wrap text-sm text-slate-700">{resultado.analise}</pre>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-600 uppercase">Prova adaptada</span>
              <span className="flex gap-2">
                <DocxDownloadButton
                  texto={`${resultado.analise}\n\n---\n\n${resultado.texto}`}
                  titulo="Prova Adaptada (DUA)"
                  filename={`Prova_Adaptada_${new Date().toISOString().slice(0, 10)}.docx`}
                  mapaImagens={Object.keys(mapaImagensParaDocx).length > 0 ? mapaImagensParaDocx : undefined}
                />
                <PdfDownloadButton
                text={`${resultado.analise}\n\n---\n\n${resultado.texto}`}
                filename={`Prova_Adaptada_${new Date().toISOString().slice(0, 10)}.pdf`}
                title="Prova Adaptada (DUA)"
              />
              </span>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-slate-600">{resultado.texto}</pre>
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
  const [serie, setSerie] = useState(student?.grade || "");
  const [componentes, setComponentes] = useState<Record<string, { codigo: string; descricao: string }[]>>({});
  const [estruturaBncc, setEstruturaBncc] = useState<EstruturaBncc>(null);
  const [componenteSel, setComponenteSel] = useState("");
  const [unidadeSel, setUnidadeSel] = useState("");
  const [objetoSel, setObjetoSel] = useState("");
  const [habilidadesSel, setHabilidadesSel] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

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
  const unidadeData = componenteSel && discData?.porUnidade?.[unidadeSel];
  const habsDoObjeto = objetoSel && unidadeData && typeof unidadeData === "object" && "porObjeto" in unidadeData ? unidadeData.porObjeto?.[objetoSel] : undefined;
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

  const gerar = async () => {
    if (!assunto.trim()) {
      setErro("Informe o assunto.");
      return;
    }
    setLoading(true);
    setErro(null);
    try {
      const peiData = student?.pei_data || {};
      const res = await fetch("/api/hub/roteiro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aluno: { nome: student?.name, ia_sugestao: (peiData.ia_sugestao as string)?.slice(0, 500), hiperfoco: (peiData.hiperfoco as string) || "Geral" },
          materia,
          assunto,
          ano: serie || undefined,
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
    <div className="p-6 rounded-xl border-2 border-slate-200 bg-gradient-to-br from-cyan-50 to-white space-y-4 shadow-sm min-h-[200px]">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Roteiro de Aula Individualizado</h3>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">Fechar</button>
      </div>
      <p className="text-sm text-slate-600">Passo a passo de aula específico para o estudante, usando o hiperfoco.</p>
      <EngineSelector value={engine} onChange={onEngineChange} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Componente</label>
          <select value={materia} onChange={(e) => setMateria(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg">
            {Object.keys(componentes).length ? Object.keys(componentes).map((c) => <option key={c} value={c}>{c}</option>) : <option value={materia}>{materia}</option>}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Assunto *</label>
          <input type="text" value={assunto} onChange={(e) => setAssunto(e.target.value)} placeholder="Ex: Frações equivalentes" className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Série (ano BNCC)</label>
          <input type="text" value={serie} onChange={(e) => setSerie(e.target.value)} placeholder="Ex: 5º Ano (EFAI)" className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
        </div>
      </div>
      {estruturaBncc && estruturaBncc.disciplinas.length > 0 && (
        <details className="border border-slate-200 rounded-lg">
          <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-slate-700 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            BNCC: Unidade e Objeto
          </summary>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Componente</label>
              <select value={componenteSel} onChange={(e) => { setComponenteSel(e.target.value); setUnidadeSel(""); setObjetoSel(""); }} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">Todos</option>
                {estruturaBncc.disciplinas.map((d) => <option key={d} value={d}>{d}</option>)}
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
                {(unidadeData?.objetos || []).map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </details>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Habilidades BNCC (opcional)</label>
        <select multiple value={habilidadesSel} onChange={(e) => setHabilidadesSel(Array.from(e.target.selectedOptions, (o) => o.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg min-h-[80px]">
          {todasHabilidades.slice(0, 80).map((h, i) => <option key={i} value={h}>{h}</option>)}
        </select>
      </div>
      <button type="button" onClick={gerar} disabled={loading} className="px-4 py-2 bg-cyan-600 text-white rounded-lg disabled:opacity-50">
        {loading ? "Gerando…" : "Gerar Roteiro"}
      </button>
      {erro && <p className="text-red-600 text-sm">{erro}</p>}
      {resultado && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-700">Roteiro gerado</span>
            <span className="flex gap-2">
              <DocxDownloadButton texto={resultado} titulo="Roteiro de Aula" filename={`Roteiro_${assunto.replace(/\s/g, "_")}_${new Date().toISOString().slice(0, 10)}.docx`} />
              <PdfDownloadButton text={resultado} filename={`Roteiro_${assunto.replace(/\s/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`} title="Roteiro de Aula" />
            </span>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-slate-600 p-4 rounded-lg bg-slate-50 border">{resultado}</pre>
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
  const [serie, setSerie] = useState(student?.grade || "");
  const [componentes, setComponentes] = useState<Record<string, { codigo: string; descricao: string }[]>>({});
  const [estruturaBncc, setEstruturaBncc] = useState<EstruturaBncc>(null);
  const [componenteSel, setComponenteSel] = useState("");
  const [unidadeSel, setUnidadeSel] = useState("");
  const [objetoSel, setObjetoSel] = useState("");
  const [habilidadesSel, setHabilidadesSel] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

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
  const unidadeDataD = componenteSel && discDataD?.porUnidade?.[unidadeSel];
  const habsDoObjetoD = objetoSel && unidadeDataD?.porObjeto?.[objetoSel];
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

  const gerar = async () => {
    if (!assunto.trim()) {
      setErro("Informe o assunto.");
      return;
    }
    setLoading(true);
    setErro(null);
    try {
      const peiData = student?.pei_data || {};
      const res = await fetch("/api/hub/dinamica", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aluno: { nome: student?.name, ia_sugestao: (peiData.ia_sugestao as string)?.slice(0, 400), hiperfoco: (peiData.hiperfoco as string) || "Geral" },
          materia,
          assunto,
          qtd_alunos: qtdAlunos,
          caracteristicas_turma: caracteristicas || undefined,
          ano: serie || undefined,
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
    <div className="p-6 rounded-xl border-2 border-slate-200 bg-gradient-to-br from-cyan-50 to-white space-y-4 shadow-sm min-h-[200px]">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Dinâmica Inclusiva</h3>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">Fechar</button>
      </div>
      <p className="text-sm text-slate-600">Atividades em grupo onde todos participam, respeitando as singularidades.</p>
      <EngineSelector value={engine} onChange={onEngineChange} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Componente</label>
          <select value={materia} onChange={(e) => setMateria(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg">
            {Object.keys(componentes).length ? Object.keys(componentes).map((c) => <option key={c} value={c}>{c}</option>) : <option value={materia}>{materia}</option>}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Assunto *</label>
          <input type="text" value={assunto} onChange={(e) => setAssunto(e.target.value)} placeholder="Ex: Trabalho em equipe" className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nº de estudantes</label>
          <input type="number" min={5} max={50} value={qtdAlunos} onChange={(e) => setQtdAlunos(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Características da turma (opcional)</label>
          <input type="text" value={caracteristicas} onChange={(e) => setCaracteristicas(e.target.value)} placeholder="Ex: Turma agitada, gostam de competição" className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Série (ano BNCC)</label>
          <input type="text" value={serie} onChange={(e) => setSerie(e.target.value)} placeholder="Ex: 5º Ano" className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
        </div>
      </div>
      {estruturaBncc && estruturaBncc.disciplinas.length > 0 && (
        <details className="border border-slate-200 rounded-lg">
          <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-slate-700 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            BNCC: Unidade e Objeto
          </summary>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Componente</label>
              <select value={componenteSel} onChange={(e) => { setComponenteSel(e.target.value); setUnidadeSel(""); setObjetoSel(""); }} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">Todos</option>
                {estruturaBncc.disciplinas.map((d) => <option key={d} value={d}>{d}</option>)}
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
                {(unidadeDataD?.objetos || []).map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </details>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Habilidades BNCC (opcional)</label>
        <select multiple value={habilidadesSel} onChange={(e) => setHabilidadesSel(Array.from(e.target.selectedOptions, (o) => o.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg min-h-[80px]">
          {todasHabilidades.slice(0, 80).map((h, i) => <option key={i} value={h}>{h}</option>)}
        </select>
      </div>
      <button type="button" onClick={gerar} disabled={loading} className="px-4 py-2 bg-cyan-600 text-white rounded-lg disabled:opacity-50">
        {loading ? "Gerando…" : "Criar Dinâmica"}
      </button>
      {erro && <p className="text-red-600 text-sm">{erro}</p>}
      {resultado && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-700">Dinâmica gerada</span>
            <span className="flex gap-2">
              <DocxDownloadButton texto={resultado} titulo="Dinâmica Inclusiva" filename={`Dinamica_${assunto.replace(/\s/g, "_")}_${new Date().toISOString().slice(0, 10)}.docx`} />
              <PdfDownloadButton text={resultado} filename={`Dinamica_${assunto.replace(/\s/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`} title="Dinâmica Inclusiva" />
            </span>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-slate-600 p-4 rounded-lg bg-slate-50 border">{resultado}</pre>
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
    <div className="p-6 rounded-xl border-2 border-cyan-200 bg-white space-y-6">
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

  const gerar = async (refazer = false) => {
    const prompt = (usarHiperfoco && tema ? `Tema: ${tema}. ` : "") + (descricao || "Ilustração educacional");
    if (!prompt.trim()) {
      setErro("Descreva a imagem ou use o hiperfoco.");
      return;
    }
    setLoading(true);
    setErro(null);
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
      <h4 className="font-medium text-slate-800">Ilustração</h4>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={usarHiperfoco} onChange={(e) => setUsarHiperfoco(e.target.checked)} />
        <span className="text-sm">Usar hiperfoco do estudante</span>
      </label>
      {usarHiperfoco && (
        <input
          type="text"
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          placeholder="Tema da ilustração"
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
        {loading ? "Gerando…" : "Gerar Ilustração"}
      </button>
      {imagem && (
        <div>
          <img src={imagem} alt="Ilustração" className="max-w-full rounded-lg border" />
          <div className="mt-2 flex flex-wrap gap-2 items-center">
            <input
              type="text"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Ajuste (ex: mais cores, menos detalhes)"
              className="flex-1 min-w-[120px] px-2 py-1 border rounded text-sm"
            />
            <button type="button" onClick={() => gerar(true)} disabled={loading} className="px-3 py-1 bg-slate-200 rounded text-sm hover:bg-slate-300">
              Refazer com ajuste
            </button>
            <button type="button" onClick={() => setImagem(null)} className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded text-sm hover:bg-emerald-200">
              ✓ Validar
            </button>
          </div>
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

  const gerar = async (refazer = false) => {
    if (!conceito.trim()) {
      setErro("Informe o conceito.");
      return;
    }
    setLoading(true);
    setErro(null);
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
      <h4 className="font-medium text-slate-800">Símbolo CAA</h4>
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
        {loading ? "Gerando…" : "Gerar Pictograma"}
      </button>
      {imagem && (
        <div>
          <img src={imagem} alt="Pictograma CAA" className="max-w-[300px] rounded-lg border" />
          <div className="mt-2 flex flex-wrap gap-2 items-center">
            <input
              type="text"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Ajuste"
              className="flex-1 min-w-[120px] px-2 py-1 border rounded text-sm"
            />
            <button type="button" onClick={() => gerar(true)} disabled={loading} className="px-3 py-1 bg-slate-200 rounded text-sm hover:bg-slate-300">
              Refazer com ajuste
            </button>
            <button type="button" onClick={() => setImagem(null)} className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded text-sm hover:bg-emerald-200">
              ✓ Validar
            </button>
          </div>
        </div>
      )}
      {erro && <p className="text-red-600 text-sm">{erro}</p>}
    </div>
  );
}

function AdaptarAtividade({
  student,
  hiperfoco,
  onClose,
}: {
  student: StudentFull | null;
  hiperfoco: string;
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [materia, setMateria] = useState("Língua Portuguesa");
  const [tema, setTema] = useState("");
  const [serie, setSerie] = useState(student?.grade || "");
  const [componentes, setComponentes] = useState<Record<string, unknown[]>>({});
  const [modoProfundo, setModoProfundo] = useState(false);
  const [tipo, setTipo] = useState("Atividade");
  const [livroProfessor, setLivroProfessor] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistAdaptacao>({});
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<{ analise: string; texto: string } | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const peiData = student?.pei_data || {};

  useEffect(() => {
    if (!serie?.trim()) return;
    fetch(`/api/bncc/ef?serie=${encodeURIComponent(serie)}`)
      .then((r) => r.json())
      .then((d) => setComponentes(d.ano_atual || d || {}))
      .catch(() => setComponentes({}));
  }, [serie]);

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

  const imagemParaEnvio = croppedFile || file;

  const gerar = async () => {
    if (!imagemParaEnvio) {
      setErro("Selecione uma imagem.");
      return;
    }
    setLoading(true);
    setErro(null);
    setResultado(null);
    try {
      const formData = new FormData();
      formData.append("file", imagemParaEnvio);
      formData.append(
        "meta",
        JSON.stringify({
          materia,
          tema: tema || materia,
          tipo,
          livro_professor: livroProfessor,
          checklist,
          modo_profundo: modoProfundo,
          estudante: { hiperfoco, perfil: (peiData.ia_sugestao as string)?.slice(0, 600) },
        })
      );
      const res = await fetch("/api/hub/adaptar-atividade", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao adaptar");
      setResultado({ analise: data.analise || "", texto: data.texto || "" });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao adaptar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-xl border-2 border-slate-200 bg-gradient-to-br from-cyan-50 to-white space-y-4 shadow-sm min-h-[200px]">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Adaptar Atividade (OCR + IA)</h3>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">
          Fechar
        </button>
      </div>
      <p className="text-sm text-slate-600">Tire foto da atividade. A IA extrai o texto e adapta com DUA.</p>
      <details className="border border-slate-200 rounded-lg" open>
        <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-slate-700 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          BNCC e Assunto
        </summary>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-600 mb-1">Série (ano BNCC)</label>
            <input type="text" value={serie} onChange={(e) => setSerie(e.target.value)} placeholder="Ex: 5º Ano (EFAI)" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Componente</label>
            <select value={materia} onChange={(e) => setMateria(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
              {(Object.keys(componentes).length ? Object.keys(componentes) : COMPONENTES).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-slate-600 mb-1">Tema / Assunto</label>
            <input type="text" value={tema} onChange={(e) => setTema(e.target.value)} placeholder="Ex: Frações equivalentes" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          </div>
        </div>
      </details>
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
        onClick={gerar}
        disabled={loading || !imagemParaEnvio}
        className="px-4 py-2 bg-cyan-600 text-white rounded-lg disabled:opacity-50"
      >
        {loading ? "Adaptando…" : "Adaptar atividade"}
      </button>
      {erro && <div className="text-red-600 text-sm">{erro}</div>}
      {resultado && (
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-slate-100 border border-slate-200">
            <div className="text-xs font-semibold text-slate-600 uppercase mb-1">Análise</div>
            <pre className="whitespace-pre-wrap text-sm text-slate-700">{resultado.analise}</pre>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-600 uppercase">Atividade adaptada</span>
              <span className="flex gap-2">
                <DocxDownloadButton texto={`${resultado.analise}\n\n---\n\n${resultado.texto}`} titulo="Atividade Adaptada (DUA)" filename={`Atividade_Adaptada_${new Date().toISOString().slice(0, 10)}.docx`} />
                <PdfDownloadButton
                  text={`${resultado.analise}\n\n---\n\n${resultado.texto}`}
                  filename={`Atividade_${new Date().toISOString().slice(0, 10)}.pdf`}
                  title="Atividade Adaptada (DUA)"
                />
              </span>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-slate-600">{resultado.texto}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
