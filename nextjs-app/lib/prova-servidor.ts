/**
 * Onda 25 — montar a prova em papel com IA (só no servidor).
 * Uma chamada para a prova inteira: dois itens por descritor, no formato JSON de lib/prova.ts,
 * seguindo as regras de item do Guia do Inep (2010) e o perfil do PEI, sem citar diagnóstico.
 */
import { randomUUID } from "crypto";
import { chatCompletionText, type EngineId } from "@/lib/ai-engines";
import { anonymizeMessages } from "@/lib/ai-anonymize";
import { barreirasDoPei } from "@/lib/pei-metas";
import { blocoParametroOmni } from "@/lib/matriz-omni";
import { blocoParametroEnem } from "@/lib/matriz-enem";
import { saebDoItem } from "@/lib/matriz-avaliacao-servidor";
import type { ItemMatriz } from "@/lib/matriz-avaliacao";
import { extrairJson, normalizarItens, type ItemProva } from "@/lib/prova";

export type EstudanteProva = { name: string; pei_data: Record<string, unknown> | null };

function parametroDo(item: ItemMatriz, disciplina: string): string {
  if (item.codigo.startsWith("OMNI-")) return blocoParametroOmni(item, saebDoItem(disciplina, item));
  if (/^(LC|MT|CN|CH)-H\d+$/.test(item.codigo)) return blocoParametroEnem(item.codigo);
  return `PARÂMETRO DO ITEM (BNCC ${item.codigo}): ${item.descritor}`;
}

/** Tipo de item que combina com o descritor: produção/explicação → aberta; prática corporal/artística → observação. */
export function tipoSugerido(item: ItemMatriz, disciplina: string): "objetiva" | "aberta" | "observacao" {
  const verbo = (item.descritor.split(/\s+/)[0] || "").toLowerCase();
  if (["Educação Física", "Arte"].includes(disciplina) && (item.eixo_cognitivo === 4 || /^(executar|realizar|praticar|criar|compor|encenar|dançar|cantar|tocar|experimentar|construir)/.test(verbo))) return "observacao";
  if (item.eixo_cognitivo === 4 || /^(produzir|escrever|redigir|planejar|elaborar|propor|justificar|explicar|argumentar|desenhar|construir|apresentar|recontar)/.test(verbo)) return "aberta";
  return "objetiva";
}

const ESQUEMA = `[
  {
    "codigo": "<código do descritor, exatamente como recebido>",
    "ordem": 1,
    "tipo": "objetiva" | "aberta" | "observacao",
    "texto_base": "<texto curto de apoio, se precisar; sem imagens: descreva em palavras>",
    "enunciado": "<um comando claro>",
    "alternativas": [{"texto": "...", "erro": "<o erro que esta alternativa revela; vazio no gabarito>"}],
    "gabarito": "A" | "B" | "C" | "D",
    "rubrica": [{"nivel": 0, "criterio": "..."}, {"nivel": 1, "criterio": "..."}, {"nivel": 2, "criterio": "..."}, {"nivel": 3, "criterio": "..."}, {"nivel": 4, "criterio": "..."}],
    "observar": "<o que a professora observa enquanto o estudante faz>"
  }
]`;

export function promptDaProva(opts: {
  estudante: EstudanteProva; disciplina: string; ano: string | null; itens: ItemMatriz[]; tipos: Record<string, string>; soItem?: { codigo: string; ordem: 1 | 2 };
}): string {
  const pei = opts.estudante.pei_data || {};
  const barreiras = barreirasDoPei(pei).slice(0, 8).map((b) => `${b.barreira}${b.nivel ? ` (${b.nivel})` : ""}`);
  const hiperfoco = typeof pei.hiperfoco === "string" ? pei.hiperfoco : "";
  const blocos = opts.itens.map((i) => `### ${i.codigo} — tipo pedido: ${opts.tipos[i.codigo]}\n${parametroDo(i, opts.disciplina)}\n- Evidência esperada: ${i.evidencia || "—"}`).join("\n\n");
  const quantos = opts.soItem
    ? `Crie UM item só: descritor ${opts.soItem.codigo}, ordem ${opts.soItem.ordem} (${opts.soItem.ordem === 1 ? "com apoio" : "sem apoio"}). Devolva uma lista JSON com um único objeto.`
    : `Crie DOIS itens para cada descritor (${opts.itens.length} descritores, ${opts.itens.length * 2} itens no total): ordem 1 COM apoio no próprio item e ordem 2 SEM apoio.`;
  return `Você é especialista em avaliação diagnóstica inclusiva e elaboração de itens (Guia de Elaboração de Itens do Inep). Vai montar uma prova em papel de ${opts.disciplina} (${opts.ano || "ano de referência do estudante"}) para ${opts.estudante.name}, que vai ser impressa, respondida à mão e corrigida pela professora.

${quantos}

DESCRITORES (cada item mede SÓ o seu descritor):
${blocos}

PERFIL PARA ADAPTAR (sem citar diagnóstico):
${barreiras.length ? `- Barreiras: ${barreiras.join("; ")}` : "- Sem barreiras registradas no PEI."}
${hiperfoco ? `- Interesse que engaja (use nos contextos quando couber): ${hiperfoco}` : ""}

REGRAS DE ITEM:
- Ordem 1 (com apoio): exemplo resolvido parecido, dica no enunciado ou passo a passo; nas objetivas, 3 alternativas.
- Ordem 2 (sem apoio): mesmo descritor, sem dica; nas objetivas, 4 alternativas.
- Objetiva: gabarito único e indiscutível; distratores plausíveis que revelam erros reais (diga qual erro em "erro"); alternativas paralelas e de tamanho parecido; sem "todas/nenhuma das anteriores"; sem pegadinha; sem negativas ("exceto", "não") no enunciado.
- Aberta: comando curto; rubrica 0 a 4 específica para o descritor (0 não fez, 4 fez certo e completo, com autonomia).
- Observação (práticas corporais e artísticas): descreva a tarefa que o estudante faz e a rubrica 0 a 4 do que observar.
- Respeite o tipo pedido para cada descritor.
- Texto-base só com o necessário, linguagem simples, frases curtas, um comando por item. Nada de imagens, emojis ou tabelas: se precisar de figura ou tabela, descreva em texto curto.
- Adeque ao ano e ao perfil. Português do Brasil.

Responda SÓ com o JSON (sem comentários), neste formato:
${ESQUEMA}`;
}

export async function gerarItensDaProva(opts: {
  estudante: EstudanteProva; disciplina: string; ano: string | null; itens: ItemMatriz[]; workspaceId: string; engine?: EngineId; soItem?: { codigo: string; ordem: 1 | 2 };
}): Promise<ItemProva[]> {
  const tipos = Object.fromEntries(opts.itens.map((i) => [i.codigo, tipoSugerido(i, opts.disciplina)]));
  const prompt = promptDaProva({ ...opts, tipos });
  const { anonymized, restore } = anonymizeMessages([{ role: "user", content: prompt }], opts.estudante.name);
  const texto = await chatCompletionText(opts.engine || "red", anonymized, {
    temperature: 0.4, workspaceId: opts.workspaceId, source: "avaliacao-prova-papel",
    max_tokens: opts.soItem ? 1500 : Math.min(9000, 700 * opts.itens.length * 2 + 600),
  });
  const bruto = extrairJson(restore(texto));
  return normalizarItens(bruto, opts.itens.map((i) => i.codigo), () => randomUUID());
}
