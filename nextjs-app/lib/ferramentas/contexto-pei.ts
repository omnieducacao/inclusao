/**
 * O PEI do estudante como contexto das ferramentas (onda 3).
 *
 * Antes, cada tela do Hub mandava para a API um pedaço do texto do PEI (os primeiros 800 a 1.000
 * caracteres de ia_sugestao, que costumam ser o perfil narrativo e o diagnóstico) mais o hiperfoco.
 * Agora a tela manda só o id do estudante, e o servidor monta um resumo acionável do PEI:
 * apoios, barreiras com nível de suporte, potencialidades, hiperfoco, estratégias de acesso,
 * ensino e avaliação, tecnologia assistiva, alfabetização, conclusões do estudo de caso e metas.
 *
 * O servidor confere a escola e o vínculo de quem pede (um professor só usa o PEI dos seus
 * estudantes). O nome do estudante continua sendo trocado por um apelido antes de ir para a IA
 * (lib/ai-anonymize), em cada rota.
 */
import type { SessionPayload } from "@/lib/session";
import { getStudent, type Student } from "@/lib/students";
import { vinculoDaSessao, vinculoInclui } from "@/lib/turmas";
import type { EstudoCaso, Vigencia } from "@/lib/estudo-caso";

export type ContextoPei = {
  studentId: string;
  nome: string;
  serie: string;
  hiperfoco: string;
  /** resumo acionável do PEI, pronto para entrar no prompt */
  perfil: string;
  versaoPei: number | null;
};

const LIMITE = 2400;

function lista(v: unknown, max = 8): string {
  if (!Array.isArray(v)) return "";
  return v.filter((x) => typeof x === "string" && x.trim()).slice(0, max).join(", ");
}

/** Pega a seção de metas do texto do PEI gerado pela IA (### 5. METAS SMART ...). */
export function metasDoTextoPei(texto: string): string {
  if (!texto) return "";
  const m = texto.match(/###\s*\d*\.?\s*[^\n]*METAS[^\n]*\n([\s\S]*?)(?=\n###\s|$)/i);
  return m ? m[1].trim().slice(0, 700) : "";
}

export function montarPerfilPei(pei: Record<string, unknown>): string {
  const ec = (pei.estudo_caso || {}) as EstudoCaso;
  const barreiras = (pei.barreiras_selecionadas || {}) as Record<string, string[]>;
  const niveis = (pei.niveis_suporte || {}) as Record<string, string>;
  const linhasBarreiras = Object.entries(barreiras)
    .filter(([, itens]) => Array.isArray(itens) && itens.length)
    .map(([dominio, itens]) => {
      const comNivel = itens.slice(0, 5).map((b) => (niveis[b] ? `${b} (${niveis[b]})` : b));
      return `  - ${dominio}: ${comNivel.join("; ")}`;
    });

  const apoio = (v?: string) => (v === "sim" ? "sim" : v === "nao" ? "não" : v === "avaliar" ? "em avaliação" : "");
  const partes: string[] = [
    "PEI DO ESTUDANTE (use para adaptar; não cite diagnóstico nem estas anotações no material do aluno)",
    linhasBarreiras.length ? `Barreiras e nível de suporte:\n${linhasBarreiras.join("\n")}` : "",
    lista(pei.potencias) ? `Potencialidades: ${lista(pei.potencias)}` : "",
    pei.hiperfoco ? `Hiperfoco/interesses: ${String(pei.hiperfoco).slice(0, 120)}` : "",
    lista(pei.estrategias_acesso) ? `Acesso: ${lista(pei.estrategias_acesso)}` : "",
    lista(pei.estrategias_ensino) ? `Ensino: ${lista(pei.estrategias_ensino)}` : "",
    lista(pei.estrategias_avaliacao) ? `Avaliação: ${lista(pei.estrategias_avaliacao)}` : "",
    lista(pei.tecnologias_assistivas) ? `Tecnologia assistiva: ${lista(pei.tecnologias_assistivas)}` : "",
    pei.nivel_alfabetizacao ? `Alfabetização: ${String(pei.nivel_alfabetizacao)}` : "",
    apoio(ec.necessita_profissional_apoio) ? `Profissional de apoio: ${apoio(ec.necessita_profissional_apoio)}` : "",
    ec.conclusao ? `Conclusão do estudo de caso: ${ec.conclusao.slice(0, 400)}` : "",
  ];
  const metas = metasDoTextoPei(String(pei.ia_sugestao || ""));
  if (metas) partes.push(`Metas do PEI:\n${metas}`);

  let texto = partes.filter(Boolean).join("\n");
  // Sem nada estruturado (PEI antigo): cai para o começo do texto do PEI, como antes
  if (partes.filter(Boolean).length <= 1) {
    const bruto = String(pei.ia_sugestao || "").trim();
    texto = bruto ? `PEI DO ESTUDANTE (resumo):\n${bruto.slice(0, 1200)}` : "";
  }
  return texto.slice(0, LIMITE);
}

/**
 * Carrega o estudante (escola + vínculo da sessão) e devolve o contexto do PEI,
 * ou null se não houver id, não for da escola ou estiver fora do vínculo.
 */
export async function contextoPeiDoEstudante(
  session: Partial<SessionPayload> | null | undefined,
  studentId: unknown
): Promise<ContextoPei | null> {
  const workspaceId = session?.simulating_workspace_id || session?.workspace_id;
  if (!workspaceId || typeof studentId !== "string" || !studentId.trim()) return null;

  const est: Student | null = await getStudent(workspaceId, studentId.trim());
  if (!est) return null;
  const vinculo = await vinculoDaSessao(session);
  if (!vinculoInclui(vinculo, est)) return null;

  const pei = (est.pei_data || {}) as Record<string, unknown>;
  const vig = pei.vigencia as Vigencia | undefined;
  return {
    studentId: est.id,
    nome: est.name || String(pei.nome || ""),
    serie: est.grade || String(pei.serie || ""),
    hiperfoco: String(pei.hiperfoco || pei.interesses || "").slice(0, 120),
    perfil: montarPerfilPei(pei),
    versaoPei: vig?.versao ?? null,
  };
}

/**
 * Coloca o contexto do PEI no corpo da requisição, nos campos que cada rota do Hub já lê
 * (estudante / aluno / nome_estudante / hiperfoco). Assim as rotas mudam pouco.
 * Devolve o contexto (ou null, e o corpo fica como veio).
 */
export async function enriquecerComPei(
  session: Partial<SessionPayload> | null | undefined,
  body: Record<string, unknown>
): Promise<ContextoPei | null> {
  const ctx = await contextoPeiDoEstudante(session, body.student_id ?? body.studentId);
  if (!ctx) return null;
  const dados = {
    nome: ctx.nome,
    serie: ctx.serie,
    hiperfoco: ctx.hiperfoco || undefined,
    perfil: ctx.perfil,
    ia_sugestao: ctx.perfil,
  };
  for (const chave of ["estudante", "aluno"] as const) {
    const atual = body[chave] && typeof body[chave] === "object" ? (body[chave] as Record<string, unknown>) : {};
    body[chave] = { ...atual, ...Object.fromEntries(Object.entries(dados).filter(([, v]) => v !== undefined)) };
  }
  body.nome_estudante = ctx.nome;
  if (ctx.hiperfoco) body.hiperfoco = ctx.hiperfoco;
  return ctx;
}
