"use client";

import { Shield, Cpu, Info } from "lucide-react";
import { RestartTourButton } from "./GuidedTour";

const ENGINES = [
    { name: "OmniRed", color: "#D94F4F", desc: "Raciocínio Profundo" },
    { name: "OmniBlue", color: "#3B82F6", desc: "Long Context" },
    { name: "OmniGreen", color: "#10B981", desc: "Precisão Pedagógica" },
    { name: "OmniYellow", color: "#EAB308", desc: "Velocidade & Visão" },
    { name: "OmniOrange", color: "#F97316", desc: "Versatilidade" },
];

export function SecurityAndAIPanel() {
    return (
        <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Shield size={20} className="text-[#2B6B8A]" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                        Segurança & Inteligência Artificial
                    </h2>
                </div>
                <RestartTourButton />
            </div>

            <p className="text-xs text-slate-500 flex items-start gap-2 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <span>
                    O OmniProf utiliza múltiplos motores de inteligência artificial governados pela tecnologia proprietária da Omni Educação.
                    <strong className="block mt-1">Atenção: A I.A. é um assistente, não um substituto. Revise sempre os planos de aula e avaliações geradas.</strong>
                </span>
            </p>

            <div className="mt-3">
                <div className="text-[11px] font-semibold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu size={14} /> Motores Ativos (OmniMatrix)
                </div>
                <div className="flex flex-wrap gap-2">
                    {ENGINES.map((eng, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm"
                        >
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: eng.color }} />
                            <div>
                                <span className="text-[12px] font-bold text-slate-700 block leading-tight">{eng.name}</span>
                                <span className="text-[10px] text-slate-400 block leading-none">{eng.desc}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
