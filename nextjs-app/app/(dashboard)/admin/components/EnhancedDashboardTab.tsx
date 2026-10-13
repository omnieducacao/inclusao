"use client";
import { Save, Plus, Trash2, Edit2, CheckCircle2, XCircle, AlertTriangle, Eye, Activity, Database, Users, Settings, Lock, FileText, Smartphone, Image as ImageIcon, Link2, Share2, Upload, Play, Pause, X, Megaphone, Download, Camera, ExternalLink, BarChart3 } from 'lucide-react';

import { OmniLoader } from "@/components/OmniLoader";
import { LottieIcon } from "@/components/LottieIcon";
import { getSupabase } from "@/lib/supabase";
import { Workspace } from "../lib/admin-types";
import { ENGINE_OPTIONS, SEGMENT_OPTIONS, FEED_CATEGORIES } from "../lib/admin-constants";

import React, { useState, useEffect } from "react";
export function EnhancedDashboardTab() {
  const [data, setData] = useState<any /* eslint-disable-line @typescript-eslint/no-explicit-any */>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="omni-cartao">
        <p className="omni-apoio" role="status" style={{ display: "flex", alignItems: "center", gap: 8, padding: "24px 0" }}>
          <OmniLoader size={20} /> Carregando painel…
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="omni-aviso omni-aviso--erro" role="alert" style={{ maxWidth: "none" }}>
        <XCircle className="omni-aviso__icone" aria-hidden />
        <div><div className="omni-aviso__texto" style={{ color: "var(--tinta)" }}>Não foi possível carregar o painel geral.</div></div>
      </div>
    );
  }

  const { kpis, school_breakdown } = data;

  const numero = { font: "800 30px/36px var(--font-sans)", color: "var(--tinta)", fontVariantNumeric: "tabular-nums" } as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Indicadores */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <div className="omni-cartao" style={{ gap: 4, padding: 20 }}>
          <p className="omni-rotulo">Escolas</p>
          <p style={numero}>{kpis.total_schools}</p>
          <p className="omni-apoio" style={{ fontSize: 13 }}>{kpis.active_schools} ativas, {kpis.inactive_schools} inativas</p>
        </div>
        <div className="omni-cartao" style={{ gap: 4, padding: 20 }}>
          <p className="omni-rotulo">Usuários</p>
          <p style={numero}>{kpis.total_users}</p>
          <p className="omni-apoio" style={{ fontSize: 13 }}>{kpis.active_users} ativos</p>
        </div>
        <div className="omni-cartao" style={{ gap: 4, padding: 20 }}>
          <p className="omni-rotulo">Estudantes</p>
          <p style={numero}>{kpis.total_students}</p>
          <p className="omni-apoio" style={{ fontSize: 13 }}>{kpis.students_with_pei} com PEI (Plano Educacional Individualizado)</p>
        </div>
        <div className="omni-cartao" style={{ gap: 4, padding: 20 }}>
          <p className="omni-rotulo">Ações nos últimos 7 dias</p>
          <p style={numero}>{kpis.recent_events_7d}</p>
          <p className="omni-apoio" style={{ fontSize: 13 }}>uso da plataforma</p>
        </div>
      </div>

      {/* Por escola */}
      <section className="omni-cartao" aria-labelledby="panorama-titulo">
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <h3 id="panorama-titulo" style={{ font: "800 18px/24px var(--font-sans)", color: "var(--tinta)", display: "flex", alignItems: "center", gap: 8 }}><BarChart3 size={20} aria-hidden /> Panorama por escola</h3>
          <button
            type="button"
            onClick={() => window.open("/api/admin/export?type=schools", "_blank")}
            className="omni-btn omni-btn--secundario omni-btn--pequeno"
          >
            <Download size={16} aria-hidden /> Baixar planilha (CSV)
          </button>
        </div>
        <div className="omni-tabela-caixa">
          <table className="omni-tabela">
            <thead>
              <tr>
                <th scope="col">Escola</th>
                <th scope="col">Situação</th>
                <th scope="col" className="num">Usuários</th>
                <th scope="col" className="num">Estudantes</th>
              </tr>
            </thead>
            <tbody>
              {(school_breakdown || []).map((s: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => (
                <tr key={s.id}>
                  <td className="omni-tabela__nome">{s.name}</td>
                  <td>
                    <span className={`omni-estado ${s.active ? "omni-estado--sucesso" : "omni-estado--erro"}`}>
                      {s.active ? "Ativa" : "Inativa"}
                    </span>
                  </td>
                  <td className="num">{s.users}</td>
                  <td className="num">{s.students}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
