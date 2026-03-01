import { cn } from "../../utils/cn";

export type StepItem = { title: string; description?: string };
export type StepsProps = { items: StepItem[]; current: number; direction?: "horizontal" | "vertical"; className?: string };

function Steps({ items, current, direction = "horizontal", className }: StepsProps) {
    return (
        <div className={cn(direction === "horizontal" ? "flex items-start" : "flex flex-col", className)}>
            {items.map((item, i) => {
                const status = i < current ? "finished" : i === current ? "active" : "waiting";
                const isLast = i === items.length - 1;
                return (
                    <div key={i} className={cn("flex", direction === "horizontal" ? "flex-1 items-start" : "pb-8 last:pb-0")}>
                        <div className={cn("flex", direction === "horizontal" ? "flex-col items-center flex-1" : "items-start gap-3")}>
                            <div className="flex items-center gap-2 w-full">
                                {direction === "vertical" && (
                                    <div className="flex flex-col items-center">
                                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all flex-shrink-0",
                                            status === "finished" ? "bg-sky-600 border-sky-600 text-white" :
                                            status === "active" ? "border-sky-600 text-sky-600 bg-transparent" :
                                            "border-[var(--omni-border-default)] text-[var(--omni-text-muted)] bg-transparent"
                                        )}>
                                            {status === "finished" ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg> : i + 1}
                                        </div>
                                        {!isLast && <div className={cn("w-0.5 flex-1 min-h-[24px] mt-1", status === "finished" ? "bg-sky-600" : "bg-[var(--omni-border-default)]")} />}
                                    </div>
                                )}
                                {direction === "horizontal" && (
                                    <div className="flex items-center w-full">
                                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all flex-shrink-0",
                                            status === "finished" ? "bg-sky-600 border-sky-600 text-white" :
                                            status === "active" ? "border-sky-600 text-sky-600 bg-transparent" :
                                            "border-[var(--omni-border-default)] text-[var(--omni-text-muted)] bg-transparent"
                                        )}>
                                            {status === "finished" ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg> : i + 1}
                                        </div>
                                        {!isLast && <div className={cn("flex-1 h-0.5 mx-2", i < current ? "bg-sky-600" : "bg-[var(--omni-border-default)]")} />}
                                    </div>
                                )}
                            </div>
                            <div className={direction === "horizontal" ? "mt-2 text-center" : ""}>
                                <p className={cn("text-sm font-semibold", status === "active" ? "text-[var(--omni-text-primary)]" : status === "finished" ? "text-[var(--omni-text-secondary)]" : "text-[var(--omni-text-muted)]")}>{item.title}</p>
                                {item.description && <p className="text-xs text-[var(--omni-text-muted)] mt-0.5">{item.description}</p>}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
export { Steps };
