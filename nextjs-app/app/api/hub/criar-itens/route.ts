import { rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { parseBody, criarAtividadeSchema } from "@/lib/validation";
import { NextResponse } from "next/server";
import { chatCompletionText, getEngineErrorWithWorkspace, type EngineId } from "@/lib/ai-engines";
import { criarPromptItensAvancado } from "@/lib/hub-prompts";
import { requireAuth } from "@/lib/permissions";
import { anonymizeMessages } from "@/lib/ai-anonymize";
import { saveHubGeneratedContent } from "@/lib/hub-tracking";

export async function POST(req: Request) {
    const rl = rateLimitResponse(req, RATE_LIMITS.AI_GENERATION); if (rl) return rl;
    const { session, error: authError } = await requireAuth(); if (authError) return authError;
    const parsed = await parseBody(req, criarAtividadeSchema);
    if (parsed.error) return parsed.error;
    const body = parsed.data;

    const assunto = (body.assunto || "").trim();
    const habilidades = body.habilidades || [];
    const temBnccPreenchida = habilidades.length > 0 || (body.ei_mode && body.ei_objetivos && body.ei_objetivos.length > 0);

    // Assunto só é obrigatório se não tiver BNCC preenchida
    if (!assunto && !temBnccPreenchida) {
        return NextResponse.json({ error: "Informe o assunto ou selecione habilidades BNCC." }, { status: 400 });
    }

    const eiMode = !!body.ei_mode;
    const eiObjetivos = body.ei_objetivos || [];
    const estudante = body.estudante || {};
    const engine: EngineId = ["red", "blue", "green", "yellow", "orange"].includes(body.engine || "")
        ? (body.engine as EngineId)
        : "red";
    const verbosBloom = body.verbos_bloom || [];
    const qtdQuestoes = body.qtd_questoes ?? 5;
    const tipoQuestao = body.tipo_questao || "Objetiva";
    const qtdImagens = body.qtd_imagens ?? 0;
    const checklist = body.checklist_adaptacao || {};

    const ctxEstudante = estudante.nome
        ? `Estudante: ${estudante.nome}. Série: ${estudante.serie || "-"}. Interesses: ${estudante.hiperfoco || "gerais"}.`
        : "";
    const perfilPei = estudante.perfil || estudante.ia_sugestao || "";

    const habParaPrompt = eiMode ? eiObjetivos : habilidades;

    // Usar prompt avançado (padrão INEP/BNI)
    const prompt = criarPromptItensAvancado({
        materia: assunto || "conteúdo baseado nas habilidades BNCC selecionadas",
        objeto: assunto || "",
        qtd: qtdQuestoes,
        tipo_q: tipoQuestao,
        qtd_imgs: qtdImagens,
        verbos_bloom: verbosBloom,
        habilidades_bncc: habParaPrompt,
        modo_profundo: false,
        checklist_adaptacao: checklist,
        hiperfoco: estudante.hiperfoco || "Geral",
        ia_sugestao: perfilPei,
    });

    // Adicionar contexto do estudante se disponível
    const promptCompleto = ctxEstudante
        ? `${prompt}\n\n${ctxEstudante}`
        : prompt;

    const wsId = session?.simulating_workspace_id || session?.workspace_id;
    const engineErr = await getEngineErrorWithWorkspace(engine, wsId);
    if (engineErr) return NextResponse.json({ error: engineErr }, { status: 500 });

    try {
        const studentName = estudante?.nome || null;
        const { anonymized, restore } = anonymizeMessages([{ role: "user", content: promptCompleto }], studentName);
        const textoRaw = await chatCompletionText(engine, anonymized, { temperature: 0.6 });
        const texto = restore(textoRaw);
        const wsId = session?.simulating_workspace_id || session?.workspace_id;
        if (wsId) {
            saveHubGeneratedContent({
                workspaceId: wsId,
                memberId: (session?.member as { id?: string } | undefined)?.id,
                studentId: null,
                contentType: "criar_itens",
                description: estudante.nome ? `Questões para ${estudante.nome}${estudante.serie ? `, ${estudante.serie}` : ""}` : `Questões: ${assunto || "BNCC"}`,
                engine,
                metadata: { assunto, qtd_questoes: qtdQuestoes, tipo_questao: tipoQuestao },
            }).catch(() => {});
        }
        return NextResponse.json({ texto });
    } catch (err) {
        console.error("Hub criar-itens:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Erro ao gerar itens." },
            { status: 500 }
        );
    }
}
