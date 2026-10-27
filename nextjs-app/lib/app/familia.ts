/** Frente 6 · pequenas regras da conta da família, usadas por mais de uma rota do app. */
import { getSupabase } from "@/lib/supabase";
import { ehUuid } from "@/lib/app/acesso";

export async function ehResponsavelDaFamilia(pessoaId: string, familiaId: string): Promise<boolean> {
  if (!ehUuid(pessoaId) || !ehUuid(familiaId)) return false;
  const { data } = await getSupabase()
    .from("familia_responsaveis")
    .select("id")
    .eq("familia_id", familiaId)
    .eq("pessoa_id", pessoaId)
    .maybeSingle();
  return !!data;
}

/** Nome (obrigatório) e nascimento (opcional, AAAA-MM-DD, não no futuro, até 25 anos atrás). */
export function dadosDaCrianca(x: unknown, agora = new Date()): { nome: string; nascimento: string | null } | { erro: string } {
  const b = (x && typeof x === "object" ? x : {}) as Record<string, unknown>;
  const nome = typeof b.nome === "string" ? b.nome.trim().replace(/\s+/g, " ").slice(0, 80) : "";
  if (nome.length < 2) return { erro: "Informe o nome da criança." };
  let nascimento: string | null = null;
  if (b.nascimento !== undefined && b.nascimento !== null && b.nascimento !== "") {
    const n = b.nascimento;
    const hoje = agora.toISOString().slice(0, 10);
    const minimo = new Date(agora.getTime() - 25 * 365.25 * 864e5).toISOString().slice(0, 10);
    if (typeof n !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(n) || Number.isNaN(Date.parse(n)) || n > hoje || n < minimo) {
      return { erro: "Confira a data de nascimento." };
    }
    nascimento = n;
  }
  return { nome, nascimento };
}
