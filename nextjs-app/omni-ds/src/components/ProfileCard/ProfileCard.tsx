import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface ProfileCardProps extends HTMLAttributes<HTMLDivElement> {
    /** URL do avatar */
    avatarUrl?: string;
    /** Iniciais fallback (ex: "RS") */
    initials?: string;
    /** Nome completo */
    name: string;
    /** Função / cargo / série */
    role?: string;
    /** Badge (online, verificado, etc.) */
    status?: "online" | "offline" | "away";
    /** Cor de destaque */
    color?: string;
    /** Link (ex: "Ver Perfil") */
    action?: { label: string; onClick: () => void };
    /** Slot extra */
    extra?: ReactNode;
    /** Variante */
    variant?: "default" | "compact" | "horizontal";
}

/**
 * ProfileCard — Card de perfil de usuário.
 *
 * Mostra avatar, nome, função e status.
 * Inspirado nos cards de perfil da referência 2.
 *
 * @example
 * ```tsx
 * <ProfileCard
 *   name="Maria Santos"
 *   role="Professora — 6º Ano"
 *   avatarUrl="/img/maria.jpg"
 *   status="online"
 *   action={{ label: "Ver perfil", onClick: () => {} }}
 * />
 * ```
 */
const ProfileCard = forwardRef<HTMLDivElement, ProfileCardProps>(
    ({ avatarUrl, initials, name, role, status, color = "#7c3aed", action, extra, variant = "default", className, ...props }, ref) => {

        const isCompact = variant === "compact";
        const isHorizontal = variant === "horizontal";

        const avatarSize = isCompact ? "w-10 h-10" : "w-14 h-14";

        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-2xl border border-[var(--omni-border-default)] bg-[var(--omni-bg-secondary)]",
                    "transition-all duration-200 hover:shadow-md",
                    isHorizontal ? "flex items-center gap-4 p-4" : "p-5",
                    className
                )}
                {...props}
            >
                <div className={cn(
                    "flex items-center gap-3",
                    !isHorizontal && !isCompact && "flex-col text-center"
                )}>
                    {/* Avatar */}
                    <div className="relative">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={name}
                                className={cn(avatarSize, "rounded-full object-cover ring-2 ring-white dark:ring-slate-800")}
                            />
                        ) : (
                            <div
                                className={cn(avatarSize, "rounded-full flex items-center justify-center font-bold text-white text-sm")}
                                style={{ backgroundColor: color }}
                            >
                                {initials || name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                        )}
                        {status && (
                            <span
                                className={cn(
                                    "absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-800",
                                    status === "online" ? "bg-emerald-500" :
                                        status === "away" ? "bg-amber-500" : "bg-slate-400"
                                )}
                            />
                        )}
                    </div>

                    {/* Info */}
                    <div className={cn(!isHorizontal && !isCompact && "mt-1")}>
                        <p className="text-sm font-bold text-[var(--omni-text-primary)] truncate">{name}</p>
                        {role && (
                            <p className="text-xs font-medium text-[var(--omni-text-muted)] truncate mt-0.5">{role}</p>
                        )}
                    </div>
                </div>

                {/* Action / Extra */}
                {(action || extra) && (
                    <div className={cn("mt-3", isHorizontal && "ml-auto mt-0")}>
                        {action && (
                            <button
                                type="button"
                                onClick={action.onClick}
                                className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                                style={{ color, backgroundColor: `${color}12` }}
                            >
                                {action.label}
                            </button>
                        )}
                        {extra}
                    </div>
                )}
            </div>
        );
    }
);

ProfileCard.displayName = "ProfileCard";

export { ProfileCard };
