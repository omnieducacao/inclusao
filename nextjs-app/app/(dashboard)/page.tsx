import { getSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h1 className="text-xl font-bold text-slate-800">
        Bem-vindo, {session?.usuario_nome}
      </h1>
      <p className="text-slate-600 mt-1">
        {session?.is_platform_admin
          ? "Painel de administração da plataforma."
          : `${session?.workspace_name} — Central de conhecimento e inclusão.`}
      </p>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href="/estudantes"
          className="block p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
        >
          <span className="font-medium text-slate-800">Estudantes</span>
          <p className="text-sm text-slate-500 mt-1">
            Cadastro e gestão de estudantes em inclusão
          </p>
        </a>
        <a
          href="/hub"
          className="block p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
        >
          <span className="font-medium text-slate-800">Hub de Recursos</span>
          <p className="text-sm text-slate-500 mt-1">
            Adaptar provas, atividades e criar do zero
          </p>
        </a>
        <a
          href="/pei"
          className="block p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
        >
          <span className="font-medium text-slate-800">PEI</span>
          <p className="text-sm text-slate-500 mt-1">
            Plano de Ensino Individualizado
          </p>
        </a>
        <a
          href="/paee"
          className="block p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
        >
          <span className="font-medium text-slate-800">PAEE</span>
          <p className="text-sm text-slate-500 mt-1">
            Plano de Atendimento Educacional Especializado
          </p>
        </a>
      </div>
    </div>
  );
}
