import { getSession } from "@/lib/session";
import Link from "next/link";

export default async function HomePage() {
  const session = await getSession();
  const saudacao =
    new Date().getHours() >= 5 && new Date().getHours() < 12
      ? "Bom dia"
      : "Boa tarde";
  const userFirst = (session?.usuario_nome || "Visitante").split(" ")[0];

  const modules = [
    {
      href: "/estudantes",
      icon: "👥",
      title: "Estudantes",
      desc: "Cadastro e gestão de estudantes em inclusão",
      color: "sky",
    },
    {
      href: "/hub",
      icon: "🚀",
      title: "Hub de Recursos",
      desc: "Adaptar provas, atividades e criar do zero",
      color: "cyan",
    },
    {
      href: "/pei",
      icon: "📘",
      title: "PEI",
      desc: "Plano de Ensino Individualizado",
      color: "blue",
    },
    {
      href: "/paee",
      icon: "🧩",
      title: "PAEE",
      desc: "Plano de Atendimento Educacional Especializado",
      color: "violet",
    },
    {
      href: "/diario",
      icon: "📝",
      title: "Diário de Bordo",
      desc: "Registro de atendimentos",
      color: "rose",
    },
    {
      href: "/monitoramento",
      icon: "📊",
      title: "Monitoramento",
      desc: "Evolução e dados",
      color: "slate",
    },
    {
      href: "/config-escola",
      icon: "🏫",
      title: "Config Escola",
      desc: "Ano letivo, séries e turmas",
      color: "slate",
    },
    {
      href: "/pgi",
      icon: "📋",
      title: "PGI",
      desc: "Plano de Gestão Inclusiva (5W2H)",
      color: "slate",
    },
  ];

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
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-2xl backdrop-blur">
            ✨
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
        {modules.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className={`block p-5 rounded-xl border bg-gradient-to-br ${colorClasses[m.color]} transition-all shadow-sm`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-white/80 flex items-center justify-center text-xl shadow-sm">
                {m.icon}
              </div>
              <div>
                <span className="font-semibold text-slate-800">{m.title}</span>
                <p className="text-sm text-slate-600 mt-1">{m.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
        <p className="text-sm text-slate-600">
          <strong>Omnisfera</strong> — Plataforma de inclusão educacional.
          Legislação: Decretos 12.686/2025 e 12.773/2025. Alinhada à BNCC.
        </p>
      </div>
    </div>
  );
}
