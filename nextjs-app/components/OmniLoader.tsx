"use client";

/**
 * OmniLoader — onda 22: agora é só uma porta para o carregamento do design system.
 * Antes tinha visual próprio (anel colorido por motor de IA, "OmniRed processando", sobreposição escura);
 * agora todo carregamento do app usa o símbolo da Omnisfera:
 * - inline  → CarregandoLinha (símbolo pequeno, dentro de botão ou ao lado de um texto)
 * - card    → TelaCarregando variante "secao" (no lugar do conteúdo de uma aba ou painel)
 * - overlay → TelaCarregando variante "pagina"
 * Com um motor de IA (engine), o símbolo usa o movimento "gerando".
 * A API ficou igual, para não mexer nas telas que já usam o OmniLoader.
 */
import React from "react";
import type { EngineId } from "@/lib/ai-engines";
import TelaCarregando, { CarregandoLinha } from "@/components/brand/TelaCarregando";

const LOADING_MESSAGES = ["Carregando…"];

const DEFAULT_MESSAGES = [
    "Analisando o perfil pedagógico…",
    "Calibrando ao nível do estudante…",
    "Gerando adaptações individualizadas…",
    "Estruturando o documento…",
    "Verificando o alinhamento com a BNCC…",
];

const MODULE_MESSAGES: Record<string, string[]> = {
    diagnostica: [
        "Criando questões…",
        "Analisando habilidades selecionadas…",
        "Calibrando questões ao nível Omnisfera…",
        "Gerando itens com distratores pedagógicos…",
        "Ajustando complexidade cognitiva…",
        "Finalizando a avaliação adaptada…",
    ],
    processual: [
        "Cruzando dados com avaliação anterior…",
        "Calculando evolução por habilidade…",
        "Gerando relatório de progresso…",
        "Identificando padrões de aprendizagem…",
    ],
    pei: [
        "Analisando barreiras e potencialidades…",
        "Gerando estratégias de acesso e ensino…",
        "Construindo o documento técnico…",
        "Alinhando com legislação inclusiva…",
        "Finalizando o PEI individualizado…",
    ],
    pei_regente: [
        "Cruzando PEI com plano de ensino…",
        "Gerando adaptações para sua disciplina…",
        "Construindo a Ponte Pedagógica…",
        "Alinhando objetivos individualizados…",
    ],
    hub: [
        "Criando atividade personalizada…",
        "Adaptando ao perfil do estudante…",
        "Gerando materiais pedagógicos…",
    ],
    hub_questoes: [
        "Criando questões…",
        "Selecionando habilidades BNCC…",
        "Gerando itens e distratores…",
        "Adaptando ao perfil do estudante…",
    ],
    plano_curso: [
        "Analisando habilidades BNCC…",
        "Gerando objetivos e metodologias…",
        "Sugerindo recursos e avaliações…",
    ],
    paee: [
        "Montando plano de atendimento…",
        "Gerando atividades especializadas…",
        "Estruturando o ciclo de atendimento…",
    ],
};

interface OmniLoaderProps {
    engine?: EngineId | string;
    module?: string;
    message?: string;
    variant?: "inline" | "overlay" | "card";
    size?: number;
}

export function OmniLoader({ engine = "default", module: moduleName, message, variant = "inline", size = 16 }: OmniLoaderProps) {
    const ia = !!engine && engine !== "default";
    // Inline: sem hooks (pode trocar de lugar com um ícone)
    if (variant === "inline") return <CarregandoLinha texto={message} tamanho={size} gerando={ia} />;
    const mensagens = message ? [message] : (moduleName && MODULE_MESSAGES[moduleName]) || (ia ? DEFAULT_MESSAGES : LOADING_MESSAGES);
    return <TelaCarregando variante={variant === "overlay" ? "pagina" : "secao"} mensagens={mensagens} animacao={ia ? "gerando" : undefined} />;
}

export default OmniLoader;
