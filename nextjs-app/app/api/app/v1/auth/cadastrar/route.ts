import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ipDaRequisicao, limitarPorChave, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { getSupabase } from "@/lib/supabase";
import { findUserByEmail } from "@/lib/auth";
import { checarSenhaNova } from "@/lib/senha-regras";
import { abrirSessao } from "@/lib/app/sessao";
import { logAction } from "@/lib/audit";
import { logger } from "@/lib/logger";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const JA_EXISTE = "Já existe uma conta com esse e-mail. Entre com ela.";

/**
 * Frente 6 · POST /api/app/v1/auth/cadastrar {nome, email, senha, termos: true, dispositivo?}
 * Conta nova no app: a família que chega direto (sem escola) e o profissional convidado.
 * Quem já tem conta na Omnisfera (escola) entra com ela; aqui não se cria uma segunda.
 * Pendente: confirmar o e-mail por link antes de liberar dado de criança (ver doc da estrutura).
 */
export async function POST(req: Request) {
  const rl = rateLimitResponse(req, RATE_LIMITS.AUTH_IP); if (rl) return rl;
  try {
    const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const nome = typeof b.nome === "string" ? b.nome.trim().slice(0, 120) : "";
    const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
    const senha = typeof b.senha === "string" ? b.senha : "";
    if (nome.length < 2) return NextResponse.json({ error: "Informe seu nome." }, { status: 400 });
    if (!EMAIL.test(email) || email.length > 160) return NextResponse.json({ error: "Confira o e-mail." }, { status: 400 });
    if (b.termos !== true) return NextResponse.json({ error: "Para criar a conta, aceite os termos de uso e a política de privacidade." }, { status: 400 });
    const porConta = limitarPorChave(`app-cadastro:${ipDaRequisicao(req)}:${email}`, RATE_LIMITS.AUTH);
    if (porConta) return porConta;

    const erroSenha = await checarSenhaNova(senha);
    if (erroSenha) return NextResponse.json({ error: erroSenha }, { status: 400 });

    const sb = getSupabase();
    const { data: ja } = await sb.from("pessoas").select("id").eq("email", email).maybeSingle();
    if (ja || (await findUserByEmail(email))) return NextResponse.json({ error: JA_EXISTE }, { status: 409 });

    const agora = new Date().toISOString();
    const { data, error } = await sb
      .from("pessoas")
      .insert({ nome, email, password_hash: bcrypt.hashSync(senha, 10), termos_aceitos_em: agora })
      .select("id")
      .single();
    if (error || !data) return NextResponse.json({ error: "Não deu para criar a conta agora." }, { status: 500 });
    const pessoa = { id: (data as { id: string }).id, nome };
    const tokens = await abrirSessao(pessoa.id, typeof b.dispositivo === "string" ? b.dispositivo : null);
    await logAction({ actorId: pessoa.id, actorRole: "pessoa", action: "create", resourceType: "pessoa", resourceId: pessoa.id, metadata: { canal: "app" }, req });
    return NextResponse.json({ ok: true, pessoa, ...tokens }, { status: 201 });
  } catch (err) {
    logger.error({ err }, "app: erro no cadastro");
    return NextResponse.json({ error: "Não deu para criar a conta agora. Tente de novo." }, { status: 500 });
  }
}
