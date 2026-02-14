"use client";

import { Loader2 } from "lucide-react";

interface LoadingProps {
  text?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

export function Loading({ text = "Carregando...", size = "md", fullScreen = false }: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const containerClasses = fullScreen
    ? "fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center"
    : "flex items-center justify-center gap-2 py-4";

  return (
    <div className={containerClasses} style={fullScreen ? { backgroundColor: 'var(--glass-bg-strong)' } : undefined}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      {text && <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{text}</span>}
    </div>
  );
}
