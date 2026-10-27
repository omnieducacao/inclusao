/**
 * SCRUM-68: lê app/api e diz, para cada rota, que proteção ela tem no código.
 *
 * Uso:  node scripts/rotas-guardas.mjs          (reescreve docs/ROTAS-PERMISSOES.md)
 * Teste: __tests__/unit/rotas-guardas.test.ts importa analisarRotas() e confere a lista
 * de rotas ainda sem guarda de equipe própria.
 *
 * O proxy.ts já recusa o papel família em toda rota /api/ fora da lista da família.
 * Este analisador mostra quais rotas também recusam por conta própria (defesa em profundidade).
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

// Espelha FAMILIA_APIS e PUBLIC_PATHS do proxy.ts.
const FAMILIA = ["familia/", "auth/", "notifications", "announcements", "vitals", "health", "public/", "simulate-family"];
const PUBLICAS = ["auth/login", "auth/admin-login", "auth/logout", "public/", "vitals", "health", "instagram-feed"];

function rotasEm(dir, acc = []) {
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) rotasEm(caminho, acc);
    else if (nome === "route.ts") acc.push(caminho);
  }
  return acc;
}

/** Funções não exportadas do arquivo (candidatas a guarda auxiliar): { nome, corpo }. */
function auxiliares(src) {
  const defs = [...src.matchAll(/^(?:async\s+)?function\s+(\w+)\s*\(/gm)];
  return defs.map((d) => {
    const resto = src.slice(d.index + 1);
    const prox = resto.search(/^(?:export\s+)?(?:async\s+)?function\s/m);
    return { nome: d[1], corpo: src.slice(d.index, prox === -1 ? src.length : d.index + 1 + prox) };
  });
}

function guardaDe(trecho, cabecalho, sub, src, profundidade = 0) {
  const flags = [...new Set([
    ...[...trecho.matchAll(/requirePermission\(\s*\w+\s*,\s*"(can_[a-z_]+)"/g)].map((m) => m[1]),
    ...[...trecho.matchAll(/requireAuthAndPermission\(\s*"(can_[a-z_]+)"/g)].map((m) => m[1]),
  ])].sort();
  const temRequireAuth = /requireAuth\(/.test(trecho) || /requireAuthAndPermission/.test(trecho);
  const temPermissao = flags.length > 0 || /requirePermission\(|requireAnyPermission\(|\bpodeAvaliar\(|\bestudanteParaAvaliar\(/.test(trecho);
  const temStaff = /requireStaff\(/.test(trecho);
  const checaFamilia = /user_role\s*===\s*"family"/.test(trecho);
  const soAdmin = /is_platform_admin/.test(trecho) && !temPermissao && !temRequireAuth;
  const soDemo = /is_demo/.test(trecho) && !temRequireAuth && !temPermissao;
  const usaSessao = /getSession\(/.test(trecho);
  const publica = PUBLICAS.some((p) => sub === p || sub.startsWith(p));
  const familiaPermitida = FAMILIA.some((p) => sub.startsWith(p));
  // guarda em função de lib/ com nome negado*(session) (ex.: negadoCaixaFamilia, negadoMissoes)
  const viaNegado = /\bnegado(?!ForaDoVinculo)[A-Z]\w*\(/.test(trecho); // negadoForaDoVinculo checa vínculo, não papel

  // Frente 6: o app do celular não usa o cookie do site. Login e renovação são públicos (com limite
  // por IP); as outras rotas de /api/app/ exigem o token do app (pessoaDoPedido) e conferem o
  // acesso à criança em lib/app/acesso.ts.
  if (sub.startsWith("app/v1/auth/")) return "pública (login do app)";
  if (sub.startsWith("app/") && /pessoaDoPedido\(/.test(trecho)) return "token do app (lib/app/acesso)";
  if (publica) return "pública";
  if (familiaPermitida) return "família permitida";
  if (temPermissao) return flags.length ? `equipe + ${flags.join(", ")}` : "equipe + permissão por módulo";
  if (temRequireAuth || temStaff || checaFamilia) return "equipe (família recusada na rota)";
  if (profundidade === 0 && src) {
    // guarda numa função auxiliar do mesmo arquivo, chamada pelo método
    for (const h of auxiliares(src)) {
      if (new RegExp("\\b" + h.nome + "\\(").test(trecho)) {
        const g = guardaDe(h.corpo, "", sub, src, 1);
        if (g !== "só sessão (família barrada pelo proxy)" && g !== "sem checagem de sessão") return g;
      }
    }
  }
  if (viaNegado) return "equipe (função negado* de lib/)";
  if (soAdmin) return "admin da plataforma";
  if (soDemo) return "demonstração";
  if (usaSessao) return "só sessão (família barrada pelo proxy)";
  return "sem checagem de sessão";
}

/** Uma linha por rota e método: { rota, metodo, arquivo, guarda }. */
export function analisarRotas(raiz = process.cwd()) {
  const base = join(raiz, "app", "api");
  const saida = [];
  for (const arq of rotasEm(base)) {
    const rota = "/api/" + relative(base, arq).split(sep).slice(0, -1).join("/");
    const sub = rota.replace("/api/", "");
    const src = readFileSync(arq, "utf8");
    const marcas = [...src.matchAll(/export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE)\b/g)];
    const cabecalho = marcas.length ? src.slice(0, marcas[0].index) : src;
    marcas.forEach((m, i) => {
      const fim = i + 1 < marcas.length ? marcas[i + 1].index : src.length;
      const trecho = src.slice(m.index, fim);
      saida.push({ rota, metodo: m[1], arquivo: relative(raiz, arq), guarda: guardaDe(trecho, cabecalho, sub, src) });
    });
  }
  return saida.sort((a, b) => (a.rota + a.metodo).localeCompare(b.rota + b.metodo));
}

export const SEM_GUARDA_DE_EQUIPE = "só sessão (família barrada pelo proxy)";

export function gerarMarkdown(rotas) {
  const chave = (g) => (g.startsWith("equipe + ") ? "equipe + permissão por módulo" : g);
  const cont = {};
  for (const r of rotas) cont[chave(r.guarda)] = (cont[chave(r.guarda)] || 0) + 1;
  const linhas = [
    "# Rotas e permissões",
    "",
    "Gerado por `node scripts/rotas-guardas.mjs` (não edite à mão). Mostra o que **cada rota e método exige no próprio código**.",
    "",
    "Antes de chegar a qualquer rota, o `proxy.ts` já recusa (403) o papel **família** em toda `/api/` fora de",
    "`/api/familia/`, `/api/auth/`, `/api/notifications`, `/api/announcements`, `/api/vitals`, `/api/health`,",
    "`/api/public/` e `/api/simulate-family`. As linhas \"equipe\" também recusam sozinhas (`requireStaff`).",
    "",
    "## Resumo (por rota e método)",
    "",
    "| Guarda na rota | Quantidade |",
    "|---|---|",
    ...Object.entries(cont).sort((a, b) => b[1] - a[1]).map(([k, v]) => `| ${k} | ${v} |`),
    "",
    "As linhas \"só sessão\" são, em quase todos os casos, leituras por vínculo (professores sem a flag do módulo também",
    "as usam) ou rotas do próprio usuário. Os métodos que gravam ou gastam IA já exigem a permissão do módulo",
    "(`requireAnyPermission`, SCRUM-68 etapa 2). `pei/disciplina` e `plano-curso` têm a regra dentro da rota.",
    "",
    "## Tabela",
    "",
    "| Rota | Método | Exige na rota |",
    "|---|---|---|",
    ...rotas.map((r) => `| \`${r.rota}\` | ${r.metodo} | ${r.guarda} |`),
    "",
  ];
  return linhas.join("\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const rotas = analisarRotas();
  writeFileSync(join(process.cwd(), "docs", "ROTAS-PERMISSOES.md"), gerarMarkdown(rotas));
  console.log(`docs/ROTAS-PERMISSOES.md: ${rotas.length} rotas/métodos`);
}
