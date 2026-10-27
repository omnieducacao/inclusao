/**
 * Frente 6 · login único: os papéis de uma pessoa, para o app montar a tela de escolha
 * ("mãe do Pedro", "professora no Colégio Modelo", "fono convidada por 3 famílias").
 */
import { getSupabase } from "@/lib/supabase";

export type CriancaResumo = { id: string; nome: string; nascimento: string | null; modo: string };
export type Papeis = {
  pessoa: { id: string; nome: string };
  familias: { id: string; nome: string; plano: string; parentesco: string | null; criancas: CriancaResumo[] }[];
  adolescente: CriancaResumo[];
  rede: { membro_id: string; tipo: string; crianca: CriancaResumo; acesso_ate: string | null }[];
  escolas: { workspace_id: string; nome: string; papel: string | null }[];
};

export async function papeisDaPessoa(pessoaId: string): Promise<Papeis | null> {
  const sb = getSupabase();
  const { data: p } = await sb.from("pessoas").select("id, nome, ativo").eq("id", pessoaId).maybeSingle();
  const pessoa = p as { id: string; nome: string; ativo: boolean } | null;
  if (!pessoa?.ativo) return null;

  const { data: fr } = await sb
    .from("familia_responsaveis")
    .select("parentesco, familias(id, nome, plano, criancas(id, nome, nascimento, modo))")
    .eq("pessoa_id", pessoaId);
  type F = { parentesco: string | null; familias: { id: string; nome: string; plano: string; criancas: CriancaResumo[] } | null };
  const familias = ((fr as F[] | null) || [])
    .filter((x) => x.familias)
    .map((x) => ({ ...x.familias!, parentesco: x.parentesco, criancas: x.familias!.criancas || [] }));

  const { data: ad } = await sb
    .from("criancas")
    .select("id, nome, nascimento, modo")
    .eq("adolescente_pessoa_id", pessoaId)
    .eq("adolescente_pausado", false);

  const hoje = new Date().toISOString().slice(0, 10);
  const { data: rm } = await sb
    .from("rede_membros")
    .select("id, tipo, acesso_ate, criancas(id, nome, nascimento, modo)")
    .eq("pessoa_id", pessoaId)
    .eq("status", "ativo");
  type R = { id: string; tipo: string; acesso_ate: string | null; criancas: CriancaResumo | null };
  const rede = ((rm as R[] | null) || [])
    .filter((r) => r.criancas && (!r.acesso_ate || r.acesso_ate >= hoje))
    .map((r) => ({ membro_id: r.id, tipo: r.tipo, crianca: r.criancas!, acesso_ate: r.acesso_ate }));

  const { data: eq } = await sb
    .from("workspace_members")
    .select("workspace_id, papel, workspaces(name)")
    .eq("pessoa_id", pessoaId);
  type E = { workspace_id: string; papel: string | null; workspaces: { name: string } | null };
  const escolas = ((eq as E[] | null) || []).map((e) => ({ workspace_id: e.workspace_id, nome: e.workspaces?.name || "", papel: e.papel }));

  return {
    pessoa: { id: pessoa.id, nome: pessoa.nome },
    familias,
    adolescente: (ad as CriancaResumo[] | null) || [],
    rede,
    escolas,
  };
}
