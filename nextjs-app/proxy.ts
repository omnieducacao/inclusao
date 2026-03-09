import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getSecret } from "@/lib/jwt-secret";
import { checkRateLimit } from "@/lib/upstash-rate-limit"; // V5 Rate Limiter


const PUBLIC_PATHS = ["/login", "/landing", "/privacidade", "/api/auth/login", "/api/auth/admin-login"];

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

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("omnisfera_session")?.value;
  if (!token) {
    // If visiting root "/" without session, check if landing page is enabled
    if (pathname === "/") {
      try {
        const baseUrl = request.nextUrl.origin;
        const res = await fetch(
          `${baseUrl}/api/public/platform-config?key=landing_page_enabled`,
          { next: { revalidate: 60 } }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.value === "true" || data.value === true) {
            return NextResponse.redirect(new URL("/landing", request.url));
          }
        }
      } catch {
        // Fallback: redirect to login as usual
      }
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots\\.txt|manifest\\.json|sitemap\\.xml|sw\\.js|workbox-.*\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)"],
};
