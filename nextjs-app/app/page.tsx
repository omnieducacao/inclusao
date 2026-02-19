import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { AIEnginesBadge } from "@/components/AIEnginesBadge";
import { getEngineError } from "@/lib/ai-engines";
import type { EngineId } from "@/lib/ai-engines";
import { ModuleCardsLottie } from "@/components/ModuleCardsLottie";
import { TermsOfUseModal } from "@/components/TermsOfUseModal";
import { SimulationBanner } from "@/components/SimulationBanner";
import { QuickActions } from "@/components/QuickActions";
import { SituationPanel } from "@/components/SituationPanel";
import { OmnisferaFeed } from "@/components/OmnisferaFeed";
import { OmniEducacaoSignature } from "@/components/Footer";
import { SecurityAndAIPanel } from "@/components/SecurityAndAIPanel";

export default async function RootPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
    return null;
  }

  if (!session.workspace_id && !session.is_platform_admin) {
    console.error("[RootPage] Usuário sem workspace:", session);
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

  // ── Fetch KPIs for smart badges ──
  type BadgeInfo = { text: string; variant: "green" | "yellow" | "red" | "gray" };
  let kpiBadges: Record<string, BadgeInfo> = {};
  try {
    if (sessionNonNull.workspace_id && !sessionNonNull.is_platform_admin) {
      const sb = getSupabase();
      const wid = sessionNonNull.workspace_id;

      const [studentsRes, peiRes, diarioRes] = await Promise.all([
        sb.from("students").select("id", { count: "exact", head: true }).eq("workspace_id", wid),
        sb.from("students").select("id, updated_at").eq("workspace_id", wid).not("pei_data", "is", null),
        sb.from("diario_registros").select("id", { count: "exact", head: true }).eq("workspace_id", wid)
          .gte("criado_em", new Date(Date.now() - 7 * 86400000).toISOString()),
      ]);

      const totalStudents = studentsRes.count || 0;
      const peiStudents = peiRes.data || [];
      const peiTotal = peiStudents.length;
      const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000);
      const peiStale = peiStudents.filter(s => s.updated_at && new Date(s.updated_at) < sixtyDaysAgo).length;
      const diario7d = diarioRes.count || 0;
      const peiCoverage = totalStudents > 0 ? Math.round((peiTotal / totalStudents) * 100) : 0;

      kpiBadges["Estudantes"] = { text: `${totalStudents} aluno${totalStudents !== 1 ? "s" : ""}`, variant: "green" };

      if (peiStale > 0) {
        kpiBadges["Estratégias & PEI"] = { text: `⚠ ${peiStale} desatualizado${peiStale > 1 ? "s" : ""}`, variant: peiStale > 2 ? "red" : "yellow" };
      } else if (peiTotal > 0) {
        kpiBadges["Estratégias & PEI"] = { text: `${peiTotal}/${totalStudents} PEIs`, variant: "green" };
      }

      if (diario7d === 0 && totalStudents > 0) {
        kpiBadges["Diário de Bordo"] = { text: "0 esta semana", variant: "gray" };
      } else if (diario7d > 0) {
        kpiBadges["Diário de Bordo"] = { text: `${diario7d} esta semana`, variant: "green" };
      }

      if (totalStudents > 0) {
        kpiBadges["Evolução & Dados"] = {
          text: `${peiCoverage}% cobertura`,
          variant: peiCoverage >= 80 ? "green" : peiCoverage >= 50 ? "yellow" : "red",
        };
      }
    }
  } catch (err) {
    console.error("[RootPage] KPI fetch error:", err);
  }

  // ── Row 1: Módulos Principais ──
  const row1Raw = [
    { href: "/estudantes", iconName: "UsersFour" as const, title: "Estudantes", desc: "Gestão completa de estudantes e acompanhamento.", color: "sky", permission: "can_estudantes", badge: kpiBadges["Estudantes"] },
    { href: "/pei", iconName: "Student" as const, title: "Estratégias & PEI", desc: "Plano Educacional Individual com IA e acompanhamento.", color: "blue", permission: "can_pei", badge: kpiBadges["Estratégias & PEI"] },
    { href: "/paee", iconName: "PuzzlePiece" as const, title: "Plano de Ação / PAEE", desc: "Atendimento Educacional Especializado e sala de recursos.", color: "violet", permission: "can_paee" },
    { href: "/hub", iconName: "RocketLaunch" as const, title: "Hub de Inclusão", desc: "Ferramentas de inteligência artificial para criar e adaptar.", color: "cyan", permission: "can_hub" },
  ];
  const row1 = row1Raw.filter((m) => canAccessModule(m.permission));

  // ── Row 2: Acompanhamento + Referência ──
  const row2Raw = [
    { href: "/diario", iconName: "BookOpen" as const, title: "Diário de Bordo", desc: "Registro de observações, evidências e intervenções.", color: "rose", permission: "can_diario", badge: kpiBadges["Diário de Bordo"] },
    { href: "/monitoramento", iconName: "ChartLineUp" as const, title: "Evolução & Dados", desc: "Indicadores e relatórios de progresso dos estudantes.", color: "slate", permission: "can_avaliacao", badge: kpiBadges["Evolução & Dados"] },
    { href: "/pgi", iconName: "ClipboardText" as const, title: "PGI", desc: "Plano de Gestão Inclusiva da escola.", color: "presentation", permission: "can_gestao" },
    { href: "/infos", iconName: "BookBookmark" as const, title: "Central de Inteligência", desc: "Fundamentos pedagógicos, legislação e ferramentas.", color: "table" },
  ];
  const row2 = row2Raw.filter((m) => !m.permission || canAccessModule(m.permission));

  // ── Row 3: Gestão e Configuração ──
  const row3Raw: Array<{ href: string; iconName: string; title: string; desc: string; color: string; permission?: string }> = [
    { href: "/gestao", iconName: "UsersThree", title: "Gestão de Usuários", desc: "Cadastrar usuários, permissões e vínculos.", color: "test", permission: "can_gestao" },
    { href: "/config-escola", iconName: "GraduationCap", title: "Configuração Escola", desc: "Ano letivo, séries e turmas.", color: "reports", permission: "can_gestao" },
  ];
  const row3Base = sessionNonNull.is_platform_admin
    ? [...row3Raw, { href: "/admin", iconName: "Gear", title: "Admin Plataforma", desc: "Gerenciamento completo da plataforma", color: "reports" }]
    : row3Raw;
  const row3 = row3Base.filter((m) => !m.permission || canAccessModule(m.permission));

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, var(--bg-primary), var(--bg-gradient-via), var(--bg-gradient-to))' }}>
      <SimulationBanner session={sessionNonNull} />
      <Navbar session={sessionNonNull} hideMenu={true} />
      <main className="max-w-[1600px] mx-auto px-6 sm:px-8 py-6 sm:py-8">

        {/* ── Two-column layout: Cards (left) + QuickActions & SituationPanel (right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* ═════ LEFT COLUMN: Module Cards ═════ */}
          <div className="lg:col-span-7 space-y-6 stagger-children">
            {row1.length > 0 && (
              <Suspense fallback={<div className="h-[100px] rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--bg-secondary)', boxShadow: 'var(--shadow-sm)' }} />}>
                <ModuleCardsLottie
                  modules={row1.map(({ permission, ...rest }) => rest)}
                  title="Módulos Principais"
                  titleIconName="Sparkle"
                  titleIconColor="text-sky-600"
                  useLottieOnHover={true}
                  useLottieByDefault={true}
                />
              </Suspense>
            )}

            {row2.length > 0 && (
              <Suspense fallback={<div className="h-[100px] rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--bg-secondary)', boxShadow: 'var(--shadow-sm)' }} />}>
                <ModuleCardsLottie
                  modules={row2.map(({ permission, ...rest }) => rest)}
                  title="Acompanhamento e Referência"
                  titleIconName="RocketLaunch"
                  titleIconColor="text-cyan-600"
                  useLottieOnHover={true}
                  useLottieByDefault={true}
                />
              </Suspense>
            )}

            {row3.length > 0 && (
              <Suspense fallback={<div className="h-[100px] rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--bg-secondary)', boxShadow: 'var(--shadow-sm)' }} />}>
                <ModuleCardsLottie
                  modules={row3.map(({ permission, ...rest }) => rest)}
                  title="Configuração e Gestão"
                  titleIconName="Gear"
                  titleIconColor="text-slate-600"
                  useLottieOnHover={true}
                  useLottieByDefault={true}
                />
              </Suspense>
            )}

            {/* ── Security & AI Engines Panel ── */}
            <SecurityAndAIPanel engines={["red", "blue", "green", "yellow", "orange"]} />
          </div>

          {/* ═════ RIGHT COLUMN: Quick Actions + Situation Panel ═════ */}
          <div className="lg:col-span-5 space-y-6 stagger-children">
            {/* Quick Actions — now integrated in sidebar */}
            <section className="relative z-20">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="premium-section-title" style={{ color: 'var(--text-secondary)' }}>
                  Acesso Rápido
                </h2>
              </div>
              <QuickActions session={sessionNonNull} />
            </section>

            {/* Situation Panel — Visão Geral | Alertas | Legislação */}
            <SituationPanel />

            {/* Feed Omnisfera — Posts, informativos, datas */}
            <OmnisferaFeed />
          </div>
        </div>

        {/* ── Full-width footer ── */}
        <footer className="sidebar-glass-card mt-12 overflow-hidden">
          <div className="h-[2px] w-full" style={{ background: 'linear-gradient(to right, #3b82f6, #6366f1, #8b5cf6, #ec4899, #6366f1, #3b82f6)' }} />
          <div className="px-6 py-3" style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-default)' }}>
            <p className="text-xs leading-relaxed text-center" style={{ color: 'var(--text-secondary)' }}>
              A plataforma utiliza motores de IA para apoiar sua prática. Essas ferramentas podem apresentar falhas. É fundamental{" "}
              <strong style={{ color: 'var(--text-primary)' }}>revisar sempre com muito cuidado</strong> todo conteúdo gerado.
            </p>
          </div>
          <div className="px-6 py-5" style={{ background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary), var(--bg-secondary))' }}>
            <OmniEducacaoSignature variant="full" />
          </div>
        </footer>
      </main>
      <AIEnginesBadge engines={["red", "blue", "green", "yellow", "orange"] as EngineId[]} />
      <TermsOfUseModal session={sessionNonNull} />
    </div>
  );
}

