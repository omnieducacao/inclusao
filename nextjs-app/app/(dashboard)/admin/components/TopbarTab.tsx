"use client";
import { TOPBAR_NAV_ITEMS } from "../lib/admin-constants";
import { type TopbarCustomization } from "../lib/admin-types";
import { Save, Plus, Trash2, Edit2, CheckCircle2, XCircle, AlertTriangle, Eye, Activity, Database, Users, Settings, Lock, FileText, Smartphone, Image as ImageIcon, Link2, Share2, Upload, Loader2, Play, Pause, X, Megaphone, Download, Camera, ExternalLink } from 'lucide-react';

import { OmniLoader } from "@/components/OmniLoader";
import { LottieIcon } from "@/components/LottieIcon";
import { getSupabase } from "@/lib/supabase";
import { Workspace } from "../lib/admin-types";
import { ENGINE_OPTIONS, SEGMENT_OPTIONS, FEED_CATEGORIES, COLOR_OPTIONS, DEFAULT_TOPBAR_ICONS } from "../lib/admin-constants";

import React, { useState, useEffect } from "react";
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
    return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-400" size={28} /></div>;
  }

  // Dropdown group headers are items whose KEY matches a group name used by other items
  const AVAILABLE_GROUPS = [
    { value: "", label: "Item direto (sem dropdown)" },
    { value: "paee", label: "Dentro de PAEE ▼" },
    { value: "avaliacoes", label: "Dentro de Avaliações ▼" },
    { value: "professor", label: "Dentro de Professor ▼" },
    { value: "config", label: "Dentro de Config ▼" },
  ];

  // Dynamically determine which items are group headers based on current assignments
  const groupHeaderKeys = new Set<string>();
  TOPBAR_NAV_ITEMS.forEach(item => {
    const g = getVal(item.key, "group") as string | null;
    if (g) groupHeaderKeys.add(g);
  });
  const groupHeaders = TOPBAR_NAV_ITEMS.filter(i => groupHeaderKeys.has(i.key));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">🧭 Personalizar Topbar</h2>
          <p className="text-sm text-slate-500 mt-1">Altere nomes, ícones e agrupamentos dos itens da barra de navegação superior.</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          {saving ? "Salvando..." : saved ? "✓ Salvo" : "Salvar Topbar"}
        </button>
      </div>

      {/* Nav items list */}
      <div className="space-y-3">
        {TOPBAR_NAV_ITEMS.map((item) => {
          const isGroupHeader = groupHeaderKeys.has(item.key);
          const currentGroup = getVal(item.key, "group") as string | null;
          const isGroupChild = !!currentGroup && !isGroupHeader;
          const currentIcon = getVal(item.key, "icon") as string;

          return (
            <div
              key={item.key}
              className={`bg-white border rounded-xl p-4 ${isGroupChild ? "ml-8 border-dashed border-slate-200" : "border-slate-200"}`}
            >
              <div className="flex items-center gap-4">
                {/* Icon preview */}
                <button
                  onClick={() => setEditingIcon(editingIcon === item.key ? null : item.key)}
                  className="shrink-0 w-14 h-14 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors"
                  title="Trocar ícone"
                >
                  <LottieIcon animation={currentIcon} size={36} />
                </button>

                {/* Label + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {groupHeaderKeys.has(item.key) && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600 uppercase tracking-wider">Dropdown</span>
                    )}
                    {!groupHeaderKeys.has(item.key) && (
                      <select
                        value={(getVal(item.key, "group") as string | null) || ""}
                        onChange={(e) => setVal(item.key, "group", e.target.value || null)}
                        className="text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200 bg-white text-slate-600 cursor-pointer"
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
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 outline-none"
                    placeholder={item.defaultLabel}
                  />
                </div>

                {/* Visibility toggle */}
                <label className="flex items-center gap-2 shrink-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={getVal(item.key, "visible") as boolean}
                    onChange={(e) => setVal(item.key, "visible", e.target.checked)}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                  <span className="text-xs text-slate-500">Visível</span>
                </label>
              </div>

              {/* Pill color picker */}
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-semibold text-slate-400">Cor da pílula:</span>
                <button
                  onClick={() => setVal(item.key, "pillColor", null)}
                  className={`w-5 h-5 rounded border-2 text-[8px] flex items-center justify-center cursor-pointer ${!customs[item.key]?.pillColor
                    ? "border-blue-500 bg-slate-100"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300"
                    }`}
                  title="Padrão"
                >✕</button>
                {COLOR_OPTIONS.slice(0, 10).map(c => (
                  <button
                    key={c.key}
                    onClick={() => setVal(item.key, "pillColor", c.key)}
                    className={`w-5 h-5 rounded border-2 cursor-pointer transition-all ${customs[item.key]?.pillColor === c.key
                      ? "border-blue-500 scale-110 shadow"
                      : "border-transparent hover:border-slate-300"
                      }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.label}
                  />
                ))}
              </div>

              {editingIcon === item.key && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="text-xs font-semibold text-slate-500 mb-2">Escolher ícone:</div>
                  {(topbarIcons.length > 0 || DEFAULT_TOPBAR_ICONS.length > 0) ? (
                    <div>
                      {/* Default _simples icons */}
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Ícones padrão</div>
                      <div className="grid grid-cols-5 sm:grid-cols-9 gap-2 mb-3">
                        {DEFAULT_TOPBAR_ICONS.map((icon) => (
                          <button
                            key={icon}
                            onClick={() => { setVal(item.key, "icon", icon); setEditingIcon(null); }}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all cursor-pointer ${currentIcon === icon
                              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-400/30"
                              : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
                              }`}
                          >
                            <LottieIcon animation={icon} size={36} />
                            <span className="text-[7px] text-slate-500 truncate w-full text-center">
                              {icon.replace(/_simples$/, "").replace(/_/g, " ")}
                            </span>
                          </button>
                        ))}
                      </div>
                      {/* Topbar animated icons */}
                      {topbarIcons.length > 0 && (
                        <>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Ícones animados</div>
                          <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
                            {topbarIcons.map((icon) => (
                              <button
                                key={icon}
                                onClick={() => { setVal(item.key, "icon", icon); setEditingIcon(null); }}
                                className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all cursor-pointer ${currentIcon === icon
                                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-400/30"
                                  : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
                                  }`}
                              >
                                <LottieIcon animation={icon} size={36} />
                                <span className="text-[7px] text-slate-500 truncate w-full text-center">
                                  {icon.replace(/^topbar\//, "").replace(/wired-gradient-\d+-/, "").replace(/-hover.*/, "").replace(/-/g, " ")}
                                </span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Carregando ícones...</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Preview with reordering */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Pré-visualização da Topbar (arraste para reordenar)</div>
        <div className="flex items-center gap-1 flex-wrap">
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
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-white border border-slate-200 group/preview"
              >
                <button
                  onClick={() => moveItem(item.key, "up")}
                  disabled={idx === 0}
                  className="text-slate-300 hover:text-slate-600 disabled:opacity-30 text-[10px] cursor-pointer"
                  title="Mover para esquerda"
                >◀</button>
                <LottieIcon animation={getVal(item.key, "icon") as string} size={18} />
                <span className="mx-0.5">{getVal(item.key, "label") as string}</span>
                <button
                  onClick={() => moveItem(item.key, "down")}
                  disabled={idx === arr.length - 1}
                  className="text-slate-300 hover:text-slate-600 disabled:opacity-30 text-[10px] cursor-pointer"
                  title="Mover para direita"
                >▶</button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
