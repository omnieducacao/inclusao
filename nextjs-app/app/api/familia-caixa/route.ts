/**
 * Resumo do que a família enviou e ainda ninguém viu, por estudante (10/10/2026).
 * Alimenta o aviso do Início. Sem a migração da família, devolve vazio.
 */
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { vinculoDaSessao, filtrarPorVinculo } from "@/lib/turmas";
import { negadoCaixaFamilia } from "@/lib/familia-caixa";

export async function GET() {
  const session = await getSession();
  const negado = negadoCaixaFamilia(session);
  if (negado) return NextResponse.json({ estudantes: [] });
  const sb = getSupabase();
  const { data: ws } = await sb.from("workspaces").select("family_module_enabled").eq("id", session!.workspace_id).maybeSingle();
  if (!(ws as { family_module_enabled?: boolean } | null)?.family_module_enabled) return NextResponse.json({ estudantes: [] });

  const { data: alunos } = await sb.from("students").select("id, name, grade, class_group, class_id").eq("workspace_id", session!.workspace_id);
  const lista = filtrarPorVinculo(await vinculoDaSessao(session), (alunos || []) as Array<{ id: string; name: string; grade: string | null; class_group: string | null; class_id: string | null }>);
  const ids = lista.map((a) => a.id);
  if (!ids.length) return NextResponse.json({ estudantes: [] });

  const [l, m, msg] = await Promise.all([
    sb.from("family_laudos").select("student_id").in("student_id", ids).is("visto_em", null),
    sb.from("family_medicacao_updates").select("student_id").in("student_id", ids).is("visto_em", null),
    sb.from("family_mensagens").select("student_id").eq("workspace_id", session!.workspace_id).eq("autor", "familia").is("lida_em", null),
  ]);
  if (l.error || m.error || msg.error) return NextResponse.json({ estudantes: [], semMigracao: true });

  const conta = new Map<string, { envios: number; mensagens: number }>();
  const soma = (rows: Array<{ student_id: string }> | null, campo: "envios" | "mensagens") => {
    for (const r of rows || []) {
      if (!ids.includes(r.student_id)) continue;
      const c = conta.get(r.student_id) || { envios: 0, mensagens: 0 };
      c[campo]++;
      conta.set(r.student_id, c);
    }
  };
  soma(l.data as Array<{ student_id: string }>, "envios");
  soma(m.data as Array<{ student_id: string }>, "envios");
  soma(msg.data as Array<{ student_id: string }>, "mensagens");
  const nomes = new Map(lista.map((a) => [a.id, a.name]));
  return NextResponse.json({
    estudantes: [...conta.entries()].map(([id, c]) => ({ id, nome: nomes.get(id) || "", ...c })),
  });
}
