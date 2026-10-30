/**
 * Frente 6 · onda 108 · o perfil de apoio da criança: o que a família escolhe acompanhar.
 * Não pede diagnóstico e não guarda nenhum; serve para o app mostrar os registros, as missões e os
 * guias que fazem sentido para esta criança (dislexia, síndrome de Down, TEA, TDAH e outras).
 */
export const APOIOS = ["crises", "sono", "alimentacao", "rotina", "leitura", "fala", "movimento", "saude"] as const;
export type Apoio = (typeof APOIOS)[number];
/** Quem não escolheu nada vê o conjunto de sempre (crises, sono, alimentação e rotina). */
export const APOIO_PADRAO: Apoio[] = ["crises", "sono", "alimentacao", "rotina"];

export function lerApoio(x: unknown): Apoio[] | null {
  if (!Array.isArray(x) || x.length > APOIOS.length) return null;
  if (!x.every((a) => (APOIOS as readonly unknown[]).includes(a))) return null;
  return APOIOS.filter((a) => x.includes(a));
}
