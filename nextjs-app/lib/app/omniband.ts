/**
 * Frente 6 · Omniband: pulseira, cordão, cartão-crachá e adesivos com chip NFC (doc "Omniband · O conceito").
 *
 * Regras que o código segue:
 *   1. O chip guarda só um link. Nenhum nome, foto, saúde ou telefone vai para o objeto.
 *   2. Quem encosta vê só o que deve ver: a família e a rede abrem o app no registro daquele objeto;
 *      quem não tem conta vê a página de ajuda escrita pela família, e a família é avisada.
 *   3. A localização só vai se quem encontrou decidir enviar. A Omniband não rastreia.
 *   4. A família desativa uma Omniband perdida na hora; desativada, o link não mostra mais nada da criança.
 *   5. A Omnisfera organiza registros: não diagnostica, não prevê crise e não indica dose.
 *
 * Dois tipos de chip:
 *   simples   NTAG 213/215/216 (amostras e adesivos). Link fixo: https://omnisfera.net/t/<codigo>
 *   ntag424   NTAG 424 DNA. Link muda a cada leitura (lib/app/sun.ts): /t/n?p=…&c=…, achado pelo UID
 */
import { createHash, randomBytes, randomInt } from "node:crypto";
import { getSupabase } from "@/lib/supabase";
import { chavesDoLote, conferirSun } from "@/lib/app/sun";
import { avisarFamilia } from "@/lib/app/avisos";

export const TIPOS_OBJETO = ["pulseira", "cordao", "cartao", "adesivo"] as const;
export const ROTINAS = ["medicamento", "refeicao", "banho", "dormir", "escola", "calma", "ajuda"] as const;
export const LINHAS = ["joaninha", "girassol", "omnisfera"] as const;
export type TipoObjeto = (typeof TIPOS_OBJETO)[number];
export type Rotina = (typeof ROTINAS)[number];

export const MAX_OBJETOS = 20;
/** Código genérico dos chips NTAG 424 DNA: o objeto é achado pelo UID que vem cifrado no link. */
export const CODIGO_UID = "n";
/** Quanto tempo vale o convite para enviar a localização, depois que a página de ajuda abriu. */
export const LOCALIZACAO_MINUTOS = 30;
/** Leituras seguidas da página de ajuda dentro desse intervalo não geram aviso novo. */
export const AVISO_INTERVALO_MS = 3 * 60_000;

const ALFABETO = "23456789abcdefghjkmnpqrstuvwxyz"; // sem 0/o, 1/l/i: dá para ler em voz alta
export function novoCodigo(): string {
  let s = "";
  for (let i = 0; i < 10; i++) s += ALFABETO[randomInt(ALFABETO.length)];
  return s;
}
export function ehCodigo(x: unknown): x is string {
  return typeof x === "string" && /^[2-9a-hjkmnp-z]{10}$/.test(x);
}

export function basePublica(): string {
  return (process.env.APP_URL_PUBLICA || "https://omnisfera.net").replace(/\/+$/, "");
}
export function linkDoObjeto(codigo: string): string {
  return `${basePublica()}/t/${codigo}`;
}
export function hashUid(uid: string): string {
  return createHash("sha256").update(`omniband-uid|${uid.toUpperCase()}`).digest("hex");
}
export function hashToken(t: string): string {
  return createHash("sha256").update(t).digest("hex");
}

export function ehTipoObjeto(x: unknown): x is TipoObjeto {
  return typeof x === "string" && (TIPOS_OBJETO as readonly string[]).includes(x);
}
export function ehRotina(x: unknown): x is Rotina {
  return typeof x === "string" && (ROTINAS as readonly string[]).includes(x);
}
export function ehLinha(x: unknown): x is (typeof LINHAS)[number] {
  return typeof x === "string" && (LINHAS as readonly string[]).includes(x);
}

export type LinkDoChip = { codigo: string; p?: string; c?: string };

