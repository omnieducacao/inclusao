import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AdminClient } from "./AdminClient";

export default async function AdminPage() {
  const session = await getSession();

  if (!session || !session.is_platform_admin) {
    redirect("/login");
    return null;
  }

  return <AdminClient session={session} />;
}
