/**
 * Família ↔ escola (10/10/2026). O que a família envia (laudo, mudança de medicação) chega à escola
 * numa caixa de entrada por estudante, e as duas partes trocam mensagens curtas com registro.
 * Textos de saúde e mensagens são gravados criptografados (lib/encryption) e lidos aqui.
 * Se a migração 20261010_familia_caixa_mensagens.sql ainda não rodou, as funções devolvem
 * o que conseguem e marcam `semMigracao`, sem quebrar a tela.
 */
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { encryptField, decryptField } from "@/lib/encryption";
import type { SessionPayload } from "@/lib/session";

export type ItemFamilia =
  | { tipo: "laudo"; id: string; quando: string; nome_arquivo: string | null; texto: string; visto_em: string | null; quem: string | null }
  | { tipo: "medicacao"; id: string; quando: string; medicamento: string; dosagem: string | null; alteracao: string | null; observacao: string | null; visto_em: string | null; quem: string | null };

export type Mensagem = { id: string; autor: "escola" | "familia"; autor_nome: string | null; texto: string; lida_em: string | null; created_at: string };

export const LIMITE_MENSAGEM = 1000;

const dec = (s: unknown) => (typeof s === "string" ? decryptField(s) : "");
export const cifrar = (s: string) => encryptField(s);

/** Quem da escola pode ver o que a família envia: direção, coordenação (PEI) e quem cuida dos estudantes. */
export function negadoCaixaFamilia(session: Partial<SessionPayload> | null | undefined): NextResponse | null {
  if (!session?.workspace_id || session.user_role === "family") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }
  if (session.is_platform_admin || session.user_role === "master") return null;
  const m = (session.member || {}) as Record<string, unknown>;
  if (m.can_pei || m.can_estudantes) return null;
  return NextResponse.json({ error: "Sem permissão para ver o que a família envia." }, { status: 403 });
}

async function nomesDosResponsaveis(ids: string[]): Promise<Map<string, string>> {
  const unicos = [...new Set(ids.filter(Boolean))];
  if (!unicos.length) return new Map();
  const { data } = await getSupabase().from("family_responsibles").select("id, nome, parentesco").in("id", unicos);
  return new Map((data || []).map((r: { id: string; nome: string | null; parentesco: string | null }) =>
    [r.id, [r.nome, r.parentesco ? `(${r.parentesco})` : ""].filter(Boolean).join(" ")]));
}

/** Laudos e mudanças de medicação enviados pela família, mais recentes primeiro. */
export async function itensDaFamilia(studentId: string): Promise<{ itens: ItemFamilia[]; semMigracao: boolean }> {
  const sb = getSupabase();
  let semMigracao = false;
  const comVisto = async (tabela: string, campos: string) => {
    const r = await sb.from(tabela).select(`${campos}, visto_em`).eq("student_id", studentId).order("created_at", { ascending: false }).limit(50);
    if (!r.error) return (r.data || []) as unknown as Record<string, unknown>[];
    semMigracao = true;
    const r2 = await sb.from(tabela).select(campos).eq("student_id", studentId).order("created_at", { ascending: false }).limit(50);
    return (r2.data || []) as unknown as Record<string, unknown>[];
  };
  const [laudos, meds] = await Promise.all([
    comVisto("family_laudos", "id, family_responsible_id, transcricao, nome_arquivo, created_at"),
    comVisto("family_medicacao_updates", "id, family_responsible_id, medicamento, dosagem, tipo_alteracao, observacao, created_at"),
  ]);
  const nomes = await nomesDosResponsaveis([...laudos, ...meds].map((x) => x.family_responsible_id as string));
  const itens: ItemFamilia[] = [
    ...laudos.map((l) => ({
      tipo: "laudo" as const, id: l.id as string, quando: l.created_at as string,
      nome_arquivo: (l.nome_arquivo as string) || null, texto: dec(l.transcricao),
      visto_em: (l.visto_em as string) || null, quem: nomes.get(l.family_responsible_id as string) || null,
    })),
    ...meds.map((m) => ({
      tipo: "medicacao" as const, id: m.id as string, quando: m.created_at as string,
      medicamento: dec(m.medicamento), dosagem: dec(m.dosagem) || null, alteracao: (m.tipo_alteracao as string) || null,
      observacao: dec(m.observacao) || null, visto_em: (m.visto_em as string) || null, quem: nomes.get(m.family_responsible_id as string) || null,
    })),
  ].sort((a, b) => (a.quando < b.quando ? 1 : -1));
  return { itens, semMigracao };
}

export async function mensagensDoEstudante(workspaceId: string, studentId: string): Promise<{ mensagens: Mensagem[]; semMigracao: boolean }> {
  const { data, error } = await getSupabase()
    .from("family_mensagens")
    .select("id, autor, autor_nome, texto, lida_em, created_at")
    .eq("workspace_id", workspaceId).eq("student_id", studentId)
    .order("created_at", { ascending: true }).limit(200);
  if (error) return { mensagens: [], semMigracao: true };
  return {
    mensagens: (data || []).map((m: Record<string, unknown>) => ({
      id: m.id as string, autor: m.autor as "escola" | "familia", autor_nome: (m.autor_nome as string) || null,
      texto: dec(m.texto), lida_em: (m.lida_em as string) || null, created_at: m.created_at as string,
    })),
    semMigracao: false,
  };
}

/** Marca como lidas as mensagens que vieram do outro lado. */
export async function marcarMensagensLidas(workspaceId: string, studentId: string, de: "escola" | "familia") {
  await getSupabase().from("family_mensagens").update({ lida_em: new Date().toISOString() })
    .eq("workspace_id", workspaceId).eq("student_id", studentId).eq("autor", de).is("lida_em", null);
}

export function validarTextoMensagem(texto: unknown): string | null {
  if (typeof texto !== "string") return null;
  const t = texto.trim();
  if (!t || t.length > LIMITE_MENSAGEM) return null;
  return t;
}

/** Identificador da versão vigente do PEI, usado na ciência da família ("v3"; "sem-versao" antes de valer). */
export function snapshotDaVersao(peiData: Record<string, unknown>): string {
  const v = (peiData.vigencia as { versao?: number } | undefined)?.versao;
  return typeof v === "number" && v > 0 ? `v${v}` : "sem-versao";
}
