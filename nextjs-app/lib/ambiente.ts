/**
 * Variáveis de ambiente sem as quais o app não funciona em produção. Conferidas na subida
 * (instrumentation.ts): se faltar alguma, o servidor responde 500 em tudo, o health check falha e o
 * Render não promove o deploy (a versão anterior continua no ar). Só nomes entram nas mensagens,
 * nunca valores.
 */
export type Ambiente = Record<string, string | undefined>;

export function variaveisFaltando(env: Ambiente): string[] {
  const faltando: string[] = [];
  if (!(env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL)?.trim()) faltando.push("SUPABASE_URL (ou NEXT_PUBLIC_SUPABASE_URL)");
  if (!env.SUPABASE_SERVICE_KEY?.trim()) faltando.push("SUPABASE_SERVICE_KEY");
  if (!env.SESSION_SECRET?.trim()) faltando.push("SESSION_SECRET");
  return faltando;
}

/** Lança erro claro se faltar variável obrigatória em produção; fora dela não faz nada. */
export function exigirAmbiente(env: Ambiente): void {
  if (env.NODE_ENV !== "production") return;
  const faltando = variaveisFaltando(env);
  if (faltando.length > 0) {
    throw new Error(
      `Ambiente de produção incompleto. Defina: ${faltando.join(", ")}. ` +
      "Sem elas o app não funciona em produção (ver docs/SEGREDOS.md)."
    );
  }
}
