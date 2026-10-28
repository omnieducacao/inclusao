import { NextResponse } from "next/server";

/**
 * Frente 6 · Omniband · Universal Links do iPhone: o link do chip (https://omnisfera.net/t/…) abre
 * direto no app Omnisfera quando ele está instalado; sem o app, abre a página de ajuda no navegador.
 * APPLE_TEAM_ID sai da conta Apple Developer (Membership). Sem ele, a lista vai vazia (nada quebra).
 * Precisa de "/.well-known/" em PUBLIC_PATHS no proxy.ts.
 */
export const dynamic = "force-dynamic";

export function GET() {
  const time = process.env.APPLE_TEAM_ID;
  const pacote = process.env.APP_IOS_BUNDLE || "net.omnisfera.app";
  const appIDs = time ? [`${time}.${pacote}`] : [];
  return NextResponse.json(
    { applinks: { details: appIDs.length ? [{ appIDs, components: [{ "/": "/t/*", comment: "Omniband" }] }] : [] } },
    { headers: { "content-type": "application/json", "cache-control": "public, max-age=3600" } },
  );
}
