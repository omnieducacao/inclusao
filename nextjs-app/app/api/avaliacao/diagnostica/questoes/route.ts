import { NextResponse } from "next/server";
import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { getSession } from "@/lib/session";
import { chatCompletionText, type EngineId } from "@/lib/ai-engines";
import { anonymizeMessages } from "@/lib/ai-anonymize";
import { logger } from "@/lib/logger";
import { estudanteParaAvaliar } from "@/lib/avaliacao-servidor";
import { barreirasDoPei } from "@/lib/pei-metas";
import { blocoParametroOmni } from "@/lib/matriz-omni";
import { blocoParametroEnem } from "@/lib/matriz-enem";
import { componenteOficial } from "@/lib/matriz-avaliacao";
import { itemPorCodigo, saebDoItem } from "@/lib/matriz-avaliacao-servidor";

/**
 * POST /api/avaliacao/diagnostica/questoes  { studentId, disciplina, codigo, ano_referencia, engine? }
 * Onda 17: duas questões curtas para observar UM descritor, já com as adaptações do perfil do
 * estudante. As questões ajudam a decidir o nível; quem decide é a professora.
 */
export async function POST(req: Request) {
  const rl = rateLimitResponse(req, RATE_LIMITS.AI_GENERATION); if (rl) return rl;
  const session = await getSession();
  const body = (await req.json().catch(() => ({}))) as { studentId?: string; disciplina?: string; codigo?: string; ano_referencia?: number; engine?: string };
  const r = await estudanteParaAvaliar(session, body.studentId);
  if ("erro" in r) return r.erro;
  const disciplina = componenteOficial(body.disciplina || "");
  const item = await itemPorCodigo(String(body.codigo || ""), disciplina, r.serie.etapa, Number(body.ano_referencia) || r.serie.ano);
  if (!item) return NextResponse.json({ error: "Descritor não encontrado na matriz." }, { status: 400 });

  const pei = r.estudante.pei_data || {};
  const barreiras = barreirasDoPei(pei).slice(0, 8).map((b) => `${b.barreira}${b.nivel ? ` (${b.nivel})` : ""}`);
  const hiperfoco = typeof pei.hiperfoco === "string" ? pei.hiperfoco : "";
  const parametro = item.codigo.startsWith("OMNI-")
    ? blocoParametroOmni(item, saebDoItem(disciplina, item))
    : item.codigo.match(/^(LC|MT|CN|CH)-H\d+$/) ? blocoParametroEnem(item.codigo)
      : `PARÂMETRO DO ITEM (BNCC ${item.codigo}): ${item.descritor}`;

  const prompt = `Você é especialista em avaliação diagnóstica inclusiva. Crie DUAS questões curtas para observar se ${r.estudante.name} demonstra o descritor abaixo, em ${disciplina} (${item.ano}).

${parametro}

PERFIL PARA ADAPTAR (sem citar diagnóstico):
${barreiras.length ? `- Barreiras: ${barreiras.join("; ")}` : "- Sem barreiras registradas no PEI."}
${hiperfoco ? `- Interesse que engaja: ${hiperfoco}` : ""}

Regras:
- Questão 1 com apoio (visual, exemplo resolvido ou alternativas reduzidas); questão 2 com menos apoio.
- Linguagem simples, frases curtas, um comando por questão. Nada de emojis.
- Depois de cada questão, uma linha "O que observar:" dizendo o que indica cada nível (0 a 4) de forma breve.
- Formato em Markdown: "### Questão 1", enunciado, alternativas se houver, "**Gabarito:**", "**O que observar:**".`;

  try {
    const { anonymized, restore } = anonymizeMessages([{ role: "user", content: prompt }], r.estudante.name);
    const engine = (["red", "blue", "green", "yellow", "orange"].includes(body.engine || "") ? body.engine : "red") as EngineId;
    const texto = await chatCompletionText(engine, anonymized, { temperature: 0.5, workspaceId: session!.workspace_id as string, source: "avaliacao-diagnostica-questoes", max_tokens: 1400 });
    return NextResponse.json({ texto: restore(texto) });
  } catch (e) {
    logger.error({ err: e }, "POST /api/avaliacao/diagnostica/questoes");
    return NextResponse.json({ error: "Não deu para criar as questões agora. Tente de novo." }, { status: 502 });
  }
}
