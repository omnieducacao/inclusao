import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { PGIClient } from "./PGIClient";

export default function PGIPage() {
  return (
    <div className="space-y-6">
      <PageHero
        iconName="ClipboardList"
        title="Plano de Gestão Inclusiva — PGI"
        desc="Estruture o acolhimento antes da matrícula. Organize sua escola nos eixos de Infraestrutura, Equipe e Cultura."
        color="teal"
        useLottie={true}
      />
      <Suspense fallback={<div className="rounded-2xl bg-white animate-pulse min-h-[200px]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(226,232,240,0.6)' }} />}>
        <PGIClient />
      </Suspense>
    </div>
  );
}
