"use client";

/**
 * Cabeçalho do estudante nas telas dos módulos (onda 6).
 *
 * Antes cada módulo tinha um seletor solto, um cartão próprio com nome/série e um painel do PEI,
 * cada um com outro visual. Agora todos mostram a mesma faixa: quem é o estudante, a situação do
 * PEI, o caminho para a ficha e um "Trocar estudante" que só abre quando a pessoa pede.
 *
 * Sem estudante escolhido, use <EscolherEstudante/>, que explica o que escolher e onde cadastrar.
 */
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowLeftRight, IdCard, UserPlus, Users } from "lucide-react";
import { situacaoDoPei, iniciais, hojeBrasilia } from "@/lib/inicio";
import s from "./CabecalhoEstudante.module.css";

export type EstudanteResumo = {
  id: string;
  name: string;
  grade?: string | null;
  class_group?: string | null;
  pei_data?: Record<string, unknown> | null;
};

/** Leva a tela atual para outro estudante, mantendo os outros parâmetros (aba, disciplina…). */
function useTrocarEstudante() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (id: string) => {
    const p = new URLSearchParams(params?.toString() || "");
    if (id) p.set("student", id); else p.delete("student");
    p.delete("studentId");
    const q = p.toString();
    router.push(q ? `${pathname}?${q}` : pathname || "/");
  };
}

function ListaEstudantes({
  students, atual, rotulo, onEscolher, autoFocus,
}: { students: EstudanteResumo[]; atual?: string; rotulo: string; onEscolher: (id: string) => void; autoFocus?: boolean }) {
  const id = useId();
  const ordenados = useMemo(() => [...students].sort((a, b) => (a.name || "").localeCompare(b.name || "", "pt-BR")), [students]);
  return (
    <div className={`omni-campo ${s.lista}`}>
      <label className="omni-campo__rotulo" htmlFor={id}>{rotulo}</label>
      <select
        id={id}
        className="omni-entrada"
        value={atual || ""}
        autoFocus={autoFocus}
        onChange={(e) => e.target.value && onEscolher(e.target.value)}
      >
        <option value="" disabled>Escolha pelo nome</option>
        {ordenados.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name}{e.grade ? ` · ${e.grade}${e.class_group ? ` ${e.class_group}` : ""}` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CabecalhoEstudante({
  students, student, acoes,
}: {
  students: EstudanteResumo[];
  student: EstudanteResumo;
  /** ações do módulo à direita (ex.: "Salvo às 10:42") */
  acoes?: ReactNode;
}) {
  const trocar = useTrocarEstudante();
  const [trocando, setTrocando] = useState(false);
  const botao = useRef<HTMLButtonElement | null>(null);
  const situacao = situacaoDoPei(student.pei_data, hojeBrasilia());
  const turma = [student.grade, student.class_group].filter(Boolean).join(" · ");

  useEffect(() => {
    if (!trocando) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setTrocando(false); botao.current?.focus(); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [trocando]);

  return (
    <section className={s.faixa} aria-label={`Estudante: ${student.name}`}>
      <div className={s.quem}>
        <span className={`omni-avatar ${s.avatar}`} aria-hidden>{iniciais(student.name)}</span>
        <div className={s.nomes}>
          <p className={s.nome}>{student.name}</p>
          <p className={s.turma}>{turma || "Série e turma não informadas"}</p>
        </div>
        <span className={`omni-estado omni-estado--${situacao.tom}`}>
          PEI: {situacao.rotulo}{situacao.versao ? ` · v${situacao.versao}` : ""}
        </span>
      </div>
      <div className={s.acoes}>
        {acoes}
        <Link href={`/estudantes/${student.id}`} className="omni-btn omni-btn--discreto omni-btn--pequeno">
          <IdCard aria-hidden /> Ficha do estudante
        </Link>
        {students.length > 1 && (
          <button
            ref={botao}
            type="button"
            className="omni-btn omni-btn--secundario omni-btn--pequeno"
            aria-expanded={trocando}
            onClick={() => setTrocando((v) => !v)}
          >
            <ArrowLeftRight aria-hidden /> Trocar estudante
          </button>
        )}
      </div>
      {trocando && (
        <div className={s.troca}>
          <ListaEstudantes
            students={students}
            atual={student.id}
            rotulo="Abrir esta tela para outro estudante"
            autoFocus
            onEscolher={(id) => { setTrocando(false); trocar(id); }}
          />
        </div>
      )}
    </section>
  );
}

/** Estado sem estudante: escolher, ou cadastrar quando a lista está vazia. */
export function EscolherEstudante({
  students, texto, naoEncontrado,
}: {
  students: EstudanteResumo[];
  /** frase sobre o que acontece depois de escolher ("Os atendimentos dele aparecem aqui.") */
  texto: string;
  /** o id da URL não está na lista do vínculo */
  naoEncontrado?: boolean;
}) {
  const trocar = useTrocarEstudante();
  if (students.length === 0) {
    return (
      <div className={s.vazio}>
        <span className="omni-modulo omni-modulo--pei"><span className="omni-modulo__selo" aria-hidden><Users /></span></span>
        <div>
          <h2 className={s.vazioTitulo}>Ainda não há estudantes aqui</h2>
          <p className="omni-apoio">Cadastre o estudante em Estudantes. Se ele já existe, peça à coordenação para ligar você à turma dele.</p>
        </div>
        <Link href="/estudantes?novo=1" className="omni-btn omni-btn--primario"><UserPlus aria-hidden /> Cadastrar estudante</Link>
      </div>
    );
  }
  return (
    <div className={s.vazio}>
      <span className="omni-modulo omni-modulo--pei"><span className="omni-modulo__selo" aria-hidden><Users /></span></span>
      <div>
        <h2 className={s.vazioTitulo}>{naoEncontrado ? "Não encontramos esse estudante" : "Escolha o estudante"}</h2>
        <p className="omni-apoio">
          {naoEncontrado
            ? "Ele pode ter sido excluído ou não estar no seu vínculo. Escolha outro na lista."
            : texto}
        </p>
      </div>
      <ListaEstudantes students={students} rotulo="Estudante" onEscolher={trocar} />
    </div>
  );
}
