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
    /** Visual variant: 'saturated' (default) or 'pastel' (warm notebook) */
    variant?: "saturated" | "pastel";
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
    variant = "saturated",
    onClick,
    className,
}: ModuleCardProps) {
    const colors = moduleColors[moduleKey];
    const isPastel = variant === "pastel";
    const cardBg = isPastel ? colors.bgPastel : colors.bg;
    const cardText = isPastel ? colors.textPastel : colors.text;
    const badgeBg = isPastel ? `${colors.bg}20` : "rgba(255,255,255,0.2)";
    const badgeText = isPastel ? colors.textPastel : "white";

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
                !disabled && "cursor-pointer hover:shadow-(--omni-shadow-2xl)",
                active && "ring-2 ring-white/60 shadow-(--omni-shadow-xl)",
                className
            )}
            style={{
                backgroundColor: cardBg,
                color: cardText,
                boxShadow: active
                    ? `0 0 0 1px rgba(255,255,255,0.2) inset, ${colors.glow}, var(--omni-shadow-lg)`
                    : isPastel
                        ? `0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)`
                        : `0 1px 0 0 rgba(255,255,255,0.15) inset, var(--omni-shadow-elevated)`,
                ...(isPastel ? { border: `1px solid ${colors.bg}25` } : {}),
            }}
        >
            {/* Icon */}
            <div className="mb-3 flex items-center justify-center">
                {iconElement ?? (Icon && <Icon className={`w-10 h-10 ${isPastel ? '' : 'text-white/90'}`} strokeWidth={1.5} style={isPastel ? { color: colors.bg } : undefined} />)}
            </div>

            {/* Title */}
            <span className={`text-sm font-bold tracking-tight leading-tight ${isPastel ? '' : 'text-white'}`} style={isPastel ? { color: cardText } : undefined}>
                {title}
            </span>

            {/* Description */}
            {description && (
                <span className={`mt-1 text-[11px] font-medium leading-snug line-clamp-2 ${isPastel ? 'opacity-70' : 'text-white/70'}`} style={isPastel ? { color: cardText } : undefined}>
                    {description}
                </span>
            )}

            {/* Badge */}
            {badge && (
                <span
                    className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-sm"
                    style={{ backgroundColor: badgeBg, color: badgeText }}
                >
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
