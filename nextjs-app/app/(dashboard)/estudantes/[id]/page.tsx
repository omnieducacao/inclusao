/**
 * Ficha do estudante (onda 6).
 *
 * Antes não havia um lugar com "tudo sobre este estudante": cada módulo tinha seu seletor e a
 * lista de Estudantes abria cartões com botões de apagar relatórios. A ficha junta, para um
 * estudante, a situação de cada módulo e o caminho para ele (sempre com ?student=), mais os
 * dados de cadastro, os responsáveis e a exportação (LGPD).
 */
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, BookOpen, Brain, ChartLine, FileText, Layers, NotebookPen, Sparkles } from "lucide-react";
import { getSession } from "@/lib/session";
import { getStudent } from "@/lib/students";
import { getSupabase } from "@/lib/supabase";
import { vinculoDaSessao, vinculoInclui, turmasDaEscola } from "@/lib/turmas";
import { situacaoDoPei, iniciais, hojeBrasilia, dataCurta } from "@/lib/inicio";
import { podeVer } from "@/lib/navegacao";
import { FichaDados } from "./FichaDados";
import s from "./ficha.module.css";

type Props = { params: Promise<{ id: string }> };

type Secao = {
  href: string; titulo: string; cor: string; Icone: LucideIcon; permissao?: string;
  estado: { texto: string; tom: string }; resumo: string; acao: string;
};

async function contar(tabela: string, workspaceId: string, studentId: string): Promise<number | null> {
  try {
    const { count, error } = await getSupabase()
      .from(tabela).select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId).eq("student_id", studentId);
    return error ? null : count ?? 0;
  } catch { return null; }
}

function plural(n: number, um: string, varios: string) { return `${n} ${n === 1 ? um : varios}`; }

