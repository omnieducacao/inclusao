"use client";

/**
 * Lista de estudantes (onda 6).
 *
 * Antes: cartões que abriam um painel com diagnóstico, botões de "apagar relatórios" e "apagar
 * jornada" e uma edição de série/turma digitada à mão, sem dizer em que pé estava cada PEI.
 * Agora: uma tabela com a situação do PEI e do PAEE de cada estudante; a linha abre a ficha,
 * onde ficam a edição, os responsáveis e a exportação. O cadastro usa as turmas da escola.
 */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, UserPlus, X } from "lucide-react";
import type { SituacaoPei } from "@/lib/inicio";
import css from "./Estudantes.module.css";

export type LinhaEstudante = {
  id: string;
  name: string;
  grade: string | null;
  class_group: string | null;
  pei: SituacaoPei;
  paee: "ativo" | "sem_ativo" | "nenhum";
};

type Turma = { id: string; grade: string; class_group: string };

const FILTROS = ["Todos", "Sem PEI", "Rascunho", "Vigente", "Revisão chegando", "Revisão vencida", "Em revisão"] as const;

function dataBr(iso: string | null) {
  if (!iso) return "—";
  const [a, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
}

function NovoEstudante({ turmas, onFechar }: { turmas: Turma[]; onFechar: () => void }) {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [turmaId, setTurmaId] = useState("");
  const [serie, setSerie] = useState("");
  const [turmaTexto, setTurmaTexto] = useState("");
  // A API exige o aceite da Política de Privacidade (LGPD); o campo tinha sumido no redesenho da onda 6
  const [consentimento, setConsentimento] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const campoNome = useRef<HTMLInputElement | null>(null);
  useEffect(() => { campoNome.current?.focus(); }, []);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) { setErro("Escreva o nome do estudante."); campoNome.current?.focus(); return; }
    const t = turmas.find((x) => x.id === turmaId);
    if (turmas.length > 0 && !t) { setErro("Escolha a turma."); return; }
    if (!consentimento) { setErro("Confirme que a escola tem a autorização da família para cadastrar o estudante."); return; }
    setSalvando(true); setErro(null);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nome.trim(),
          grade: t ? t.grade : serie.trim() || null,
          class_group: t ? t.class_group : turmaTexto.trim() || null,
          privacy_consent: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível cadastrar.");
      router.push(`/estudantes/${data.student.id}`);
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível cadastrar.");
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="omni-cartao omni-cartao--plano space-y-4" aria-labelledby="novo-titulo" noValidate>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="novo-titulo" className="omni-cartao__titulo">Cadastrar estudante</h2>
          <p className="omni-apoio">Só o nome e a turma. O resto entra no estudo de caso do PEI.</p>
        </div>
        <button type="button" className="omni-btn omni-btn--discreto omni-btn--icone" aria-label="Fechar cadastro" onClick={onFechar}><X aria-hidden /></button>
      </div>
      {erro && <div className="omni-aviso omni-aviso--erro" role="alert"><div><div className="omni-aviso__texto">{erro}</div></div></div>}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="omni-campo">
          <label className="omni-campo__rotulo" htmlFor="novo-nome">Nome completo</label>
          <input ref={campoNome} id="novo-nome" className="omni-entrada" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="off" required />
        </div>
        {turmas.length > 0 ? (
          <div className="omni-campo">
            <label className="omni-campo__rotulo" htmlFor="novo-turma">Turma</label>
            <select id="novo-turma" className="omni-entrada" value={turmaId} onChange={(e) => setTurmaId(e.target.value)} required>
              <option value="">Escolha a turma</option>
              {turmas.map((t) => <option key={t.id} value={t.id}>{[t.grade, t.class_group].filter(Boolean).join(" · ")}</option>)}
            </select>
            <span className="omni-campo__ajuda">As turmas vêm de Configuração da escola.</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="omni-campo">
              <label className="omni-campo__rotulo" htmlFor="novo-serie">Série <span className="omni-campo__opcional">(opcional)</span></label>
              <input id="novo-serie" className="omni-entrada" value={serie} onChange={(e) => setSerie(e.target.value)} placeholder="4º ano" />
            </div>
            <div className="omni-campo">
              <label className="omni-campo__rotulo" htmlFor="novo-turma-txt">Turma <span className="omni-campo__opcional">(opcional)</span></label>
              <input id="novo-turma-txt" className="omni-entrada" value={turmaTexto} onChange={(e) => setTurmaTexto(e.target.value)} placeholder="A" />
            </div>
          </div>
        )}
      </div>
      <label className="omni-caixa" style={{ fontSize: 15 }}>
        <input type="checkbox" checked={consentimento} onChange={(e) => setConsentimento(e.target.checked)} />
        <span>
          A família autorizou a escola a registrar os dados deste estudante na Omnisfera, conforme a{" "}
          <a href="/privacidade" target="_blank" rel="noopener" style={{ color: "var(--acao)", fontWeight: 600 }}>Política de Privacidade</a>.
        </span>
      </label>
      <div className="flex flex-wrap gap-2">
        <button type="submit" className="omni-btn omni-btn--primario" disabled={salvando}>{salvando ? "Cadastrando…" : "Cadastrar e abrir a ficha"}</button>
        <button type="button" className="omni-btn omni-btn--discreto" onClick={onFechar}>Cancelar</button>
      </div>
    </form>
  );
}

