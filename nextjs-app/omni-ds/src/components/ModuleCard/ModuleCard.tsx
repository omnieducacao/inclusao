import type { LucideIcon } from "lucide-react";
import { cn } from "../../utils/cn";
import type { ModuleKey } from "../../tokens/colors";
import { moduleColors } from "../../tokens/colors";

export type ModuleCardProps = {
    /** ID do módulo (determina cor automaticamente) */
    moduleKey: ModuleKey;
    /** Ícone Lucide */
    icon?: LucideIcon;
    /** Custom icon element (ex: Lottie) */
    iconElement?: React.ReactNode;
    /** Título do módulo */
    title: string;
    /** Descrição curta */
    description?: string;
    /** Badge de contagem (ex: "12 alunos") */
    badge?: string;
    /** Se está ativo/selecionado */
    active?: boolean;
    /** Desabilitado */
    disabled?: boolean;
    /** Click handler */
    onClick?: () => void;
    className?: string;
};

export function ModuleCard({
    moduleKey,
    icon: Icon,
    iconElement,
    title,
    description,
    badge,
    active,
    disabled,
    onClick,
    className,
}: ModuleCardProps) {
    const colors = moduleColors[moduleKey];

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "group relative flex flex-col items-center justify-center text-center p-5 rounded-2xl",
                "transition-all duration-300 ease-out touch-manipulation active-scale overflow-hidden",
                "min-h-[140px] w-full shadow-(--omni-shadow-elevated) ring-1 ring-white/10 dark:ring-white/5",
                disabled && "opacity-50 cursor-not-allowed",
                !disabled && "cursor-pointer hover:scale-[1.03] hover:-translate-y-1 hover:shadow-(--omni-shadow-2xl)",
                active && "ring-2 ring-white/60 shadow-(--omni-shadow-xl) scale-[1.02]",
                className
            )}
            style={{
                backgroundColor: colors.bg,
                color: colors.text,
                boxShadow: active ? `0 0 0 1px rgba(255,255,255,0.2) inset, ${colors.glow}, var(--omni-shadow-lg)` : `0 1px 0 0 rgba(255,255,255,0.15) inset, var(--omni-shadow-elevated)`,
            }}
        >
            {/* Icon */}
            <div className="mb-3 flex items-center justify-center">
                {iconElement ?? (Icon && <Icon className="w-10 h-10 text-white/90" strokeWidth={1.5} />)}
            </div>

            {/* Title */}
            <span className="text-sm font-bold tracking-tight text-white leading-tight">
                {title}
            </span>

            {/* Description */}
            {description && (
                <span className="mt-1 text-[11px] font-medium text-white/70 leading-snug line-clamp-2">
                    {description}
                </span>
            )}

            {/* Badge */}
            {badge && (
                <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white backdrop-blur-sm">
                    {badge}
                </span>
            )}

            {/* Hover shimmer premium */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                    background: "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 55%, transparent 80%)",
                }}
            />
        </button>
    );
}
