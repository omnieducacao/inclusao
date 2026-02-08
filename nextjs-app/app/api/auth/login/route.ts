import { NextResponse } from "next/server";
import {
  findUserByEmail,
  verifyWorkspaceMaster,
  verifyMemberPassword,
} from "@/lib/auth";
import { createSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios." },
        { status: 400 }
      );
    }

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
