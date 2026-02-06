import { getSession } from "@/lib/session";
import { listStudents } from "@/lib/students";
import Link from "next/link";

export default async function EstudantesPage() {
  const session = await getSession();
  const workspaceId = session?.workspace_id;
  const students = workspaceId ? await listStudents(workspaceId) : [];

  const saudacao =
    new Date().getHours() >= 5 && new Date().getHours() < 12
      ? "Bom dia"
      : "Boa tarde";
  const userFirst = (session?.usuario_nome || "Visitante").split(" ")[0];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <div className="flex items-center gap-4 h-28 px-6 bg-gradient-to-r from-sky-50 to-white border-b border-slate-100">
          <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 text-xl">
            👥
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">
              Gestão de Estudantes
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {saudacao}, <strong>{userFirst}</strong>! Gerencie os dados dos
              estudantes vinculados aos PEIs neste workspace.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <input
            type="search"
            placeholder="Buscar por nome..."
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm w-64 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
          />
          <div className="flex gap-2">
            <Link
              href="/pei"
              className="px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 transition-colors"
            >
              Ir para PEI
            </Link>
            <Link
              href="/"
              className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Voltar
            </Link>
          </div>
        </div>

        {students.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-slate-600 font-medium">
              Nenhum estudante encontrado
            </p>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              Para começar, crie um PEI no módulo Estratégias &amp; PEI — o
              estudante é cadastrado junto com o plano.
            </p>
            <div className="mt-6 flex gap-3 justify-center">
              <Link
                href="/pei"
                className="px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700"
              >
                Ir para Estratégias & PEI
              </Link>
              <Link
                href="/"
                className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
              >
                Página Inicial
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {students.map((s) => {
              const peiData = (s.pei_data || {}) as Record<string, unknown>;
              const paeeCiclos = (s.paee_ciclos || []) as unknown[];
              const temRelatorio = Boolean(
                (peiData?.ia_sugestao as string)?.trim()
              );
              const temJornada = Boolean(
                (peiData?.ia_mapa_texto as string)?.trim()
              );
              const nCiclos = paeeCiclos.length;

              return (
                <div
                  key={s.id}
                  className="p-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {s.name || "—"}
                      </h3>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sky-50 text-sky-700 border border-sky-100">
                          {s.grade || "—"}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {s.class_group || "—"}
                        </span>
                        {temRelatorio && (
                          <span className="text-xs text-amber-600">📄 PEI</span>
                        )}
                        {temJornada && (
                          <span className="text-xs text-violet-600">
                            🗺️ Jornada
                          </span>
                        )}
                        {nCiclos > 0 && (
                          <span className="text-xs text-slate-500">
                            {nCiclos} ciclo(s) PAEE
                          </span>
                        )}
                      </div>
                      {s.diagnosis && (
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                          Contexto (equipe): {s.diagnosis}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link
                        href={`/pei?student=${s.id}`}
                        className="px-3 py-1.5 text-sm font-medium text-sky-600 hover:bg-sky-50 rounded-lg"
                      >
                        PEI
                      </Link>
                      <Link
                        href={`/paee?student=${s.id}`}
                        className="px-3 py-1.5 text-sm font-medium text-violet-600 hover:bg-violet-50 rounded-lg"
                      >
                        PAEE
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <p className="text-xs text-slate-400">
        Dados sensíveis: uso exclusivo da equipe pedagógica. Não compartilhar
        com estudantes ou famílias.
      </p>
    </div>
  );
}
