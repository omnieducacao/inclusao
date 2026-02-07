import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { ConfigEscolaClient } from "./ConfigEscolaClient";
import { School } from "lucide-react";

export default function ConfigEscolaPage() {
  return (
    <div className="space-y-6">
      <PageHero
        icon={School}
        title="Configuração da Escola"
        desc="Ano letivo, séries e turmas."
        color="slate"
      />
      <Suspense fallback={<div className="text-slate-500">Carregando…</div>}>
        <ConfigEscolaClient />
      </Suspense>
    </div>
  );
}
