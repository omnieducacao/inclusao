import { cn } from "../../utils/cn";

export type AvatarProps = { src?: string; alt?: string; name?: string; size?: "xs" | "sm" | "md" | "lg" | "xl"; className?: string };

const sizes = { xs: "w-6 h-6 text-[10px]", sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base", xl: "w-16 h-16 text-xl" };
const colors = ["bg-sky-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500", "bg-indigo-500"];

function getInitials(name: string) { return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2); }
function hashColor(name: string) { let h = 0; for (const c of name) h = c.charCodeAt(0) + ((h << 5) - h); return colors[Math.abs(h) % colors.length]; }

function Avatar({ src, alt, name, size = "md", className }: AvatarProps) {
    if (src) return <img src={src} alt={alt || name || ""} className={cn("rounded-full object-cover ring-2 ring-[var(--omni-bg-secondary)]", sizes[size], className)} />;
    const initials = name ? getInitials(name) : "?";
    return (
        <div className={cn("rounded-full flex items-center justify-center font-bold text-white ring-2 ring-[var(--omni-bg-secondary)]", sizes[size], name ? hashColor(name) : "bg-slate-400", className)}>{initials}</div>
    );
}

export type AvatarGroupProps = { children: React.ReactNode; max?: number; size?: AvatarProps["size"]; className?: string };
function AvatarGroup({ children, max = 4, size = "md", className }: AvatarGroupProps) {
    const items = Array.isArray(children) ? children : [children];
    const visible = items.slice(0, max);
    const overflow = items.length - max;
    return (
        <div className={cn("flex -space-x-2", className)}>
            {visible}
            {overflow > 0 && (
                <div className={cn("rounded-full flex items-center justify-center font-bold bg-[var(--omni-bg-tertiary)] text-[var(--omni-text-muted)] ring-2 ring-[var(--omni-bg-secondary)]", sizes[size])}>+{overflow}</div>
            )}
        </div>
    );
}
export { Avatar, AvatarGroup };