/** Lê o link gravado no chip (ou o que o app recebeu ao abrir). Só aceita o domínio da Omnisfera. */
export function lerLinkDoChip(bruto: unknown): LinkDoChip | null {
  if (typeof bruto !== "string" || bruto.length > 300) return null;
  let u: URL;
  try {
    u = new URL(bruto.trim());
  } catch {
    return null;
  }
  const hostOk = ["omnisfera.net", "www.omnisfera.net", new URL(basePublica()).host].includes(u.host);
  if (!hostOk || !["https:", "http:"].includes(u.protocol)) return null;
  const m = u.pathname.match(/^\/t\/([a-z0-9]{1,10})\/?$/);
  if (!m) return null;
  return montarLink(m[1], u.searchParams.get("p"), u.searchParams.get("c"));
}

/** Monta o link a partir das partes (página /t/[codigo] e rota do toque). */
export function montarLink(codigo: string, p?: string | null, c?: string | null): LinkDoChip | null {
  if (p && c) {
    if (!/^[0-9a-fA-F]{32}$/.test(p) || !/^[0-9a-fA-F]{16}$/.test(c)) return null;
    return { codigo, p, c };
  }
  return ehCodigo(codigo) ? { codigo } : null;
}

export type Objeto = {
  id: string;
  crianca_id: string;
  tipo: TipoObjeto;
  rotina: Rotina | null;
  linha: string | null;
  apelido: string | null;
  codigo: string;
  chip: "simples" | "ntag424";
  uid_hash: string | null;
  contador: number;
  status: "ativo" | "desativado";
};

const COLUNAS = "id, crianca_id, tipo, rotina, linha, apelido, codigo, chip, uid_hash, contador, status";

/** Confere um link SUN e devolve UID e contador (ou null). */
export function abrirSun(p: string, c: string): { uid: string; contador: number } | null {
  const chaves = chavesDoLote();
  if (!chaves) return null;
  return conferirSun(p, c, chaves.meta, chaves.arquivo);
}

/**
 * Acha o objeto de um link. `novo` diz se é uma leitura nova de verdade (no NTAG 424, o contador
 * avançou; um link copiado traz contador velho). O contador do objeto é atualizado aqui.
 */
export async function acharObjeto(link: LinkDoChip): Promise<{ objeto: Objeto; novo: boolean } | null> {
  const sb = getSupabase();
  if (link.p && link.c) {
    const sun = abrirSun(link.p, link.c);
    if (!sun) return null;
    const { data } = await sb.from("omniband_objetos").select(COLUNAS).eq("uid_hash", hashUid(sun.uid)).eq("chip", "ntag424").order("created_at", { ascending: false }).limit(1);
    const objeto = ((data as Objeto[] | null) || [])[0];
    if (!objeto) return null;
    const novo = sun.contador > (objeto.contador || 0);
    if (novo) {
      await sb.from("omniband_objetos").update({ contador: sun.contador, updated_at: new Date().toISOString() }).eq("id", objeto.id);
      objeto.contador = sun.contador;
    }
    return { objeto, novo };
  }
  if (!ehCodigo(link.codigo)) return null;
  const { data } = await sb.from("omniband_objetos").select(COLUNAS).eq("codigo", link.codigo).eq("chip", "simples").maybeSingle();
  return data ? { objeto: data as Objeto, novo: true } : null;
}

/** O que o app abre quando alguém da família ou da rede encosta naquele objeto. */
export type Sugestao = {
  tela: "registrar" | "dose" | "escolher";
  tipo?: "evento";
  subtipo?: string;
  local?: "casa" | "escola";
  opcoes?: string[];
};

export function sugestaoDaRotina(rotina: Rotina | null): Sugestao {
  switch (rotina) {
    case "medicamento": return { tela: "dose" };
    case "refeicao": return { tela: "registrar", tipo: "evento", subtipo: "alimentacao", local: "casa" };
    case "banho": return { tela: "registrar", tipo: "evento", subtipo: "banho", local: "casa" };
    case "dormir": return { tela: "registrar", tipo: "evento", subtipo: "sono", local: "casa" };
    case "calma": return { tela: "registrar", tipo: "evento", subtipo: "calma", local: "casa" };
    case "escola": return { tela: "registrar", tipo: "evento", local: "escola", opcoes: ["chegada", "saida"] };
    default: return { tela: "escolher" };
  }
}

// ---------- página de ajuda (escrita pela família) ----------

