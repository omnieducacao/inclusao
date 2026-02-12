/**
 * Utilitários de data com fuso horário de Brasília
 */

/**
 * Retorna a data atual no fuso horário de Brasília
 */
export function getDataBrasilia(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
}

/**
 * Retorna a data formatada no fuso horário de Brasília (YYYY-MM-DD)
 */
export function getDataBrasiliaISO(): string {
  return getDataBrasilia().toISOString().slice(0, 10);
}

/**
 * Retorna a data formatada em pt-BR no fuso horário de Brasília
 */
export function getDataBrasiliaFormatada(): string {
  return getDataBrasilia().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}
