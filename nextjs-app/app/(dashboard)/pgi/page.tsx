import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { PGIClient } from "./PGIClient";
import { ClipboardList } from "lucide-react";

export default function PGIPage() {
  return (
    <div className="space-y-6">
      <PageHero
        icon={ClipboardList}
        title="Plano de Gestão Inclusiva — PGI"
        desc="Estruture o acolhimento antes da matrícula. Organize sua escola nos eixos de Infraestrutura, Equipe e Cultura."
        color="teal"
      />
      <Suspense fallback={<div className="text-slate-500">Carregando…</div>}>
        <PGIClient />
      </Suspense>
    </div>
  );
}
