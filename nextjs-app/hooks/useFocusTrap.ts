"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * useFocusTrap — traps keyboard focus within a container when active.
 *
 * Features:
 * - Tab / Shift+Tab cycles through focusable elements
 * - Escape key calls onEscape callback
 * - Restores focus to trigger element on deactivation
 * - Auto-focuses first focusable element on activation
 *
 * Usage:
 *   const trapRef = useFocusTrap(isOpen, { onEscape: () => setOpen(false) });
 *   <div ref={trapRef} role="dialog" aria-modal="true"> ... </div>
 */

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(', ');

interface FocusTrapOptions {
    /** Called when Escape is pressed */
    onEscape?: () => void;
    /** Whether to auto-focus the first element (default: true) */
    autoFocus?: boolean;
    /** Whether to restore focus on unmount (default: true) */
    restoreFocus?: boolean;
}

export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
    active: boolean,
    options: FocusTrapOptions = {}
) {
    const { onEscape, autoFocus = true, restoreFocus = true } = options;
    const containerRef = useRef<T>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    // Save the element that had focus before the trap activated
    useEffect(() => {
        if (active) {
            previousFocusRef.current = document.activeElement as HTMLElement;
        }
    }, [active]);

    // Auto-focus first focusable element
    useEffect(() => {
        if (!active || !autoFocus || !containerRef.current) return;

        const timer = requestAnimationFrame(() => {
            if (!containerRef.current) return;
            const focusable = containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
            if (focusable.length > 0) {
                focusable[0].focus();
            } else {
                // If no focusable elements, focus the container itself
                containerRef.current.setAttribute('tabindex', '-1');
                containerRef.current.focus();
            }
        });

        return () => cancelAnimationFrame(timer);
    }, [active, autoFocus]);

    // Restore focus when trap deactivates
    useEffect(() => {
        if (active || !restoreFocus) return;
        return () => {
            if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
                previousFocusRef.current.focus();
                previousFocusRef.current = null;
            }
        };
    }, [active, restoreFocus]);

    // Handle Tab and Escape
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (!active || !containerRef.current) return;

            if (e.key === 'Escape' && onEscape) {
                e.preventDefault();
                e.stopPropagation();
                onEscape();
                return;
            }

            if (e.key !== 'Tab') return;

            const focusable = Array.from(
                containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
            );

            if (focusable.length === 0) {
                e.preventDefault();
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey) {
                // Shift+Tab: if on first element, wrap to last
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                // Tab: if on last element, wrap to first
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        },
        [active, onEscape]
    );

    useEffect(() => {
        if (!active) return;
        document.addEventListener('keydown', handleKeyDown, true);
        return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [active, handleKeyDown]);

    return containerRef;
}
