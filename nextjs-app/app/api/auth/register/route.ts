import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { parseBody, registerSchema } from "@/lib/validation";
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { findUserByEmail } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { logger } from "@/lib/logger";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    const rl = rateLimitResponse(req, RATE_LIMITS.AUTH); if (rl) return rl;
    try {
        const parsed = await parseBody(req, registerSchema);
        if (parsed.error) return parsed.error;
        const { nome, email, password } = parsed.data;

        // 1. Verify if user already exists
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return NextResponse.json(
                { error: "Este e-mail já está cadastrado na nossa base." },
                { status: 400 }
            );
        }

        const sb = getSupabase();

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Create the Personal Workspace (The magic of B2C Individual Teacher)
        const { data: wsData, error: wsError } = await sb
            .from("workspaces")
            .insert({
                name: `Workspace de ${nome}`,
                plano: "premium_b2c", // Placed in B2C premium (Can have 7-day trial limit)
            })
            .select("id, name")
            .single();

        if (wsError || !wsData) {
            logger.error({ err: wsError }, "Register error: Failed to create Workspace");
            return NextResponse.json(
                { error: "Erro ao aprovisionar sua área segura." },
                { status: 500 }
            );
        }

        // 4. Create the Master User
        const { data: masterData, error: masterError } = await sb
            .from("workspace_masters")
            .insert({
                workspace_id: wsData.id,
                nome: nome,
                email: email,
                password_hash: passwordHash,
            })
            .select("id, nome, email")
            .single();

        if (masterError || !masterData) {
            logger.error({ err: masterError }, "Register error: Failed to create Master");
            // Clean up the created workspace to prevent orphaned ones
            await sb.from("workspaces").delete().eq("id", wsData.id);

            return NextResponse.json(
                { error: "Erro ao criar sua credencial." },
                { status: 500 }
            );
        }

        // 5. Create Session Cookie immediately after creation (Auto-login)
        await createSession({
            workspace_id: wsData.id,
            workspace_name: wsData.name,
            usuario_nome: nome,
            user_role: "master",
            member: undefined,
            family_responsible_id: undefined,
            is_platform_admin: false,
            terms_accepted: true,
        });

        return NextResponse.json({
            ok: true,
            workspace_name: wsData.name,
            usuario_nome: nome,
            redirect: "/",
        });
    } catch (err) {
        logger.error({ err: err }, "Register error:");
        return NextResponse.json(
            { error: "Erro durante a criação da conta. Tente novamente." },
            { status: 500 }
        );
    }
}
