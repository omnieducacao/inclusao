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

/**
 * Onda 51: na demonstração, as telas que pedem um estudante já abrem com a Beatriz Almeida
 * (a estudante com a jornada completa: estudo de caso, PEI, PAEE, diário e avaliação).
 * O visitante continua podendo trocar de estudante.
 */
export const DEMO_ESTUDANTE_PADRAO = process.env.DEMO_ESTUDANTE_PADRAO || "2ff78d50-afdc-426f-ba23-22fa090f536b";
const TELAS_COM_ESTUDANTE = ["/pei", "/paee", "/hub", "/diario", "/avaliacao-diagnostica"];

/** Devolve a URL com o estudante padrão, ou null quando a tela não precisa (ou já tem estudante). */
export function demoComEstudante(url: URL): URL | null {
  if (!TELAS_COM_ESTUDANTE.includes(url.pathname)) return null;
  if (url.searchParams.get("student") || url.searchParams.get("studentId")) return null;
  const nova = new URL(url.toString());
  nova.searchParams.set("student", DEMO_ESTUDANTE_PADRAO);
  return nova;
}
