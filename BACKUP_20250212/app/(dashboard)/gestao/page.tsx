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
        color="blue"
        useLottie={true}
      />
      <Suspense fallback={<div className="rounded-2xl bg-white animate-pulse min-h-[200px]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(226,232,240,0.6)' }} />}>
        <GestaoClient />
      </Suspense>
    </div>
  );
}
