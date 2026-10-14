const ROTAS: Array<[string, string]> = [
  ["/estudantes", "Estudantes"], ["/pei-professor", "PEI do professor"], ["/pei", "PEI"], ["/paee", "PAEE"],
  ["/diario", "Diário de bordo"], ["/hub", "Hub de recursos"], ["/plano-de-ensino", "Plano de ensino"],
  ["/avaliacao", "Avaliação"], ["/evolucao", "Evolução e dados"], ["/pgi", "PGI"], ["/equipe", "Equipe"],
  ["/config-escola", "Configuração da escola"], ["/central", "Central de inteligência"],
];

/** Nome do módulo a partir do endereço visitado (para o registro da demonstração). */
export function moduloDaRota(rota: string): string | null {
  if (rota === "/") return "Início";
  const r = ROTAS.find(([p]) => rota === p || rota.startsWith(p + "/") || rota.startsWith(p + "?") || (p === "/avaliacao" && rota.startsWith("/avaliacao")));
  return r ? r[1] : null;
}
