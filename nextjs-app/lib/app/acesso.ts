/**
 * Frente 6 · quem vê o quê. Uma função só decide o acesso de uma pessoa a uma criança, para que
 * nenhuma rota do app reinvente a regra. A tabela de referência está no doc da estrutura
 * ("Quem vê o quê"); a família pode mudar cada permissão de cada membro da rede.
 */
import { getSupabase } from "@/lib/supabase";

export const CATEGORIAS = [
  "eventos_casa", "eventos_escola", "medicacao", "laudos", "pei", "missoes",
  "humor", "orientacoes", "resumo", "sinais",
] as const;
export type Categoria = (typeof CATEGORIAS)[number];

export function ehCategoria(x: unknown): x is Categoria {
  return typeof x === "string" && (CATEGORIAS as readonly string[]).includes(x);
}

export type Acesso = {
  papel: "responsavel" | "adolescente" | "membro";
  familiaId: string;
  membroId?: string;
  ver: Set<Categoria>;
  escrever: Set<Categoria>;
};

/** O adolescente vê o que é dele; o humor ele escreve, e a família vê o resumo (não cada frase). */
const ADOLESCENTE_VE: Categoria[] = ["missoes", "humor", "orientacoes", "pei"];
const ADOLESCENTE_ESCREVE: Categoria[] = ["humor", "missoes"];
/** O responsável vê e escreve tudo, menos o humor do adolescente, que ele só vê resumido. */
const RESPONSAVEL_ESCREVE: Categoria[] = CATEGORIAS.filter((c) => c !== "humor");

function hoje(): string {
  return new Date().toISOString().slice(0, 10);
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function ehUuid(x: unknown): x is string {
  return typeof x === "string" && UUID.test(x);
}

export async function acessoACrianca(pessoaId: string, criancaId: string): Promise<Acesso | null> {
  if (!ehUuid(pessoaId) || !ehUuid(criancaId)) return null;
  const sb = getSupabase();
  const { data: crianca } = await sb
    .from("criancas")
    .select("id, familia_id, adolescente_pessoa_id, adolescente_pausado")
    .eq("id", criancaId)
    .maybeSingle();
  const c = crianca as { id: string; familia_id: string; adolescente_pessoa_id: string | null; adolescente_pausado: boolean } | null;
  if (!c) return null;

  const { data: resp } = await sb
    .from("familia_responsaveis")
    .select("id")
    .eq("familia_id", c.familia_id)
    .eq("pessoa_id", pessoaId)
    .maybeSingle();
  if (resp) {
    return { papel: "responsavel", familiaId: c.familia_id, ver: new Set(CATEGORIAS), escrever: new Set(RESPONSAVEL_ESCREVE) };
  }

  if (c.adolescente_pessoa_id === pessoaId) {
    if (c.adolescente_pausado) return null;
    return { papel: "adolescente", familiaId: c.familia_id, ver: new Set(ADOLESCENTE_VE), escrever: new Set(ADOLESCENTE_ESCREVE) };
  }

  // Membro da rede: convite aceito por esta pessoa, ou a escola cliente em que ela trabalha.
  const { data: equipe } = await sb.from("workspace_members").select("workspace_id").eq("pessoa_id", pessoaId);
  const escolas = ((equipe as { workspace_id: string }[] | null) || []).map((e) => e.workspace_id);
  let q = sb
    .from("rede_membros")
    .select("id, pessoa_id, workspace_id, status, acesso_ate")
    .eq("crianca_id", criancaId)
    .eq("status", "ativo");
  q = escolas.length
    ? q.or(`pessoa_id.eq.${pessoaId},workspace_id.in.(${escolas.join(",")})`)
    : q.eq("pessoa_id", pessoaId);
  const { data: membros } = await q;
  const validos = ((membros as { id: string; acesso_ate: string | null }[] | null) || [])
    .filter((m) => !m.acesso_ate || m.acesso_ate >= hoje());
  if (!validos.length) return null;

  const { data: perms } = await sb
    .from("rede_permissoes")
    .select("membro_id, categoria, pode_ver, pode_escrever")
    .in("membro_id", validos.map((m) => m.id));
  const ver = new Set<Categoria>();
  const escrever = new Set<Categoria>();
  for (const p of (perms as { categoria: string; pode_ver: boolean; pode_escrever: boolean }[] | null) || []) {
    if (!ehCategoria(p.categoria)) continue;
    if (p.pode_ver) ver.add(p.categoria);
    if (p.pode_escrever) escrever.add(p.categoria);
  }
  return { papel: "membro", familiaId: c.familia_id, membroId: validos[0].id, ver, escrever };
}

/** Em qual categoria cai um registro, para decidir quem vê. */
export function categoriaDoRegistro(tipo: string, local?: string | null): Categoria | null {
  switch (tipo) {
    case "evento": return local === "escola" ? "eventos_escola" : "eventos_casa";
    case "dose":
    case "medicacao": return "medicacao";
    case "terapia":
    case "orientacao": return "orientacoes";
    case "humor": return "humor";
    case "sinal": return "sinais";
    default: return null;
  }
}
