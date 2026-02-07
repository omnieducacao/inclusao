import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { GestaoClient } from "./GestaoClient";
import { Settings } from "lucide-react";

export default function GestaoPage() {
  return (
    <div className="space-y-6">
      <PageHero
        icon={Settings}
        title="Gestão de Usuários"
        desc="Membros e permissões do workspace."
        color="slate"
      />
      <Suspense fallback={<div className="text-slate-500">Carregando…</div>}>
        <GestaoClient />
      </Suspense>
    </div>
  );
}
