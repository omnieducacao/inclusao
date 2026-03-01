import { forwardRef, useEffect, useCallback, useRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface SheetProps extends HTMLAttributes<HTMLDialogElement> {
    /** Aberto/fechado */
    open: boolean;
    /** Callback ao fechar */
    onClose: () => void;
    /** Lado da tela */
    side?: "left" | "right" | "top" | "bottom";
    /** Largura (left/right) ou altura (top/bottom) */
    size?: string;
    /** Título para acessibilidade */
    title?: string;
    children: ReactNode;
}

/**
 * Sheet / Drawer — Painel lateral deslizante.
 * Usa `<dialog>` nativo para máxima acessibilidade.
 *
 * @example
 * ```tsx
 * <Sheet open={open} onClose={() => setOpen(false)} side="right" title="Filtros">
 *   <SheetHeader>Filtros</SheetHeader>
 *   <SheetBody>...</SheetBody>
 * </Sheet>
 * ```
 */
const Sheet = forwardRef<HTMLDialogElement, SheetProps>(
    ({ open, onClose, side = "right", size, title, children, className, ...props }, ref) => {
        const dialogRef = useRef<HTMLDialogElement>(null);

        const resolvedRef = (ref as React.RefObject<HTMLDialogElement>) || dialogRef;

        const sizeValue = size || (side === "left" || side === "right" ? "380px" : "320px");

        // Sync open state with dialog
        useEffect(() => {
            const dialog = (resolvedRef as React.RefObject<HTMLDialogElement>).current;
            if (!dialog) return;
            if (open && !dialog.open) {
                dialog.showModal();
            } else if (!open && dialog.open) {
                dialog.close();
            }
        }, [open, resolvedRef]);

        // Handle backdrop click
        const handleClick = useCallback(
            (e: React.MouseEvent<HTMLDialogElement>) => {
                if (e.target === e.currentTarget) onClose();
            },
            [onClose]
        );

        // Handle Escape
        const handleCancel = useCallback(
            (e: React.SyntheticEvent) => {
                e.preventDefault();
                onClose();
            },
            [onClose]
        );

        const positionClasses = {
            right: "ml-auto h-full rounded-l-2xl translate-x-0",
            left: "mr-auto h-full rounded-r-2xl translate-x-0",
            top: "mb-auto w-full rounded-b-2xl translate-y-0",
            bottom: "mt-auto w-full rounded-t-2xl translate-y-0",
        };

        const sizeStyle = side === "left" || side === "right"
            ? { width: sizeValue, maxWidth: "90vw" }
            : { height: sizeValue, maxHeight: "90vh" };

        return (
            <dialog
                ref={resolvedRef}
                aria-label={title}
                className={cn(
                    // Reset dialog defaults
                    "fixed inset-0 m-0 p-0 max-w-none max-h-none",
                    "bg-transparent border-none outline-none",
                    // Backdrop
                    "backdrop:bg-black/50 backdrop:backdrop-blur-sm",
                    // Animation
                    "open:animate-in open:fade-in-0",
                    className
                )}
                onClick={handleClick}
                onCancel={handleCancel}
                {...props}
            >
                <div
                    className={cn(
                        "bg-[var(--omni-bg-secondary)] shadow-[var(--omni-shadow-2xl)]",
                        "flex flex-col overflow-hidden",
                        positionClasses[side]
                    )}
                    style={sizeStyle}
                >
                    {children}
                </div>
            </dialog>
        );
    }
);

Sheet.displayName = "Sheet";

// ─── Sub-components ───

const SheetHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "flex items-center justify-between px-6 py-4",
                "border-b border-[var(--omni-border-default)]",
                className
            )}
            {...props}
        />
    )
);
SheetHeader.displayName = "SheetHeader";

const SheetTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h2
            ref={ref}
            className={cn("text-lg font-bold tracking-tight text-[var(--omni-text-primary)]", className)}
            {...props}
        />
    )
);
SheetTitle.displayName = "SheetTitle";

const SheetBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("flex-1 overflow-auto px-6 py-4", className)}
            {...props}
        />
    )
);
SheetBody.displayName = "SheetBody";

const SheetFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "flex items-center justify-end gap-3 px-6 py-4",
                "border-t border-[var(--omni-border-default)]",
                className
            )}
            {...props}
        />
    )
);
SheetFooter.displayName = "SheetFooter";

export { Sheet, SheetHeader, SheetTitle, SheetBody, SheetFooter };
