/**
 * Frente 6 · onda 102 · a escola dentro do app da família.
 *
 * A família que usa a Omnisfera pela escola (family_responsibles + family_student_links) entra no app
 * com o mesmo login. No primeiro /eu, cada estudante vinculado vira uma criança do app, numa família
 * de origem "escola", ligada ao estudante por crianca_escolas. A escola entra na rede da criança com
 * o que a tabela "Quem vê o quê" dá a ela (registrar o que acontece na escola, ver a medicação da
 * escola, missões e orientações). A família pode mudar isso depois, como com qualquer membro.
 *
 * Combo (onda 103): quem já acompanha a criança no plano da família é perguntado antes, para a escola
 * entrar na mesma criança em vez de criar outra.
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

/** O aluno como a escola cadastrou (getSupabase já abre o nome cifrado). */
async function alunoDaEscola(v: Vinculo): Promise<{ id: string; name: string } | null> {
  const { data: st } = await getSupabase().from("students").select("id, name").eq("id", v.student_id).eq("workspace_id", v.workspace_id).maybeSingle();
  return st as { id: string; name: string } | null;
}

async function nomeDaEscola(workspaceId: string): Promise<string> {
  const { data: ws } = await getSupabase().from("workspaces").select("name").eq("id", workspaceId).maybeSingle();
  return (ws as { name: string } | null)?.name || "Escola";
}

/**
 * Liga a escola a uma criança do app: o vínculo crianca_escolas e a escola na rede da criança,
 * com o padrão da tabela "Quem vê o quê" e o consentimento registrado em nome de quem ligou.
 */
async function ligarEscolaNaCrianca(criancaId: string, v: Vinculo, pessoaId: string): Promise<void> {
  const sb = getSupabase();
  const agora = new Date().toISOString();
  await sb.from("crianca_escolas").insert({ crianca_id: criancaId, workspace_id: v.workspace_id, student_id: v.student_id, status: "ativo", aceito_em: agora, aceito_por: pessoaId });
  const { data: mb } = await sb
    .from("rede_membros")
    .insert({ crianca_id: criancaId, tipo: "escola", workspace_id: v.workspace_id, nome: await nomeDaEscola(v.workspace_id), status: "ativo", aceito_em: agora })
    .select("id")
    .single();
  if (mb) {
    const membroId = (mb as { id: string }).id;
    await sb.from("rede_permissoes").insert(PERMISSOES_ESCOLA.map((p) => ({ membro_id: membroId, categoria: p.categoria, pode_ver: p.ver, pode_escrever: p.escrever })));
    await sb.from("consentimentos").insert({ crianca_id: criancaId, membro_id: membroId, autorizado_por: pessoaId, acao: "concedeu", categorias: paraConsentimento(PERMISSOES_ESCOLA), ate: null, versao_termo: VERSAO_TERMO_REDE });
  }
}

/** Família nova, de origem "escola" (só a devolutiva, sem o plano da família), com a criança do aluno. */
async function criarCriancaDaEscola(v: Vinculo, pessoaId: string): Promise<string | null> {
  const aluno = await alunoDaEscola(v);
  if (!aluno) return null;
  const sb = getSupabase();
  const primeiro = (aluno.name || "Criança").trim().split(/\s+/)[0];
  const { data: fam } = await sb.from("familias").insert({ nome: `Família de ${primeiro}`, origem: "escola", plano: "escola" }).select("id").single();
  if (!fam) return null;
  const { data: cr } = await sb.from("criancas").insert({ familia_id: (fam as { id: string }).id, nome: aluno.name || "Criança", nascimento: null, modo: "crianca" }).select("id").single();
  if (!cr) return null;
  const criancaId = (cr as { id: string }).id;
  await ligarEscolaNaCrianca(criancaId, v, pessoaId);
  return criancaId;
}

/** Garante que esta pessoa é responsável da família da criança. */
async function garantirResponsavel(criancaId: string, pessoaId: string, parentesco: string | null): Promise<void> {
  const sb = getSupabase();
  const { data: cri } = await sb.from("criancas").select("familia_id").eq("id", criancaId).maybeSingle();
  const familiaId = (cri as { familia_id: string } | null)?.familia_id;
  if (!familiaId) return;
  const { data: ja } = await sb.from("familia_responsaveis").select("id").eq("familia_id", familiaId).eq("pessoa_id", pessoaId).maybeSingle();
  if (ja) return;
  const { data: outros } = await sb.from("familia_responsaveis").select("id").eq("familia_id", familiaId);
  await sb.from("familia_responsaveis").insert({ familia_id: familiaId, pessoa_id: pessoaId, parentesco, principal: !((outros as unknown[] | null) || []).length });
}

/**
 * As crianças que esta pessoa já acompanha no plano da família e que ainda não têm escola ligada.
 * Quando existem, um aluno novo da escola pode ser uma delas: o app pergunta antes de criar outra (combo).
 */
