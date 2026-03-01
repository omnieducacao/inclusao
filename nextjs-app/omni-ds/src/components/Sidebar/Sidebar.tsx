import { forwardRef, useState, createContext, useContext, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

// ─── Context ───
interface SidebarCtx {
    collapsed: boolean;
    setCollapsed: (v: boolean) => void;
}

const Ctx = createContext<SidebarCtx>({
    collapsed: false,
    setCollapsed: () => { },
});

export const useSidebar = () => useContext(Ctx);

// ─── Root ───
export interface SidebarProps extends HTMLAttributes<HTMLElement> {
    /** Largura expandida */
    width?: string;
    /** Largura colapsada */
    collapsedWidth?: string;
    /** Controlado externamente */
    collapsed?: boolean;
    onCollapsedChange?: (collapsed: boolean) => void;
    children: ReactNode;
}

/**
 * Sidebar — Navegação lateral colapsável.
 *
 * @example
 * ```tsx
 * <Sidebar>
 *   <SidebarHeader>Logo</SidebarHeader>
 *   <SidebarContent>
 *     <SidebarGroup label="Módulos">
 *       <SidebarItem icon={<Icon />} active>PEI</SidebarItem>
 *       <SidebarItem icon={<Icon />}>Hub</SidebarItem>
 *     </SidebarGroup>
 *   </SidebarContent>
 *   <SidebarFooter>
 *     <SidebarToggle />
 *   </SidebarFooter>
 * </Sidebar>
 * ```
 */
const Sidebar = forwardRef<HTMLElement, SidebarProps>(
    ({ width = "260px", collapsedWidth = "64px", collapsed: controlledCollapsed, onCollapsedChange, children, className, style, ...props }, ref) => {
        const [internalCollapsed, setInternalCollapsed] = useState(false);
        const collapsed = controlledCollapsed ?? internalCollapsed;
        const setCollapsed = (v: boolean) => {
            setInternalCollapsed(v);
            onCollapsedChange?.(v);
        };

        return (
            <Ctx.Provider value={{ collapsed, setCollapsed }}>
                <nav
                    ref={ref}
                    role="navigation"
                    aria-label="Sidebar navigation"
                    className={cn(
                        "flex flex-col h-full",
                        "bg-[var(--omni-bg-secondary)] border-r border-[var(--omni-border-default)]",
                        "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                        "overflow-hidden shrink-0",
                        className
                    )}
                    style={{
                        width: collapsed ? collapsedWidth : width,
                        ...style,
                    }}
                    {...props}
                >
                    {children}
                </nav>
            </Ctx.Provider>
        );
    }
);
Sidebar.displayName = "Sidebar";

// ─── Sub-components ───

const SidebarHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("px-4 py-4 shrink-0", className)} {...props} />
    )
);
SidebarHeader.displayName = "SidebarHeader";

const SidebarContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("flex-1 overflow-auto px-3 py-2", className)} {...props} />
    )
);
SidebarContent.displayName = "SidebarContent";

const SidebarFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("px-3 py-3 shrink-0 border-t border-[var(--omni-border-default)]", className)}
            {...props}
        />
    )
);
SidebarFooter.displayName = "SidebarFooter";

// ─── Group ───
export interface SidebarGroupProps extends HTMLAttributes<HTMLDivElement> {
    label?: string;
}

const SidebarGroup = forwardRef<HTMLDivElement, SidebarGroupProps>(
    ({ label, children, className, ...props }, ref) => {
        const { collapsed } = useSidebar();
        return (
            <div ref={ref} className={cn("mb-2", className)} role="group" aria-label={label} {...props}>
                {label && !collapsed && (
                    <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--omni-text-muted)]">
                        {label}
                    </p>
                )}
                <div className="flex flex-col gap-0.5">{children}</div>
            </div>
        );
    }
);
SidebarGroup.displayName = "SidebarGroup";

// ─── Item ───
export interface SidebarItemProps extends HTMLAttributes<HTMLButtonElement> {
    icon?: ReactNode;
    active?: boolean;
    badge?: ReactNode;
}

const SidebarItem = forwardRef<HTMLButtonElement, SidebarItemProps>(
    ({ icon, active, badge, children, className, ...props }, ref) => {
        const { collapsed } = useSidebar();
        return (
            <button
                ref={ref}
                type="button"
                className={cn(
                    "flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium",
                    "transition-colors cursor-pointer outline-none",
                    active
                        ? "bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300"
                        : "text-[var(--omni-text-secondary)] hover:bg-[var(--omni-bg-hover)] hover:text-[var(--omni-text-primary)]",
                    collapsed && "justify-center px-0",
                    className
                )}
                title={collapsed ? (typeof children === "string" ? children : undefined) : undefined}
                {...props}
            >
                {icon && <span className="shrink-0 w-5 h-5 flex items-center justify-center">{icon}</span>}
                {!collapsed && <span className="flex-1 text-left truncate">{children}</span>}
                {!collapsed && badge && <span className="shrink-0">{badge}</span>}
            </button>
        );
    }
);
SidebarItem.displayName = "SidebarItem";

// ─── Toggle ───
function SidebarToggle({ className, ...props }: HTMLAttributes<HTMLButtonElement>) {
    const { collapsed, setCollapsed } = useSidebar();
    return (
        <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
                "flex items-center justify-center w-full rounded-xl py-2 text-sm font-medium",
                "text-[var(--omni-text-muted)] hover:bg-[var(--omni-bg-hover)] hover:text-[var(--omni-text-primary)]",
                "transition-colors cursor-pointer",
                className
            )}
            aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            {...props}
        >
            <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn("transition-transform", collapsed && "rotate-180")}
            >
                <path d="M10 4L6 8L10 12" />
            </svg>
            {!collapsed && <span className="ml-2">Colapsar</span>}
        </button>
    );
}

export { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup, SidebarItem, SidebarToggle };
