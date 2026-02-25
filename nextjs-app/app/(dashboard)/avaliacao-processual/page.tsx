import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AvaliacaoProcessualClient from "./AvaliacaoProcessualClient";

export default async function AvaliacaoProcessualPage() {
    const session = await getSession();
    if (!session?.workspace_id) redirect("/login");

    return <AvaliacaoProcessualClient />;
}
