import { registrarAcesso } from "@/lib/acessos";
import { getSupabase } from "@/lib/supabase";
import { createSession } from "@/lib/session";
import { DEMO_DURACAO_SEGUNDOS, DEMO_WORKSPACE_ID, PAPEIS_DEMO, type PapelDemo } from "@/lib/demo";

/** Abre a sessão de visitante na Escola Demo como o membro fictício do papel escolhido. */
export async function abrirSessaoDemo(papel: PapelDemo, leadId: string | null, tipo: "demo_entrada" | "demo_papel" = "demo_entrada"): Promise<string> {
  const sb = getSupabase();
  const [{ data: membro }, { data: ws }] = await Promise.all([
    sb.from("workspace_members")
      .select("id, workspace_id, nome, email, papel, cargo, can_estudantes, can_pei, can_pei_professor, can_paee, can_hub, can_diario, can_avaliacao, can_gestao, link_type")
      .eq("workspace_id", DEMO_WORKSPACE_ID).eq("email", PAPEIS_DEMO[papel].email).maybeSingle(),
    sb.from("workspaces").select("name").eq("id", DEMO_WORKSPACE_ID).maybeSingle(),
  ]);
  if (!membro) throw new Error("A Escola Demo não está pronta.");
  await createSession({
    workspace_id: DEMO_WORKSPACE_ID,
    workspace_name: (ws?.name as string) || "Escola Demo",
    usuario_nome: membro.nome as string,
    user_role: "member",
    member: { ...membro, terms_accepted: true } as Record<string, unknown>,
    is_platform_admin: false,
    terms_accepted: true,
    is_demo: true,
    demo_papel: papel,
    demo_lead_id: leadId,
  }, DEMO_DURACAO_SEGUNDOS);
  await registrarAcesso({ tipo, workspace_id: DEMO_WORKSPACE_ID, workspace_nome: "Demonstração", usuario_nome: membro.nome as string, papel: PAPEIS_DEMO[papel].rotulo, lead_id: leadId });
  return PAPEIS_DEMO[papel].inicio;
}
