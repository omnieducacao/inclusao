import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AvaliacaoDiagnosticaClient from "./AvaliacaoDiagnosticaClient";

export default async function AvaliacaoDiagnosticaPage() {
    const session = await getSession();
    if (!session?.workspace_id) redirect("/login");

    return <AvaliacaoDiagnosticaClient />;
}
