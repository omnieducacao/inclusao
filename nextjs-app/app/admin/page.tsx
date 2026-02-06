import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function AdminPage() {
  const session = await getSession();
  if (!session?.is_platform_admin) {
    redirect("/");
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h1 className="text-xl font-bold text-slate-800">Administração da Plataforma</h1>
      <p className="text-slate-600 mt-1">
        Gestão de escolas, termo de uso, dashboard. (Em construção)
      </p>
    </div>
  );
}
