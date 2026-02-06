"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { StudentSelector } from "@/components/StudentSelector";
import { EngineSelector } from "@/components/EngineSelector";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";
import { DocxDownloadButton } from "@/components/DocxDownloadButton";

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

type ToolId = "adaptar-prova" | "adaptar-atividade" | "criar-zero" | "estudio-visual" | "papo-mestre" | "plano-aula" | "roteiro" | "dinamica";
type EngineId = "red" | "blue" | "green" | "yellow" | "orange";

const TOOLS: { id: ToolId; icon: string; title: string; desc: string }[] = [
  { id: "adaptar-prova", icon: "📄", title: "Adaptar Prova", desc: "Upload DOCX, adaptação com DUA" },
  { id: "adaptar-atividade", icon: "🖼️", title: "Adaptar Atividade", desc: "Imagem → OCR → IA adapta" },
  { id: "criar-zero", icon: "✨", title: "Criar do Zero", desc: "BNCC + assunto → atividade gerada" },
  { id: "estudio-visual", icon: "🎨", title: "Estúdio Visual", desc: "Pictogramas, cenas sociais" },
  { id: "roteiro", icon: "📝", title: "Roteiro Individual", desc: "Passo a passo de aula personalizado" },
  { id: "papo-mestre", icon: "💬", title: "Papo de Mestre", desc: "Sugestões de mediação" },
  { id: "dinamica", icon: "🤝", title: "Dinâmica Inclusiva", desc: "Atividades em grupo DUA" },
  { id: "plano-aula", icon: "📋", title: "Plano de Aula DUA", desc: "Desenho Universal" },
];

