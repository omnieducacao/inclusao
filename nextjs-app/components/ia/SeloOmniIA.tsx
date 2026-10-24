/**
 * Onda 88 (SCRUM-237): selo nos textos de PEI e PAEE. Esses textos levam dado de estudante, e
 * por isso só passam pela Omni IA, sempre sem o nome (lib/ai-engines.ts, Onda 86).
 * Só use em telas cuja rota de geração passa as mensagens por anonymizeMessages.
 */
import { ShieldCheck } from "lucide-react";

export function SeloOmniIA() {
  return (
    <a
      href="/seguranca"
      className="omni-estado omni-estado--info"
      style={{ alignSelf: "flex-start", textDecoration: "none" }}
      title="Como a Omnisfera trata os dados de estudante"
    >
      <ShieldCheck aria-hidden /> Gerado com Omni IA · sem o nome do estudante
    </a>
  );
}
