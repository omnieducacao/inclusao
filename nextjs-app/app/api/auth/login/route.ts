import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { parseBody, loginSchema } from "@/lib/validation";
import { NextResponse } from "next/server";
import {
  findUserByEmail,
  verifyWorkspaceMaster,
  verifyMemberPassword,
} from "@/lib/auth";
import { createSession } from "@/lib/session";

export async function POST(req: Request) {
  const rl = rateLimitResponse(req, RATE_LIMITS.AUTH); if (rl) return rl;
  try {
    const parsed = await parseBody(req, loginSchema);
    if (parsed.error) return parsed.error;
    const { email, password } = parsed.data;

    const found = await findUserByEmail(email);
    if (!found) {
      return NextResponse.json(
        { error: "Email não encontrado. Verifique o endereço ou entre em contato com a escola." },
        { status: 401 }
      );
    }

    let ok = false;
    if (found.role === "master") {
      ok = await verifyWorkspaceMaster(
        found.workspace_id,
        email,
        password
      );
    } else {
      ok = await verifyMemberPassword(
        found.workspace_id,
        email,
        password
      );
    }

    if (!ok) {
      return NextResponse.json(
        { error: "Senha incorreta." },
        { status: 401 }
      );
    }

    const member =
      found.role === "member"
        ? found.user
        : {
          id: null,
          can_estudantes: true,
          can_pei: true,
          can_pei_professor: true,
          can_paee: true,
          can_hub: true,
          can_diario: true,
          can_avaliacao: true,
          can_gestao: true,
          link_type: "todos" as const,
        };

    await createSession({
      workspace_id: found.workspace_id,
      workspace_name: found.workspace_name,
      usuario_nome: (found.user.nome as string) || email,
      user_role: found.role,
      member: member as Record<string, unknown>,
      is_platform_admin: false,
      terms_accepted: found.role === "master" ? true : (found.user.terms_accepted as boolean | undefined) || false,
    });

    return NextResponse.json({
      ok: true,
      workspace_name: found.workspace_name,
      usuario_nome: found.user.nome,
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Erro ao fazer login. Tente novamente." },
      { status: 500 }
    );
  }
}
