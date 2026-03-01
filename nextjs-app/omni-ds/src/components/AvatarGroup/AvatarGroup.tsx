import { forwardRef, type HTMLAttributes, type ReactNode, Children, isValidElement, cloneElement } from "react";
import { cn } from "../../utils/cn";

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
    /** Máximo de avatars visíveis antes do "+N" */
    max?: number;
    /** Tamanho dos avatars (herdado) */
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    children: ReactNode;
}

const sizeMap = {
    xs: { dim: 24, text: "text-[9px]", overlap: "-ml-1.5" },
    sm: { dim: 28, text: "text-[10px]", overlap: "-ml-2" },
    md: { dim: 32, text: "text-xs", overlap: "-ml-2.5" },
    lg: { dim: 40, text: "text-sm", overlap: "-ml-3" },
    xl: { dim: 48, text: "text-base", overlap: "-ml-3.5" },
};

/**
 * AvatarGroup — Agrupamento de avatars com overlap e contador "+N".
 *
 * @example
 * ```tsx
 * <AvatarGroup max={3}>
 *   <Avatar name="Maria" />
 *   <Avatar name="João" />
 *   <Avatar name="Ana" />
 *   <Avatar name="Carlos" />
 *   <Avatar name="Pedro" />
 * </AvatarGroup>
 * ```
 */
const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
    ({ children, max = 4, size = "md", className, ...props }, ref) => {
        const childArray = Children.toArray(children).filter(isValidElement);
        const visible = childArray.slice(0, max);
        const remaining = childArray.length - max;
        const s = sizeMap[size];

        return (
            <div
                ref={ref}
                className={cn("flex items-center", className)}
                role="group"
                aria-label={`Grupo de ${childArray.length} avatars`}
                {...props}
            >
                {visible.map((child, i) =>
                    cloneElement(child as React.ReactElement<{ size?: string; className?: string }>, {
                        size,
                        className: cn(
                            i > 0 && s.overlap,
                            "ring-2 ring-[var(--omni-bg-secondary)]",
                            (child as React.ReactElement<{ className?: string }>).props.className
                        ),
                    })
                )}
                {remaining > 0 && (
                    <div
                        className={cn(
                            "inline-flex items-center justify-center rounded-full",
                            "bg-[var(--omni-bg-tertiary)] text-[var(--omni-text-secondary)]",
                            "font-semibold ring-2 ring-[var(--omni-bg-secondary)]",
                            s.overlap,
                            s.text
                        )}
                        style={{ width: s.dim, height: s.dim }}
                        aria-label={`Mais ${remaining} pessoas`}
                    >
                        +{remaining}
                    </div>
                )}
            </div>
        );
    }
);

AvatarGroup.displayName = "AvatarGroup";

export { AvatarGroup };
