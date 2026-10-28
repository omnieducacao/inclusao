import { NextResponse } from "next/server";

/**
 * Frente 6 · Omniband · App Links do Android: o link do chip abre direto no app Omnisfera.
 * ANDROID_CERT_SHA256: impressões SHA-256 dos certificados (EAS e Play App Signing), separadas por vírgula.
 * Precisa de "/.well-known/" em PUBLIC_PATHS no proxy.ts.
 */
export const dynamic = "force-dynamic";

export function GET() {
  const pacote = process.env.ANDROID_PACKAGE || "net.omnisfera.app";
  const impressoes = (process.env.ANDROID_CERT_SHA256 || "").split(",").map((s) => s.trim()).filter(Boolean);
  const corpo = impressoes.length
    ? [{ relation: ["delegate_permission/common.handle_all_urls"], target: { namespace: "android_app", package_name: pacote, sha256_cert_fingerprints: impressoes } }]
    : [];
  return NextResponse.json(corpo, { headers: { "cache-control": "public, max-age=3600" } });
}
