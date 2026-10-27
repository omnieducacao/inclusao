/**
 * SCRUM-275 · Colégio Modelo: guardar e restaurar o estado da escola ("resetar escola modelo").
 *
 * --guardar   copia todas as linhas do Colégio Modelo (como estão gravadas, já cifradas) para um arquivo
 *             no Mac, fora do repositório. Rodar uma vez, com a escola do jeito que deve ser entregue.
 * --restaurar apaga o Colégio Modelo atual e regrava as linhas guardadas, com os mesmos ids e as mesmas
 *             senhas. Rodar depois de cada avaliação externa, para a próxima pessoa achar a escola intacta.
 *
 * Usa o cliente SEM a camada de cifra (lib/supabase getSupabaseSemCifra): os valores vão e voltam
 * exatamente como estão no banco, sem cifrar duas vezes. Exige a mesma ENCRYPTION_KEY da produção.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getSupabaseSemCifra } from "@/lib/supabase";
import { ESCOLA } from "./personas";

type Linha = Record<string, unknown>;
type Estado = { versao: 1; guardado_em: string; workspace_id: string; tabelas: Record<string, Linha[]> };

export const ARQUIVO_PADRAO = path.join(os.homedir(), "colegio-modelo-estado.json");

/** Ordem de gravação (pai antes de filho). A restauração apaga na ordem inversa. */
const COM_WORKSPACE = [
  "workspaces", "workspace_masters", "school_years", "workspace_grades", "classes", "workspace_members",
  "students", "family_responsibles",
  "pei_disciplinas", "planos_ensino", "avaliacoes_diagnosticas", "avaliacao_processual", "hub_generated_content",
  "family_mensagens", "family_pei_acknowledgments", "estudante_missoes", "pei_ciencias", "monitoring_assessments",
];

async function idDaEscola(): Promise<string | null> {
  const { data, error } = await getSupabaseSemCifra().from("workspaces").select("id").eq("name", ESCOLA.nome);
  if (error) throw new Error(`procurar a escola: ${error.message}`);
  if ((data || []).length > 1) throw new Error("há mais de um Colégio Modelo; apague os extras antes");
  return (data?.[0]?.id as string) || null;
}

async function ler(tabela: string, coluna: string, valores: string[]): Promise<Linha[]> {
  if (!valores.length) return [];
  const { data, error } = await getSupabaseSemCifra().from(tabela).select("*").in(coluna, valores);
  if (error) {
    if (/does not exist|schema cache/i.test(error.message)) return []; // tabela que não existe neste banco
    throw new Error(`ler ${tabela}: ${error.message}`);
  }
  return (data || []) as Linha[];
}

export async function guardar(arquivo = ARQUIVO_PADRAO) {
  const ws = await idDaEscola();
  if (!ws) throw new Error("não há Colégio Modelo para guardar");
  const tabelas: Record<string, Linha[]> = {};
  for (const t of COM_WORKSPACE) tabelas[t] = await ler(t, t === "workspaces" ? "id" : "workspace_id", [ws]);
  const membros = tabelas.workspace_members.map((m) => m.id as string);
  const familias = tabelas.family_responsibles.map((f) => f.id as string);
  tabelas.teacher_assignments = await ler("teacher_assignments", "workspace_member_id", membros);
  tabelas.teacher_student_links = await ler("teacher_student_links", "workspace_member_id", membros);
  tabelas.family_student_links = await ler("family_student_links", "family_responsible_id", familias);
  const estado: Estado = { versao: 1, guardado_em: new Date().toISOString(), workspace_id: ws, tabelas };
  fs.writeFileSync(arquivo, JSON.stringify(estado), { mode: 0o600 });
  const resumo = Object.entries(tabelas).filter(([, l]) => l.length).map(([t, l]) => `${t} ${l.length}`).join(" · ");
  console.log(`Estado guardado em ${arquivo}\n  ${resumo}`);
}

const ORDEM_INSERIR = [
  ...COM_WORKSPACE.slice(0, 6), "teacher_assignments", "students", "teacher_student_links",
  "family_responsibles", "family_student_links", ...COM_WORKSPACE.slice(8),
];

export async function restaurar(apagarAtual: () => Promise<void>, arquivo = ARQUIVO_PADRAO) {
  if (!fs.existsSync(arquivo)) throw new Error(`não achei ${arquivo}. Rode antes com --guardar.`);
  const estado = JSON.parse(fs.readFileSync(arquivo, "utf8")) as Estado;
  if (estado.versao !== 1) throw new Error("arquivo de estado de outra versão");
  await apagarAtual();
  const sb = getSupabaseSemCifra();
  for (const t of ORDEM_INSERIR) {
    const linhas = estado.tabelas[t] || [];
    for (let i = 0; i < linhas.length; i += 200) {
      const { error } = await sb.from(t).insert(linhas.slice(i, i + 200));
      if (error) throw new Error(`regravar ${t}: ${error.message}`);
    }
  }
  console.log(`Colégio Modelo restaurado ao estado de ${new Date(estado.guardado_em).toLocaleString("pt-BR")}. Logins e senhas são os mesmos.`);
}
