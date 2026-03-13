import { getSupabase } from "./supabase";

export type SubscriptionStatus = {
    active: boolean;
    status: "trial" | "active" | "expired" | "freemium";
    daysRemaining?: number;
};

/**
 * Checks the subscription status of a B2C Workspace
 * @param workspaceId The isolated workspace ID of the Teacher
 */
export async function checkB2CSubscription(workspaceId: string): Promise<SubscriptionStatus> {
    const sb = getSupabase();

    const { data, error } = await sb
        .from("workspaces")
        .select("plano, created_at, subscription_status")
        .eq("id", workspaceId)
        .single();

    if (error || !data) {
        return { active: false, status: "expired" };
    }

    // Se já houver um controle explícito de Gateway via Webhook na coluna subscription_status
    if (data.subscription_status === "active") {
        return { active: true, status: "active" };
    }

    if (data.subscription_status === "canceled" || data.subscription_status === "past_due") {
        return { active: false, status: "expired" };
    }

    // Trial Logic (7 Days Free on "premium_b2c" plan)
    if (data.plano === "premium_b2c") {
        const createdDate = new Date(data.created_at);
        const now = new Date();

        // Calcula a diferença em dias úteis
        const diffTime = Math.abs(now.getTime() - createdDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const trialDays = 7;

        if (diffDays <= trialDays) {
            return {
                active: true,
                status: "trial",
                daysRemaining: trialDays - diffDays
            };
        } else {
            return { active: false, status: "expired" };
        }
    }

    // Falback for legacy school B2B plans (which don't use the B2C logic)
    // Escolas (B2B) têm contrato manual, então a lógica padrão as aprova se "premium_b2c" não for cravado
    return { active: true, status: "active" };
}
