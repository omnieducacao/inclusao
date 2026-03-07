import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { ConfigEscolaClient } from "./ConfigEscolaClient";
import { Skeleton } from "@/components/Skeleton";

export default function ConfigEscolaPage() {
  return (
    <div className="space-y-6">
      <PageHero moduleKey="cursos"
        title="Configuração da Escola"
        desc="Ano letivo, séries e turmas."
      />
      <Suspense fallback={<Skeleton className="min-h-[200px] w-full rounded-2xl" />}>
        <ConfigEscolaClient />
      </Suspense>
    </div>
  );
}
