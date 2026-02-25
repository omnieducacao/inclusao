import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import PerfilClient from "./PerfilClient";

export default async function PerfilPage() {
    const session = await getSession();
    if (!session?.workspace_id) redirect("/login");

    return <PerfilClient />;
}
