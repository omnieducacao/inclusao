import { getSession } from "@/lib/session";
import Link from "next/link";
import { Suspense } from "react";
import { InfosClient } from "@/app/(dashboard)/infos/InfosClient";
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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export default async function HomePage() {
  const session = await getSession();
  const saudacao =
    new Date().getHours() >= 5 && new Date().getHours() < 12
      ? "Bom dia"
      : "Boa tarde";
  const userFirst = (session?.usuario_nome || "Visitante").split(" ")[0];

  const modules: Array<{
    href: string;
    icon: LucideIcon;
    title: string;
    desc: string;
    color: string;
  }> = [
    {
      href: "/estudantes",
      icon: Users,
      title: "Estudantes",
      desc: "Cadastro e gestão de estudantes em inclusão",
      color: "sky",
    },
    {
      href: "/hub",
      icon: Rocket,
      title: "Hub de Recursos",
      desc: "Adaptar provas, atividades e criar do zero",
      color: "cyan",
    },
    {
      href: "/pei",
      icon: FileText,
      title: "PEI",
      desc: "Plano de Ensino Individualizado",
      color: "blue",
    },
    {
      href: "/paee",
      icon: Puzzle,
      title: "PAEE",
      desc: "Plano de Atendimento Educacional Especializado",
      color: "violet",
    },
    {
      href: "/diario",
      icon: BookOpen,
      title: "Diário de Bordo",
      desc: "Registro de atendimentos",
      color: "rose",
    },
    {
      href: "/monitoramento",
      icon: BarChart3,
      title: "Monitoramento",
      desc: "Evolução e dados",
      color: "slate",
    },
    {
      href: "/config-escola",
      icon: School,
      title: "Config Escola",
      desc: "Ano letivo, séries e turmas",
      color: "slate",
    },
    {
      href: "/pgi",
      icon: ClipboardList,
      title: "PGI",
      desc: "Plano de Gestão Inclusiva (5W2H)",
      color: "slate",
    },
    {
      href: "/infos",
      icon: BookMarked,
      title: "Central de Inteligência",
      desc: "Fundamentos, legislação e ferramentas práticas",
      color: "blue",
    },
  ];

  if (session?.is_platform_admin) {
    modules.push({
      href: "/admin",
      icon: Settings,
      title: "Admin Plataforma",
      desc: "Gerenciamento completo da plataforma",
      color: "slate",
    });
  }

  const colorClasses: Record<string, string> = {
    sky: "from-sky-50 to-white border-sky-100 hover:border-sky-200 hover:bg-sky-50/50",
    cyan: "from-cyan-50 to-white border-cyan-100 hover:border-cyan-200 hover:bg-cyan-50/50",
    blue: "from-blue-50 to-white border-blue-100 hover:border-blue-200 hover:bg-blue-50/50",
    violet: "from-violet-50 to-white border-violet-100 hover:border-violet-200 hover:bg-violet-50/50",
    rose: "from-rose-50 to-white border-rose-100 hover:border-rose-200 hover:bg-rose-50/50",
    slate: "from-slate-50 to-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50",
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <div className="flex items-center gap-6 h-36 px-6 bg-gradient-to-r from-blue-600 to-sky-600">
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur shadow-lg">
            <Sparkles className="w-7 h-7 text-white" />
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.href}
              href={m.href}
              className={`group block p-5 rounded-xl border bg-gradient-to-br ${colorClasses[m.color]} transition-all shadow-sm hover:shadow-md`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-white/80 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-slate-700" />
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-slate-800 block">{m.title}</span>
                  <p className="text-sm text-slate-600 mt-1">{m.desc}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
        <p className="text-sm text-slate-600">
          <strong>Omnisfera</strong> — Plataforma de inclusão educacional.
          Legislação: Decretos 12.686/2025 e 12.773/2025. Alinhada à BNCC.
        </p>
      </div>

      {/* Central de Inteligência Inclusiva */}
      <div className="mt-12">
        <Suspense fallback={<div className="text-slate-500 p-4 flex items-center gap-2"><div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div> Carregando Central de Inteligência...</div>}>
          <InfosClient session={session} />
        </Suspense>
      </div>
    </div>
  );
}
