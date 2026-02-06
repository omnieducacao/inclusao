import { getSession } from "@/lib/session";
import { InfosClient } from "./InfosClient";

export default async function InfosPage() {
  const session = await getSession();
  return <InfosClient session={session} />;
}
