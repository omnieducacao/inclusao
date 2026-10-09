"use client";

/**
 * PEI em quatro etapas (onda 7).
 *
 * Antes: guia "Bem-vindo ao PEI", barra de progresso em %, até 14 abas no mesmo nível, migalhas
 * e botões "Salvar"/"Atualizar PEI" que abriam alert(). Agora:
 * - o estudante vem do cabeçalho (cadastro em Estudantes; nada de criar estudante no PEI);
 * - quatro etapas na ordem da escola (Estudo de caso → PEI → Vigente e ciência → Revisão),
 *   com o estado de cada uma vindo dos dados;
 * - dentro da etapa, poucas seções em abas; uma ação principal no rodapé;
 * - salva sozinho 2 s depois de cada mudança; "Baixar" junta PDF, Word e cópia de segurança.
 */
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { AlertTriangle, ArrowRight, Check } from "lucide-react";
import { usePEIData } from "@/hooks/usePEIData";
import { PEIFase2Regentes } from "@/components/PEIFase2Regentes";
import { PEIConsolidacao } from "@/components/PEIConsolidacao";
import { CabecalhoEstudante, EscolherEstudante, type EstudanteResumo } from "@/components/estudante/CabecalhoEstudante";
import { DashboardTab } from "./components/PEIDashboardTab";
import { ConsultoriaTab } from "./components/PEIConsultoriaTab";
import { BNCCTab } from "./components/PEIBnccTab";
import { PEITabEstudante } from "./components/PEITabEstudante";
import { PEITabEvidencias } from "./components/PEITabEvidencias";
import { PEITabRede } from "./components/PEITabRede";
import { PEITabMapeamento } from "./components/PEITabMapeamento";
import { PEITabPlano } from "./components/PEITabPlano";
import { PEITabMonitoramento } from "./components/PEITabMonitoramento";
import { PEITabEstudoCaso } from "./components/PEITabEstudoCaso";
import { PEITabVigencia } from "./components/PEITabVigencia";
import { BaixarPEI } from "./components/BaixarPEI";
import { useStudentRealtime } from "@/hooks/useStudentRealtime";
import { ETAPAS, secoesDaEtapa, etapaDaAbaAntiga, estadoDasEtapas, etapaInicial, type Etapa, type SecaoId } from "@/lib/pei-etapas";
import { hojeBrasilia } from "@/lib/inicio";
import type { PEIData } from "@/lib/pei";
import type { Student } from "@/lib/students";
import s from "./PEIClient.module.css";

type Props = {
  students: EstudanteResumo[];
  studentId: string | null;
  studentName: string | null;
  initialPeiData: Record<string, unknown>;
  initialStudent?: Student | null;
  initialClasses: Array<{ id: string; class_group: string; grade_id: string; grades?: { name?: string; label?: string } }>;
  initialGrades: Array<{ id: string; name: string; label?: string }>;
  modo?: "completo" | "simplificado";
  usuarioNome?: string;
};

const ACAO_FINAL: Record<Etapa, string | null> = {
  1: "Seguir para o PEI",
  2: "Seguir para tornar vigente",
  3: "Ir para a revisão",
  4: null,
};

