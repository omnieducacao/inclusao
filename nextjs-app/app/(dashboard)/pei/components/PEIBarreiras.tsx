"use client";

import { useEffect } from "react";
import { NIVEIS_SUPORTE } from "@/lib/pei";
import type { PEIData } from "@/lib/pei";

// ─── NivelSuporteRange ──────────────────────────────────────────────────────

export function NivelSuporteRange({
    value,
    max,
    onChange,
    id,
}: {
    value: number;
    max: number;
    onChange: (value: number) => void;
    id: string;
}) {
    const thumbColor = value === 0 ? '#10b981' : value === 1 ? '#eab308' : value === 2 ? '#f97316' : '#ef4444';
    const rangeId = `range-${id.replace(/[^a-zA-Z0-9]/g, '-')}`;

    useEffect(() => {
        const style = document.createElement('style');
        style.id = `style-${rangeId}`;
        style.textContent = `
      #${rangeId}::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: ${thumbColor};
        border: 3px solid white;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        transition: background 0.2s;
      }
      #${rangeId}::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: ${thumbColor};
        border: 3px solid white;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        transition: background 0.2s;
      }
      #${rangeId}::-webkit-slider-runnable-track {
        background: transparent;
        height: 8px;
      }
      #${rangeId}::-moz-range-track {
        background: transparent;
        height: 8px;
      }
    `;
        const existingStyle = document.getElementById(`style-${rangeId}`);
        if (existingStyle) {
            existingStyle.remove();
        }
        document.head.appendChild(style);
        return () => {
            const styleEl = document.getElementById(`style-${rangeId}`);
            if (styleEl) styleEl.remove();
        };
    }, [thumbColor, rangeId]);

    let barColor = '#10b981';
    if (value === 1) barColor = '#eab308';
    if (value === 2) barColor = '#f97316';
    if (value === 3) barColor = '#ef4444';

    return (
        <div className="relative">
            <div className="absolute w-full h-2 rounded-lg pointer-events-none bg-slate-200" />
            <div
                className="absolute w-full h-2 rounded-lg pointer-events-none transition-all duration-200"
                style={{ background: barColor }}
            />
            <input
                type="range"
                min="0"
                max={max}
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="relative w-full h-2 rounded-lg appearance-none cursor-pointer bg-transparent"
                style={{ WebkitAppearance: 'none', appearance: 'none' }}
                id={rangeId}
            />
        </div>
    );
}

// ─── BarreirasDominio ───────────────────────────────────────────────────────

export function BarreirasDominio({
    dominio,
    opcoes,
    peiData,
    updateField,
}: {
    dominio: string;
    opcoes: string[];
    peiData: PEIData;
    updateField: (k: keyof PEIData, v: unknown) => void;
}) {
    const barreiras = peiData.barreiras_selecionadas || {};
    const selecionadas = barreiras[dominio] || [];
    const niveis = peiData.niveis_suporte || {};
    const obs = peiData.observacoes_barreiras || {};

    return (
        <div className={`p-4 rounded-lg border-2 ${selecionadas.length > 0 ? "border-emerald-300 bg-emerald-50/20" : "border-slate-200 bg-white"} transition-all`}>
            <h5 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <strong>{dominio}</strong>
                {selecionadas.length > 0 && (
                    <span className="text-xs font-normal text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {selecionadas.length} selecionada{selecionadas.length > 1 ? "s" : ""}
                    </span>
                )}
            </h5>

            <div className="space-y-2 mb-4">
                {opcoes.map((b) => {
                    const estaSelecionada = selecionadas.includes(b);
                    return (
                        <label key={b} className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all ${estaSelecionada ? "bg-emerald-50 border-2 border-emerald-300 shadow-sm" : "hover:bg-slate-50 border-2 border-transparent"}`}>
                            <input
                                type="checkbox"
                                checked={estaSelecionada}
                                onChange={(e) => {
                                    const novas = e.target.checked ? [...selecionadas, b] : selecionadas.filter((item) => item !== b);
                                    const novasBarreiras = { ...barreiras, [dominio]: novas };
                                    updateField("barreiras_selecionadas", novasBarreiras);
                                    if (!e.target.checked) {
                                        const chave = `${dominio}_${b}`;
                                        const novosNiveis = { ...niveis };
                                        delete novosNiveis[chave];
                                        updateField("niveis_suporte", novosNiveis);
                                    }
                                }}
                                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                            />
                            <span className={`text-sm ${estaSelecionada ? "text-emerald-900 font-medium" : "text-slate-700"}`}>{b}</span>
                        </label>
                    );
                })}
            </div>

            {selecionadas.length > 0 && (
                <>
                    <hr className="my-4 border-slate-300" />
                    <h6 className="text-sm font-semibold text-slate-700 mb-2">Nível de apoio por barreira</h6>
                    <p className="text-xs text-slate-500 mb-4">
                        Escala: Autônomo (faz sozinho) → Monitorado → Substancial → Muito Substancial (suporte intenso/contínuo).
                    </p>
                    <p className="text-xs text-slate-400 mb-3">
                        Autônomo: realiza sem mediação | Monitorado: precisa de checagens | Substancial: precisa de mediação frequente | Muito Substancial: precisa de suporte intenso/contínuo
                    </p>
                    <div className="space-y-4">
                        {selecionadas.map((b) => {
                            const chave = `${dominio}_${b}`;
                            const nivelAtual = niveis[chave] || "Monitorado";
                            const nivelIndex = NIVEIS_SUPORTE.indexOf(nivelAtual);
                            return (
                                <div key={b} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                                    <div className="mb-2"><strong className="text-sm text-slate-800">{b}</strong></div>
                                    <div className="space-y-2">
                                        <NivelSuporteRange
                                            value={nivelIndex}
                                            max={NIVEIS_SUPORTE.length - 1}
                                            onChange={(newIndex) => {
                                                const novoNivel = NIVEIS_SUPORTE[newIndex];
                                                updateField("niveis_suporte", { ...niveis, [chave]: novoNivel });
                                            }}
                                            id={chave}
                                        />
                                        <div className="flex justify-between items-center">
                                            <span className={`text-xs font-medium px-2 py-1 rounded ${nivelIndex === 0 ? "text-emerald-700 bg-emerald-100" : nivelIndex === 1 ? "text-yellow-700 bg-yellow-100" : nivelIndex === 2 ? "text-orange-700 bg-orange-100" : "text-red-700 bg-red-100"}`}>
                                                {nivelAtual}
                                            </span>
                                            <div className="flex gap-1 text-[10px] text-slate-500">
                                                {NIVEIS_SUPORTE.map((n, idx) => (
                                                    <span key={n} className={idx === nivelIndex ? "font-bold text-sky-600" : ""}>{n.slice(0, 3)}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-1">
                                            {nivelAtual === "Autônomo" && "Realiza sem mediação"}
                                            {nivelAtual === "Monitorado" && "Precisa de checagens"}
                                            {nivelAtual === "Substancial" && "Precisa de mediação frequente"}
                                            {nivelAtual === "Muito Substancial" && "Precisa de suporte intenso/contínuo"}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            <div className="mt-4">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Observações (opcional)</label>
                <textarea
                    value={obs[dominio] || ""}
                    onChange={(e) => updateField("observacoes_barreiras", { ...obs, [dominio]: e.target.value })}
                    placeholder="Ex.: quando ocorre, gatilhos, o que ajuda, o que piora, estratégias que já funcionam..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
            </div>
        </div>
    );
}
