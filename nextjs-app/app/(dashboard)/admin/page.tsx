import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { AdminClient } from "./AdminClient";

export default async function AdminPage() {
  const session = await getSession();
  
  if (!session?.is_platform_admin) {
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <PageHero
        icon="🔧"
        title="Admin Plataforma"
        desc="Gerenciamento completo da plataforma Omnisfera."
        color="indigo"
      />

      <Suspense fallback={<div className="text-slate-500">Carregando…</div>}>
        <AdminClient />
      </Suspense>
    </div>
  );
}
