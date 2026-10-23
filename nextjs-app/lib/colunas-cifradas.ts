/**
 * SCRUM-231: colunas cifradas pela própria plataforma (AES-256-GCM, lib/encryption.ts).
 *
 * `comColunasCifradas(cliente)` devolve o mesmo cliente do Supabase, mas, nas tabelas e colunas
 * de COLUNAS_CIFRADAS, cifra os valores ao gravar (insert, update, upsert) e decifra ao ler
 * (o resultado de qualquer consulta). O resto do código continua escrevendo e lendo texto aberto.
 *
 * Limite: uma coluna cifrada não serve para busca nem ordenação no banco (a cifra muda a cada
 * gravação). Só entra aqui coluna que o código não usa em .eq(), .ilike() ou .order().
 * Valor antigo ainda em texto claro continua sendo lido normalmente (decryptField deixa passar);
 * a rota /api/admin/cifrar-dados regrava esses valores.
 */
import { encryptField, decryptField } from "@/lib/encryption";

export const COLUNAS_CIFRADAS: Readonly<Record<string, readonly string[]>> = {
  workspace_members: ["telefone"],
  workspace_masters: ["telefone"],
  family_responsibles: ["telefone"],
};

type Linha = Record<string, unknown>;

function cifrarLinha(colunas: readonly string[], linha: unknown): unknown {
  if (!linha || typeof linha !== "object" || Array.isArray(linha)) return linha;
  const copia: Linha = { ...(linha as Linha) };
  for (const c of colunas) {
    const v = copia[c];
    if (typeof v === "string" && v.trim()) copia[c] = encryptField(v);
  }
  return copia;
}

function abrirLinha(colunas: readonly string[], linha: unknown): unknown {
  if (!linha || typeof linha !== "object" || Array.isArray(linha)) return linha;
  const copia: Linha = { ...(linha as Linha) };
  for (const c of colunas) {
    const v = copia[c];
    if (typeof v === "string") copia[c] = decryptField(v);
  }
  return copia;
}

export function cifrarValores(tabela: string, valores: unknown): unknown {
  const colunas = COLUNAS_CIFRADAS[tabela];
  if (!colunas) return valores;
  return Array.isArray(valores) ? valores.map((l) => cifrarLinha(colunas, l)) : cifrarLinha(colunas, valores);
}

export function abrirDados(tabela: string, dados: unknown): unknown {
  const colunas = COLUNAS_CIFRADAS[tabela];
  if (!colunas || dados == null) return dados;
  return Array.isArray(dados) ? dados.map((l) => abrirLinha(colunas, l)) : abrirLinha(colunas, dados);
}

const ESCRITA = new Set(["insert", "update", "upsert"]);

/** Envolve um construtor de consulta: cifra o que é gravado e decifra o resultado. */
function envolver<T extends object>(construtor: T, tabela: string): T {
  return new Proxy(construtor, {
    get(alvo, prop, receptor) {
      const valor = Reflect.get(alvo, prop, receptor);
      if (prop === "then" && typeof valor === "function") {
        return (ok?: (r: unknown) => unknown, erro?: (e: unknown) => unknown) =>
          (valor as (a: unknown, b: unknown) => Promise<unknown>).call(
            alvo,
            (r: unknown) => {
              const res = r && typeof r === "object" && "data" in (r as Linha)
                ? { ...(r as Linha), data: abrirDados(tabela, (r as Linha).data) }
                : r;
              return ok ? ok(res) : res;
            },
            erro
          );
      }
      if (typeof valor !== "function") return valor;
      return (...args: unknown[]) => {
        if (typeof prop === "string" && ESCRITA.has(prop)) args[0] = cifrarValores(tabela, args[0]);
        const saida = (valor as (...a: unknown[]) => unknown).apply(alvo, args);
        return saida && typeof saida === "object" && typeof (saida as { then?: unknown }).then === "function"
          ? envolver(saida as object, tabela)
          : saida;
      };
    },
  });
}

/** Cliente do Supabase com as colunas de COLUNAS_CIFRADAS cifradas de forma transparente. */
export function comColunasCifradas<C extends { from: (tabela: string) => unknown }>(cliente: C): C {
  return new Proxy(cliente, {
    get(alvo, prop, receptor) {
      const valor = Reflect.get(alvo, prop, receptor);
      if (prop !== "from" || typeof valor !== "function") return typeof valor === "function" ? valor.bind(alvo) : valor;
      return (tabela: string) => {
        const construtor = (valor as (t: string) => unknown).call(alvo, tabela);
        return COLUNAS_CIFRADAS[tabela] && construtor && typeof construtor === "object"
          ? envolver(construtor as object, tabela)
          : construtor;
      };
    },
  });
}
