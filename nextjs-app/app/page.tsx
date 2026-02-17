import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { Navbar } from "@/components/Navbar";
import { AIEnginesBadge } from "@/components/AIEnginesBadge";
import { ModuleCardsLottie, IntelligenceModuleCard } from "@/components/ModuleCardsLottie";
import { WelcomeHero } from "@/components/WelcomeHero";
import { TermsOfUseModal } from "@/components/TermsOfUseModal";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { SimulationBanner } from "@/components/SimulationBanner";
import { OmniEducacaoSignature } from "@/components/Footer";

export default async function RootPage() {
  const session = await getSession();

  // O middleware já redireciona para /login se não houver sessão
  // Mas garantimos que a sessão existe aqui também
  if (!session) {
    redirect("/login");
    return null; // TypeScript safety
  }

  // TypeScript agora sabe que session não é null após o check acima
  // Garantir que workspace_id existe para usuários não-admin
  if (!session.workspace_id && !session.is_platform_admin) {
    console.error("[RootPage] Usuário sem workspace:", session);
    redirect("/login?error=no_workspace");
    return null;
  }

  const sessionNonNull = session;

  const saudacao =
    new Date().getHours() >= 5 && new Date().getHours() < 12
      ? "Bom dia"
      : "Boa tarde";
  const userFirst = (sessionNonNull.usuario_nome || "Visitante").split(" ")[0];

  // Função para verificar permissão de acesso
  function canAccessModule(permission?: string): boolean {
    if (!permission) return true; // Sem permissão específica = acesso livre
    if (sessionNonNull.is_platform_admin) return true; // Admin tem acesso a tudo
    if (sessionNonNull.user_role === "master") return true; // Master tem acesso a tudo
    const member = sessionNonNull.member as Record<string, boolean> | undefined;
    if (!member) return false; // Sem member = sem acesso
    return member[permission] === true;
  }

  // Módulos principais - fluxo core do usuário (com permissões)
  const primaryModulesRaw = [
    {
      href: "/estudantes",
      iconName: "UsersFour" as const,
      title: "Estudantes",
      desc: "Gestão completa de estudantes, histórico e acompanhamento individualizado.",
      color: "sky",
      permission: "can_estudantes",
    },
    {
      href: "/pei",
      iconName: "Student" as const,
      title: "Estratégias & PEI",
      desc: "Plano Educacional Individual com objetivos, avaliações e acompanhamento.",
      color: "blue",
      permission: "can_pei",
    },
    {
      href: "/paee",
      iconName: "PuzzlePiece" as const,
      title: "Plano de Ação / PAEE",
      desc: "Plano de Atendimento Educacional Especializado e sala de recursos.",
      color: "violet",
      permission: "can_paee",
    },
  ];

  // Filtrar módulos baseado em permissões
  const primaryModules = primaryModulesRaw.filter((m) => canAccessModule(m.permission));

  // Módulos de apoio e recursos (com permissões)
  const supportModulesRaw = [
    {
      href: "/hub",
      iconName: "RocketLaunch" as const,
      title: "Hub de Recursos",
      desc: "Biblioteca de materiais, modelos e inteligência artificial para apoio.",
      color: "cyan",
      permission: "can_hub",
    },
    {
      href: "/diario",
      iconName: "BookOpen" as const,
      title: "Diário de Bordo",
      desc: "Registro diário de observações, evidências e intervenções.",
      color: "rose",
      permission: "can_diario",
    },
    {
      href: "/monitoramento",
      iconName: "ChartLineUp" as const,
      title: "Evolução & Dados",
      desc: "Indicadores, gráficos e relatórios de progresso dos estudantes.",
      color: "slate",
      permission: "can_avaliacao",
    },
  ];

  // Filtrar módulos baseado em permissões
  const supportModules = supportModulesRaw.filter((m) => canAccessModule(m.permission));

  // Central de Inteligência - destaque especial
  const intelligenceModule = {
    href: "/infos",
    title: "Central de Inteligência",
    desc: "Fundamentos pedagógicos, legislação atualizada e ferramentas práticas para educação inclusiva.",
  };

  // Módulos administrativos
  const adminModulesBase: Array<{
    href: string;
    iconName: string;
    title: string;
    desc: string;
    color: string;
  }> = [
      {
        href: "/gestao",
        iconName: "UsersThree",
        title: "Gestão de Usuários",
        desc: "Cadastrar usuários, atribuir permissões e vínculos com estudantes.",
        color: "test",
      },
      {
        href: "/pgi",
        iconName: "ClipboardText",
        title: "PGI",
        desc: "Plano de Gestão Inclusiva. Estruture infraestrutura, formação e recursos da escola.",
        color: "presentation",
      },
      {
        href: "/config-escola",
        iconName: "GraduationCap",
        title: "Configuração Escola",
        desc: "Ano letivo, séries e turmas. Configure antes de cadastrar professores.",
        color: "reports",
      },
    ];

  const adminModules = sessionNonNull.is_platform_admin
    ? [
      ...adminModulesBase,
      {
        href: "/admin",
        iconName: "Gear",
        title: "Admin Plataforma",
        desc: "Gerenciamento completo da plataforma",
        color: "reports",
      },
    ]
    : adminModulesBase;


  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, var(--bg-primary), var(--bg-gradient-via), var(--bg-gradient-to))' }}>
      <SimulationBanner session={sessionNonNull} />
      <Navbar session={sessionNonNull} hideMenu={true} />
      <main className="max-w-[1600px] mx-auto px-8 py-8">
        <div className="space-y-8">
          {/* Módulos Principais - Fluxo Core */}
          {primaryModules.length > 0 && (
            <Suspense fallback={<div className="h-[120px] bg-white rounded-2xl animate-pulse" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} />}>
              <ModuleCardsLottie
                modules={primaryModules.map(({ permission, ...rest }) => rest)}
                title="Módulos Principais"
                titleIconName="Sparkle"
                titleIconColor="text-sky-600"
                useLottieOnHover={true}
                useLottieByDefault={true}
              />
            </Suspense>
          )}

          {/* Módulos de Apoio */}
          {supportModules.length > 0 && (
            <Suspense fallback={<div className="h-[120px] bg-white rounded-2xl animate-pulse" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} />}>
              <ModuleCardsLottie
                modules={supportModules.map(({ permission, ...rest }) => rest)}
                title="Recursos e Acompanhamento"
                titleIconName="RocketLaunch"
                titleIconColor="text-cyan-600"
                useLottieOnHover={true}
                useLottieByDefault={true}
              />
            </Suspense>
          )}

          {/* Módulos Administrativos */}
          {adminModules.length > 0 && canAccessModule("can_gestao") && (
            <Suspense fallback={<div className="h-[120px] bg-white rounded-2xl animate-pulse" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} />}>
              <ModuleCardsLottie
                modules={adminModules}
                title="Configuração e Gestão"
                titleIconName="Gear"
                titleIconColor="text-slate-600"
                useLottieOnHover={true}
                useLottieByDefault={true}
              />
            </Suspense>
          )}

          {/* Central de Inteligência - Destaque Especial (sempre visível) */}
          <Suspense fallback={<div className="h-[120px] bg-white rounded-2xl animate-pulse" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} />}>
            <IntelligenceModuleCard
              href={intelligenceModule.href}
              title={intelligenceModule.title}
              desc={intelligenceModule.desc}
            />
          </Suspense>

          <footer className="rounded-2xl overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-default)' }}>
            <div className="px-6 py-5" style={{ background: 'linear-gradient(to right, var(--bg-secondary), var(--bg-tertiary))', borderTop: '1px solid var(--border-default)' }}>
              <OmniEducacaoSignature variant="compact" />
            </div>
          </footer>
        </div>
      </main>
      <AIEnginesBadge />
      <TermsOfUseModal session={sessionNonNull} />
    </div>
  );
}
