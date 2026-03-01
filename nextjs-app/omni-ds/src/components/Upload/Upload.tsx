import { useState, useRef, type DragEvent } from "react";
import { cn } from "../../utils/cn";

export type UploadProps = { accept?: string; multiple?: boolean; maxSize?: number; onFiles?: (files: File[]) => void; className?: string; label?: string; description?: string };

function Upload({ accept, multiple, maxSize, onFiles, className, label = "Click or drag file to this area to upload", description }: UploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFiles = (files: FileList | null) => {
        if (!files) return;
        let arr = Array.from(files);
        if (maxSize) arr = arr.filter((f) => f.size <= maxSize);
        if (arr.length) onFiles?.(arr);
    };

    const onDrag = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const onDragEnter = (e: DragEvent) => { onDrag(e); setIsDragging(true); };
    const onDragLeave = (e: DragEvent) => { onDrag(e); setIsDragging(false); };
    const onDrop = (e: DragEvent) => { onDrag(e); setIsDragging(false); handleFiles(e.dataTransfer.files); };

    return (
        <div
            className={cn("relative flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all text-center",
                isDragging ? "border-sky-500 bg-sky-50 dark:bg-sky-950/20" : "border-[var(--omni-border-default)] hover:border-sky-400 hover:bg-[var(--omni-bg-tertiary)]", className
            )}
            onClick={() => inputRef.current?.click()}
            onDragOver={onDrag} onDragEnter={onDragEnter} onDragLeave={onDragLeave} onDrop={onDrop}
        >
            <input ref={inputRef} type="file" accept={accept} multiple={multiple} onChange={(e) => handleFiles(e.target.files)} className="hidden" />
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--omni-text-muted)]"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            <p className="text-sm font-semibold text-[var(--omni-text-secondary)]">{label}</p>
            {description && <p className="text-xs text-[var(--omni-text-muted)]">{description}</p>}
        </div>
    );
}
export { Upload };
