"use client";

/**
 * "Evolução e dados" com estudante escolhido (onda 19).
 * Antes: rubricas de quatro critérios (gravavam em monitoring_assessments, que ninguém lia),
 * sugestão de rubricas por IA e uma média por disciplina da processual antiga.
 * Agora a evolução vem da avaliação por descritor: a diagnóstica de cada componente e os
 * períodos registrados na processual. O diário de bordo aparece em resumo dos últimos 60 dias.
 */
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ClipboardList, NotebookPen, Plus } from "lucide-react";
import { CabecalhoEstudante, EscolherEstudante } from "@/components/estudante/CabecalhoEstudante";
import { PEISummaryPanel } from "@/components/PEISummaryPanel";
import { EvolucaoDescritores, type DiagnosticaEvolucao, type RegistroEvolucao } from "@/components/avaliacao/EvolucaoDescritores";
import { lerSerie } from "@/lib/matriz-avaliacao";

type Student = { id: string; name: string; grade?: string | null; class_group?: string | null };
type RegistroDiario = {
  registro_id?: string;
  data_sessao?: string;
  duracao_minutos?: number | null;
  engajamento_aluno?: number | null;
  alerta_regente?: boolean | null;
  criado_em?: string;
};

type StudentFull = Student & {
  grade?: string | null;
  diagnosis?: string | null;
  pei_data?: Record<string, unknown>;
  paee_ciclos?: unknown[];
  paee_data?: Record<string, unknown> | null;
  planejamento_ativo?: string | null;
  daily_logs?: unknown[];
};

type Props = {
  students: Student[];
  studentId: string | null;
  student: StudentFull | null;
};

type Diagnostica = DiagnosticaEvolucao & { id: string; matriz: string };
type Componente = { diag: Diagnostica; registros: RegistroEvolucao[] };

const DIAS_RESUMO = 60;

/** "2026-10-09" ou ISO → "09/10/2026" (data sem hora não pode virar o dia anterior pelo fuso) */
function fmtData(s: string | undefined | null): string {
  if (!s) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return s;
}

