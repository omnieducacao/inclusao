import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import PlanoCursoClient from "./PlanoCursoClient";

export default async function PlanoCursoPage() {
    const session = await getSession();
    if (!session?.workspace_id) redirect("/login");

    return <PlanoCursoClient />;
}
