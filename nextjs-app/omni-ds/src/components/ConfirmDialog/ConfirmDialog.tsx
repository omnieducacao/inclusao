import { type ReactNode } from "react";
import { Modal } from "../Modal/Modal";

export type ConfirmDialogProps = { open: boolean; onConfirm: () => void; onCancel: () => void; title: string; description?: string; icon?: ReactNode; variant?: "danger" | "warning" | "info"; confirmText?: string; cancelText?: string };

const variantColors = { danger: "#ef4444", warning: "#f59e0b", info: "#0ea5e9" };
const variantBg = { danger: "bg-red-100 dark:bg-red-900/30", warning: "bg-amber-100 dark:bg-amber-900/30", info: "bg-sky-100 dark:bg-sky-900/30" };
const defaultIcons: Record<string, string> = { danger: "⚠️", warning: "❓", info: "ℹ️" };

function ConfirmDialog({ open, onConfirm, onCancel, title, description, icon, variant = "danger", confirmText = "Confirmar", cancelText = "Cancelar" }: ConfirmDialogProps) {
    return (
        <Modal open={open} onClose={onCancel} size="sm" showClose={false}>
            <div className="flex flex-col items-center text-center">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4 ${variantBg[variant]}`}>
                    {icon ?? defaultIcons[variant]}
                </div>
                <h3 className="text-lg font-bold text-[var(--omni-text-primary)]">{title}</h3>
                {description && <p className="text-sm text-[var(--omni-text-muted)] mt-2 max-w-xs">{description}</p>}
                <div className="flex gap-3 mt-6 w-full">
                    <button onClick={onCancel} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl border border-[var(--omni-border-default)] text-[var(--omni-text-secondary)] hover:bg-[var(--omni-bg-tertiary)] transition-colors">{cancelText}</button>
                    <button onClick={onConfirm} className="flex-1 px-4 py-2.5 text-sm font-bold rounded-xl text-white transition-colors hover:opacity-90" style={{ backgroundColor: variantColors[variant] }}>{confirmText}</button>
                </div>
            </div>
        </Modal>
    );
}
export { ConfirmDialog };
