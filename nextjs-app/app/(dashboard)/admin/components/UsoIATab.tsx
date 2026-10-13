"use client";
import { Save, Plus, Trash2, Edit2, CheckCircle2, XCircle, AlertTriangle, Eye, Activity, Database, Users, Settings, Lock, FileText, Smartphone, Image as ImageIcon, Link2, Share2, Upload, Play, Pause, X, Megaphone, Download, Camera, ExternalLink, Cpu } from 'lucide-react';

import { OmniLoader } from "@/components/OmniLoader";
import { LottieIcon } from "@/components/LottieIcon";
import { getSupabase } from "@/lib/supabase";
import { Workspace } from "../lib/admin-types";
import { ENGINE_OPTIONS, SEGMENT_OPTIONS, FEED_CATEGORIES } from "../lib/admin-constants";

import React, { useState, useEffect } from "react";
export function UsoIATab() {
  const [usage, setUsage] = useState<any[] /* eslint-disable-line @typescript-eslint/no-explicit-any */>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadUsage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  async function loadUsage() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ia-usage?days=${days}`);
      if (res.ok) {
        const data = await res.json();
        setUsage(data.usage || []);
      }
    } catch (err) {
      /* client-side */ console.error("Erro ao carregar uso de IA:", err);
    } finally {
      setLoading(false);
    }
  }

  const motores: [string, string][] = [["red", "OmniRed"], ["blue", "OmniBlue"], ["green", "OmniGreen"], ["yellow", "OmniYellow"], ["orange", "OmniOrange"]];

  return (
    <section className="omni-cartao" aria-labelledby="uso-ia-titulo">
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h3 id="uso-ia-titulo" style={{ font: "800 18px/24px var(--font-sans)", color: "var(--tinta)", display: "flex", alignItems: "center", gap: 8 }}><Cpu size={20} aria-hidden /> Uso de IA por escola</h3>
          <p className="omni-apoio" style={{ marginTop: 4 }}>Chamadas por motor de IA. Base para o controle de créditos.</p>
        </div>
        <label className="omni-campo" style={{ minWidth: 200 }}>
          <span className="omni-campo__rotulo">Período</span>
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="omni-entrada"
          >
            <option value={7}>Últimos 7 dias</option>
            <option value={30}>Últimos 30 dias</option>
            <option value={90}>Últimos 90 dias</option>
          </select>
        </label>
      </div>

      {loading ? (
        <p className="omni-apoio" role="status" style={{ display: "flex", alignItems: "center", gap: 8, padding: "24px 0" }}>
          <OmniLoader size={20} /> Carregando uso de IA…
        </p>
      ) : usage.length === 0 ? (
        <p className="omni-apoio" style={{ textAlign: "center", padding: "24px 0" }}>
          Ainda não há registros de uso de IA neste período.
        </p>
      ) : (
        <div className="omni-tabela-caixa">
          <table className="omni-tabela">
            <thead>
              <tr>
                <th scope="col">Escola</th>
                {motores.map(([k, nome]) => <th key={k} scope="col" className="num">{nome}</th>)}
                <th scope="col" className="num">Total</th>
                <th scope="col" className="num">Créditos</th>
                <th scope="col" className="num">Custo estimado</th>
                <th scope="col">Plano</th>
                <th scope="col" className="num">Limite</th>
              </tr>
            </thead>
            <tbody>
              {usage.map((u) => (
                <tr key={u.workspace_id}>
                  <td className="omni-tabela__nome">{u.workspace_name}</td>
                  <td className="num">{u.red || 0}</td>
                  <td className="num">{u.blue || 0}</td>
                  <td className="num">{u.green || 0}</td>
                  <td className="num">{u.yellow || 0}</td>
                  <td className="num">{u.orange || 0}</td>
                  <td className="num" style={{ fontWeight: 700 }}>{u.total_calls || 0}</td>
                  <td className="num" style={{ fontWeight: 700, color: "var(--acao)" }}>{u.credits_used?.toFixed(1) || "0.0"}</td>
                  <td className="num">{u.custo_usd ? `US$ ${Number(u.custo_usd).toFixed(4)}` : "—"}</td>
                  <td>
                    <span className={`omni-estado ${u.plan === "robusto" ? "omni-estado--sucesso" : "omni-estado--neutro"}`}>
                      {u.plan === "robusto" ? "Robusto" : "Básico"}
                    </span>
                  </td>
                  <td className="num">{u.credits_limit || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {usage.length > 0 && (
        <div className="omni-apoio" style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 4 }}>
          <p>Créditos usados: soma das unidades de cada chamada (1 por padrão; o OmniGreen pode pesar mais).</p>
          <p>Custo estimado: tokens (pedaços de texto que a IA lê e escreve) de cada chamada vezes o preço do modelo, pela mesma tabela do OmniProf. Conta só as chamadas desde 10/10/2026.</p>
          <p>No futuro, cada plano terá um limite. Ao chegar nele, a escola passa para um plano maior.</p>
        </div>
      )}
    </section>
  );
}
