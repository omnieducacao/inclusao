/**
 * Contatos comerciais (leads) da home de vendas e da demonstração (onda 39).
 * Validação pura, usada pela rota pública /api/public/contato e pelos testes.
 */

export const CARGOS = [
  "Direção",
  "Coordenação",
  "Professor(a) do AEE",
  "Professor(a) regente",
  "Secretaria de educação",
  "Outro",
] as const;

export const TIPOS_INSTITUICAO = ["Escola particular", "Rede municipal", "Rede estadual", "Outro"] as const;

export const FAIXAS_ESTUDANTES = ["Até 300", "301 a 1.000", "1.001 a 5.000", "Mais de 5.000"] as const;

export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR",
  "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

export const STATUS_LEAD = ["novo", "em_conversa", "fechado", "descartado"] as const;
export type StatusLead = (typeof STATUS_LEAD)[number];

export const ROTULO_STATUS: Record<StatusLead, string> = {
  novo: "Novo",
  em_conversa: "Em conversa",
  fechado: "Fechado",
  descartado: "Descartado",
};

export type LeadEntrada = {
  nome: string;
  email: string;
  telefone: string;
  escola: string;
  cargo: string;
  tipo_instituicao: string | null;
  faixa_estudantes: string | null;
  cidade: string | null;
  uf: string | null;
  mensagem: string | null;
  origem: "contato" | "demonstracao";
  papel_demo: string | null;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function texto(v: unknown, max: number): string {
  return typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

function opcional(v: unknown, max: number): string | null {
  const t = texto(v, max);
  return t ? t : null;
}

function daLista<T extends readonly string[]>(v: unknown, lista: T): T[number] | null {
  return typeof v === "string" && (lista as readonly string[]).includes(v) ? (v as T[number]) : null;
}

/** Só dígitos, com DDD: 10 ou 11 números (aceita +55 na frente). */
export function telefoneValido(t: string): boolean {
  const d = t.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  return d.length === 10 || d.length === 11;
}

export type ResultadoLead = { ok: true; lead: LeadEntrada } | { ok: false; erros: Record<string, string> };

/**
 * Confere o que veio do formulário. O campo "site" é uma armadilha para robôs: pessoas não o veem,
 * então qualquer valor nele é tratado como spam (a rota responde como se tivesse dado certo).
 */
export function validarLead(body: unknown): ResultadoLead {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const erros: Record<string, string> = {};

  const nome = texto(b.nome, 120);
  const email = texto(b.email, 160).toLowerCase();
  const escola = texto(b.escola, 160);
  const cargo = daLista(b.cargo, CARGOS);
  const telefone = texto(b.telefone, 30);
  const origem = b.origem === "demonstracao" ? "demonstracao" : "contato";

  if (nome.length < 2) erros.nome = "Escreva o seu nome.";
  if (!EMAIL.test(email)) erros.email = "Confira o e-mail.";
  if (escola.length < 2) erros.escola = "Escreva o nome da escola ou da rede.";
  if (!cargo) erros.cargo = "Escolha o seu cargo.";
  // por enquanto o retorno é feito por telefone/WhatsApp ou e-mail, então os dois são obrigatórios
  if (!telefone) erros.telefone = "Escreva um WhatsApp ou telefone com DDD.";
  else if (!telefoneValido(telefone)) erros.telefone = "Confira o telefone, com DDD.";
  if (b.consentimento !== true) erros.consentimento = "Para entrarmos em contato, marque a autorização.";

  if (Object.keys(erros).length) return { ok: false, erros };

  return {
    ok: true,
    lead: {
      nome,
      email,
      telefone,
      escola,
      cargo: cargo as string,
      tipo_instituicao: daLista(b.tipo_instituicao, TIPOS_INSTITUICAO),
      faixa_estudantes: daLista(b.faixa_estudantes, FAIXAS_ESTUDANTES),
      cidade: opcional(b.cidade, 80),
      uf: daLista(b.uf, UFS),
      mensagem: opcional(b.mensagem, 2000),
      origem,
      papel_demo: origem === "demonstracao" ? opcional(b.papel_demo, 40) : null,
    },
  };
}

export function ehRobo(body: unknown): boolean {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  return typeof b.site === "string" && b.site.trim() !== "";
}
