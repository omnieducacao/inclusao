/**
 * Frente 6 · onda 122 · a aparência da criança no app: o avatar e a família montada ("Monte a família").
 * É só o desenho: cores de pele, cabelo, roupa e calça, o estilo do cabelo, o nome que a criança usa
 * para cada pessoa e o tamanho do boneco. Não há campo de raça, etnia, gênero, orientação ou
 * parentesco, e nada disso vai para a IA nem para relatórios. Módulo puro, testado em app-aparencia.
 */
export const ESTILOS_CABELO = [
  "nenhum", "raspado", "curto", "lado", "espetado", "franja", "cacheado", "afro", "trancas", "medio",
  "longo", "cachosLongos", "rabinhos", "rabo", "coque",
] as const;
export type Avatar = { pele: string; cabelo: string; estilo: (typeof ESTILOS_CABELO)[number]; roupa: string; calca: string };
export type PessoaDaFamilia = { id: string; nome: string; fala?: string; porte: "adulto" | "crianca"; avatar: Avatar };
export type Aparencia = { avatar: Avatar | null; familia: PessoaDaFamilia[] };

export const LIMITE_FAMILIA = 12;
const COR = /^#[0-9a-fA-F]{6}$/;

function texto(x: unknown, max: number): string | null {
  if (typeof x !== "string") return null;
  const t = x.trim();
  return t && t.length <= max ? t : null;
}

export function lerAvatar(x: unknown): Avatar | null {
  if (!x || typeof x !== "object") return null;
  const a = x as Record<string, unknown>;
  const cores = ["pele", "cabelo", "roupa", "calca"] as const;
  if (!cores.every((k) => typeof a[k] === "string" && COR.test(a[k] as string))) return null;
  if (!(ESTILOS_CABELO as readonly unknown[]).includes(a.estilo)) return null;
  return { pele: a.pele as string, cabelo: a.cabelo as string, estilo: a.estilo as Avatar["estilo"], roupa: a.roupa as string, calca: a.calca as string };
}

/** Valida o que o app manda; devolve null se algo não fizer sentido (o servidor responde 400). */
export function lerAparencia(x: unknown): Aparencia | null {
  if (!x || typeof x !== "object") return null;
  const b = x as Record<string, unknown>;
  const avatar = b.avatar == null ? null : lerAvatar(b.avatar);
  if (b.avatar != null && !avatar) return null;
  const lista = b.familia ?? [];
  if (!Array.isArray(lista) || lista.length > LIMITE_FAMILIA) return null;
  const familia: PessoaDaFamilia[] = [];
  const ids = new Set<string>();
  for (const item of lista) {
    if (!item || typeof item !== "object") return null;
    const p = item as Record<string, unknown>;
    const id = texto(p.id, 24);
    const nome = texto(p.nome, 24);
    const av = lerAvatar(p.avatar);
    if (!id || !nome || !av || ids.has(id)) return null;
    if (p.porte !== "adulto" && p.porte !== "crianca") return null;
    ids.add(id);
    const pessoa: PessoaDaFamilia = { id, nome, porte: p.porte, avatar: av };
    // o que o celular fala no cartão: opcional, até 80 letras (em branco = sem fala)
    if (p.fala != null) {
      if (typeof p.fala !== "string" || p.fala.length > 80) return null;
      if (p.fala.trim()) pessoa.fala = p.fala.trim();
    }
    familia.push(pessoa);
  }
  return { avatar, familia };
}

/** Lê o que está guardado no banco (texto JSON); qualquer coisa estranha vira "nada guardado". */
export function abrirAparencia(guardado: unknown): Aparencia | null {
  if (typeof guardado !== "string" || !guardado) return null;
  try {
    return lerAparencia(JSON.parse(guardado));
  } catch {
    return null;
  }
}
