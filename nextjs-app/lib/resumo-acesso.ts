/**
 * SCRUM-231: o que se guarda de quem acessou, sem guardar o dado pessoal em si.
 *
 * - resumirIp: resumo com chave do servidor (HMAC-SHA256 com SESSION_SECRET). O mesmo IP gera o
 *   mesmo resumo (dá para ver repetição e comparar com um IP conhecido), mas não dá para voltar ao
 *   IP testando todos os possíveis, como daria com um hash simples.
 * - resumirNavegador: só o tipo de navegador e de sistema ("Chrome · Android"), sem a versão e sem
 *   a assinatura completa do aparelho.
 */
import { createHmac } from "crypto";

export function resumirIp(ip: string | null | undefined): string | null {
  const limpo = (ip || "").split(",")[0].trim();
  if (!limpo) return null;
  const chave = process.env.SESSION_SECRET || "omnisfera-dev-secret-change-in-prod";
  return "ip:" + createHmac("sha256", chave).update(limpo).digest("hex").slice(0, 32);
}

export function ipDoPedido(req: Request): string | null {
  return req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null;
}

export function resumirNavegador(ua: string | null | undefined): string | null {
  if (!ua) return null;
  const navegador =
    /Edg\//.test(ua) ? "Edge" :
    /OPR\/|Opera/.test(ua) ? "Opera" :
    /SamsungBrowser/.test(ua) ? "Samsung Internet" :
    /Firefox\//.test(ua) ? "Firefox" :
    /Chrome\//.test(ua) ? "Chrome" :
    /Safari\//.test(ua) ? "Safari" : "outro navegador";
  const sistema =
    /Android/.test(ua) ? "Android" :
    /iPhone|iPad|iPod/.test(ua) ? "iOS" :
    /Windows/.test(ua) ? "Windows" :
    /Mac OS X|Macintosh/.test(ua) ? "macOS" :
    /CrOS/.test(ua) ? "ChromeOS" :
    /Linux/.test(ua) ? "Linux" : "outro sistema";
  return `${navegador} · ${sistema}`;
}
