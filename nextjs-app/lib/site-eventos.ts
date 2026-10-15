/**
 * Medição do site (onda 57): visitas, cliques e marcos (ex.: chegou ao fim da história da Beatriz).
 *
 * Sem cookie e sem guardar IP. O "visitante" é um hash de IP + navegador + data, que muda todo dia:
 * serve para contar pessoas diferentes num dia, não para seguir alguém ao longo do tempo.
 * Funções puras aqui; a gravação fica em app/api/public/evento.
 */
import { createHash } from "crypto";

export type TipoEvento = "visita" | "clique" | "marco";
export type EventoSite = {
  tipo: TipoEvento; pagina: string; alvo: string | null; ref_host: string | null;
  utm_source: string | null; utm_medium: string | null; utm_campaign: string | null;
};

const corta = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Só o caminho, sem consulta nem âncora: "/formacao/?x=1#cert" vira "/formacao/". */
export function normalizarPagina(p: string): string {
  let s = p.split(/[?#]/)[0] || "/";
  if (!s.startsWith("/")) s = "/" + s;
  s = s.replace(/\/index\.html$/, "/").replace(/^\/site\//, "/").replace(/\/{2,}/g, "/");
  return s.slice(0, 120) || "/";
}

export function hostDe(url: string): string | null {
  try { return new URL(url).hostname.replace(/^www\./, "").toLowerCase().slice(0, 80) || null; } catch { return null; }
}

export function validarEvento(body: unknown): EventoSite | null {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const tipo = b.t;
  if (tipo !== "visita" && tipo !== "clique" && tipo !== "marco") return null;
  const pagina = corta(b.p, 300);
  if (!pagina) return null;
  const alvo = corta(b.a, 120) || null;
  if (tipo !== "visita" && !alvo) return null;
  const u = (b.u && typeof b.u === "object" ? b.u : {}) as Record<string, unknown>;
  const ref = corta(b.r, 400);
  const ref_host = ref ? hostDe(ref) : null;
  return {
    tipo, pagina: normalizarPagina(pagina), alvo,
    ref_host: ref_host && !/(^|\.)omnisfera\.net$/.test(ref_host) ? ref_host : null,
    utm_source: corta(u.s, 60).toLowerCase() || null, utm_medium: corta(u.m, 60).toLowerCase() || null, utm_campaign: corta(u.c, 80) || null,
  };
}

/** De onde a pessoa veio, em poucos grupos legíveis no painel. */
export function classificarOrigem(refHost: string | null, utmSource: string | null): string {
  const s = `${utmSource || ""} ${refHost || ""}`.toLowerCase();
  if (/whats|wa\.me/.test(s)) return "WhatsApp";
  if (/instagram/.test(s)) return "Instagram";
  if (/facebook|fb\.|\bfb\b/.test(s)) return "Facebook";
  if (/linkedin|lnkd/.test(s)) return "LinkedIn";
  if (/google/.test(s)) return "Google";
  if (/bing|duckduckgo|yahoo|ecosia/.test(s)) return "Outras buscas";
  if (/omniprof/.test(s)) return "OmniProf";
  if (/mail|email|gmail|outlook/.test(s)) return "E-mail";
  if (!refHost && !utmSource) return "Direto ou WhatsApp";
  return "Outros sites";
}

export function dispositivoDe(ua: string): "celular" | "computador" {
  return /mobile|android|iphone|ipad|ipod/i.test(ua) ? "celular" : "computador";
}

/** Robôs e navegadores automatizados não contam (inclui os testes automáticos da equipe). */
export function ehRoboUA(ua: string): boolean {
  return !ua || /bot|crawler|spider|slurp|headless|preview|facebookexternalhit|whatsapp|curl|wget|python|node-fetch|lighthouse/i.test(ua);
}

export function visitanteDoDia(ip: string, ua: string, dia: string): string {
  return createHash("sha256").update(`omnisfera-site:${dia}:${ip}:${ua}`).digest("hex").slice(0, 20);
}
