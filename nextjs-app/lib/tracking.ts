/**
 * Sistema de tracking de eventos de uso e feedback de IA
 * Equivalente a track_usage_event e track_ai_feedback do Streamlit
 */

import { getSupabase } from "./supabase";

export type EventType = 
  | "page_view"
  | "login"
  | "ai_call"
  | "ai_feedback"
  | "export_pdf"
  | "export_docx"
  | "export_csv"
  | "export_json"
  | "export_pptx"
  | "student_created"
  | "student_updated"
  | "student_deleted"
  | "pei_saved"
  | "paee_cycle_created"
  | "diario_entry_created"
  | "member_created"
  | "member_updated";

export type AIEngine = "red" | "blue" | "green" | "yellow" | "orange";

export type AIFeedbackAction = "validated" | "rejected" | "adjusted" | "regenerated";

/**
 * Registra um evento de uso no Supabase
 */
export async function trackUsageEvent(
  eventType: EventType,
  options: {
    workspaceId?: string;
    source?: string;
    aiEngine?: AIEngine;
    metadata?: Record<string, unknown>;
    actorType?: "member" | "master" | "admin";
    actorId?: string;
  } = {}
): Promise<void> {
  try {
    const sb = getSupabase();
    const { workspaceId, source, aiEngine, metadata, actorType, actorId } = options;

    await sb.from("usage_events").insert({
      event_type: eventType,
      workspace_id: workspaceId || null,
      source: source || null,
      ai_engine: aiEngine || null,
      metadata: metadata || null,
      actor_type: actorType || null,
      actor_id: actorId || null,
    });
  } catch (err) {
    // Falha silenciosa - não deve quebrar o fluxo principal
    console.error("Erro ao registrar evento de uso:", err);
  }
}

/**
 * Registra uso de IA (para métricas e sistema de créditos)
 */
export async function trackAIUsage(
  engine: AIEngine,
  options: {
    workspaceId?: string;
    source?: string;
    creditsConsumed?: number;
  } = {}
): Promise<void> {
  try {
    const sb = getSupabase();
    const { workspaceId, source, creditsConsumed = 1.0 } = options;

    // Registrar como evento de uso
    await trackUsageEvent("ai_call", {
      workspaceId,
      source,
      aiEngine: engine,
      metadata: { credits_consumed: creditsConsumed },
    });

    // Também registrar na tabela de uso de IA (se existir)
    if (workspaceId) {
      try {
        await sb.from("ia_usage").insert({
          workspace_id: workspaceId,
          engine: engine.toLowerCase(),
          source: source || null,
          credits_consumed: creditsConsumed,
        });
      } catch {
        // Tabela pode não existir ainda - ignorar erro
      }
    }
  } catch (err) {
    console.error("Erro ao registrar uso de IA:", err);
  }
}

/**
 * Registra feedback do usuário sobre resposta de IA
 */
export async function trackAIFeedback(
  source: string,
  action: AIFeedbackAction,
  options: {
    workspaceId?: string;
    engine?: AIEngine;
    contentType?: string;
    feedbackText?: string;
    metadata?: Record<string, unknown>;
  } = {}
): Promise<void> {
  try {
    const sb = getSupabase();
    const { workspaceId, engine, contentType, feedbackText, metadata } = options;

    // Registrar na tabela ai_feedback (se existir)
    try {
      await sb.from("ai_feedback").insert({
        workspace_id: workspaceId || null,
        engine: engine || null,
        source: source,
        content_type: contentType || null,
        action: action,
        feedback_text: feedbackText || null,
        metadata: metadata || {},
      });
    } catch {
      // Tabela pode não existir ainda - ignorar erro
    }

    // Também registrar como evento de uso
    await trackUsageEvent("ai_feedback", {
      workspaceId,
      source,
      aiEngine: engine,
      metadata: {
        action,
        content_type: contentType,
        feedback_text: feedbackText,
        ...metadata,
      },
    });
  } catch (err) {
    console.error("Erro ao registrar feedback de IA:", err);
  }
}

/**
 * Registra visualização de página (com throttling)
 */
const pageViewCache: Record<string, number> = {};
const PAGE_VIEW_THROTTLE_MS = 120000; // 2 minutos

export async function trackPageView(
  pageName: string,
  workspaceId?: string
): Promise<void> {
  if (!pageName) return;

  const now = Date.now();
  const last = pageViewCache[pageName];
  
  // Throttling: só registra se passou mais de 2 minutos desde a última visualização
  if (last && (now - last) < PAGE_VIEW_THROTTLE_MS) {
    return;
  }

  pageViewCache[pageName] = now;

  await trackUsageEvent("page_view", {
    workspaceId,
    source: pageName,
    metadata: { page: pageName },
  });
}
