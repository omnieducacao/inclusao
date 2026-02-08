import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { BookMarked } from "lucide-react";
import InfosClient from "./InfosClient";

export default async function InfosPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/50 overflow-hidden bg-white shadow-sm">
        <div className="flex items-center gap-6 h-36 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur shadow-lg relative z-10">
            <BookMarked className="w-7 h-7 text-white" />
          </div>
          <div className="relative z-10">
            <h1 className="text-xl font-bold text-white">
              Central de Inteligência Inclusiva
            </h1>
            <p className="text-blue-100 mt-1">
              Fundamentos Pedagógicos, Marcos Legais e Ferramentas Práticas.
            </p>
          </div>
        </div>
      </div>

      <InfosClient />
    </div>
  );
}
