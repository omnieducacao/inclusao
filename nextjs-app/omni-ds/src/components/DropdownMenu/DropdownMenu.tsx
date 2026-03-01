import { useState, useRef, useEffect, useCallback, createContext, useContext, forwardRef, type HTMLAttributes, type ReactNode, type ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

// ─── Context ───
interface DropdownCtx {
    open: boolean;
    setOpen: (v: boolean) => void;
    triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const Ctx = createContext<DropdownCtx>({
    open: false,
    setOpen: () => { },
    triggerRef: { current: null },
});

// ─── Root ───
export interface DropdownMenuProps {
    children: ReactNode;
    /** Controlado externamente */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function DropdownMenu({ children, open: controlledOpen, onOpenChange }: DropdownMenuProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = controlledOpen ?? internalOpen;
    const setOpen = useCallback(
        (v: boolean) => {
            setInternalOpen(v);
            onOpenChange?.(v);
        },
        [onOpenChange]
    );
    const triggerRef = useRef<HTMLButtonElement>(null);

    return <Ctx.Provider value={{ open, setOpen, triggerRef }}>{children}</Ctx.Provider>;
}

// ─── Trigger ───
export const DropdownMenuTrigger = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ children, className, onClick, ...props }, ref) => {
        const { open, setOpen, triggerRef } = useContext(Ctx);
        return (
            <button
                ref={(node) => {
                    (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
                    if (typeof ref === "function") ref(node);
                    else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
                }}
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                className={cn("inline-flex items-center", className)}
                onClick={(e) => {
                    onClick?.(e);
                    setOpen(!open);
                }}
                {...props}
            >
                {children}
            </button>
        );
    }
);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

// ─── Content ───
export interface DropdownMenuContentProps extends HTMLAttributes<HTMLDivElement> {
    /** Alinhamento relativo ao trigger */
    align?: "start" | "center" | "end";
    /** Lado do trigger */
    side?: "top" | "bottom";
}

export const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(
    ({ children, className, align = "start", side = "bottom", ...props }, ref) => {
        const { open, setOpen, triggerRef } = useContext(Ctx);
        const menuRef = useRef<HTMLDivElement>(null);

        // Close on outside click
        useEffect(() => {
            if (!open) return;
            const handler = (e: MouseEvent) => {
                const target = e.target as Node;
                if (
                    menuRef.current && !menuRef.current.contains(target) &&
                    triggerRef.current && !triggerRef.current.contains(target)
                ) {
                    setOpen(false);
                }
            };
            document.addEventListener("mousedown", handler);
            return () => document.removeEventListener("mousedown", handler);
        }, [open, setOpen, triggerRef]);

        // Close on Escape
        useEffect(() => {
            if (!open) return;
            const handler = (e: KeyboardEvent) => {
                if (e.key === "Escape") {
                    setOpen(false);
                    triggerRef.current?.focus();
                }
            };
            document.addEventListener("keydown", handler);
            return () => document.removeEventListener("keydown", handler);
        }, [open, setOpen, triggerRef]);

        // Focus first item on open
        useEffect(() => {
            if (open && menuRef.current) {
                const first = menuRef.current.querySelector<HTMLElement>('[role="menuitem"]');
                first?.focus();
            }
        }, [open]);

        if (!open) return null;

        return (
            <div
                ref={(node) => {
                    (menuRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
                    if (typeof ref === "function") ref(node);
                    else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
                }}
                role="menu"
                aria-orientation="vertical"
                className={cn(
                    "absolute z-50 min-w-[180px] overflow-hidden rounded-xl",
                    "bg-[var(--omni-bg-secondary)] border border-[var(--omni-border-default)]",
                    "shadow-[var(--omni-shadow-lg)] p-1.5",
                    "animate-in fade-in-0 zoom-in-95",
                    side === "bottom" ? "mt-2" : "mb-2 bottom-full",
                    align === "end" ? "right-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "left-0",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
DropdownMenuContent.displayName = "DropdownMenuContent";

// ─── Item ───
export interface DropdownMenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Ícone à esquerda */
    icon?: ReactNode;
    /** Atalho de teclado exibido */
    shortcut?: string;
    /** Variante destrutiva (vermelha) */
    destructive?: boolean;
}

export const DropdownMenuItem = forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
    ({ children, className, icon, shortcut, destructive, disabled, onClick, ...props }, ref) => {
        const { setOpen } = useContext(Ctx);
        return (
            <button
                ref={ref}
                type="button"
                role="menuitem"
                disabled={disabled}
                className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                    "transition-colors cursor-pointer outline-none",
                    "focus:bg-[var(--omni-bg-hover)] hover:bg-[var(--omni-bg-hover)]",
                    destructive
                        ? "text-red-600 focus:text-red-600 dark:text-red-400"
                        : "text-[var(--omni-text-primary)]",
                    disabled && "opacity-50 cursor-not-allowed pointer-events-none",
                    className
                )}
                onClick={(e) => {
                    onClick?.(e);
                    if (!disabled) setOpen(false);
                }}
                onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                        e.preventDefault();
                        const next = (e.currentTarget.nextElementSibling as HTMLElement)?.querySelector?.("[role='menuitem']") as HTMLElement
                            ?? e.currentTarget.nextElementSibling as HTMLElement;
                        next?.focus();
                    }
                    if (e.key === "ArrowUp") {
                        e.preventDefault();
                        const prev = (e.currentTarget.previousElementSibling as HTMLElement)?.querySelector?.("[role='menuitem']") as HTMLElement
                            ?? e.currentTarget.previousElementSibling as HTMLElement;
                        prev?.focus();
                    }
                }}
                {...props}
            >
                {icon && <span className="shrink-0 text-[var(--omni-text-muted)]">{icon}</span>}
                <span className="flex-1 text-left">{children}</span>
                {shortcut && (
                    <span className="ml-auto text-xs text-[var(--omni-text-muted)] font-mono">
                        {shortcut}
                    </span>
                )}
            </button>
        );
    }
);
DropdownMenuItem.displayName = "DropdownMenuItem";

// ─── Separator ───
export function DropdownMenuSeparator({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            role="separator"
            className={cn("h-px my-1 bg-[var(--omni-border-default)]", className)}
            {...props}
        />
    );
}

// ─── Label ───
export function DropdownMenuLabel({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "px-3 py-1.5 text-xs font-semibold text-[var(--omni-text-muted)] uppercase tracking-wider",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
