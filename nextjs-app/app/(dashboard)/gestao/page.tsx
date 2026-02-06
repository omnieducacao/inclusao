import { PageHero } from "@/components/PageHero";

export default function GestaoPage() {
  return (
    <div className="space-y-6">
      <PageHero
        icon="⚙️"
        title="Gestão de Usuários"
        desc="Membros e permissões do workspace."
        color="slate"
      />
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <p className="text-slate-600">
          Gerencie membros da equipe, permissões por módulo e vínculos (turma ou
          tutor). Em construção.
        </p>
      </div>
    </div>
  );
}