export function EstudantesClient({
  students, turmas, podeCriar,
}: { students: LinhaEstudante[]; turmas: Turma[]; podeCriar: boolean }) {
  const params = useSearchParams();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]>("Todos");
  const [novo, setNovo] = useState(params?.get("novo") === "1" && podeCriar);

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return students
      .filter((s) => filtro === "Todos" || s.pei.rotulo === filtro)
      .filter((s) => !q || [s.name, s.grade, s.class_group].some((v) => (v || "").toLowerCase().includes(q)))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [students, busca, filtro]);

  const contagem = useMemo(() => {
    const c: Record<string, number> = {};
    for (const s of students) c[s.pei.rotulo] = (c[s.pei.rotulo] || 0) + 1;
    return c;
  }, [students]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="omni-campo" style={{ minWidth: 240 }}>
            <label className="omni-campo__rotulo" htmlFor="busca-estudante">Buscar</label>
            <div className="relative">
              <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--tinta-3)" }} />
              <input id="busca-estudante" className="omni-entrada" style={{ paddingLeft: 36 }} value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Nome, série ou turma" />
            </div>
          </div>
          <div className="omni-campo">
            <label className="omni-campo__rotulo" htmlFor="filtro-pei">Situação do PEI</label>
            <select id="filtro-pei" className="omni-entrada" value={filtro} onChange={(e) => setFiltro(e.target.value as typeof filtro)}>
              {FILTROS.map((f) => (
                <option key={f} value={f}>{f}{f === "Todos" ? ` (${students.length})` : contagem[f] ? ` (${contagem[f]})` : " (0)"}</option>
              ))}
            </select>
          </div>
        </div>
        {podeCriar && !novo && (
          <button type="button" className="omni-btn omni-btn--primario" onClick={() => setNovo(true)}>
            <UserPlus aria-hidden /> Cadastrar estudante
          </button>
        )}
      </div>

      {novo && <NovoEstudante turmas={turmas} onFechar={() => setNovo(false)} />}

      {students.length === 0 ? (
        <div className="omni-cartao omni-cartao--plano">
          <h2 className="omni-cartao__titulo">Nenhum estudante ainda</h2>
          <p className="omni-apoio">
            {podeCriar ? "Cadastre o primeiro estudante para começar o PEI." : "Peça à coordenação para ligar você às suas turmas ou estudantes."}
          </p>
        </div>
      ) : (
        <div className={`omni-tabela-caixa ${css.caixa}`}>
          <table className={`omni-tabela ${css.tabela}`}>
            <caption className="omni-so-leitor">Estudantes e situação do PEI e do PAEE</caption>
            <thead>
              <tr>
                <th scope="col">Estudante</th>
                <th scope="col">PEI</th>
                <th scope="col">Próxima revisão</th>
                <th scope="col">PAEE</th>
                <th scope="col"><span className="omni-so-leitor">Ação</span></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link href={`/estudantes/${s.id}`} className="omni-tabela__nome" style={{ color: "var(--tinta)", fontWeight: 700 }}>{s.name}</Link>
                    <div className="omni-tabela__sub" style={{ color: "var(--tinta-2)", fontSize: 14 }}>
                      {[s.grade, s.class_group].filter(Boolean).join(" · ") || "Sem turma"}
                    </div>
                  </td>
                  <td>
                    <span className={css.rotuloCelular}>PEI</span>
                    <span className={`omni-estado omni-estado--${s.pei.tom}`}>{s.pei.rotulo}{s.pei.versao ? ` · v${s.pei.versao}` : ""}</span>
                  </td>
                  <td className="num"><span className={css.rotuloCelular}>Próxima revisão</span>{dataBr(s.pei.proximaRevisao)}</td>
                  <td>
                    <span className={css.rotuloCelular}>PAEE</span>
                    {s.paee === "ativo" ? <span className="omni-estado omni-estado--sucesso">Ciclo ativo</span>
                      : s.paee === "sem_ativo" ? <span className="omni-estado omni-estado--atencao">Sem ciclo ativo</span>
                      : <span className="omni-estado omni-estado--neutro">Não começado</span>}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Link href={`/estudantes/${s.id}`} className="omni-btn omni-btn--discreto omni-btn--pequeno" aria-label={`Abrir a ficha de ${s.name}`}>
                      Abrir ficha
                    </Link>
                  </td>
                </tr>
              ))}
              {lista.length === 0 && (
                <tr><td colSpan={5} className="omni-apoio">Nenhum estudante com esse filtro.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