export default async function FichaEstudantePage({ params }: Props) {
  const session = await getSession();
  if (!session?.workspace_id) redirect("/login");
  const { id } = await params;

  const student = await getStudent(session.workspace_id, id);
  if (!student) notFound();
  const vinculo = await vinculoDaSessao(session);
  if (!vinculoInclui(vinculo, student)) notFound();

  const hoje = hojeBrasilia();
  const pei = (student.pei_data || {}) as Record<string, unknown>;
  const situacao = situacaoDoPei(pei, hoje);
  const ciclos = (student.paee_ciclos || []) as Array<{ status?: string; tipo?: string }>;
  const cicloAtivo = ciclos.find((c) => c.status === "ativo");
  const registros = (student.daily_logs || []) as Array<{ data_sessao?: string }>;
  const ultimoRegistro = registros.map((r) => r.data_sessao || "").filter(Boolean).sort().pop();

  const [materiais, diagnosticas, processuais] = await Promise.all([
    contar("hub_generated_content", session.workspace_id, id),
    contar("avaliacoes_diagnosticas", session.workspace_id, id),
    contar("avaliacao_processual", session.workspace_id, id),
  ]);

  const q = `?student=${id}`;
  const secoes: Secao[] = [
    {
      href: `/pei${q}`, titulo: "PEI", cor: "pei", Icone: FileText, permissao: "can_pei",
      estado: { texto: situacao.rotulo, tom: situacao.tom },
      resumo: situacao.versao
        ? `Versão ${situacao.versao}${situacao.proximaRevisao ? ` · revisão em ${dataCurta(situacao.proximaRevisao, hoje)}` : ""}`
        : situacao.rotulo === "Sem PEI" ? "Comece pelo estudo de caso." : "O PEI ainda não foi fechado.",
      acao: situacao.rotulo === "Sem PEI" ? "Começar o PEI" : "Abrir o PEI",
    },
    {
      href: "/pei-regente", titulo: "PEI do professor", cor: "pei", Icone: BookOpen, permissao: "can_pei_professor",
      estado: situacao.versao ? { texto: "Para ler", tom: "info" } : { texto: "Sem versão", tom: "neutro" },
      resumo: situacao.versao ? "Leia o PEI vigente e registre a ciência." : "Aparece aqui quando o PEI estiver vigente.",
      acao: "Abrir",
    },
    {
      href: `/paee${q}`, titulo: "PAEE", cor: "paee", Icone: Layers, permissao: "can_paee",
      estado: cicloAtivo ? { texto: "Ciclo ativo", tom: "sucesso" } : ciclos.length ? { texto: "Sem ciclo ativo", tom: "atencao" } : { texto: "Não começado", tom: "neutro" },
      resumo: ciclos.length ? plural(ciclos.length, "ciclo registrado", "ciclos registrados") : "Plano do AEE (Atendimento Educacional Especializado).",
      acao: "Abrir o PAEE",
    },
    {
      href: `/diario${q}`, titulo: "Diário de bordo", cor: "diario", Icone: NotebookPen, permissao: "can_diario",
      estado: registros.length ? { texto: plural(registros.length, "registro", "registros"), tom: "neutro" } : { texto: "Sem registros", tom: "neutro" },
      resumo: ultimoRegistro ? `Último atendimento em ${dataCurta(ultimoRegistro, hoje)}` : "Registre cada atendimento em poucos campos.",
      acao: "Abrir o diário",
    },
    {
      href: `/hub${q}`, titulo: "Materiais do Hub", cor: "hub", Icone: Sparkles, permissao: "can_hub",
      estado: { texto: materiais == null ? "—" : plural(materiais, "material", "materiais"), tom: "neutro" },
      resumo: "Atividades adaptadas e recursos criados para este estudante.",
      acao: "Criar ou ver materiais",
    },
    {
      href: `/avaliacao-diagnostica${q}`, titulo: "Avaliações", cor: "hub", Icone: Brain, permissao: "can_pei_professor",
      estado: { texto: diagnosticas == null && processuais == null ? "—" : plural((diagnosticas || 0) + (processuais || 0), "avaliação", "avaliações"), tom: "neutro" },
      resumo: `${plural(diagnosticas || 0, "diagnóstica", "diagnósticas")} · ${plural(processuais || 0, "processual", "processuais")}`,
      acao: "Abrir avaliação diagnóstica",
    },
    {
      href: `/monitoramento${q}`, titulo: "Evolução e dados", cor: "monitoramento", Icone: ChartLine, permissao: "can_avaliacao",
      estado: { texto: "Consolidado", tom: "neutro" },
      resumo: "O que o PEI, o PAEE e o Diário já registraram, num só lugar.",
      acao: "Ver evolução",
    },
  ].filter((x) => podeVer(x, session));

  const member = (session.member || {}) as Record<string, boolean>;
  const podeEditar = Boolean(session.is_platform_admin || session.user_role === "master" || member.can_estudantes);

  const sb = getSupabase();
  const { data: ws } = await sb.from("workspaces").select("family_module_enabled").eq("id", session.workspace_id).maybeSingle();
  const familia = Boolean((ws as { family_module_enabled?: boolean } | null)?.family_module_enabled);
  const turmas = podeEditar ? await turmasDaEscola(session.workspace_id) : [];

  return (
    <div className="space-y-6">
      <Link href="/estudantes" className={`omni-btn omni-btn--discreto omni-btn--pequeno ${s.voltar}`}>
        <ArrowLeft aria-hidden /> Estudantes
      </Link>

      <header className={s.topo}>
        <span className={`omni-avatar ${s.avatar}`} aria-hidden>{iniciais(student.name)}</span>
        <div className={s.quem}>
          <p className="omni-rotulo">Ficha do estudante</p>
          <h1 className={s.nome}>{student.name}</h1>
          <p className={s.turma}>{[student.grade, student.class_group].filter(Boolean).join(" · ") || "Série e turma não informadas"}</p>
        </div>
        <span className={`omni-estado omni-estado--${situacao.tom}`}>PEI: {situacao.rotulo}</span>
      </header>

      <section aria-labelledby="ficha-modulos">
        <h2 id="ficha-modulos" className={s.secaoTitulo}>Acompanhamento</h2>
        <ul className={s.grade}>
          {secoes.map((x) => (
            <li key={x.titulo}>
              <Link href={x.href} className={`omni-modulo omni-modulo--${x.cor} ${s.cartao}`}>
                <span className={`omni-modulo__selo ${s.selo}`} aria-hidden><x.Icone /></span>
                <span className={s.cartaoTexto}>
                  <span className={s.cartaoTitulo}>{x.titulo}</span>
                  <span className={`omni-estado omni-estado--${x.estado.tom}`}>{x.estado.texto}</span>
                  <span className={s.cartaoResumo}>{x.resumo}</span>
                  <span className={s.cartaoAcao}>{x.acao} →</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <FichaDados
        estudante={{ id: student.id, name: student.name, grade: student.grade, class_group: student.class_group }}
        podeEditar={podeEditar}
        familia={familia}
        turmas={turmas.map((t) => ({ id: t.id, grade: t.grade?.label || "", class_group: t.class_group || "" }))}
      />
    </div>
  );
}