export type Contato = { nome: string; telefone: string };
export type PaginaAjuda = {
  apelido: string | null;
  mensagem: string;
  contatos: Contato[];
  mostrar_localizacao: boolean;
  ativa: boolean;
};

export const MENSAGEM_PADRAO = "Posso precisar de ajuda. Fale devagar, com calma, e fique perto de mim. Minha família já foi avisada.";

function textoLimpo(x: unknown, max: number): string | null {
  return typeof x === "string" && x.trim() ? x.trim().replace(/[ \t]+/g, " ").slice(0, max) : null;
}

/** Telefone brasileiro: só dígitos, com DDD; aceita +55. Devolve no formato +55DDNNNNNNNNN. */
export function telefoneValido(x: unknown): string | null {
  if (typeof x !== "string") return null;
  let d = x.replace(/\D/g, "");
  if (d.startsWith("55") && (d.length === 12 || d.length === 13)) d = d.slice(2);
  if (d.length !== 10 && d.length !== 11) return null;
  if (d.startsWith("0")) return null;
  return `+55${d}`;
}

export function lerPaginaAjuda(b: Record<string, unknown>): PaginaAjuda | { erro: string } {
  const apelido = textoLimpo(b.apelido, 30);
  const mensagem = textoLimpo(b.mensagem, 400) || MENSAGEM_PADRAO;
  const contatos: Contato[] = [];
  if (b.contatos !== undefined) {
    if (!Array.isArray(b.contatos) || b.contatos.length > 3) return { erro: "Até 3 contatos." };
    for (const c of b.contatos) {
      const o = (c && typeof c === "object" ? c : {}) as Record<string, unknown>;
      const nome = textoLimpo(o.nome, 40);
      const telefone = telefoneValido(o.telefone);
      if (!nome || !telefone) return { erro: "Cada contato precisa de nome e telefone com DDD." };
      contatos.push({ nome, telefone });
    }
  }
  return {
    apelido,
    mensagem,
    contatos,
    mostrar_localizacao: b.mostrar_localizacao !== false,
    ativa: b.ativa !== false,
  };
}

/** Lê a página guardada (os textos chegam abertos: lib/colunas-cifradas.ts). Sem página, a padrão. */
export async function paginaDaCrianca(criancaId: string): Promise<PaginaAjuda> {
  const { data } = await getSupabase()
    .from("paginas_ajuda")
    .select("apelido, mensagem, contatos, mostrar_localizacao, ativa")
    .eq("crianca_id", criancaId)
    .maybeSingle();
  const p = data as { apelido: string | null; mensagem: string | null; contatos: string | null; mostrar_localizacao: boolean; ativa: boolean } | null;
  if (!p) return { apelido: null, mensagem: MENSAGEM_PADRAO, contatos: [], mostrar_localizacao: true, ativa: true };
  let contatos: Contato[] = [];
  try {
    const lista = JSON.parse(p.contatos || "[]");
    if (Array.isArray(lista)) contatos = lista.filter((c) => c && typeof c.nome === "string" && typeof c.telefone === "string");
  } catch {
    contatos = [];
  }
  return { apelido: p.apelido, mensagem: p.mensagem || MENSAGEM_PADRAO, contatos, mostrar_localizacao: p.mostrar_localizacao !== false, ativa: p.ativa !== false };
}

// ---------- quem encontrou: a página pública /t/[codigo] ----------

export type LeituraPublica =
  | { estado: "desconhecida" }
  | { estado: "desativada" }
  | { estado: "ok"; pagina: PaginaAjuda; token: string | null };

/**
 * Leitura por quem não tem conta (página pública). Registra a leitura e avisa a família,
 * no máximo um aviso a cada poucos minutos por objeto. Devolve o que a página pode mostrar
 * e o convite (token) para enviar a localização, se a família permitiu.
 */
