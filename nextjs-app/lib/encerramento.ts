/**
 * SCRUM-245/247: prazo de guarda depois do fim do contrato (decisão do Rodrigo, 24/10/2026).
 * A escola tem 90 dias para baixar PEI, PAEE e relatórios; depois, a rotina diária do banco
 * (lgpd_expurgar_escolas) apaga os dados. A data de encerramento é gravada pelo banco ao desativar.
 */
export const DIAS_PARA_EXPORTAR = 90;
const DIA_MS = 24 * 60 * 60 * 1000;

export type PrazoEncerramento = { encerradoEm: Date; apagaEm: Date; diasRestantes: number };

export function prazoEncerramento(
  active: boolean | null | undefined,
  contratoEncerradoEm: string | Date | null | undefined,
  agora: Date = new Date(),
): PrazoEncerramento | null {
  if (active !== false || !contratoEncerradoEm) return null;
  const encerradoEm = new Date(contratoEncerradoEm);
  if (Number.isNaN(encerradoEm.getTime())) return null;
  const apagaEm = new Date(encerradoEm.getTime() + DIAS_PARA_EXPORTAR * DIA_MS);
  const diasRestantes = Math.max(0, Math.ceil((apagaEm.getTime() - agora.getTime()) / DIA_MS));
  return { encerradoEm, apagaEm, diasRestantes };
}

export function dataCurta(d: Date): string {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Sao_Paulo" });
}

export function textoPrazo(p: PrazoEncerramento): string {
  if (p.diasRestantes === 0) return "Os dados serão apagados na próxima madrugada.";
  const dias = p.diasRestantes === 1 ? "1 dia" : `${p.diasRestantes} dias`;
  return `Os dados serão apagados em ${dataCurta(p.apagaEm)} (faltam ${dias}).`;
}
