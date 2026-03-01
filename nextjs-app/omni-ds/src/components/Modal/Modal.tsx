import { forwardRef, useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";

export type ModalProps = HTMLAttributes<HTMLDialogElement> & {
    open: boolean;
    onClose: () => void;
    title?: string;
    size?: "sm" | "md" | "lg" | "full";
    children: ReactNode;
    /** Mostrar botão de fechar no canto superior direito */
    showClose?: boolean;
};

const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    full: "max-w-[90vw] max-h-[90vh]",
};

const Modal = forwardRef<HTMLDialogElement, ModalProps>(
    ({ open, onClose, title, size = "md", showClose = true, children, className, ...props }, ref) => {
        const dialogRef = useRef<HTMLDialogElement | null>(null);

        const setRef = (node: HTMLDialogElement | null) => {
            dialogRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
        };

        useEffect(() => {
            const dialog = dialogRef.current;
            if (!dialog) return;
            if (open && !dialog.open) dialog.showModal();
            else if (!open && dialog.open) dialog.close();
        }, [open]);

        useEffect(() => {
            const dialog = dialogRef.current;
            if (!dialog) return;
            const handleClose = () => onClose();
            dialog.addEventListener("close", handleClose);
            return () => dialog.removeEventListener("close", handleClose);
        }, [onClose]);

        return (
            <dialog
                ref={setRef}
                className={cn(
                    "p-0 rounded-2xl border border-[var(--omni-border-default)] bg-[var(--omni-bg-secondary)] text-[var(--omni-text-primary)] shadow-[var(--omni-shadow-2xl)]",
                    "backdrop:bg-black/50 backdrop:backdrop-blur-md",
                    "w-full",
                    sizeClasses[size],
                    "animate-[modal-in_250ms_cubic-bezier(0.16,1,0.3,1)]",
                    className
                )}
                {...props}
            >
                {(title || showClose) && (
                    <div className="flex items-center justify-between px-6 pt-5 pb-1">
                        {title && <h2 className="text-lg font-bold tracking-tight">{title}</h2>}
                        {showClose && (
                            <button
                                onClick={onClose}
                                className="ml-auto p-1.5 rounded-lg text-[var(--omni-text-muted)] hover:text-[var(--omni-text-primary)] hover:bg-[var(--omni-bg-tertiary)] transition-colors"
                                aria-label="Fechar"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}
                <div className="px-6 pb-6 pt-2">{children}</div>
            </dialog>
        );
    }
);

Modal.displayName = "Modal";
export { Modal };
