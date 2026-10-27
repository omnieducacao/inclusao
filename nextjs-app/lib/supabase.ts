import { createClient } from "@supabase/supabase-js";
import { comColunasCifradas } from "@/lib/colunas-cifradas";

/**
 * Cliente do banco para o SERVIDOR. Usa só a chave de serviço (SUPABASE_SERVICE_KEY), que ignora o
 * RLS. O banco é fechado para a chave pública (anon): sem a chave de serviço o app não tem como
 * funcionar, então não existe mais o fallback silencioso para a anon (SCRUM-66).
 * Em produção, a falta das variáveis é pega já na subida (instrumentation.ts / lib/ambiente.ts).
 *
 * SCRUM-254: o cliente é criado UMA vez por processo e reaproveitado. Antes, cada chamada criava um
 * cliente novo, e cada um deixava uns 7 KB presos na memória (a parte de login do supabase-js, que o
 * servidor nem usa). Com o health check do Render e as rotas chamando getSupabase() o tempo todo, a
 * memória subia ~35 MB por hora até o Node estourar (exit 134) e o Render reiniciar o serviço.
 * O servidor usa a chave de serviço e não guarda sessão: login automático desligado.
 */
function novoCliente(url: string, key: string) {
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

type Cliente = ReturnType<typeof novoCliente>;
const cache: { chave?: string; cifrado?: Cliente; cru?: Cliente } = {};

function credenciais() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
  const key = (process.env.SUPABASE_SERVICE_KEY || "").trim();
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórios. A chave pública (anon) não serve: " +
      "o banco está fechado para ela."
    );
  }
  const chave = url + "|" + key;
  if (cache.chave !== chave) {
    cache.chave = chave;
    cache.cifrado = undefined;
    cache.cru = undefined;
  }
  return { url, key };
}

function clienteCru(): Cliente {
  const { url, key } = credenciais();
  return (cache.cru ??= novoCliente(url, key));
}

export function getSupabase() {
  credenciais();
  // SCRUM-231: as colunas de lib/colunas-cifradas.ts são cifradas ao gravar e decifradas ao ler
  return (cache.cifrado ??= comColunasCifradas(clienteCru()));
}

/**
 * SCRUM-231: cliente SEM a camada de colunas cifradas. Só para a manutenção que precisa ver o valor
 * gravado de verdade (ex.: /api/admin/cifrar-dados, que acha o que ainda está em texto claro).
 */
export function getSupabaseSemCifra() {
  return clienteCru();
}

export type SupabaseClient = ReturnType<typeof createClient>;
