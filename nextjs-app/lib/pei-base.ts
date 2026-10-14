/**
 * O texto do PEI foi escrito com o estudo de caso de agora? (piloto de 14/10/2026: o texto dizia "sem hiperfoco"
 * e o interesse foi registrado depois; nada avisava para gerar de novo).
 * A marca junta o que a IA lê do estudo de caso; se ela muda depois de o texto ser gerado, o texto ficou para trás.
 */
type Pei = Record<string, unknown>;

const CAMPOS = ["estudo_caso", "hiperfoco", "potencias", "barreiras_selecionadas", "estrategias_acesso", "estrategias_ensino", "estrategias_avaliacao", "diagnostico", "historico", "rede_apoio"] as const;

function estavel(v: unknown): string {
  if (v == null || v === "") return "";
  if (Array.isArray(v)) return `[${v.map(estavel).join(",")}]`;
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    // a data em que o estudo de caso foi concluído não muda o que a IA lê
    return `{${Object.keys(o).filter((k) => k !== "concluido_em").sort().map((k) => `${k}:${estavel(o[k])}`).join(",")}}`;
  }
  return String(v).trim();
}

/** Marca curta (djb2) do que a IA usa para escrever o texto do PEI. */
export function baseDoTextoPei(pei: Pei | null | undefined): string {
  const p = pei || {};
  const s = CAMPOS.map((c) => `${c}=${estavel(p[c])}`).join("|");
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/** O texto do PEI foi gerado antes de o estudo de caso mudar? (texto sem marca = antigo: não avisa) */
export function textoPeiDesatualizado(pei: Pei | null | undefined): boolean {
  const p = pei || {};
  const base = typeof p.ia_base === "string" ? p.ia_base : "";
  return Boolean(base && typeof p.ia_sugestao === "string" && p.ia_sugestao.trim() && base !== baseDoTextoPei(p));
}