export async function lerParaAjuda(link: LinkDoChip, agora = new Date()): Promise<LeituraPublica> {
  const achado = await acharObjeto(link);
  if (!achado) return { estado: "desconhecida" };
  const { objeto, novo } = achado;
  if (objeto.status !== "ativo") return { estado: "desativada" };
  const pagina = await paginaDaCrianca(objeto.crianca_id);
  if (!pagina.ativa) return { estado: "desativada" };

  const sb = getSupabase();
  const { data: ultimas } = await sb
    .from("omniband_leituras")
    .select("id, created_at")
    .eq("objeto_id", objeto.id)
    .eq("quem", "anonimo")
    .order("created_at", { ascending: false })
    .limit(1);
  const ultima = ((ultimas as { created_at: string }[] | null) || [])[0];
  const avisar = novo && (!ultima || agora.getTime() - Date.parse(ultima.created_at) > AVISO_INTERVALO_MS);

  const token = pagina.mostrar_localizacao ? randomBytes(24).toString("base64url") : null;
  let registroId: string | null = null;
  if (avisar) {
    const { data: reg } = await sb
      .from("registros")
      .insert({
        crianca_id: objeto.crianca_id,
        tipo: "sinal",
        categoria: "sinais",
        subtipo: "leitura_ajuda",
        quando: agora.toISOString(),
        local: "rua",
        texto: null,
        dados: { objeto_id: objeto.id, objeto_tipo: objeto.tipo },
        origem: "pulseira",
      })
      .select("id")
      .single();
    registroId = (reg as { id: string } | null)?.id || null;
  }
  await sb.from("omniband_leituras").insert({
    objeto_id: objeto.id,
    crianca_id: objeto.crianca_id,
    quem: "anonimo",
    pessoa_id: null,
    contador: objeto.contador,
    token_hash: token ? hashToken(token) : null,
    registro_id: registroId,
    created_at: agora.toISOString(),
  });
  if (avisar) {
    // Sem nome nem detalhe no aviso: ele passa pelos servidores de notificação da Apple e do Google.
    await avisarFamilia(objeto.crianca_id, {
      titulo: "Alguém leu a Omniband agora",
      corpo: "Uma pessoa sem conta abriu a página de ajuda. Abra o app para ver.",
      dados: { tipo: "omniband_leitura", crianca_id: objeto.crianca_id, objeto_id: objeto.id },
    });
  }
  return { estado: "ok", pagina, token };
}

/** Quem encontrou decidiu enviar a localização. Só vale com o convite da leitura, uma vez, por 30 min. */
export async function receberLocalizacao(
  token: unknown,
  lat: unknown,
  lng: unknown,
  precisao: unknown,
  agora = new Date(),
): Promise<"ok" | "invalido" | "expirado"> {
  if (typeof token !== "string" || token.length < 20 || token.length > 64) return "invalido";
  if (typeof lat !== "number" || typeof lng !== "number" || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return "invalido";
  }
  const sb = getSupabase();
  const { data } = await sb
    .from("omniband_leituras")
    .select("id, objeto_id, crianca_id, created_at, localizacao_em")
    .eq("token_hash", hashToken(token))
    .maybeSingle();
  const l = data as { id: string; objeto_id: string; crianca_id: string; created_at: string; localizacao_em: string | null } | null;
  if (!l) return "invalido";
  if (l.localizacao_em || agora.getTime() - Date.parse(l.created_at) > LOCALIZACAO_MINUTOS * 60_000) return "expirado";

  const metros = typeof precisao === "number" && Number.isFinite(precisao) ? Math.round(Math.min(precisao, 99_999)) : null;
  const texto = `${lat.toFixed(6)},${lng.toFixed(6)}${metros !== null ? ` (±${metros} m)` : ""}`;
  await sb.from("omniband_leituras").update({ localizacao_em: agora.toISOString() }).eq("id", l.id);
  await sb.from("registros").insert({
    crianca_id: l.crianca_id,
    tipo: "sinal",
    categoria: "sinais",
    subtipo: "localizacao",
    quando: agora.toISOString(),
    local: "rua",
    texto, // cifrado (lib/colunas-cifradas.ts): a localização nunca fica em texto aberto
    dados: { objeto_id: l.objeto_id },
    origem: "pulseira",
  });
  await avisarFamilia(l.crianca_id, {
    titulo: "Localização enviada",
    corpo: "Quem encontrou enviou onde está. Abra o app para ver no mapa.",
    dados: { tipo: "omniband_localizacao", crianca_id: l.crianca_id },
  });
  return "ok";
}
