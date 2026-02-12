"use client";

import { useState, useEffect, useCallback } from "react";
import { TOUR_STEPS } from "@/lib/tour-content";

const STORAGE_KEY = "omnisfera-tour-seen";

/**
 * GuidedTour — 7-step wizard overlay for new users.
 * Shows once per browser unless explicitly restarted.
 */
export function GuidedTour({ onComplete }: { onComplete?: () => void }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const seen = localStorage.getItem(STORAGE_KEY);
        if (!seen) {
            setVisible(true);
        }
    }, []);

    const step = TOUR_STEPS[currentStep];
    const isLast = currentStep === TOUR_STEPS.length - 1;
    const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

    const complete = useCallback(() => {
        localStorage.setItem(STORAGE_KEY, "true");
        setVisible(false);
        onComplete?.();
    }, [onComplete]);

    const next = useCallback(() => {
        if (isLast) {
            complete();
        } else {
            setCurrentStep((prev) => prev + 1);
        }
    }, [isLast, complete]);

    const prev = useCallback(() => {
        setCurrentStep((prev) => Math.max(0, prev - 1));
    }, []);

    const skip = useCallback(() => {
        complete();
    }, [complete]);

    if (!visible) return null;

    return (
        <div
            className="fixed inset-0 z-[9998] flex items-center justify-center"
            style={{ backgroundColor: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(6px)" }}
        >
            <div
                className="bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 p-0 overflow-hidden animate-fade-in"
                style={{ border: "1px solid rgba(226, 232, 240, 0.8)" }}
            >
                {/* Progress bar */}
                <div className="h-1.5 bg-slate-100">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-r-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Content */}
                <div className="px-8 pt-8 pb-6">
                    {/* Step indicator */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <span className="text-3xl">{step.icon}</span>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Passo {currentStep + 1} de {TOUR_STEPS.length}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={skip}
                            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            Pular tour
                        </button>
                    </div>

                    {/* Title & Description */}
                    <h2 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h2>
                    <p className="text-sm text-slate-600 leading-relaxed mb-6">{step.description}</p>

                    {/* Step dots */}
                    <div className="flex items-center justify-center gap-1.5 mb-6">
                        {TOUR_STEPS.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setCurrentStep(i)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentStep
                                        ? "bg-blue-500 w-5"
                                        : i < currentStep
                                            ? "bg-blue-300"
                                            : "bg-slate-200"
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={prev}
                            disabled={currentStep === 0}
                            className={`px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${currentStep === 0
                                    ? "text-slate-300 cursor-not-allowed"
                                    : "text-slate-600 hover:bg-slate-100"
                                }`}
                        >
                            ← Anterior
                        </button>
                        <button
                            type="button"
                            onClick={next}
                            className="px-6 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
                        >
                            {isLast ? "Começar a usar! 🚀" : "Próximo →"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Button to manually restart the guided tour.
 * Can be placed in settings or help sections.
 */
export function RestartTourButton() {
    const [restarted, setRestarted] = useState(false);

    return (
        <button
            type="button"
            onClick={() => {
                localStorage.removeItem(STORAGE_KEY);
                setRestarted(true);
                window.location.reload();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors border border-blue-200"
        >
            <span>🎓</span>
            {restarted ? "Tour reiniciado! Recarregando..." : "Refazer Tour Guiado"}
        </button>
    );
}
