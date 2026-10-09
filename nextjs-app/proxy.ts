import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getSecret } from "@/lib/jwt-secret";
import { checkRateLimit } from "@/lib/upstash-rate-limit"; // V5 Rate Limiter


const PUBLIC_PATHS = ["/login", "/landing", "/privacidade", "/seguranca", "/site/", "/api/auth/login", "/api/auth/admin-login", "/api/vitals"];

// Site informativo (omnisfera.net): páginas estáticas em public/site, servidas por rewrite.
// A lista precisa acompanhar as pastas de public/site (gerado pelo projeto omnisfera-net).
const SITE_PAGES = new Set([
  "lei", "conceitos", "conhecer-o-estudante", "autismo", "deficiencia-intelectual",
  "dislexia-discalculia-tdah", "altas-habilidades", "visual-surdez-fisica", "dua-e-caa",
  "pei-e-aee", "adaptar-e-avaliar", "perfis", "formacao", "checklists", "glossario",
  "fontes", "sobre", "na-midia", "videos",
]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- V5 RATE LIMITING FIREWALL START ---
  if (pathname.startsWith('/api')) {
    let type: 'global' | 'ai' = 'global';
    const isAiRoute =
      pathname.includes('/gerar') ||
      pathname.includes('/transcrever') ||
      pathname.includes('/extrair') ||
      pathname.includes('/chat') ||
      pathname.includes('/habilidades') ||
      pathname.startsWith('/api/ai-engines');

    if (isAiRoute) type = 'ai';

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const { success, limit, remaining, reset } = await checkRateLimit(ip, type);

    if (!success) {
      return new NextResponse(
        JSON.stringify({
          error: "Too Many Requests",
          message: type === 'ai'
            ? "Limite de operações de IA atingido. Tente novamente em um minuto."
            : "Excesso de requisições detectado. Aguarde alguns segundos."
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
          },
        }
      );
    }
    // If it's an API route and not a PUBLIC API route, it will just pass through or get caught by JWT validation below.
    // Notice that /api/auth/login is the only public API path, which bypasses JWT validation but STILL gets rate limited properly.
  }
  // --- V5 RATE LIMITING FIREWALL END ---

  // Páginas do site informativo: públicas para todos, com ou sem sessão.
  const pagina = pathname.replace(/^\/+|\/+$/g, "");
  if (SITE_PAGES.has(pagina)) {
    return NextResponse.rewrite(new URL(`/site/${pagina}/index.html`, request.url));
  }

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("omnisfera_session")?.value;
  if (!token) {
    // Sem sessão, a raiz mostra o site informativo; quem tem sessão segue para o app.
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/site/index.html", request.url));
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    await jwtVerify(token, getSecret());
    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete("omnisfera_session");
    return res;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|_vercel|favicon.ico|robots\\.txt|manifest\\.json|sitemap\\.xml|sw\\.js|workbox-.*\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)"],
};
