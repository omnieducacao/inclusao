import { forwardRef, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const cardVariants = cva("transition-all duration-200", {
    variants: {
        variant: {
            default:
                "bg-(--omni-bg-secondary) rounded-(--omni-radius-lg) border border-(--omni-border-default) shadow-(--omni-shadow-sm) hover:shadow-(--omni-shadow-md)",
            premium:
                "bg-(--omni-bg-secondary) rounded-(--omni-radius-lg) border border-(--omni-border-default) shadow-(--omni-shadow-md) hover:shadow-(--omni-shadow-elevated) hover:-translate-y-1 hover:border-(--omni-border-strong)",
            glass:
                "bg-(--omni-glass-bg-strong) backdrop-blur-[24px] backdrop-saturate-[200%] rounded-(--omni-radius-lg) border border-(--omni-border-default) shadow-[var(--omni-shadow-md),var(--omni-shadow-inner)] hover:shadow-[var(--omni-shadow-elevated),var(--omni-shadow-inner)] hover:-translate-y-1",
            interactive:
                "bg-(--omni-surface-1) rounded-(--omni-radius-lg) border border-(--omni-border-default) shadow-[var(--omni-shadow-md),var(--omni-shadow-inner)] hover:shadow-[var(--omni-shadow-lg),var(--omni-shadow-inner)] hover:-translate-y-[4px] cursor-pointer",
            flat:
                "rounded-(--omni-radius-lg) border-none",
        },
        padding: {
            none: "p-0",
            sm: "p-3",
            md: "p-5",
            lg: "p-6",
        },
    },
    defaultVariants: {
        variant: "default",
        padding: "md",
    },
});

export type CardProps = HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof cardVariants>;

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant, padding, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(cardVariants({ variant, padding }), className)}
            {...props}
        />
    )
);

Card.displayName = "Card";

// Sub-components
const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("flex flex-col gap-1.5", className)} {...props} />
    )
);
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn("text-lg font-bold tracking-tight text-(--omni-text-primary)", className)}
            {...props}
        />
    )
);
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p
            ref={ref}
            className={cn("text-sm text-(--omni-text-muted)", className)}
            {...props}
        />
    )
);
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("pt-2", className)} {...props} />
    )
);
CardContent.displayName = "CardContent";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, cardVariants };
