import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AvaliacaoProcessualClient from "./AvaliacaoProcessualClient";
import { CabecalhoAvaliacao } from "@/components/avaliacao/CabecalhoAvaliacao";

export default async function AvaliacaoProcessualPage() {
    const session = await getSession();
    if (!session?.workspace_id) redirect("/login");

    return (
        <div className="space-y-6">
            <CabecalhoAvaliacao atual="processual" />
            <AvaliacaoProcessualClient />
        </div>
    );
}
