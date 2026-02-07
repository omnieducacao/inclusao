import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Navbar } from "@/components/Navbar";
import { AIEnginesBadge } from "@/components/AIEnginesBadge";
import { ModuleCards, IntelligenceModuleCard } from "@/components/ModuleCards";
import { SparkleIcon } from "@/components/SparkleIcon";

export default async function RootPage() {
  const session = await getSession();
  
  // O middleware já redireciona para /login se não houver sessão
  // Mas garantimos que a sessão existe aqui também
  if (!session) {
    redirect("/login");
    return null; // TypeScript safety
  }
  
  const saudacao =
    new Date().getHours() >= 5 && new Date().getHours() < 12
      ? "Bom dia"
      : "Boa tarde";
  const userFirst = (session?.usuario_nome || "Visitante").split(" ")[0];

  // Módulos principais - fluxo core do usuário
  const primaryModules = [
    {
      href: "/estudantes",
      iconName: "UsersFour" as const,
      title: "Estudantes",
      desc: "Gestão completa de estudantes, histórico e acompanhamento individualizado.",
      color: "sky",
    },
    {
      href: "/pei",
      iconName: "FileText" as const,
      title: "Estratégias & PEI",
      desc: "Plano Educacional Individual com objetivos, avaliações e acompanhamento.",
      color: "blue",
    },
    {
      href: "/paee",
      iconName: "PuzzlePiece" as const,
      title: "Plano de Ação / PAEE",
      desc: "Plano de Atendimento Educacional Especializado e sala de recursos.",
      color: "violet",
    },
  ];

  // Módulos de apoio e recursos
  const supportModules = [
    {
      href: "/hub",
      iconName: "RocketLaunch" as const,
      title: "Hub de Recursos",
      desc: "Biblioteca de materiais, modelos e inteligência artificial para apoio.",
      color: "cyan",
    },
    {
      href: "/diario",
      iconName: "BookOpen" as const,
      title: "Diário de Bordo",
      desc: "Registro diário de observações, evidências e intervenções.",
      color: "rose",
    },
    {
      href: "/monitoramento",
      iconName: "ChartLineUp" as const,
      title: "Evolução & Dados",
      desc: "Indicadores, gráficos e relatórios de progresso dos estudantes.",
      color: "slate",
    },
  ];

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

  const adminModules = session?.is_platform_admin
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-sky-50/20">
      <Navbar session={session} hideMenu={true} />
      <main className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-lg">
            <div className="flex items-center gap-6 h-36 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
              <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur shadow-xl relative z-10" style={{ animation: 'float 6s ease-in-out infinite' }}>
                <SparkleIcon className="w-8 h-8 text-white" weight="fill" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {saudacao}, {userFirst}!
                </h1>
                <p className="text-blue-100 mt-1">
                  {session?.is_platform_admin
                    ? "Painel de administração da plataforma."
                    : `${session?.workspace_name} — Central de conhecimento e inclusão.`}
                </p>
              </div>
            </div>
          </div>

          {/* Módulos Principais - Fluxo Core */}
          <ModuleCards 
            modules={primaryModules} 
            title="Módulos Principais" 
            titleIconName="Sparkle"
            titleIconColor="text-sky-600"
          />

          {/* Módulos de Apoio */}
          <ModuleCards 
            modules={supportModules} 
            title="Recursos e Acompanhamento" 
            titleIconName="RocketLaunch"
            titleIconColor="text-cyan-600"
          />

          {/* Módulos Administrativos */}
          {adminModules.length > 0 && (
            <ModuleCards 
              modules={adminModules} 
              title="Configuração e Gestão" 
              titleIconName="Gear"
              titleIconColor="text-slate-600"
            />
          )}

          {/* Central de Inteligência - Destaque Especial */}
          <IntelligenceModuleCard 
            href={intelligenceModule.href}
            title={intelligenceModule.title}
            desc={intelligenceModule.desc}
          />

          <div className="rounded-xl border-2 border-slate-200 bg-slate-50/50 p-4">
            <p className="text-sm text-slate-600">
              <strong>Omnisfera</strong> — Plataforma de inclusão educacional.
              Legislação: Decretos 12.686/2025 e 12.773/2025. Alinhada à BNCC.
            </p>
          </div>
        </div>
      </main>
      <AIEnginesBadge />
    </div>
  );
}
