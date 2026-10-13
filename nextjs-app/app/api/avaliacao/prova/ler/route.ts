import { NextResponse } from "next/server";
import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { estudanteParaAvaliar } from "@/lib/avaliacao-servidor";
import { visionAdapt, getVisionError } from "@/lib/ai-engines";
import { extrairJson, RUBRICA_PADRAO, type ItemProva } from "@/lib/prova";

/**
 * POST { id, itemId, imagem (base64, sem prefixo), mime } → a IA lê a resposta escrita à mão
 * e sugere o nível da rubrica. A professora confirma. A foto não é guardada.
 */
export async function POST(req: Request) {
  const rl = rateLimitResponse(req, RATE_LIMITS.AI_GENERATION); if (rl) return rl;
  const session = await getSession();
  const body = (await req.json().catch(() => ({}))) as { id?: string; itemId?: string; imagem?: string; mime?: string };
  if (!body.imagem || body.imagem.length > 6_000_000) return NextResponse.json({ error: "Mande uma foto de até 4 MB." }, { status: 400 });
  const erroVisao = getVisionError();
  if (erroVisao) return NextResponse.json({ error: "A leitura por IA não está configurada neste ambiente." }, { status: 503 });
  const { data: prova } = await getSupabase().from("avaliacao_provas").select("*").eq("id", body.id || "-").eq("workspace_id", session?.workspace_id || "-").maybeSingle();
  if (!prova) return NextResponse.json({ error: "Prova não encontrada." }, { status: 404 });
  const r = await estudanteParaAvaliar(session, prova.student_id as string);
  if ("erro" in r) return r.erro;
  const item = ((prova.itens as ItemProva[]) || []).find((i) => i.id === body.itemId);
  if (!item || item.tipo === "objetiva") return NextResponse.json({ error: "Escolha uma questão aberta." }, { status: 400 });

  const rubrica = (item.rubrica?.length ? item.rubrica : RUBRICA_PADRAO).map((x) => `${x.nivel}: ${x.criterio}`).join("\n");
  const prompt = `Você corrige a resposta manuscrita de um estudante do Ensino Fundamental, em ${prova.disciplina}.
Questão: ${item.texto_base ? `${item.texto_base}\n` : ""}${item.enunciado}
Rubrica (nível: critério):
${rubrica}

Leia a resposta na foto (ignore nomes e qualquer dado pessoal) e responda SÓ em JSON:
{"transcricao": "<o que o estudante escreveu, fiel, até 400 caracteres>", "nivel": <0 a 4 pela rubrica>, "justificativa": "<uma frase curta>"}
Se a foto estiver ilegível, use "nivel": null e explique na justificativa. Seja justo com erros de ortografia que não mudam o sentido.`;
  try {
    const texto = await visionAdapt(prompt, body.imagem, body.mime || "image/jpeg");
    const j = extrairJson(texto) as { transcricao?: string; nivel?: number | null; justificativa?: string } | null;
    if (!j) throw new Error("sem json");
    const nivel = typeof j.nivel === "number" && j.nivel >= 0 && j.nivel <= 4 ? Math.round(j.nivel) : null;
    return NextResponse.json({ nivel, transcricao: String(j.transcricao || "").slice(0, 600), justificativa: String(j.justificativa || "").slice(0, 300) });
  } catch (e) {
    logger.error({ err: e }, "POST /api/avaliacao/prova/ler");
    return NextResponse.json({ error: "Não deu para ler a foto agora. Corrija pela rubrica." }, { status: 502 });
  }
}
