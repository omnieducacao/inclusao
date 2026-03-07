import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AvaliacaoProcessualClient from "./AvaliacaoProcessualClient";
import { Skeleton } from "@/components/Skeleton";

export default async function AvaliacaoProcessualPage() {
    const session = await getSession();
    if (!session?.workspace_id) redirect("/login");

    return (
        <Suspense fallback={<Skeleton className="h-20 w-full" />}>
            <AvaliacaoProcessualClient />
        </Suspense>
    );
}
