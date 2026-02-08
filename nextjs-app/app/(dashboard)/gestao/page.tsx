import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { GestaoClient } from "./GestaoClient";

export default function GestaoPage() {
  return (
    <div className="space-y-6">
      <PageHero
        iconName="Settings"
        title="Gestão de Usuários"
        desc="Membros e permissões do workspace."
        color="slate"
        useLottie={true}
      />
      <Suspense fallback={<div className="text-slate-500">Carregando…</div>}>
        <GestaoClient />
      </Suspense>
    </div>
  );
}
