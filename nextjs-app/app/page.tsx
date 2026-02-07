import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Navbar } from "@/components/Navbar";
import { AIEnginesBadge } from "@/components/AIEnginesBadge";
import { getColorClasses, colorPalette } from "@/lib/colors";
import Link from "next/link";
import {
  Users,
  Rocket,
  FileText,
  Puzzle,
  BookOpen,
  BarChart3,
  School,
  ClipboardList,
  BookMarked,
  Settings,
  Sparkles,
  UserCog,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export default async function RootPage() {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }
  
  const saudacao =
    new Date().getHours() >= 5 && new Date().getHours() < 12
      ? "Bom dia"
      : "Boa tarde";
  const userFirst = (session?.usuario_nome || "Visitante").split(" ")[0];

  // Módulos principais - fluxo core do usuário
  const primaryModules: Array<{
    href: string;
    icon: LucideIcon;
    title: string;
    desc: string;
    color: string;
    badge?: string;
  }> = [
    {
      href: "/estudantes",
      icon: Users,
      title: "Estudantes",
      desc: "Gestão completa de estudantes, histórico e acompanhamento individualizado.",
      color: "sky",
    },
    {
      href: "/pei",
      icon: FileText,
      title: "Estratégias & PEI",
      desc: "Plano Educacional Individual com objetivos, avaliações e acompanhamento.",
      color: "blue",
    },
    {
      href: "/paee",
      icon: Puzzle,
      title: "Plano de Ação / PAEE",
      desc: "Plano de Atendimento Educacional Especializado e sala de recursos.",
      color: "violet",
    },
  ];

  // Módulos de apoio e recursos
  const supportModules: Array<{
    href: string;
    icon: LucideIcon;
    title: string;
    desc: string;
    color: string;
  }> = [
    {
      href: "/hub",
      icon: Rocket,
      title: "Hub de Recursos",
      desc: "Biblioteca de materiais, modelos e inteligência artificial para apoio.",
      color: "cyan",
    },
    {
      href: "/diario",
      icon: BookOpen,
      title: "Diário de Bordo",
      desc: "Registro diário de observações, evidências e intervenções.",
      color: "rose",
    },
    {
      href: "/monitoramento",
      icon: BarChart3,
      title: "Evolução & Dados",
      desc: "Indicadores, gráficos e relatórios de progresso dos estudantes.",
      color: "slate",
    },
  ];

  // Central de Inteligência - destaque especial
  const intelligenceModule = {
    href: "/infos",
    icon: BookMarked,
    title: "Central de Inteligência",
    desc: "Fundamentos pedagógicos, legislação atualizada e ferramentas práticas para educação inclusiva.",
    color: "table",
  };

  // Módulos administrativos
  const adminModules: Array<{
    href: string;
    icon: LucideIcon;
    title: string;
    desc: string;
    color: string;
  }> = [
    {
      href: "/gestao",
      icon: UserCog,
      title: "Gestão de Usuários",
      desc: "Cadastrar usuários, atribuir permissões e vínculos com estudantes.",
      color: "test",
    },
    {
      href: "/pgi",
      icon: ClipboardList,
      title: "PGI",
      desc: "Plano de Gestão Inclusiva. Estruture infraestrutura, formação e recursos da escola.",
      color: "presentation",
    },
    {
      href: "/config-escola",
      icon: School,
      title: "Configuração Escola",
      desc: "Ano letivo, séries e turmas. Configure antes de cadastrar professores.",
      color: "reports",
    },
  ];

  if (session?.is_platform_admin) {
    adminModules.push({
      href: "/admin",
      icon: Settings,
      title: "Admin Plataforma",
      desc: "Gerenciamento completo da plataforma",
      color: "reports",
    });
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-sky-50/20">
      <Navbar session={session} hideMenu={true} />
      <main className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-lg">
            <div className="flex items-center gap-6 h-36 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
              <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur shadow-xl relative z-10" style={{ animation: 'float 6s ease-in-out infinite' }}>
                <Sparkles className="w-8 h-8 text-white" />
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
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-600" />
              Módulos Principais
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {primaryModules.map((m) => {
                const Icon = m.icon;
                const colors = getColorClasses(m.color);
                return (
                  <Link
                    key={m.href}
                    href={m.href}
                    className="group relative block p-6 rounded-xl border-2 border-slate-200 transition-all duration-300 shadow-sm hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1"
                    style={{ backgroundColor: colors.bg }}
                  >
                    {m.badge && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full shadow-sm">
                        {m.badge}
                      </span>
                    )}
                    <div className="flex items-start gap-5">
                      <Icon 
                        className="w-14 h-14 flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" 
                        style={{ color: colors.icon }}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-bold block text-lg transition-colors" style={{ color: colors.text }}>{m.title}</span>
                        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{m.desc}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Módulos de Apoio */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-cyan-600" />
              Recursos e Acompanhamento
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {supportModules.map((m) => {
                const Icon = m.icon;
                const colors = getColorClasses(m.color);
                return (
                  <Link
                    key={m.href}
                    href={m.href}
                    className="group block p-5 rounded-xl border-2 border-slate-200 transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-[1.02]"
                    style={{ backgroundColor: colors.bg }}
                  >
                    <div className="flex items-start gap-5">
                      <Icon 
                        className="w-14 h-14 flex-shrink-0 group-hover:scale-110 transition-all duration-300" 
                        style={{ color: colors.icon }}
                      />
                      <div className="flex-1">
                        <span className="font-bold block text-lg" style={{ color: colors.text }}>{m.title}</span>
                        <p className="text-sm text-slate-600 mt-1.5">{m.desc}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Módulos Administrativos */}
          {adminModules.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-600" />
                Configuração e Gestão
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {adminModules.map((m) => {
                  const Icon = m.icon;
                  const colors = getColorClasses(m.color);
                  return (
                    <Link
                      key={m.href}
                      href={m.href}
                      className="group block p-5 rounded-xl border-2 border-slate-200 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.01]"
                      style={{ backgroundColor: colors.bg }}
                    >
                      <div className="flex items-start gap-5">
                        <Icon 
                          className="w-14 h-14 flex-shrink-0 group-hover:scale-110 transition-all duration-300" 
                          style={{ color: colors.icon }}
                        />
                        <div className="flex-1">
                          <span className="font-bold block text-lg" style={{ color: colors.text }}>{m.title}</span>
                          <p className="text-sm text-slate-600 mt-1.5">{m.desc}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Central de Inteligência - Destaque Especial */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-purple-600" />
              Conhecimento e Referência
            </h2>
            <Link
              href={intelligenceModule.href}
              className="group relative block p-8 rounded-2xl border-2 border-slate-200 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-[1.01] hover:border-slate-300 overflow-hidden"
              style={{ backgroundColor: colorPalette.table.bg }}
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{ background: `linear-gradient(to right, ${colorPalette.table.icon}15, transparent, ${colorPalette.table.icon}15)` }}></div>
              <div className="relative flex items-start gap-6">
                <BookMarked 
                  className="w-16 h-16 flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" 
                  style={{ color: colorPalette.table.icon }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-2xl transition-colors" style={{ color: colorPalette.table.text }}>
                      {intelligenceModule.title}
                    </span>
                    <span className="px-3 py-1 text-xs font-bold text-white rounded-full shadow-sm" style={{ backgroundColor: colorPalette.table.icon }}>
                      Novo
                    </span>
                  </div>
                  <p className="text-base text-slate-700 leading-relaxed font-medium">
                    {intelligenceModule.desc}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all" style={{ color: colorPalette.table.icon }}>
                    <span>Explorar recursos</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

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
