/**
 * Demonstração (onda 44): o visitante entra na Escola Demo (fictícia) num dos três papéis,
 * sem senha, por algumas horas. Nada é gravado: o proxy.ts recusa toda chamada que muda dados.
 */
export const DEMO_WORKSPACE_ID = process.env.DEMO_WORKSPACE_ID || "480ed9ba-d8c5-40dd-9fbf-7269e51467a6";
export const DEMO_DURACAO_SEGUNDOS = 3 * 60 * 60;

export const PAPEIS_DEMO = {
  aee: { email: "aee@demo.omnisfera.net", rotulo: "Professor(a) do AEE", inicio: "/estudantes" },
  regente: { email: "regente@demo.omnisfera.net", rotulo: "Professor(a) regente", inicio: "/pei-professor" },
  coordenacao: { email: "coordenacao@demo.omnisfera.net", rotulo: "Coordenação", inicio: "/" },
} as const;
export type PapelDemo = keyof typeof PAPEIS_DEMO;

export function papelDemoValido(p: unknown): p is PapelDemo {
  return typeof p === "string" && p in PAPEIS_DEMO;
}

/** Chamadas que a sessão de demonstração pode fazer mesmo mudando algo (sair, trocar de papel, métricas). */
const LIBERADAS = ["/api/auth/logout", "/api/demo/", "/api/public/", "/api/vitals", "/api/health"];

/** Na demonstração, só leitura: qualquer método que muda dados é recusado, menos as rotas liberadas. */
export function demoPodeChamar(pathname: string, method: string): boolean {
  if (!pathname.startsWith("/api/")) return true;
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return true;
  return LIBERADAS.some((p) => pathname.startsWith(p));
}

/** Páginas fora do alcance de quem está na demonstração. */
export function demoPaginaBloqueada(pathname: string): boolean {
  return ["/admin", "/familia"].some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export const MENSAGEM_DEMO = "Na demonstração nada é salvo. Para usar com os seus estudantes, fale com a nossa equipe.";
