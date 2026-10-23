import { rateLimitResponse, limitarPorChave, ipDaRequisicao, RATE_LIMITS } from "@/lib/rate-limit";
import { parseBody, loginSchema } from "@/lib/validation";
import { NextResponse } from "next/server";
import {
  findUserByEmail,
  verifyWorkspaceMaster,
  verifyMemberPassword,
  verifyFamilyPassword,
  compararSenhaFicticia,
} from "@/lib/auth";
import { createSession } from "@/lib/session";
import { logger } from "@/lib/logger";
import { registrarAcesso } from "@/lib/acessos";
import { logAction } from "@/lib/audit";

// SCRUM-229: a mesma resposta para e-mail sem conta e senha errada, para não revelar quem tem conta
const ERRO_CREDENCIAIS = "E-mail ou senha incorretos. Confira e tente de novo; se esqueceu a senha, fale com a coordenação da escola.";

export async function POST(req: Request) {
  // SCRUM-229: teto largo por IP (a escola inteira sai pelo mesmo IP) e limite fino por e-mail
  const rl = rateLimitResponse(req, RATE_LIMITS.AUTH_IP); if (rl) return rl;
  try {
    const parsed = await parseBody(req, loginSchema);
    if (parsed.error) return parsed.error;
    const { email, password } = parsed.data;
    const porConta = limitarPorChave(`${ipDaRequisicao(req)}:${String(email).trim().toLowerCase()}`, RATE_LIMITS.AUTH);
    if (porConta) return porConta;

    const found = await findUserByEmail(email);
    if (!found) {
      compararSenhaFicticia(password);
      await logAction({ action: "login_failed", resourceType: "sessao", metadata: { motivo: "conta_inexistente" }, req });
      return NextResponse.json({ error: ERRO_CREDENCIAIS }, { status: 401 });
    }

    let ok = false;
    if (found.role === "master") {
      ok = await verifyWorkspaceMaster(
        found.workspace_id,
        email,
        password
      );
    } else if (found.role === "family") {
      ok = await verifyFamilyPassword(
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

    // SCRUM-70: id de quem entrou (a conta principal da escola não tem id próprio: usa o da escola)
    const usuarioId = found.role === "master" ? found.workspace_id : ((found.user.id as string) || null);

    if (!ok) {
      await logAction({
        workspaceId: found.workspace_id, actorId: usuarioId, actorRole: found.role,
        action: "login_failed", resourceType: "sessao", metadata: { motivo: "senha_incorreta" }, req,
      });
      return NextResponse.json({ error: ERRO_CREDENCIAIS }, { status: 401 });
    }

    const member =
      found.role === "member"
        ? found.user
        : found.role === "family"
          ? undefined
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
      usuario_id: usuarioId,
      user_role: found.role,
      member: member as Record<string, unknown> | undefined,
      family_responsible_id: found.role === "family" ? (found.user.id as string) : undefined,
      is_platform_admin: false,
      terms_accepted: found.role === "master" ? true : found.role === "family" ? (found.user.terms_accepted as boolean | undefined) ?? true : (found.user.terms_accepted as boolean | undefined) || false,
    });

    await registrarAcesso({
      tipo: "login", workspace_id: found.workspace_id, workspace_nome: found.workspace_name,
      usuario_nome: (found.user.nome as string) || email,
      papel: found.role === "master" ? "gestão (conta principal)" : found.role === "family" ? "família" : ((found.user.papel as string) || (found.user.cargo as string) || "equipe"),
    });

    await logAction({
      workspaceId: found.workspace_id, actorId: usuarioId, actorRole: found.role,
      action: "login", resourceType: "sessao", req,
    });

    return NextResponse.json({
      ok: true,
      workspace_name: found.workspace_name,
      usuario_nome: found.user.nome,
      redirect: found.role === "family" ? "/familia" : undefined,
    });
  } catch (err) {
    logger.error({ err: err }, "Login error:");
    return NextResponse.json(
      { error: "Erro ao fazer login. Tente novamente." },
      { status: 500 }
    );
  }
}
