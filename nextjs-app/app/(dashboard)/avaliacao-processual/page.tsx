import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/Skeleton";

const AvaliacaoProcessualClient = dynamic(
    () => import("./AvaliacaoProcessualClient"),
    {
        ssr: false,
        loading: () => <Skeleton className="h-20 w-full" />,
    }
);

export default async function AvaliacaoProcessualPage() {
    const session = await getSession();
    if (!session?.workspace_id) redirect("/login");

    return <AvaliacaoProcessualClient />;
}
