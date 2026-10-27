import { NextResponse } from "next/server";
import { ipDaRequisicao, limitarPorChave, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { entrarComSenha } from "@/lib/app/entrar";
import { abrirSessao } from "@/lib/app/sessao";
import { logAction } from "@/lib/audit";
import { logger } from "@/lib/logger";

// Mesma resposta para e-mail sem conta e senha errada (SCRUM-229).
const ERRO = "E-mail ou senha incorretos. Confira e tente de novo.";

/** Frente 6 · POST /api/app/v1/auth/entrar {email, senha, dispositivo?} → par de tokens do app. */
export async function POST(req: Request) {
  const rl = rateLimitResponse(req, RATE_LIMITS.AUTH_IP); if (rl) return rl;
  try {
    const body = (await req.json().catch(() => ({}))) as { email?: unknown; senha?: unknown; dispositivo?: unknown };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const senha = typeof body.senha === "string" ? body.senha : "";
    if (!email || !senha) return NextResponse.json({ error: "Informe o e-mail e a senha." }, { status: 400 });
    const porConta = limitarPorChave(`app:${ipDaRequisicao(req)}:${email}`, RATE_LIMITS.AUTH);
    if (porConta) return porConta;

    const pessoa = await entrarComSenha(email, senha);
    if (!pessoa) {
      await logAction({ action: "login_failed", resourceType: "sessao_app", metadata: { canal: "app" }, req });
      return NextResponse.json({ error: ERRO }, { status: 401 });
    }
    const tokens = await abrirSessao(pessoa.id, typeof body.dispositivo === "string" ? body.dispositivo : null);
    await logAction({ actorId: pessoa.id, actorRole: "pessoa", action: "login", resourceType: "sessao_app", req });
    return NextResponse.json({ ok: true, pessoa, ...tokens });
  } catch (err) {
    logger.error({ err }, "app: erro no login");
    return NextResponse.json({ error: "Não deu para entrar agora. Tente de novo." }, { status: 500 });
  }
}