export function HubClient({ students, studentId, student }: Props) {
  const searchParams = useSearchParams();
  const currentId = studentId || searchParams.get("student");
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [engine, setEngine] = useState<EngineId>("red");

  const peiData = student?.pei_data || {};
  const hiperfoco = (peiData.hiperfoco as string) || (peiData.interesses as string) || "Interesses gerais";

  return (
    <div className="space-y-6">
      <StudentSelector students={students} currentId={currentId} placeholder="Selecione o estudante" />

      {currentId && student && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
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
      )}

      {!currentId && (
        <div className="bg-amber-50 text-amber-800 p-4 rounded-lg">
          Selecione um estudante para usar as ferramentas do Hub com contexto personalizado.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTool(activeTool === t.id ? null : t.id)}
            className={`text-left p-4 rounded-xl border-2 transition-all ${
              activeTool === t.id
                ? "border-cyan-500 bg-cyan-50 shadow-md"
                : "border-slate-200 hover:border-cyan-300 hover:bg-slate-50"
            }`}
          >
            <div className="text-2xl mb-2">{t.icon}</div>
            <div className="font-bold text-slate-800">{t.title}</div>
            <div className="text-sm text-slate-500 mt-0.5">{t.desc}</div>
          </button>
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
        <AdaptarAtividade student={student} hiperfoco={hiperfoco} onClose={() => setActiveTool(null)} />
      )}

      {activeTool === "estudio-visual" && (
        <EstudioVisual student={student} hiperfoco={hiperfoco} onClose={() => setActiveTool(null)} />
      )}

      {activeTool === "roteiro" && (
        <RoteiroIndividual student={student} engine={engine} onEngineChange={setEngine} onClose={() => setActiveTool(null)} />
      )}

      {activeTool === "dinamica" && (
        <DinamicaInclusiva student={student} engine={engine} onEngineChange={setEngine} onClose={() => setActiveTool(null)} />
      )}

      {activeTool && !["criar-zero", "papo-mestre", "plano-aula", "adaptar-prova", "adaptar-atividade", "estudio-visual", "roteiro", "dinamica"].includes(activeTool) && (
        <div className="p-6 rounded-xl border border-slate-200 bg-slate-50">
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
}: {
  student: StudentFull | null;
  engine: EngineId;
  onEngineChange: (e: EngineId) => void;
  onClose: () => void;
}) {
  const [serie, setSerie] = useState("");
  const [componentes, setComponentes] = useState<Record<string, { codigo: string; descricao: string }[]>>({});
  const [assunto, setAssunto] = useState("");
  const [habilidadesSel, setHabilidadesSel] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const serieAluno = student?.grade || "";

  useEffect(() => {
    if (!serieAluno) return;
    setSerie(serieAluno);
    fetch(`/api/bncc/ef?serie=${encodeURIComponent(serieAluno)}`)
      .then((r) => r.json())
      .then((d) => {
        const ano = d.ano_atual || {};
        setComponentes(ano);
      })
      .catch(() => setComponentes({}));
  }, [serieAluno]);

  const todasHabilidades = Object.entries(componentes).flatMap(([disc, habs]) =>
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
    try {
      const res = await fetch("/api/hub/criar-atividade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assunto,
          engine,
          habilidades: habilidadesSel.length > 0 ? habilidadesSel : undefined,
          estudante: student ? { nome: student.name, serie: student.grade, hiperfoco: (student.pei_data as Record<string, unknown>)?.hiperfoco } : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar");
      setResultado(data.texto || "Atividade gerada.");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao gerar atividade.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-xl border-2 border-cyan-200 bg-white space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Criar do Zero</h3>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">
          Fechar
        </button>
      </div>
      <EngineSelector value={engine} onChange={onEngineChange} />
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Assunto / tema</label>
        <input
          type="text"
          value={assunto}
          onChange={(e) => setAssunto(e.target.value)}
          placeholder="Ex: Frações, Sistema Solar..."
          className="w-full px-3 py-2 border border-slate-200 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Habilidades BNCC (opcional)</label>
        <select
          multiple
          value={habilidadesSel}
          onChange={(e) => setHabilidadesSel(Array.from(e.target.selectedOptions, (o) => o.value))}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg min-h-[100px]"
        >
          {todasHabilidades.slice(0, 50).map((h, i) => (
            <option key={i} value={h}>{h}</option>
          ))}
        </select>
        <p className="text-xs text-slate-500 mt-1">Segure Ctrl/Cmd para múltipla seleção.</p>
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
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700">Resultado</span>
            <span className="flex gap-2">
              <DocxDownloadButton texto={resultado} titulo="Atividade Criada" filename={`Atividade_${assunto.replace(/\s/g, "_")}_${new Date().toISOString().slice(0, 10)}.docx`} />
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
    <div className="p-6 rounded-xl border-2 border-cyan-200 bg-white space-y-4">
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
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
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
  const [duracao, setDuracao] = useState(50);
  const [metodologia, setMetodologia] = useState("Metodologias ativas");
  const [qtdAlunos, setQtdAlunos] = useState(25);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const peiData = student?.pei_data || {};
  const hiperfoco = (peiData.hiperfoco as string) || (peiData.interesses as string) || "";

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
    <div className="p-6 rounded-xl border-2 border-cyan-200 bg-white space-y-4">
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
  const [materia, setMateria] = useState("Língua Portuguesa");
  const [tema, setTema] = useState("");
  const [serie, setSerie] = useState(student?.grade || "");
  const [componentes, setComponentes] = useState<Record<string, unknown[]>>({});
  const [modoProfundo, setModoProfundo] = useState(false);
  const [tipo, setTipo] = useState("Prova");
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

  const gerar = async () => {
    if (!file) {
      setErro("Selecione um arquivo DOCX.");
      return;
    }
    setLoading(true);
    setErro(null);
    setResultado(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
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

  return (
    <div className="p-6 rounded-xl border-2 border-cyan-200 bg-white space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Adaptar Prova (DUA)</h3>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">
          Fechar
        </button>
      </div>
      <p className="text-sm text-slate-600">Transforme provas padrão em avaliações acessíveis.</p>
      <EngineSelector value={engine} onChange={onEngineChange} />
      <details className="border border-slate-200 rounded-lg" open>
        <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-slate-700">📚 BNCC e Assunto</summary>
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
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-100 file:text-cyan-800"
        />
      </div>
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
        disabled={loading || !file}
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
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-600 uppercase">Prova adaptada</span>
              <span className="flex gap-2">
                <DocxDownloadButton texto={`${resultado.analise}\n\n---\n\n${resultado.texto}`} titulo="Prova Adaptada (DUA)" filename={`Prova_Adaptada_${new Date().toISOString().slice(0, 10)}.docx`} />
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
  const [habilidadesSel, setHabilidadesSel] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!serie) return;
    fetch(`/api/bncc/ef?serie=${encodeURIComponent(serie)}`)
      .then((r) => r.json())
      .then((d) => setComponentes(d.ano_atual || d || {}))
      .catch(() => setComponentes({}));
  }, [serie]);

  const todasHabilidades = Object.entries(componentes).flatMap(([disc, habs]) =>
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
    <div className="p-6 rounded-xl border-2 border-cyan-200 bg-white space-y-4">
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
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Habilidades BNCC (opcional)</label>
        <select multiple value={habilidadesSel} onChange={(e) => setHabilidadesSel(Array.from(e.target.selectedOptions, (o) => o.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg min-h-[80px]">
          {todasHabilidades.slice(0, 40).map((h, i) => <option key={i} value={h}>{h}</option>)}
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
  const [habilidadesSel, setHabilidadesSel] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!serie) return;
    fetch(`/api/bncc/ef?serie=${encodeURIComponent(serie)}`)
      .then((r) => r.json())
      .then((d) => setComponentes(d.ano_atual || d || {}))
      .catch(() => setComponentes({}));
  }, [serie]);

  const todasHabilidades = Object.entries(componentes).flatMap(([disc, habs]) =>
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
    <div className="p-6 rounded-xl border-2 border-cyan-200 bg-white space-y-4">
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
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Habilidades BNCC (opcional)</label>
        <select multiple value={habilidadesSel} onChange={(e) => setHabilidadesSel(Array.from(e.target.selectedOptions, (o) => o.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg min-h-[80px]">
          {todasHabilidades.slice(0, 40).map((h, i) => <option key={i} value={h}>{h}</option>)}
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
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Ajuste (ex: mais cores, menos detalhes)"
              className="flex-1 px-2 py-1 border rounded text-sm"
            />
            <button type="button" onClick={() => gerar(true)} disabled={loading} className="px-3 py-1 bg-slate-200 rounded text-sm">
              Refazer
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
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Ajuste"
              className="flex-1 px-2 py-1 border rounded text-sm"
            />
            <button type="button" onClick={() => gerar(true)} disabled={loading} className="px-3 py-1 bg-slate-200 rounded text-sm">
              Refazer
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

  const gerar = async () => {
    if (!file) {
      setErro("Selecione uma imagem.");
      return;
    }
    setLoading(true);
    setErro(null);
    setResultado(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
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
    <div className="p-6 rounded-xl border-2 border-cyan-200 bg-white space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800">Adaptar Atividade (OCR + IA)</h3>
        <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">
          Fechar
        </button>
      </div>
      <p className="text-sm text-slate-600">Tire foto da atividade. A IA extrai o texto e adapta com DUA.</p>
      <details className="border border-slate-200 rounded-lg" open>
        <summary className="px-4 py-2 cursor-pointer text-sm font-medium text-slate-700">📚 BNCC e Assunto</summary>
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
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-100 file:text-cyan-800"
        />
        <p className="text-xs text-slate-500 mt-1">Máx. 4MB. Recorte a área da questão para melhor resultado.</p>
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
        disabled={loading || !file}
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
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
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
