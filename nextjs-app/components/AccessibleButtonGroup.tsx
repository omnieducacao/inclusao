"use client";

import React, { useRef, useCallback, type KeyboardEvent, type CSSProperties, type ReactNode } from "react";

/**
 * AccessibleButtonGroup  —  roving-tabindex button group (WCAG 2.1 AA)
 *
 * Implements the WAI-ARIA radiogroup pattern:
 * - Arrow keys move focus between options
 * - Home/End jump to first/last option
 * - Tab moves focus in/out of the group (only the active/selected item is tabbable)
 * - Each option has role="radio" with aria-checked
 * - The container has role="radiogroup" with an accessible label
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/radio/
 */

export type ButtonGroupOption<T extends string | number = string> = {
    value: T;
    label: ReactNode;
    disabled?: boolean;
};

type Props<T extends string | number = string> = {
    /** Accessible label for screen readers */
    groupLabel: string;
    options: ButtonGroupOption<T>[];
    selected: T | null;
    onChange: (value: T) => void;
    /** If true, options cannot be changed (post-analysis lock) */
    readOnly?: boolean;
    /** Style applied to each button */
    buttonStyle?: (option: ButtonGroupOption<T>, isSelected: boolean) => CSSProperties;
    /** Style applied to the container */
    containerStyle?: CSSProperties;
    /** CSS class for the container */
    className?: string;
    /** Orientation affects which arrow keys are used (default: horizontal) */
    orientation?: "horizontal" | "vertical";
};

export function AccessibleButtonGroup<T extends string | number = string>({
    groupLabel,
    options,
    selected,
    onChange,
    readOnly = false,
    buttonStyle,
    containerStyle,
    className,
    orientation = "horizontal",
}: Props<T>) {
    const containerRef = useRef<HTMLDivElement>(null);

    const moveFocus = useCallback((currentIndex: number, direction: 1 | -1) => {
        const enabledOptions = options.filter(o => !o.disabled);
        if (enabledOptions.length === 0) return;

        const currentEnabledIdx = enabledOptions.findIndex(o => o.value === options[currentIndex]?.value);
        let nextIdx = currentEnabledIdx + direction;
        if (nextIdx < 0) nextIdx = enabledOptions.length - 1;
        if (nextIdx >= enabledOptions.length) nextIdx = 0;

        // Find the DOM button for this enabled option
        const buttons = containerRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
        if (buttons) {
            const targetValue = String(enabledOptions[nextIdx].value);
            for (const btn of buttons) {
                if (btn.dataset.value === targetValue) {
                    btn.focus();
                    break;
                }
            }
        }
    }, [options]);

    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLButtonElement>, index: number) => {
        const prevKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
        const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";

        switch (e.key) {
            case nextKey:
                e.preventDefault();
                moveFocus(index, 1);
                break;
            case prevKey:
                e.preventDefault();
                moveFocus(index, -1);
                break;
            case "Home":
                e.preventDefault();
                moveFocus(0, -1); // wraps to first
                {
                    const buttons = containerRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]:not([disabled])');
                    buttons?.[0]?.focus();
                }
                break;
            case "End":
                e.preventDefault();
                {
                    const buttons = containerRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]:not([disabled])');
                    if (buttons && buttons.length > 0) buttons[buttons.length - 1].focus();
                }
                break;
            case " ":
            case "Enter":
                e.preventDefault();
                if (!readOnly && !options[index].disabled) {
                    onChange(options[index].value);
                }
                break;
        }
    }, [moveFocus, onChange, options, orientation, readOnly]);

    return (
        <div
            ref={containerRef}
            role="radiogroup"
            aria-label={groupLabel}
            aria-orientation={orientation}
            style={containerStyle}
            className={className}
        >
            {options.map((opt, i) => {
                const isSelected = selected === opt.value;
                // Only the selected item (or first if none selected) is tabbable
                const isTabTarget = isSelected || (selected == null && i === 0);

                return (
                    <button
                        key={String(opt.value)}
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={typeof opt.label === "string" ? opt.label : undefined}
                        data-value={String(opt.value)}
                        disabled={opt.disabled}
                        tabIndex={isTabTarget ? 0 : -1}
                        onClick={() => {
                            if (!readOnly && !opt.disabled) onChange(opt.value);
                        }}
                        onKeyDown={(e) => handleKeyDown(e, i)}
                        style={buttonStyle?.(opt, isSelected)}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}
