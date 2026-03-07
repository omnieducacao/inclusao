import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { PGIClient } from "./PGIClient";
import { Skeleton } from "@/components/Skeleton";

export default function PGIPage() {
  return (
    <div className="space-y-6">
      <PageHero moduleKey="pgi"
        title="Plano de Gestão Inclusiva — PGI"
        desc="Estruture o acolhimento antes da matrícula. Organize sua escola nos eixos de Infraestrutura, Equipe e Cultura."
      />
      <Suspense fallback={<Skeleton className="min-h-[200px] w-full rounded-2xl" />}>
        <PGIClient />
      </Suspense>
    </div>
  );
}
