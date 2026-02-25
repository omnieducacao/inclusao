import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Navbar } from "@/components/Navbar";
import PlanoCursoClient from "./PlanoCursoClient";

export default async function PlanoCursoPage() {
    const session = await getSession();
    if (!session?.workspace_id) redirect("/login");

    return (
        <>
            <Navbar session={session} />
            <main className="page-wrapper">
                <PlanoCursoClient />
            </main>
        </>
    );
}
