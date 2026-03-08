import React from "react";

export interface BadgeInfoProps {
    children: React.ReactNode;
    variant?: "indigo" | "purple" | "emerald" | "amber" | "rose";
}

export function BadgeInfo({ children, variant = "indigo" }: BadgeInfoProps) {
    const variants = {
        indigo: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
        purple: "bg-purple-500/10 text-purple-500 border-purple-500/20 text-[9px]",
        emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        rose: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    };

    return (
        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${variants[variant]}`}>
            {children}
        </span>
    );
}