function chaveDia(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function resumoDoDiario(logs: RegistroDiario[]) {
  const corte = new Date();
  corte.setDate(corte.getDate() - DIAS_RESUMO);
  const desde = chaveDia(corte);
  const comData = logs
    .map((r) => ({ r, dia: (r.data_sessao || r.criado_em || "").slice(0, 10) }))
    .filter((x) => x.dia)
    .sort((a, b) => b.dia.localeCompare(a.dia));
  const recentes = comData.filter((x) => x.dia >= desde).map((x) => x.r);
  const notas = recentes.map((r) => r.engajamento_aluno).filter((n): n is number => typeof n === "number" && n >= 1 && n <= 5);
  return {
    atendimentos: recentes.length,
    minutos: recentes.reduce((acc, r) => acc + (Number(r.duracao_minutos) || 0), 0),
    engajamento: notas.length ? notas.reduce((a, b) => a + b, 0) / notas.length : null,
    ultimo: comData[0]?.dia || null,
    alertas: recentes.filter((r) => r.alerta_regente === true).length,
  };
}

function MonitoramentoClientInner({ students, studentId, student }: Props) {
  const searchParams = useSearchParams();
  const currentId = studentId || searchParams?.get("student") || null;

  const [componentes, setComponentes] = useState<Componente[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!currentId || !student) { setComponentes(null); return; }
    let ativo = true;
    setComponentes(null);
    setErro(null);
    (async () => {
      try {
        const r = await fetch(`/api/avaliacao/diagnostica?studentId=${encodeURIComponent(currentId)}`);
        const d = await r.json();
        if (!r.ok) throw new Error();
        const lista = ((d.avaliacoes || []) as Diagnostica[]).filter((a) => a.matriz !== "legado" && a.concluida_em);
        // a mais recente de cada componente
        const vistos = new Set<string>();
        const diags = lista.filter((a) => (vistos.has(a.disciplina) ? false : (vistos.add(a.disciplina), true)));
        const montados = await Promise.all(diags.map(async (diag) => {
          try {
            const rp = await fetch(`/api/avaliacao/processual?studentId=${encodeURIComponent(currentId)}&disciplina=${encodeURIComponent(diag.disciplina)}`);
            const dp = await rp.json();
            return { diag, registros: (rp.ok ? dp.registros || [] : []) as RegistroEvolucao[] };
          } catch {
            return { diag, registros: [] };
          }
        }));
        if (ativo) setComponentes(montados);
      } catch {
        if (ativo) { setErro("Não deu para carregar a avaliação. Tente de novo em instantes."); setComponentes([]); }
      }
    })();
    return () => { ativo = false; };
  }, [currentId, student]);

  if (!(currentId && student)) {
    return (
      <EscolherEstudante
        students={students}
        texto="Você vê a evolução por descritor, da diagnóstica aos períodos da processual, e o resumo do diário de bordo."
        naoEncontrado={Boolean(currentId)}
      />
    );
  }

  const peiData = student.pei_data || {};
  const diario = resumoDoDiario((student.daily_logs || []) as RegistroDiario[]);
  const ehInfantil = lerSerie(student.grade).etapa === "EI";

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <CabecalhoEstudante students={students} student={{ ...student, pei_data: peiData }} />

      <PEISummaryPanel peiData={peiData} studentName={student.name} />

      {/* Evolução por componente */}
      <section style={{ display: "grid", gap: 12 }} aria-labelledby="evo-componentes">
        <div>
          <h2 id="evo-componentes" style={{ margin: 0, font: "800 18px/24px var(--font-sans)", color: "var(--tinta)" }}>Evolução por componente</h2>
          <p className="omni-apoio" style={{ margin: "4px 0 0" }}>Cada descritor da diagnóstica, período a período. Escala de 0 a 4.</p>
        </div>

        {erro && (
          <div className="omni-aviso omni-aviso--erro" role="alert"><div><div className="omni-aviso__texto">{erro}</div></div></div>
        )}

        {componentes === null && !erro && <p className="omni-apoio" role="status" style={{ margin: 0 }}>Carregando a avaliação…</p>}

        {componentes !== null && componentes.length === 0 && !erro && (
          <div className="omni-vazio">
            <ClipboardList size={40} aria-hidden style={{ color: "var(--tinta-3)" }} />
            <div className="omni-vazio__texto">
              <h3 className="omni-vazio__titulo">Ainda sem diagnóstica</h3>
              <p style={{ margin: 0 }}>
                {ehInfantil
                  ? "Na Educação Infantil o acompanhamento é feito no PEI e no diário de bordo."
                  : `A evolução aparece aqui depois que ${student.name} tiver uma diagnóstica concluída. Depois, cada período registrado na processual vira uma coluna.`}
              </p>
              {!ehInfantil && (
                <Link href={`/avaliacao-diagnostica?student=${student.id}`} className="omni-btn omni-btn--primario">Fazer a diagnóstica</Link>
              )}
            </div>
          </div>
        )}

        {componentes?.map(({ diag, registros }) => (
          <div key={diag.id} className="omni-cartao" style={{ display: "grid", gap: 8 }}>
            <EvolucaoDescritores
              diag={diag}
              registros={registros}
              nivelTitulo={3}
              acoes={
                <Link href={`/avaliacao-processual?student=${student.id}&disciplina=${encodeURIComponent(diag.disciplina)}`} className="omni-btn omni-btn--secundario omni-btn--pequeno">
                  <Plus aria-hidden /> Registrar o período
                </Link>
              }
            />
            {registros.length === 0 && <p className="omni-apoio" style={{ margin: 0 }}>Nenhum período registrado ainda. Só a diagnóstica.</p>}
          </div>
        ))}
      </section>

      {/* Diário de bordo */}
      <section className="omni-cartao" style={{ display: "grid", gap: 12 }} aria-labelledby="evo-diario">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 id="evo-diario" style={{ margin: 0, font: "800 18px/24px var(--font-sans)", color: "var(--tinta)" }}>Diário de bordo</h2>
            <p className="omni-apoio" style={{ margin: "4px 0 0" }}>Últimos {DIAS_RESUMO} dias.</p>
          </div>
          <Link href={`/diario?student=${student.id}`} className="omni-btn omni-btn--secundario omni-btn--pequeno">
            <NotebookPen aria-hidden /> Abrir o diário
          </Link>
        </div>

        {diario.atendimentos === 0 ? (
          <p className="omni-apoio" style={{ margin: 0 }}>
            Nenhum atendimento registrado nos últimos {DIAS_RESUMO} dias.
            {diario.ultimo ? ` O último foi em ${fmtData(diario.ultimo)}.` : ""}
          </p>
        ) : (
          <dl style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, margin: 0 }}>
            <Numero rotulo="Atendimentos" valor={String(diario.atendimentos)} />
            <Numero rotulo="Tempo somado" valor={diario.minutos >= 60 ? `${Math.floor(diario.minutos / 60)} h ${diario.minutos % 60} min` : `${diario.minutos} min`} />
            <Numero rotulo="Engajamento médio" valor={diario.engajamento === null ? "—" : `${diario.engajamento.toFixed(1).replace(".", ",")} de 5`} />
            <Numero rotulo="Último atendimento" valor={fmtData(diario.ultimo)} />
            <Numero rotulo="Alertas ao professor" valor={String(diario.alertas)} tom={diario.alertas > 0 ? "atencao" : undefined} />
          </dl>
        )}
      </section>

      <nav aria-label="Outros registros do estudante" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Link href={`/pei?student=${student.id}`} className="omni-btn omni-btn--discreto omni-btn--pequeno">Ver PEI</Link>
        <Link href={`/paee?student=${student.id}`} className="omni-btn omni-btn--discreto omni-btn--pequeno">Ver PAEE</Link>
      </nav>
    </div>
  );
}

function Numero({ rotulo, valor, tom }: { rotulo: string; valor: string; tom?: "atencao" }) {
  return (
    <div className="omni-cartao omni-cartao--plano" style={{ display: "grid", gap: 4 }}>
      <dt className="omni-rotulo">{rotulo}</dt>
      <dd style={{ margin: 0, font: "800 22px/28px var(--font-sans)", color: "var(--tinta)" }}>
        {tom ? <span className={`omni-estado omni-estado--${tom}`}>{valor}</span> : valor}
      </dd>
    </div>
  );
}

export function MonitoramentoClient({ students, studentId, student }: Props) {
  return (
    <Suspense fallback={<p className="omni-apoio" role="status">Carregando…</p>}>
      <MonitoramentoClientInner students={students} studentId={studentId} student={student} />
    </Suspense>
  );
}
