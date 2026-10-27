/**
 * Frente 6 · login único. Uma pessoa entra no app com o mesmo e-mail e a mesma senha que já usa
 * na Omnisfera (responsável da escola ou membro da equipe). No primeiro acesso pelo app, a pessoa
 * é criada em `pessoas` e ligada ao cadastro da escola (pessoa_id); depois disso, entra direto.
 * A conta principal da escola (workspace_masters) não entra no app: ela é da escola, não de uma pessoa.
 */
import { getSupabase } from "@/lib/supabase";
import {
  compararSenhaFicticia,
  findUserByEmail,
  verifyFamilyPassword,
  verifyMemberPassword,
  verifyPassword,
} from "@/lib/auth";

export type PessoaLogada = { id: string; nome: string };

type LinhaPessoa = { id: string; nome: string; password_hash: string | null; ativo: boolean };

export async function entrarComSenha(emailBruto: string, senha: string): Promise<PessoaLogada | null> {
  const email = (emailBruto || "").trim().toLowerCase();
  if (!email || !senha) return null;
  const sb = getSupabase();

  const { data } = await sb.from("pessoas").select("id, nome, password_hash, ativo").eq("email", email).maybeSingle();
  const pessoa = data as LinhaPessoa | null;
  if (pessoa && !pessoa.ativo) {
    compararSenhaFicticia(senha);
    return null;
  }
  if (pessoa?.password_hash) {
    return verifyPassword(senha, pessoa.password_hash) ? { id: pessoa.id, nome: pessoa.nome } : null;
  }

  // Primeiro acesso pelo app: confere a senha no cadastro da escola e cria (ou completa) a pessoa.
  const achado = await findUserByEmail(email);
  if (!achado || achado.role === "master") {
    compararSenhaFicticia(senha);
    return null;
  }
  const ok = achado.role === "family"
    ? await verifyFamilyPassword(achado.workspace_id, email, senha)
    : await verifyMemberPassword(achado.workspace_id, email, senha);
  if (!ok) return null;

  const tabela = achado.role === "family" ? "family_responsibles" : "workspace_members";
  const idCadastro = String(achado.user.id);
  const { data: comHash } = await sb.from(tabela).select("password_hash").eq("id", idCadastro).maybeSingle();
  const hash = (comHash as { password_hash?: string } | null)?.password_hash || null;
  const nome = String(achado.user.nome || email);

  let pessoaId = pessoa?.id;
  if (pessoaId) {
    await sb.from("pessoas").update({ password_hash: hash, updated_at: new Date().toISOString() }).eq("id", pessoaId);
  } else {
    const { data: nova, error } = await sb.from("pessoas").insert({ nome, email, password_hash: hash }).select("id").single();
    if (error || !nova) return null;
    pessoaId = (nova as { id: string }).id;
  }
  await sb.from(tabela).update({ pessoa_id: pessoaId }).eq("id", idCadastro);
  return { id: pessoaId, nome };
}
