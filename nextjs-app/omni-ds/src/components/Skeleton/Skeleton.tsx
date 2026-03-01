import { type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
    variant?: "text" | "circular" | "rectangular";
    width?: string | number;
    height?: string | number;
    /** Número de linhas (variant="text") */
    lines?: number;
};

function Skeleton({
    variant = "text",
    width,
    height,
    lines = 1,
    className,
    style,
    ...props
}: SkeletonProps) {
    const baseClasses = "relative overflow-hidden bg-[var(--omni-surface-0)] dark:bg-white/5 rounded-lg before:absolute before:inset-0 before:-translate-x-full before:animate-[omni-shimmer_2s_infinite_ease-in-out] before:bg-gradient-to-r before:from-transparent before:via-black/5 dark:before:via-white/10 before:to-transparent";

    if (variant === "circular") {
        const size = width || height || 40;
        return (
            <div
                className={cn(baseClasses, "rounded-full", className)}
                style={{ width: size, height: size, ...style }}
                {...props}
            />
        );
    }

    if (variant === "rectangular") {
        return (
            <div
                className={cn(baseClasses, "rounded-xl", className)}
                style={{ width: width || "100%", height: height || 120, ...style }}
                {...props}
            />
        );
    }

    // variant === "text"
    if (lines > 1) {
        return (
            <div className={cn("flex flex-col gap-2", className)} {...props}>
                {Array.from({ length: lines }).map((_, i) => (
                    <div
                        key={i}
                        className={cn(baseClasses, "h-4")}
                        style={{
                            width: i === lines - 1 ? "75%" : width || "100%",
                            ...style,
                        }}
                    />
                ))}
            </div>
        );
    }

    return (
        <div
            className={cn(baseClasses, "h-4", className)}
            style={{ width: width || "100%", height: height, ...style }}
            {...props}
        />
    );
}

export { Skeleton };
