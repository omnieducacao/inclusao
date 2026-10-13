"use client";
import { TOPBAR_NAV_ITEMS } from "../lib/admin-constants";
import { type TopbarCustomization } from "../lib/admin-types";
import { Save, Plus, Trash2, Edit2, CheckCircle2, XCircle, AlertTriangle, Eye, Activity, Database, Users, Settings, Lock, FileText, Smartphone, Image as ImageIcon, Link2, Share2, Upload, Play, Pause, X, Megaphone, Download, Camera, ExternalLink } from 'lucide-react';

import { OmniLoader } from "@/components/OmniLoader";
import { LottieIcon } from "@/components/LottieIcon";
import { getSupabase } from "@/lib/supabase";
import { Workspace } from "../lib/admin-types";
import { ENGINE_OPTIONS, SEGMENT_OPTIONS, FEED_CATEGORIES, COLOR_OPTIONS, DEFAULT_TOPBAR_ICONS } from "../lib/admin-constants";

import React, { useState, useEffect } from "react";
import { Check, ChevronLeft, ChevronRight, PanelTop } from "lucide-react";
export function TopbarTab() {
  const [customs, setCustoms] = useState<TopbarCustomization>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingIcon, setEditingIcon] = useState<string | null>(null);
  const [topbarIcons, setTopbarIcons] = useState<string[]>([]);
  const [itemOrder, setItemOrder] = useState<string[]>(TOPBAR_NAV_ITEMS.map(i => i.key));

  useEffect(() => {
    // Load saved customizations
    fetch("/api/admin/platform-config?key=topbar_customizations")
      .then(r => r.json())
      .then(data => {
        if (data?.value) {
          try {
            const parsed = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
            if (parsed._order) {
              setItemOrder(parsed._order);
              delete parsed._order;
            }
            setCustoms(parsed);
          } catch { /* ignore */ }
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false));

    // Load available topbar icons
    fetch("/api/admin/topbar-icons")
      .then(r => r.json())
      .then(data => {
        if (data?.icons?.length) setTopbarIcons(data.icons);
      })
      .catch(() => { });
  }, []);

  function getVal(key: string, field: "label" | "icon" | "group" | "visible") {
    const item = TOPBAR_NAV_ITEMS.find(i => i.key === key);
    const custom = customs[key];
    if (field === "label") return custom?.label ?? item?.defaultLabel ?? key;
    if (field === "icon") return custom?.icon ?? item?.defaultIcon ?? "";
    if (field === "group") return custom?.group ?? item?.defaultGroup ?? null;
    if (field === "visible") return custom?.visible !== false;
    return "";
  }

  function setVal(key: string, field: string, value: string | boolean | null) {
    setCustoms((prev: any) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    try {
      const payload = { ...customs, _order: itemOrder };
      await fetch("/api/admin/platform-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "topbar_customizations", value: JSON.stringify(payload) }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* silent */ }
    setSaving(false);
  }

  function moveItem(key: string, direction: "up" | "down") {
    setItemOrder(prev => {
      const idx = prev.indexOf(key);
      if (idx < 0) return prev;
      const target = direction === "up" ? idx - 1 : idx + 1;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
    setSaved(false);
  }

  if (loading) {
    return (
      <p className="omni-apoio" role="status" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "48px 0" }}>
        <OmniLoader size={20} /> Carregando…
      </p>
    );
  }

  // Cabeçalhos de menu são itens cuja CHAVE é usada como grupo por outros itens
  const AVAILABLE_GROUPS = [
    { value: "", label: "Item solto (fora de menu)" },
    { value: "paee", label: "Dentro do menu PAEE" },
    { value: "avaliacoes", label: "Dentro do menu Avaliações" },
    { value: "professor", label: "Dentro do menu Professor" },
    { value: "config", label: "Dentro do menu Configurações" },
  ];

  // Dynamically determine which items are group headers based on current assignments
  const groupHeaderKeys = new Set<string>();
  TOPBAR_NAV_ITEMS.forEach(item => {
    const g = getVal(item.key, "group") as string | null;
    if (g) groupHeaderKeys.add(g);
  });
  const groupHeaders = TOPBAR_NAV_ITEMS.filter(i => groupHeaderKeys.has(i.key));

  return (
    <section className="omni-cartao" aria-labelledby="topbar-titulo" style={{ gap: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h3 id="topbar-titulo" style={{ font: "800 18px/24px var(--font-sans)", color: "var(--tinta)", display: "flex", alignItems: "center", gap: 8 }}>
            <PanelTop size={20} aria-hidden /> Barra do topo
          </h3>
          <p className="omni-apoio" style={{ marginTop: 4 }}>
            Mude nomes, ícones e menus dos itens da barra de navegação do topo.
            PAEE: Plano de Atendimento Educacional Especializado.
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="omni-btn omni-btn--primario"
        >
          {saving ? <OmniLoader size={18} /> : saved ? <Check size={18} aria-hidden /> : <Save size={18} aria-hidden />}
          {saving ? "Salvando…" : saved ? "Salvo" : "Salvar barra do topo"}
        </button>
      </div>
      <span role="status" className="sr-only">{saved ? "Barra do topo salva." : ""}</span>

      {/* Itens */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {TOPBAR_NAV_ITEMS.map((item) => {
          const isGroupHeader = groupHeaderKeys.has(item.key);
          const currentGroup = getVal(item.key, "group") as string | null;
          const isGroupChild = !!currentGroup && !isGroupHeader;
          const currentIcon = getVal(item.key, "icon") as string;
          const nomeItem = (getVal(item.key, "label") as string) || item.defaultLabel;

          return (
            <div
              key={item.key}
              className="omni-cartao omni-cartao--plano"
              style={{ padding: 16, gap: 8, ...(isGroupChild ? { marginLeft: 32, background: "var(--superficie)", border: "1px dashed var(--borda-forte)" } : {}) }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
                {/* Ícone */}
                <button
                  type="button"
                  onClick={() => setEditingIcon(editingIcon === item.key ? null : item.key)}
                  aria-expanded={editingIcon === item.key}
                  aria-label={`Trocar ícone de ${nomeItem}`}
                  style={{ flex: "none", width: 56, height: 56, borderRadius: "var(--o-radius-sm)", background: "var(--superficie)", border: "1px solid var(--borda)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                  title="Trocar ícone"
                >
                  <LottieIcon animation={currentIcon} size={36} />
                </button>

                {/* Nome + menu */}
                <div style={{ flex: "1 1 220px", minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div>
                    {groupHeaderKeys.has(item.key) && (
                      <span className="omni-estado omni-estado--info">Abre um menu</span>
                    )}
                    {!groupHeaderKeys.has(item.key) && (
                      <select
                        value={(getVal(item.key, "group") as string | null) || ""}
                        onChange={(e) => setVal(item.key, "group", e.target.value || null)}
                        aria-label={`Onde fica ${nomeItem}`}
                        className="omni-entrada"
                        style={{ minHeight: 32, padding: "4px 36px 4px 10px", fontSize: 13, width: "auto" }}
                      >
                        {AVAILABLE_GROUPS.map(g => (
                          <option key={g.value} value={g.value}>{g.label}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <input
                    type="text"
                    value={getVal(item.key, "label") as string}
                    onChange={(e) => setVal(item.key, "label", e.target.value)}
                    aria-label={`Nome do item (padrão: ${item.defaultLabel})`}
                    className="omni-entrada"
                    style={{ fontWeight: 600 }}
                    placeholder={item.defaultLabel}
                  />
                </div>

                {/* Visível */}
                <label className="omni-chip" style={{ flex: "none" }}>
                  <input
                    type="checkbox"
                    checked={getVal(item.key, "visible") as boolean}
                    onChange={(e) => setVal(item.key, "visible", e.target.checked)}
                  />
                  <Check className="omni-chip__marca" aria-hidden />
                  Aparece na barra
                </label>
              </div>

              {/* Cor da pílula */}
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }} role="group" aria-label={`Cor de destaque de ${nomeItem}`}>
                <span className="omni-apoio" style={{ fontSize: 12 }}>Cor de destaque:</span>
                <button
                  type="button"
                  onClick={() => setVal(item.key, "pillColor", null)}
                  aria-pressed={!customs[item.key]?.pillColor}
                  style={{
                    width: 24, height: 24, borderRadius: "var(--o-radius-xs)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                    background: "var(--superficie)", color: "var(--tinta-2)",
                    border: !customs[item.key]?.pillColor ? "2px solid var(--tinta)" : "1px solid var(--borda-forte)",
                  }}
                  title="Padrão"
                  aria-label="Padrão"
                ><X size={12} aria-hidden /></button>
                {COLOR_OPTIONS.slice(0, 10).map(c => (
                  <button
                    type="button"
                    key={c.key}
                    onClick={() => setVal(item.key, "pillColor", c.key)}
                    aria-pressed={customs[item.key]?.pillColor === c.key}
                    aria-label={c.label}
                    style={{
                      width: 24, height: 24, borderRadius: "var(--o-radius-xs)", cursor: "pointer", backgroundColor: c.hex,
                      border: customs[item.key]?.pillColor === c.key ? "2px solid var(--tinta)" : "1px solid var(--borda)",
                    }}
                    title={c.label}
                  />
                ))}
              </div>

              {editingIcon === item.key && (
                <div style={{ marginTop: 4, paddingTop: 12, borderTop: "1px solid var(--borda)", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className="omni-campo__rotulo">Escolher ícone</div>
                  {(topbarIcons.length > 0 || DEFAULT_TOPBAR_ICONS.length > 0) ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div className="omni-rotulo">Ícones simples</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))", gap: 8 }}>
                        {DEFAULT_TOPBAR_ICONS.map((icon) => (
                          <button
                            type="button"
                            key={icon}
                            onClick={() => { setVal(item.key, "icon", icon); setEditingIcon(null); }}
                            aria-pressed={currentIcon === icon}
                            style={{
                              display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: 8, borderRadius: "var(--o-radius-sm)", cursor: "pointer",
                              border: currentIcon === icon ? "2px solid var(--acao)" : "1px solid var(--borda)",
                              background: currentIcon === icon ? "var(--acao-suave)" : "var(--superficie)",
                            }}
                          >
                            <LottieIcon animation={icon} size={36} />
                            <span style={{ fontSize: 10, lineHeight: "12px", color: "var(--tinta-2)", width: "100%", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {icon.replace(/_simples$/, "").replace(/_/g, " ")}
                            </span>
                          </button>
                        ))}
                      </div>
                      {topbarIcons.length > 0 && (
                        <>
                          <div className="omni-rotulo">Ícones animados</div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))", gap: 8 }}>
                            {topbarIcons.map((icon) => (
                              <button
                                type="button"
                                key={icon}
                                onClick={() => { setVal(item.key, "icon", icon); setEditingIcon(null); }}
                                aria-pressed={currentIcon === icon}
                                style={{
                              display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: 8, borderRadius: "var(--o-radius-sm)", cursor: "pointer",
                              border: currentIcon === icon ? "2px solid var(--acao)" : "1px solid var(--borda)",
                              background: currentIcon === icon ? "var(--acao-suave)" : "var(--superficie)",
                            }}
                              >
                                <LottieIcon animation={icon} size={36} />
                                <span style={{ fontSize: 10, lineHeight: "12px", color: "var(--tinta-2)", width: "100%", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {icon.replace(/^topbar\//, "").replace(/wired-gradient-\d+-/, "").replace(/-hover.*/, "").replace(/-/g, " ")}
                                </span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="omni-apoio" style={{ fontSize: 13 }}>Carregando ícones…</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Prévia com ordem */}
      <div className="omni-cartao omni-cartao--plano" style={{ padding: 16, gap: 12 }}>
        <div className="omni-rotulo">Prévia da barra do topo (use as setas para mudar a ordem)</div>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
          {itemOrder
            .map(key => TOPBAR_NAV_ITEMS.find(i => i.key === key))
            .filter((item): item is typeof TOPBAR_NAV_ITEMS[0] => !!item)
            .filter(item => {
              const isGroupChild = item.defaultGroup && !groupHeaders.some(g => g.key === item.key);
              if (isGroupChild) return false;
              return getVal(item.key, "visible");
            })
            .map((item, idx, arr) => (
              <div
                key={item.key}
                style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 6px", borderRadius: "var(--o-radius-sm)", background: "var(--superficie)", border: "1px solid var(--borda)", font: "600 13px/18px var(--font-sans)", color: "var(--tinta-2)" }}
              >
                <button
                  type="button"
                  onClick={() => moveItem(item.key, "up")}
                  disabled={idx === 0}
                  className="omni-btn omni-btn--discreto"
                  style={{ minHeight: 28, width: 28, padding: 0 }}
                  aria-label={`Mover ${getVal(item.key, "label") as string} para a esquerda`}
                  title="Mover para a esquerda"
                ><ChevronLeft size={16} aria-hidden /></button>
                <LottieIcon animation={getVal(item.key, "icon") as string} size={18} />
                <span style={{ margin: "0 2px" }}>{getVal(item.key, "label") as string}</span>
                <button
                  type="button"
                  onClick={() => moveItem(item.key, "down")}
                  disabled={idx === arr.length - 1}
                  className="omni-btn omni-btn--discreto"
                  style={{ minHeight: 28, width: 28, padding: 0 }}
                  aria-label={`Mover ${getVal(item.key, "label") as string} para a direita`}
                  title="Mover para a direita"
                ><ChevronRight size={16} aria-hidden /></button>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