export async function criancasSemEscola(pessoaId: string): Promise<{ id: string; nome: string }[]> {
  const sb = getSupabase();
  const { data: fr } = await sb.from("familia_responsaveis").select("familia_id").eq("pessoa_id", pessoaId);
  const familiaIds = ((fr as { familia_id: string }[] | null) || []).map((f) => f.familia_id);
  if (!familiaIds.length) return [];
  const { data: fs } = await sb.from("familias").select("id, origem").in("id", familiaIds);
  const diretas = ((fs as { id: string; origem: string }[] | null) || []).filter((f) => f.origem !== "escola").map((f) => f.id);
  if (!diretas.length) return [];
  const { data: cs } = await sb.from("criancas").select("id, nome").in("familia_id", diretas);
  const criancas = (cs as { id: string; nome: string }[] | null) || [];
  if (!criancas.length) return [];
  const { data: ces } = await sb.from("crianca_escolas").select("crianca_id, status").in("crianca_id", criancas.map((c) => c.id)).eq("status", "ativo");
  const comEscola = new Set(((ces as { crianca_id: string }[] | null) || []).map((c) => c.crianca_id));
  return criancas.filter((c) => !comEscola.has(c.id)).map((c) => ({ id: c.id, nome: c.nome }));
}

export type EscolaPendente = { student_id: string; escola: string; aluno: string };

/**
 * Garante que cada estudante vinculado tem a sua criança no app e que esta pessoa é responsável
 * dela. Idempotente: roda a cada /eu e só cria o que falta. Erros aqui não derrubam o /eu.
 * Combo: se a pessoa já acompanha crianças no plano da família sem escola ligada, o aluno novo não
 * vira criança sozinho; volta como pendente para a família dizer se é uma delas (ligarAlunoDaEscola).
 */
export async function garantirCriancasDaEscola(pessoaId: string): Promise<EscolaPendente[]> {
  const pendentes: EscolaPendente[] = [];
  try {
    const vinculos = await vinculosDaEscola(pessoaId);
    if (!vinculos.length) return pendentes;
    const sb = getSupabase();
    const { data: existentes } = await sb
      .from("crianca_escolas")
      .select("crianca_id, student_id, status")
      .in("student_id", vinculos.map((v) => v.student_id));
    const porStudent = new Map(
      ((existentes as { crianca_id: string; student_id: string; status: string }[] | null) || [])
        .filter((e) => e.status !== "encerrado")
        .map((e) => [e.student_id, e.crianca_id]),
    );
    let semEscola: { id: string; nome: string }[] | null = null;

    for (const v of vinculos) {
      let criancaId = porStudent.get(v.student_id);
      if (!criancaId) {
        semEscola ??= await criancasSemEscola(pessoaId);
        if (semEscola.length) {
          const aluno = await alunoDaEscola(v);
          if (aluno) pendentes.push({ student_id: v.student_id, escola: await nomeDaEscola(v.workspace_id), aluno: aluno.name || "Estudante" });
          continue;
        }
        criancaId = (await criarCriancaDaEscola(v, pessoaId)) ?? undefined;
        if (!criancaId) continue;
        porStudent.set(v.student_id, criancaId);
      }
      await garantirResponsavel(criancaId, pessoaId, v.parentesco);
    }
  } catch (err) {
    logger.warn({ err }, "[app/escola] não deu para espelhar os estudantes da escola");
  }
  return pendentes;
}

/**
 * Combo (SCRUM-311): a família responde à pendência. Com `criancaId`, a escola entra na criança que
 * ela já acompanha (que mantém o plano da família); com null, o aluno vira uma criança nova.
 * Devolve o id da criança, ou um erro em português.
 */
export async function ligarAlunoDaEscola(pessoaId: string, studentId: string, criancaId: string | null): Promise<{ crianca_id: string } | { erro: string; status: number }> {
  const v = (await vinculosDaEscola(pessoaId)).find((x) => x.student_id === studentId);
  if (!v) return { erro: "Este estudante não está ligado a você na escola.", status: 404 };
  const sb = getSupabase();
  const { data: ja } = await sb.from("crianca_escolas").select("crianca_id, status").eq("student_id", studentId);
  const ativo = ((ja as { crianca_id: string; status: string }[] | null) || []).find((x) => x.status !== "encerrado");
  if (ativo) return { erro: "Este estudante já está ligado a uma criança no app.", status: 409 };
  if (criancaId === null) {
    const nova = await criarCriancaDaEscola(v, pessoaId);
    if (!nova) return { erro: "Não deu para ligar agora.", status: 500 };
    await garantirResponsavel(nova, pessoaId, v.parentesco);
    return { crianca_id: nova };
  }
  const opcoes = await criancasSemEscola(pessoaId);
  if (!opcoes.some((c) => c.id === criancaId)) return { erro: "Escolha uma criança da sua família que ainda não tem escola ligada.", status: 400 };
  await ligarEscolaNaCrianca(criancaId, v, pessoaId);
  return { crianca_id: criancaId };
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
