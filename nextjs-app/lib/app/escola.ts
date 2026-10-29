/**
 * Frente 6 · onda 102 · a escola dentro do app da família.
 *
 * A família que usa a Omnisfera pela escola (family_responsibles + family_student_links) entra no app
 * com o mesmo login. No primeiro /eu, cada estudante vinculado vira uma criança do app, numa família
 * de origem "escola", ligada ao estudante por crianca_escolas. A escola entra na rede da criança com
 * o que a tabela "Quem vê o quê" dá a ela (registrar o que acontece na escola, ver a medicação da
 * escola, missões e orientações). A família pode mudar isso depois, como com qualquer membro.
 *
 * O espelho do modo família do site (plano, evolução, conversa, missões da escola) é lido pelas
 * mesmas funções do site (lib/familia-resumo, lib/familia-caixa, lib/missoes-servidor).
 */
import { getSupabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { VERSAO_TERMO_REDE, paraConsentimento, type Permissao } from "@/lib/app/rede";

/** O que a escola cliente vê e escreve por padrão (doc "Quem vê o quê", linha Escola). */
export const PERMISSOES_ESCOLA: Permissao[] = [
  { categoria: "eventos_escola", ver: true, escrever: true },
  { categoria: "medicacao", ver: true, escrever: false },
  { categoria: "missoes", ver: true, escrever: true },
  { categoria: "orientacoes", ver: true, escrever: false },
  { categoria: "pei", ver: true, escrever: true },
];

type Vinculo = { family_responsible_id: string; student_id: string; workspace_id: string; parentesco: string | null };

/** Os estudantes de escolas clientes ligados a esta pessoa (pelo cadastro de responsável da escola). */
async function vinculosDaEscola(pessoaId: string): Promise<Vinculo[]> {
  const sb = getSupabase();
  const { data: resp } = await sb.from("family_responsibles").select("id, workspace_id, parentesco, active").eq("pessoa_id", pessoaId);
  const responsaveis = ((resp as { id: string; workspace_id: string; parentesco: string | null; active: boolean | null }[] | null) || []).filter((r) => r.active !== false);
  if (!responsaveis.length) return [];
  const { data: links } = await sb.from("family_student_links").select("family_responsible_id, student_id").in("family_responsible_id", responsaveis.map((r) => r.id));
  const porResp = new Map(responsaveis.map((r) => [r.id, r]));
  return ((links as { family_responsible_id: string; student_id: string }[] | null) || []).map((l) => {
    const r = porResp.get(l.family_responsible_id)!;
    return { family_responsible_id: l.family_responsible_id, student_id: l.student_id, workspace_id: r.workspace_id, parentesco: r.parentesco };
  });
}

/**
 * Garante que cada estudante vinculado tem a sua criança no app e que esta pessoa é responsável
 * dela. Idempotente: roda a cada /eu e só cria o que falta. Erros aqui não derrubam o /eu.
 */
export async function garantirCriancasDaEscola(pessoaId: string): Promise<void> {
  try {
    const vinculos = await vinculosDaEscola(pessoaId);
    if (!vinculos.length) return;
    const sb = getSupabase();
    const agora = new Date().toISOString();
    const { data: existentes } = await sb
      .from("crianca_escolas")
      .select("crianca_id, student_id, status")
      .in("student_id", vinculos.map((v) => v.student_id));
    const porStudent = new Map(
      ((existentes as { crianca_id: string; student_id: string; status: string }[] | null) || [])
        .filter((e) => e.status !== "encerrado")
        .map((e) => [e.student_id, e.crianca_id]),
    );

    for (const v of vinculos) {
      let criancaId = porStudent.get(v.student_id);
      if (!criancaId) {
        const { data: st } = await sb.from("students").select("id, name").eq("id", v.student_id).eq("workspace_id", v.workspace_id).maybeSingle();
        const aluno = st as { id: string; name: string } | null; // getSupabase já abre o nome cifrado
        if (!aluno) continue;
        const primeiro = (aluno.name || "Criança").trim().split(/\s+/)[0];
        const { data: fam } = await sb.from("familias").insert({ nome: `Família de ${primeiro}`, origem: "escola", plano: "escola" }).select("id").single();
        if (!fam) continue;
        const familiaId = (fam as { id: string }).id;
        const { data: cr } = await sb.from("criancas").insert({ familia_id: familiaId, nome: aluno.name || "Criança", nascimento: null, modo: "crianca" }).select("id").single();
        if (!cr) continue;
        criancaId = (cr as { id: string }).id;
        await sb.from("crianca_escolas").insert({ crianca_id: criancaId, workspace_id: v.workspace_id, student_id: v.student_id, status: "ativo", aceito_em: agora });
        // a escola entra na rede com o padrão da tabela "Quem vê o quê"; a família pode mudar depois
        const { data: ws } = await sb.from("workspaces").select("name").eq("id", v.workspace_id).maybeSingle();
        const { data: mb } = await sb
          .from("rede_membros")
          .insert({ crianca_id: criancaId, tipo: "escola", workspace_id: v.workspace_id, nome: (ws as { name: string } | null)?.name || "Escola", status: "ativo", aceito_em: agora })
          .select("id")
          .single();
        if (mb) {
          const membroId = (mb as { id: string }).id;
          await sb.from("rede_permissoes").insert(PERMISSOES_ESCOLA.map((p) => ({ membro_id: membroId, categoria: p.categoria, pode_ver: p.ver, pode_escrever: p.escrever })));
          await sb.from("consentimentos").insert({ crianca_id: criancaId, membro_id: membroId, autorizado_por: pessoaId, acao: "concedeu", categorias: paraConsentimento(PERMISSOES_ESCOLA), ate: null, versao_termo: VERSAO_TERMO_REDE });
        }
        porStudent.set(v.student_id, criancaId);
      }
      // esta pessoa é responsável da família dessa criança?
      const { data: cri } = await sb.from("criancas").select("familia_id").eq("id", criancaId).maybeSingle();
      const familiaId = (cri as { familia_id: string } | null)?.familia_id;
      if (!familiaId) continue;
      const { data: ja } = await sb.from("familia_responsaveis").select("id").eq("familia_id", familiaId).eq("pessoa_id", pessoaId).maybeSingle();
      if (!ja) {
        const { data: outros } = await sb.from("familia_responsaveis").select("id").eq("familia_id", familiaId);
        await sb.from("familia_responsaveis").insert({ familia_id: familiaId, pessoa_id: pessoaId, parentesco: v.parentesco, principal: !((outros as unknown[] | null) || []).length });
      }
    }
  } catch (err) {
    logger.warn({ err }, "[app/escola] não deu para espelhar os estudantes da escola");
  }
}

export type EscolaDaCrianca = { workspace_id: string; student_id: string; family_responsible_id: string; nome: string };

/**
 * A escola cliente desta criança, do ponto de vista desta pessoa: só quando a pessoa é responsável
 * cadastrado nessa escola e vinculado a esse estudante (family_student_links). Senão, null.
 */
export async function escolaDaCrianca(pessoaId: string, criancaId: string): Promise<EscolaDaCrianca | null> {
  const sb = getSupabase();
  const { data: ce } = await sb.from("crianca_escolas").select("workspace_id, student_id").eq("crianca_id", criancaId).eq("status", "ativo").limit(1);
  const v = ((ce as { workspace_id: string; student_id: string }[] | null) || [])[0];
  if (!v) return null;
  const { data: resp } = await sb.from("family_responsibles").select("id").eq("pessoa_id", pessoaId).eq("workspace_id", v.workspace_id);
  const ids = ((resp as { id: string }[] | null) || []).map((r) => r.id);
  if (!ids.length) return null;
  const { data: link } = await sb.from("family_student_links").select("family_responsible_id").eq("student_id", v.student_id).in("family_responsible_id", ids).limit(1);
  const l = ((link as { family_responsible_id: string }[] | null) || [])[0];
  if (!l) return null;
  const { data: ws } = await sb.from("workspaces").select("name").eq("id", v.workspace_id).maybeSingle();
  return { workspace_id: v.workspace_id, student_id: v.student_id, family_responsible_id: l.family_responsible_id, nome: (ws as { name: string } | null)?.name || "Escola" };
}
