import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { BookMarked } from "lucide-react";

export default async function InfosPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <div className="flex items-center gap-6 h-36 px-6 bg-gradient-to-r from-blue-600 to-sky-600">
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur shadow-lg">
            <BookMarked className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              Central de Inteligência Inclusiva
            </h1>
            <p className="text-blue-100 mt-1">
              Fundamentos, legislação e ferramentas práticas
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <p className="text-slate-600">
          A Central de Inteligência Inclusiva está em desenvolvimento.
          <br />
          Em breve você terá acesso a fundamentos teóricos, legislação atualizada e ferramentas práticas.
        </p>
      </div>
    </div>
  );
}
