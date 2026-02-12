import { parseBody, adminLoginSchema } from "@/lib/validation";
import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { verifyPlatformAdmin } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const rl = rateLimitResponse(req, RATE_LIMITS.AUTH); if (rl) return rl;
  try {
    const parsed = await parseBody(req, adminLoginSchema);
    if (parsed.error) return parsed.error;
    const { email, password } = parsed.data;
    const ok = await verifyPlatformAdmin(email, password);
    if (!ok) {
      return NextResponse.json(
        { error: "Credenciais inválidas." },
        { status: 401 }
      );
    }

    const sb = getSupabase();
    const { data } = await sb
      .from("platform_admins")
      .select("nome")
      .eq("email", (email as string).trim().toLowerCase())
      .single();

    await createSession({
      workspace_id: null,
      workspace_name: "Administração",
      usuario_nome: (data?.nome as string) || email,
      user_role: "platform_admin",
      is_platform_admin: true,
      member: {}, // evita crash em componentes que acessam session.member
    });

    return NextResponse.json({
      ok: true,
      usuario_nome: data?.nome || email,
    });
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json(
      { error: "Erro ao fazer login. Tente novamente." },
      { status: 500 }
    );
  }
}
