import { redirect } from "next/navigation";
import { getSession, memberIdDaSessao } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { TermsOfUseModal } from "@/components/TermsOfUseModal";
import { SimulationBanner } from "@/components/SimulationBanner";
import { OmnisferaFeed } from "@/components/OmnisferaFeed";
import { OmniEducacaoSignature } from "@/components/Footer";
import { logger } from "@/lib/logger";
import { listStudentsDaSessao, type Student } from "@/lib/students";
import { pendenciasDoInicio, pedemAtencao, saudacao, dataPorExtenso, hojeBrasilia, primeiroNome, type Pendencia } from "@/lib/inicio";
import type { Vigencia } from "@/lib/estudo-caso";
import { Inicio, type CartaoDeModulo, type GrupoDeModulos, type Atalho } from "@/components/inicio/Inicio";

export default async function RootPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
    return null;
  }

  if (!session.workspace_id && !session.is_platform_admin) {
    logger.error({ session }, "[RootPage] Usuário sem workspace");
    redirect("/login?error=no_workspace");
    return null;
  }

  const sessionNonNull = session;

  function canAccessModule(permission?: string): boolean {
    if (!permission) return true;
    if (sessionNonNull.is_platform_admin) return true;
    if (sessionNonNull.user_role === "master") return true;
    const member = sessionNonNull.member as Record<string, boolean> | undefined;
    if (!member) return false;
    return member[permission] === true;
  }

  // ── Estudantes do vínculo, PEIs e pendências (onda 4: a home mostra o que é de cada pessoa) ──
  const editaPei = canAccessModule("can_pei");
  const memberId = memberIdDaSessao(sessionNonNull);
  const hoje = hojeBrasilia();
  let estudantes: Student[] = [];
  let pendencias: Pendencia[] = [];
  let peisVigentes = 0;
  let peisDesatualizados = 0;
  let diario7d = 0;
  let processualCount = 0;
  let familyModuleEnabled = false;
  try {
    if (sessionNonNull.workspace_id && !sessionNonNull.is_platform_admin) {
      const sb = getSupabase();
      const wid = sessionNonNull.workspace_id;
      estudantes = await listStudentsDaSessao(sessionNonNull);

      const valendo = estudantes.filter((e) => {
        const v = (e.pei_data as Record<string, unknown> | undefined)?.vigencia as Vigencia | undefined;
        return v && (v.status === "vigente" || v.status === "em_revisao") && v.versao > 0;
      });
      peisVigentes = valendo.length;
      peisDesatualizados = valendo.filter((e) => {
        const v = (e.pei_data as Record<string, unknown>).vigencia as Vigencia;
        return v.status === "vigente" && v.proxima_revisao && v.proxima_revisao < hoje;
      }).length;

      // Ciência: só para quem é profissional da escola (tem membro); a coordenação sem membro não dá ciência
      let cientes: Set<string> | null = null;
      if (memberId && sessionNonNull.user_role === "member" && valendo.length > 0) {
        const { data } = await sb
          .from("pei_ciencias")
          .select("student_id, versao")
          .eq("workspace_id", wid)
          .eq("member_id", memberId)
          .in("student_id", valendo.map((e) => e.id));
        cientes = new Set((data || []).map((c: { student_id: string; versao: number }) => `${c.student_id}:${c.versao}`));
      }
      pendencias = pendenciasDoInicio(estudantes, { editaPei, cientes, hoje });

      const [diarioRes, wsData] = await Promise.all([
        sb.from("diario_registros").select("id", { count: "exact", head: true }).eq("workspace_id", wid)
          .gte("criado_em", new Date(Date.now() - 7 * 86400000).toISOString()),
        sb.from("workspaces").select("family_module_enabled").eq("id", wid).maybeSingle(),
      ]);
      diario7d = diarioRes.count || 0;
      familyModuleEnabled = Boolean((wsData.data as { family_module_enabled?: boolean } | null)?.family_module_enabled);
      try {
        const processualRes = await sb.from("avaliacao_processual")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", wid)
          .eq("ano_letivo", new Date().getFullYear());
        processualCount = processualRes.count || 0;
      } catch { /* tabela pode não existir */ }
    }
  } catch (err) {
    logger.error({ err }, "[RootPage] erro ao montar o início");
  }

  // ── Módulos, nas cores dos seis círculos (design system: CartaoModulo) ──
  type Mod = CartaoDeModulo & { permission?: string };
  const n = estudantes.length;
  const acompanhar: Mod[] = [
    { href: "/estudantes", icone: "users", cor: "pei", titulo: "Estudantes", descricao: "Cadastro, turma e acompanhamento de cada estudante.", permission: "can_estudantes",
      selo: n ? { texto: `${n} no vínculo`, tipo: "neutro" } : undefined },
    { href: "/pei", icone: "fileText", cor: "pei", titulo: "PEI", descricao: "Estudo de caso, PEI com IA, versões, ciência e revisões.", permission: "can_pei",
      selo: peisDesatualizados ? { texto: `${peisDesatualizados} com revisão vencida`, tipo: "atencao" } : peisVigentes ? { texto: `${peisVigentes} vigentes`, tipo: "neutro" } : undefined },
    { href: "/pei-regente", icone: "bookOpen", cor: "pei", titulo: "PEI do professor", descricao: "Ler o PEI, dar ciência e fazer a parte da sua disciplina.", permission: "can_pei_professor" },
    { href: "/paee", icone: "layers", cor: "paee", titulo: "PAEE", descricao: "Atendimento Educacional Especializado e sala de recursos.", permission: "can_paee" },
    { href: "/diario", icone: "notebookPen", cor: "diario", titulo: "Diário de bordo", descricao: "Observações, evidências e intervenções do dia a dia.", permission: "can_diario",
      selo: n ? { texto: `${diario7d} esta semana`, tipo: "neutro" } : undefined },
    ...(familyModuleEnabled
      ? [{ href: "/estudantes", icone: "heartHandshake", cor: "diario", titulo: "Família", descricao: "Responsáveis com acesso ao PEI e à evolução.", permission: "can_estudantes" } as Mod]
      : []),
  ];
  const planejar: Mod[] = [
    { href: "/hub", icone: "sparkles", cor: "hub", titulo: "Hub de recursos", descricao: "Ferramentas de IA para criar e adaptar materiais.", permission: "can_hub" },
    { href: "/plano-curso", icone: "bookMarked", cor: "hub", titulo: "Plano de curso", descricao: "Planejamento por componente curricular e série.", permission: "can_pei_professor" },
    { href: "/avaliacao-diagnostica", icone: "brain", cor: "hub", titulo: "Avaliação diagnóstica", descricao: "Questões com IA para conhecer o ponto de partida.", permission: "can_pei_professor" },
    { href: "/avaliacao-processual", icone: "chartLine", cor: "monitoramento", titulo: "Avaliação processual", descricao: "A evolução do estudante ao longo do ano.", permission: "can_pei_professor",
      selo: processualCount ? { texto: `${processualCount} registros`, tipo: "neutro" } : undefined },
    { href: "/monitoramento", icone: "chartLine", cor: "monitoramento", titulo: "Evolução e dados", descricao: "Indicadores e relatórios de progresso.", permission: "can_avaliacao" },
  ];
  const gestao: Mod[] = [
    { href: "/pgi", icone: "clipboardList", cor: "gestao", titulo: "PGI", descricao: "Plano de Gestão Inclusiva da escola.", permission: "can_gestao" },
    { href: "/infos", icone: "library", cor: "gestao", titulo: "Central de inteligência", descricao: "Fundamentos pedagógicos, legislação e referências.", permission: "can_gestao" },
    { href: "/gestao", icone: "userCog", cor: "gestao", titulo: "Equipe e papéis", descricao: "Profissionais, papéis, permissões e vínculos.", permission: "can_gestao" },
    { href: "/config-escola", icone: "school", cor: "gestao", titulo: "Configuração da escola", descricao: "Ano letivo, séries, turmas e modo da escola.", permission: "can_gestao" },
    ...(sessionNonNull.is_platform_admin
      ? [{ href: "/admin", icone: "settings", cor: "gestao", titulo: "Administração", descricao: "Escolas e configurações da plataforma." } as Mod]
      : []),
  ];
  const so = (lista: Mod[]): CartaoDeModulo[] =>
    lista.filter((m) => canAccessModule(m.permission)).map(({ permission: _p, ...m }) => m);
  const grupos: GrupoDeModulos[] = [
    { titulo: "Acompanhar o estudante", modulos: so(acompanhar) },
    { titulo: "Planejar e avaliar", modulos: so(planejar) },
    { titulo: "Gestão da escola", modulos: so(gestao) },
  ];

  // ── Atalhos para as ferramentas mais usadas ──
  const atalhos: Atalho[] = [
    ...(canAccessModule("can_hub")
      ? ([
          { href: "/hub?tool=adaptar-atividade", rotulo: "Adaptar atividade", icone: "sparkles" },
          { href: "/hub?tool=adaptar-prova", rotulo: "Adaptar prova", icone: "fileText" },
          { href: "/hub?tool=criar-zero", rotulo: "Criar questões", icone: "brain" },
          { href: "/hub?tool=plano-aula", rotulo: "Plano de aula (DUA)", icone: "bookMarked" },
        ] as Atalho[])
      : []),
    ...(canAccessModule("can_diario") ? ([{ href: "/diario?tab=novo", rotulo: "Novo registro no diário", icone: "notebookPen" }] as Atalho[]) : []),
  ];

  const atencao = pedemAtencao(pendencias);
  const contexto = sessionNonNull.is_platform_admin && !sessionNonNull.workspace_id
    ? "Administração da plataforma"
    : [
        `${n} ${n === 1 ? "estudante" : "estudantes"} ${sessionNonNull.user_role === "member" ? "no seu vínculo" : "na escola"}`,
        peisVigentes ? `${peisVigentes} ${peisVigentes === 1 ? "PEI vigente" : "PEIs vigentes"}` : null,
        atencao ? `${atencao} ${atencao === 1 ? "pede" : "pedem"} sua atenção` : "nada pendente",
      ].filter(Boolean).join(" · ");
  const nomePessoa = primeiroNome(sessionNonNull.simulating_member_name || sessionNonNull.usuario_nome);

  return (
    <div className="min-h-screen" style={{ background: "var(--fundo)" }}>
      <SimulationBanner session={sessionNonNull} />
      <Navbar session={sessionNonNull} hideMenu={true} />
      <Inicio
        saudacao={saudacao()}
        nome={nomePessoa}
        escola={sessionNonNull.simulating_workspace_name || sessionNonNull.workspace_name || "Omnisfera"}
        data={dataPorExtenso()}
        contexto={contexto}
        pendencias={pendencias}
        totalPendencias={pendencias.length}
        grupos={grupos}
        atalhos={atalhos}
        novidades={<OmnisferaFeed />}
        rodape={
          <footer className="omni-cartao" style={{ padding: "var(--space-5) var(--space-6)" }}>
            <OmniEducacaoSignature variant="full" />
          </footer>
        }
      />
      <TermsOfUseModal session={sessionNonNull} />
    </div>
  );
}
