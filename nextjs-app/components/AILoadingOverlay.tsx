"use client";

/**
 * Geração com IA em andamento (onda 8 · design system: GeracaoIA).
 *
 * Antes: uma camada escura cobrindo a tela toda, com o nome do motor ("OmniRed está
 * trabalhando…") e frases genéricas. A pessoa ficava presa até 1–2 minutos sem poder ler nem
 * mexer em nada.
 *
 * Agora é um cartão no canto, que não bloqueia a tela: a pessoa continua lendo, rolando e
 * preenchendo outros campos. Diz o que está sendo feito, a etapa do momento e, depois de 20 s,
 * explica que dá para continuar nesta tela. Como a geração acontece nesta aba, sair dela
 * cancela o resultado: o navegador avisa antes de fechar ou recarregar.
 *
 * Os 29 lugares que chamam aiLoadingStart/aiLoadingStop continuam iguais.
 */
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useAILoading } from "@/hooks/useAILoading";
import SimboloOmnisfera from "@/components/SimboloOmnisfera";

const TITULO: Record<string, string> = {
  pei: "Escrevendo o PEI",
  paee: "Montando o PAEE",
  hub: "Criando o material",
  diario: "Lendo os registros do diário",
  monitoramento: "Consolidando a evolução",
  diagnostica: "Montando a avaliação diagnóstica",
  pei_regente: "Adaptando para a sua disciplina",
  pgi: "Montando o plano da escola",
  default: "Gerando com IA",
};

const ETAPAS: Record<string, string[]> = {
  pei: ["lendo o estudo de caso…", "escolhendo habilidades da BNCC…", "escrevendo os objetivos…", "propondo estratégias…", "revisando o texto…"],
  paee: ["lendo o PEI…", "organizando o ciclo do AEE…", "sugerindo recursos de acessibilidade…", "montando o cronograma…"],
  hub: ["lendo o perfil do estudante…", "adaptando o conteúdo…", "ajustando a linguagem…", "conferindo o checklist de adaptação…"],
  diario: ["lendo os atendimentos…", "procurando padrões…", "escrevendo a análise…"],
  monitoramento: ["juntando PEI, PAEE e diário…", "comparando com as metas…", "escrevendo a síntese…"],
  diagnostica: ["lendo as habilidades escolhidas…", "escrevendo as questões…", "conferindo as alternativas…"],
  pei_regente: ["lendo o PEI…", "cruzando com o plano de ensino…", "escrevendo as adaptações…"],
  pgi: ["lendo os dados da escola…", "priorizando ações…", "escrevendo o plano…"],
  default: ["lendo o contexto…", "escrevendo…", "revisando…"],
};

const NOTA_DEPOIS_MS = 20000;

export function AILoadingOverlay() {
  const { state } = useAILoading();
  const [etapa, setEtapa] = useState(0);
  const [demorando, setDemorando] = useState(false);
  const [recolhido, setRecolhido] = useState(false);

  const modulo = TITULO[state.module] ? state.module : "default";
  const etapas = ETAPAS[modulo];

  useEffect(() => {
    if (!state.isLoading) return;
    setEtapa(0); setDemorando(false); setRecolhido(false);
    // avança pelas etapas e para na última (não volta ao começo: não é um carrossel)
    const passo = setInterval(() => setEtapa((e) => Math.min(e + 1, etapas.length - 1)), 6000);
    const nota = setTimeout(() => setDemorando(true), NOTA_DEPOIS_MS);
    // sair da aba cancela a geração: o navegador pergunta antes
    const avisar = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", avisar);
    return () => { clearInterval(passo); clearTimeout(nota); window.removeEventListener("beforeunload", avisar); };
  }, [state.isLoading, etapas.length]);

  if (!state.isLoading) return null;

  return (
    <div
      className="omni-geracao omni-geracao--flutuante"
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{
        position: "fixed", right: 16, bottom: "calc(16px + env(safe-area-inset-bottom, 0px))", zIndex: 60,
        width: recolhido ? "auto" : "min(400px, calc(100vw - 32px))",
        padding: recolhido ? "10px 14px" : "var(--space-5)",
        gap: recolhido ? 10 : "var(--space-4)",
        alignItems: "center",
        boxShadow: "var(--sombra-2, 0 12px 32px rgb(0 0 0 / .14))",
      }}
    >
      <span className="omni-geracao__marca" aria-hidden style={recolhido ? { width: 28, height: 28 } : { width: 48, height: 48 }}>
        <SimboloOmnisfera tamanho={recolhido ? 28 : 48} animacao="vez" />
      </span>
      <div style={{ minWidth: 0 }}>
        <div className="flex items-start justify-between gap-2">
          <p className="omni-geracao__titulo" style={{ margin: 0, fontSize: recolhido ? 15 : 17, lineHeight: recolhido ? "20px" : "22px" }}>
            {TITULO[modulo]}
          </p>
          <button
            type="button"
            className="omni-btn omni-btn--discreto omni-btn--icone"
            style={{ minHeight: 28, width: 28, padding: 0, marginTop: -4 }}
            aria-label={recolhido ? "Mostrar detalhes da geração" : "Recolher"}
            onClick={() => setRecolhido((v) => !v)}
          >
            {recolhido ? <ChevronUp aria-hidden /> : <ChevronDown aria-hidden />}
          </button>
        </div>
        {!recolhido && (
          <>
            <p className="omni-geracao__frase" style={{ margin: "2px 0 0", fontSize: 15 }}>{etapas[etapa]}</p>
            <p className="omni-geracao__nota" style={{ fontSize: 13, lineHeight: "18px" }}>
              {demorando
                ? "Ainda escrevendo. Pode continuar usando esta tela; só não feche nem troque de página, senão o texto se perde."
                : "Pode continuar lendo e preenchendo esta tela enquanto isso."}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
