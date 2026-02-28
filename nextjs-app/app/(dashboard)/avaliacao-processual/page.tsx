import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AvaliacaoProcessualClient from "./AvaliacaoProcessualClient";

export default async function AvaliacaoProcessualPage() {
    const session = await getSession();
    if (!session?.workspace_id) redirect("/login");

    return (
        <Suspense fallback={<div className="p-4 text-slate-500">Carregando...</div>}>
            <AvaliacaoProcessualClient />
        </Suspense>
    );
}
