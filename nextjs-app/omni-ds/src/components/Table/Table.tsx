import { forwardRef, type HTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

/**
 * Table — Tabela de dados estilizada.
 *
 * @example
 * ```tsx
 * <Table>
 *   <TableHeader>
 *     <TableRow>
 *       <TableHead>Nome</TableHead>
 *       <TableHead>Status</TableHead>
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>Maria Santos</TableCell>
 *       <TableCell><Badge>Ativo</Badge></TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 * ```
 */

const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
    ({ className, ...props }, ref) => (
        <div className="relative w-full overflow-auto rounded-xl border border-[var(--omni-border-default)]">
            <table
                ref={ref}
                className={cn("w-full caption-bottom text-sm", className)}
                {...props}
            />
        </div>
    )
);
Table.displayName = "Table";

const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
    ({ className, ...props }, ref) => (
        <thead
            ref={ref}
            className={cn(
                "bg-[var(--omni-bg-tertiary)] [&_tr]:border-b [&_tr]:border-[var(--omni-border-default)]",
                className
            )}
            {...props}
        />
    )
);
TableHeader.displayName = "TableHeader";

const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
    ({ className, ...props }, ref) => (
        <tbody
            ref={ref}
            className={cn(
                "bg-[var(--omni-bg-secondary)] [&_tr:last-child]:border-0",
                className
            )}
            {...props}
        />
    )
);
TableBody.displayName = "TableBody";

const TableFooter = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
    ({ className, ...props }, ref) => (
        <tfoot
            ref={ref}
            className={cn(
                "border-t border-[var(--omni-border-default)] bg-[var(--omni-bg-tertiary)] font-medium",
                className
            )}
            {...props}
        />
    )
);
TableFooter.displayName = "TableFooter";

const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
    ({ className, ...props }, ref) => (
        <tr
            ref={ref}
            className={cn(
                "border-b border-[var(--omni-border-default)] transition-colors",
                "hover:bg-[var(--omni-bg-hover)]",
                "data-[state=selected]:bg-sky-50 dark:data-[state=selected]:bg-sky-900/10",
                className
            )}
            {...props}
        />
    )
);
TableRow.displayName = "TableRow";

const TableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
    ({ className, ...props }, ref) => (
        <th
            ref={ref}
            className={cn(
                "h-11 px-4 text-left align-middle font-semibold",
                "text-[var(--omni-text-secondary)] text-xs uppercase tracking-wider",
                "[&:has([role=checkbox])]:pr-0",
                className
            )}
            {...props}
        />
    )
);
TableHead.displayName = "TableHead";

const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
    ({ className, ...props }, ref) => (
        <td
            ref={ref}
            className={cn(
                "px-4 py-3 align-middle text-[var(--omni-text-primary)]",
                "[&:has([role=checkbox])]:pr-0",
                className
            )}
            {...props}
        />
    )
);
TableCell.displayName = "TableCell";

const TableCaption = forwardRef<HTMLTableCaptionElement, HTMLAttributes<HTMLTableCaptionElement>>(
    ({ className, ...props }, ref) => (
        <caption
            ref={ref}
            className={cn("mt-3 text-sm text-[var(--omni-text-muted)]", className)}
            {...props}
        />
    )
);
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption };
