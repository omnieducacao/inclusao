import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import PEIProfessorClient from "./PEIProfessorClient";

export default async function PEIProfessorPage() {
    const session = await getSession();
    if (!session?.workspace_id) {
        redirect("/login");
    }

    return <PEIProfessorClient />;
}
