/**
 * SCRUM-66: o banco é fechado para a chave pública (anon). Duas camadas de teste:
 *
 * 1. Estática (sempre roda): lê as migrations e trava a regressão. Nenhuma migration depois da
 *    Onda 0 pode criar política aberta (USING true) e toda tabela criada depois dela precisa ligar RLS.
 * 2. Ao vivo (só roda com variáveis de teste): com a chave pública, ler `students` e as tabelas de
 *    senha deve dar erro ou zero linhas, e gravar deve falhar. Como rodar:
 *      TESTE_SUPABASE_URL=https://SEU-PROJETO.supabase.co TESTE_SUPABASE_ANON_KEY=<chave pública> \
 *        npx vitest run __tests__/integration/seguranca-banco.test.ts
 *    As variáveis têm prefixo TESTE_ de propósito, para nenhum ambiente rodar isto sem querer.
 */
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const RAIZ_APP = process.cwd();
const PASTAS = [join(RAIZ_APP, "..", "supabase", "migrations"), join(RAIZ_APP, "supabase", "migrations")];
const ONDA0 = "20261009_onda0_banco_fechado.sql";

type Migration = { arquivo: string; sql: string };

/** Ordem em que o banco as recebeu: as numeradas (00005...) da raiz, depois as datadas do app. */
function migrations(): Migration[] {
  const lista: Migration[] = [];
  for (const pasta of PASTAS) {
    if (!existsSync(pasta)) continue;
    for (const arquivo of readdirSync(pasta).filter((f) => f.endsWith(".sql")).sort()) {
      lista.push({ arquivo, sql: readFileSync(join(pasta, arquivo), "utf8") });
    }
  }
  return lista;
}

/** SQL sem comentários, para não confundir texto de explicação com comando. */
function semComentarios(sql: string): string {
  return sql.replace(/--[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
}

/** Políticas abertas: USING (true) ou WITH CHECK (true) sem restringir a service_role. */
function politicasAbertas(sql: string): string[] {
  return semComentarios(sql)
    .split(";")
    .map((c) => c.trim().replace(/\s+/g, " "))
    .filter((c) => /^create policy/i.test(c))
    .filter((c) => /(using|with check)\s*\(\s*true\s*\)/i.test(c) && !/\bto\s+service_role\b/i.test(c));
}

function tabelasCriadas(sql: string): string[] {
  return [...semComentarios(sql).matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?"?(\w+)"?/gi)].map((m) => m[1]);
}

function ligaRls(sql: string, tabela: string): boolean {
  const limpo = semComentarios(sql);
  return new RegExp(`alter\\s+table\\s+(?:if\\s+exists\\s+)?(?:only\\s+)?(?:public\\.)?"?${tabela}"?\\s+enable\\s+row\\s+level\\s+security`, "i").test(limpo);
}

describe("migrations: banco fechado para a chave pública", () => {
  const todas = migrations();
  const posicaoOnda0 = todas.findIndex((m) => m.arquivo === ONDA0);

  it("a migration da Onda 0 existe e faz as três coisas", () => {
    expect(posicaoOnda0).toBeGreaterThanOrEqual(0);
    const sql = semComentarios(todas[posicaoOnda0].sql);
    expect(sql).toMatch(/pg_policies[\s\S]*drop policy/i); // remove todas as políticas
    expect(sql).toMatch(/enable row level security/i); // liga RLS em todas as tabelas
    expect(sql).toMatch(/revoke execute on function[\s\S]*anon/i); // tira as funções da chave pública
    expect(sql).toMatch(/alter default privileges[\s\S]*revoke all on tables from anon, authenticated/i); // vale para as futuras
  });

  it("o detector de política aberta acha o problema nas migrations antigas (o teste não é vazio)", () => {
    const antigas = todas.slice(0, posicaoOnda0).filter((m) => politicasAbertas(m.sql).length > 0);
    expect(antigas.length).toBeGreaterThan(0);
  });

  it("nenhuma migration depois da Onda 0 cria política aberta", () => {
    const depois = todas.slice(posicaoOnda0 + 1);
    const abertas = depois.flatMap((m) => politicasAbertas(m.sql).map((c) => `${m.arquivo}: ${c.slice(0, 80)}`));
    expect(abertas).toEqual([]);
  });

  it("toda tabela criada depois da Onda 0 liga RLS na própria migration", () => {
    const sem: string[] = [];
    for (const m of todas.slice(posicaoOnda0 + 1)) {
      for (const tabela of tabelasCriadas(m.sql)) {
        if (!ligaRls(m.sql, tabela)) sem.push(`${m.arquivo}: ${tabela}`);
      }
    }
    expect(sem).toEqual([]);
  });
});

const URL_TESTE = process.env.TESTE_SUPABASE_URL;
const ANON_TESTE = process.env.TESTE_SUPABASE_ANON_KEY;

describe.skipIf(!URL_TESTE || !ANON_TESTE)("banco ao vivo: a chave pública não lê nem grava", () => {
  const anon = () => createClient(URL_TESTE as string, ANON_TESTE as string);
  const TABELAS = ["students", "workspace_members", "workspace_masters", "platform_admins", "family_laudos", "workspaces"];

  for (const tabela of TABELAS) {
    it(`ler ${tabela} com a chave pública: erro ou zero linhas`, async () => {
      const { data, error } = await anon().from(tabela).select("*").limit(5);
      expect(error !== null || (data ?? []).length === 0).toBe(true);
    });
  }

  it("gravar em students com a chave pública falha", async () => {
    const { error } = await anon().from("students").insert({ name: "Teste de segurança (não deve gravar)" });
    expect(error).not.toBeNull();
  });

  it("chamar funções do banco com a chave pública falha", async () => {
    const { error } = await anon().rpc("students_by_workspace", { p_workspace_id: "00000000-0000-0000-0000-000000000000" });
    expect(error).not.toBeNull();
  });
});
