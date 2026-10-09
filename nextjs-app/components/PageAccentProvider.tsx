"use client";

/**
 * PageAccentProvider (onda 4d · Omni Design System).
 *
 * Antes injetava a cor que o admin escolhia para cada módulo (--module-accent) e pintava avatares,
 * selos e títulos com ela. Agora a cor de cada módulo é fixa e vem do design system (os seis círculos
 * do Encontro, aplicados pelo PageHero), para a plataforma ter uma identidade só e manter o contraste
 * conferido. O componente fica como um contêiner simples para não mexer nas telas que o usam.
 */
type Props = {
    adminKey: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    serverConfig?: Record<string, any>;
    children: React.ReactNode;
};

export function PageAccentProvider({ children }: Props) {
    return <div>{children}</div>;
}