function PEIDoEstudante({
  students, studentId, initialPeiData, initialStudent, initialClasses, initialGrades, modo = "completo", usuarioNome,
}: Props & { studentId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const pei = usePEIData({ students, studentId, initialPeiData });
  const { peiData, setPeiData, saving, updateField, toggleChecklist, addMedicamento, removeMedicamento, handleUpdate,
    salvoEm, erroSalvar, salvarPei, currentStudentId } = pei;

  useStudentRealtime(currentStudentId);

  const hoje = hojeBrasilia();
  const estados = useMemo(() => estadoDasEtapas(peiData as Record<string, unknown>, hoje), [peiData, hoje]);

  // Etapa e seção: da URL (?etapa=2&secao=bncc, ou o antigo ?tab=) ou a primeira etapa por fazer
  const daUrl = useMemo(() => {
    const e = Number(params?.get("etapa"));
    if (e >= 1 && e <= 4) return { etapa: e as Etapa, secao: (params?.get("secao") as SecaoId) || null };
    return etapaDaAbaAntiga(params?.get("tab"));
  }, [params]);
  const [etapa, setEtapa] = useState<Etapa>(() => daUrl?.etapa ?? etapaInicial(estados));
  const secoes = secoesDaEtapa(etapa, modo);
  const [secao, setSecao] = useState<SecaoId>(() => (daUrl?.secao && secoes.some((x) => x.id === daUrl.secao) ? daUrl.secao : secoes[0].id));

  function irPara(e: Etapa, sec?: SecaoId) {
    const lista = secoesDaEtapa(e, modo);
    const alvo = sec && lista.some((x) => x.id === sec) ? sec : lista[0].id;
    setEtapa(e);
    setSecao(alvo);
    const p = new URLSearchParams(params?.toString() || "");
    p.set("etapa", String(e)); p.set("secao", alvo); p.delete("tab");
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
    document.getElementById("pei-etapa")?.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  const serie = (peiData.serie as string) || "";
  const hiperfoco = (peiData.hiperfoco as string) || (peiData.interesses as string) || "Interesses gerais";
  const estudante = students.find((x) => x.id === studentId) || { id: studentId, name: (peiData.nome as string) || "Estudante" };
  const info = ETAPAS[etapa - 1];

  const estadoSalvar = erroSalvar ? null : saving ? "Salvando…" : salvoEm ? `Salvo às ${salvoEm}` : null;

  return (
    <div className="space-y-5">
      <CabecalhoEstudante
        students={students}
        student={{ ...estudante, pei_data: peiData as Record<string, unknown> }}
        acoes={
          <>
            {estadoSalvar && <span className="omni-apoio" role="status" aria-live="polite">{estadoSalvar}</span>}
            <BaixarPEI peiData={peiData} />
          </>
        }
      />

      {erroSalvar && (
        <div className="omni-aviso omni-aviso--erro" role="alert">
          <AlertTriangle className="omni-aviso__icone" aria-hidden />
          <div>
            <div className="omni-aviso__titulo">Não conseguimos salvar o PEI agora</div>
            <div className="omni-aviso__texto">O que você escreveu continua nesta tela. Confira a internet e tente de novo.</div>
          </div>
          <div className="omni-aviso__acoes">
            <button type="button" className="omni-btn omni-btn--secundario omni-btn--pequeno" onClick={() => void salvarPei()}>Tentar de novo</button>
          </div>
        </div>
      )}

      <nav aria-label="Etapas do PEI">
        <ol className="omni-passos">
          {ETAPAS.map((e) => {
            const est = estados[e.n];
            const atual = e.n === etapa;
            return (
              <li key={e.n} className={`omni-passo ${est.feito ? "omni-passo--feito" : ""} ${atual ? "omni-passo--atual" : ""} ${s.passo}`}>
                <button type="button" className={s.passoBotao} aria-current={atual ? "step" : undefined} onClick={() => irPara(e.n)}>
                  <span className="omni-passo__num" aria-hidden>{est.feito ? <Check size={16} /> : e.n}</span>
                  <span>
                    <span className="omni-passo__titulo">{e.titulo}</span>
                    <span className="omni-passo__estado" style={{ display: "block" }}>{est.texto}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <section id="pei-etapa" className={s.etapa} aria-labelledby="pei-etapa-titulo">
        <header className={s.etapaTopo}>
          <p className="omni-rotulo">Etapa {etapa} de 4</p>
          <h2 id="pei-etapa-titulo" className={s.etapaTitulo}>{info.titulo}</h2>
          <p className="omni-apoio">{info.ajuda}</p>
        </header>

        {secoes.length > 1 && (
          <div className="omni-abas" role="tablist" aria-label={`Seções de ${info.titulo}`}>
            {secoes.map((x) => (
              <button
                key={x.id}
                type="button"
                role="tab"
                id={`aba-${x.id}`}
                aria-selected={secao === x.id}
                aria-controls="pei-secao"
                className="omni-aba"
                onClick={() => irPara(etapa, x.id)}
              >
                {x.nome}
              </button>
            ))}
          </div>
        )}

        <div id="pei-secao" role={secoes.length > 1 ? "tabpanel" : undefined} aria-labelledby={secoes.length > 1 ? `aba-${secao}` : undefined} className={s.secao}>
          {secao === "estudo_caso" && (
            <PEITabEstudoCaso
              peiData={peiData}
              updateField={updateField}
              toggleChecklist={toggleChecklist as (field: keyof PEIData, value: string) => void}
              hiperfoco={hiperfoco}
              onIrParaPei={() => irPara(2)}
            />
          )}
          {secao === "estudante" && (
            <PEITabEstudante
              peiData={peiData} setPeiData={setPeiData}
              updateField={updateField}
              addMedicamento={() => addMedicamento("", "", false)} removeMedicamento={removeMedicamento}
              serie={serie}
              schoolClasses={initialClasses} schoolGrades={initialGrades}
            />
          )}
          {secao === "evidencias" && (
            <PEITabEvidencias peiData={peiData} updateField={updateField} toggleChecklist={toggleChecklist as (field: keyof PEIData, value: string) => void} />
          )}
          {secao === "rede" && <PEITabRede peiData={peiData} updateField={updateField} />}
          {secao === "mapeamento" && <PEITabMapeamento peiData={peiData} updateField={updateField} hiperfoco={hiperfoco} />}
          {secao === "consultoria" && (
            <ConsultoriaTab peiData={peiData} updateField={updateField} serie={peiData.serie || ""} student={initialStudent} />
          )}
          {secao === "bncc" && <BNCCTab peiData={peiData} updateField={updateField} serie={peiData.serie || ""} />}
          {secao === "plano" && <PEITabPlano peiData={peiData} updateField={updateField} />}
          {secao === "monitoramento" && <PEITabMonitoramento peiData={peiData} updateField={updateField} />}
          {(secao === "vigencia" || secao === "revisao") && (
            <PEITabVigencia
              peiData={peiData}
              updateField={updateField}
              currentStudentId={currentStudentId}
              usuarioNome={usuarioNome}
              onSalvar={handleUpdate}
              saving={saving}
              parte={secao === "vigencia" ? "vigencia" : "revisao"}
            />
          )}
          {secao === "regentes" && (
            <PEIFase2Regentes
              studentId={currentStudentId}
              studentName={peiData.nome || estudante.name}
              studentGrade={peiData.serie || ""}
              studentClass={peiData.turma || ""}
              onSave={handleUpdate}
              onUpdate={handleUpdate}
              isEditing
              saving={saving}
            />
          )}
          {secao === "consolidacao" && (
            <PEIConsolidacao
              studentId={currentStudentId}
              consolidadoEm={(peiData.consolidacao as { em?: string } | undefined)?.em || null}
              onConsolidar={(r) => { updateField("consolidacao", r); updateField("fase_pei", "consolidado"); }}
            />
          )}
          {secao === "acompanhamento" && (
            <DashboardTab
              peiData={peiData}
              currentStudentId={currentStudentId}
              updateField={updateField}
              onSave={handleUpdate}
              onUpdate={handleUpdate}
              isEditing
              saving={saving}
              dailyLogs={(initialStudent?.daily_logs as unknown[]) || []}
            />
          )}
        </div>

        <footer className={s.rodape}>
          {etapa > 1 && (
            <button type="button" className="omni-btn omni-btn--discreto" onClick={() => irPara((etapa - 1) as Etapa)}>
              Voltar para {ETAPAS[etapa - 2].titulo}
            </button>
          )}
          <span className={s.espaco} />
          {ACAO_FINAL[etapa] && (
            <button type="button" className="omni-btn omni-btn--primario" onClick={() => irPara((etapa + 1) as Etapa)}>
              {ACAO_FINAL[etapa]} <ArrowRight aria-hidden />
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}

export function PEIClient(props: Props) {
  const { students, studentId, initialStudent } = props;
  if (!studentId || !initialStudent) {
    return (
      <EscolherEstudante
        students={students}
        texto="O PEI segue quatro etapas: estudo de caso, PEI, vigente e ciência, e revisão. Ele salva sozinho."
        naoEncontrado={Boolean(studentId)}
      />
    );
  }
  // Os dados de cadastro entram no PEI quando ainda não estão lá (estudante criado em Estudantes)
  const inicial = {
    ...props.initialPeiData,
    nome: (props.initialPeiData.nome as string) || initialStudent.name,
    serie: (props.initialPeiData.serie as string) || initialStudent.grade || "",
    turma: (props.initialPeiData.turma as string) || initialStudent.class_group || "",
  };
  // key: trocar de estudante recomeça o estado (antes o hook guardava o PEI do anterior)
  return <PEIDoEstudante key={studentId} {...props} studentId={studentId} initialPeiData={inicial} />;
}
