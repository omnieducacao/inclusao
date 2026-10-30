/**
 * Frente 6 · onda 112 · perguntas para a consulta.
 * Durante o mês a família anota o que quer perguntar ao médico, à terapeuta ou à escola ("a dose da
 * noite pode ser mais cedo?", "o que fazer quando ele morde a roupa?"). Na consulta, abre a lista,
 * pergunta e marca como respondida, com a resposta em uma linha se quiser.
 * Guardadas como registro (tipo evento, subtipo "pergunta") sempre reservado: só a família vê.
 * Não entram na linha do tempo nem nas contas do resumo. Sem tabela nova: nada de migration.
 */
export const PARA_QUEM = ["consulta", "terapia", "escola", "outro"] as const;
export type ParaQuem = (typeof PARA_QUEM)[number];
export const SUBTIPO_PERGUNTA = "pergunta";

export type Pergunta = {
  id: string;
  texto: string;
  para: ParaQuem;
  quando: string;
  respondida_em: string | null;
  resposta: string | null;
};

export function lerPara(x: unknown): ParaQuem {
  return (PARA_QUEM as readonly unknown[]).includes(x) ? (x as ParaQuem) : "consulta";
}

/** Do registro do banco para a pergunta que o app mostra. */
export function paraPergunta(r: { id: string; texto: string | null; quando: string; dados: unknown }): Pergunta {
  const d = (r.dados || {}) as { para?: unknown; respondida_em?: unknown; resposta?: unknown };
  return {
    id: r.id,
    texto: r.texto || "",
    para: lerPara(d.para),
    quando: r.quando,
    respondida_em: typeof d.respondida_em === "string" ? d.respondida_em : null,
    resposta: typeof d.resposta === "string" ? d.resposta : null,
  };
}
