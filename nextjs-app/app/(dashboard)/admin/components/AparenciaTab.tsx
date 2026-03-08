"use client";
import { HOME_MODULES } from "../lib/admin-constants";
import { type CardCustomization } from "../lib/admin-types";
import { COLOR_OPTIONS } from "../lib/admin-constants";
import { Save, Plus, Trash2, Edit2, CheckCircle2, XCircle, AlertTriangle, Eye, Activity, Database, Users, Settings, Lock, FileText, Smartphone, Image as ImageIcon, Link2, Share2, Upload, Loader2, Play, Pause, X, Megaphone, Download, Camera, ExternalLink } from 'lucide-react';

import { OmniLoader } from "@/components/OmniLoader";
import { LottieIcon } from "@/components/LottieIcon";
import { getSupabase } from "@/lib/supabase";
import { Workspace } from "../lib/admin-types";
import { ENGINE_OPTIONS, SEGMENT_OPTIONS, FEED_CATEGORIES } from "../lib/admin-constants";

import React, { useState, useEffect } from "react";
export function AparenciaTab() {
  const [customizations, setCustomizations] = useState<CardCustomization>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [flatIcons, setFlatIcons] = useState<string[]>([]);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [iconSearch, setIconSearch] = useState("");

  // Load saved customizations and available flat icons
  useEffect(() => {
    Promise.all([
      fetch("/api/admin/platform-config?key=card_customizations")
        .then((r) => r.json())
        .then((d) => {
          if (d.value) {
            try {
              // Handle both text (string) and jsonb (already parsed object)
              const parsed = typeof d.value === "string" ? JSON.parse(d.value) : d.value;
              // Migrate old color keys to new DS-aligned keys
              const LEGACY_MAP: Record<string, string> = {
                sky: "omnisfera", blue: "ferramentas", teal: "monitoramento",
                green: "diario", cyan: "hub", violet: "pei", rose: "paee",
                amber: "cursos", slate: "admin", presentation: "pgi",
                table: "ferramentas", test: "gestao", reports: "cursos",
              };
              const migrated: CardCustomization = {};
              for (const [k, v] of Object.entries(parsed as CardCustomization)) {
                migrated[k] = { ...v };
                if (v.color && LEGACY_MAP[v.color]) migrated[k].color = LEGACY_MAP[v.color];
                if (v.heroColor && LEGACY_MAP[v.heroColor]) migrated[k].heroColor = LEGACY_MAP[v.heroColor];
              }
              setCustomizations(migrated);
            } catch { /* ignore parse errors */ }
          }
        })
        .catch(() => { }),
      fetch("/api/admin/flat-icons")
        .then((r) => r.json())
        .then((d) => setFlatIcons(d.icons || []))
        .catch(() => {
          // Fallback: use known icons
          setFlatIcons([]);
        }),
    ]).finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/platform-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "card_customizations",
          value: JSON.stringify(customizations),
        }),
      });
      if (res.ok) {
        alert("✅ Customizações de aparência salvas! Os cards serão atualizados ao recarregar a home.");
      } else {
        alert("Erro ao salvar.");
      }
    } catch {
      alert("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  }

  function updateModule(moduleKey: string, field: "color" | "heroColor" | "icon", value: string) {
    setCustomizations((prev: any) => ({
      ...prev,
      [moduleKey]: {
        ...prev[moduleKey],
        [field]: value,
      },
    }));
  }

  function resetModule(moduleKey: string) {
    setCustomizations((prev: any) => {
      const next = { ...prev };
      delete next[moduleKey];
      return next;
    });
  }

  const filteredIcons = flatIcons.filter((ic) =>
    iconSearch ? ic.toLowerCase().includes(iconSearch.toLowerCase()) : true
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">🎨 Aparência dos Cards da Home</h3>
            <p className="text-slate-600 text-sm mt-1">
              Personalize a cor e o ícone de cada módulo na página inicial.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar alterações
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-3">
            {HOME_MODULES.map((mod: any) => {
              const custom = customizations[mod.key] || {};
              const currentColor = custom.color || mod.defaultColor;
              const currentHeroColor = custom.heroColor || custom.color || mod.defaultColor;
              const currentIcon = custom.icon || mod.defaultIcon;
              const isEditing = editingModule === mod.key;
              const colorInfo = COLOR_OPTIONS.find((c: any) => c.key === currentColor);
              const heroColorInfo = COLOR_OPTIONS.find((c: any) => c.key === currentHeroColor);

              return (
                <div
                  key={mod.key}
                  className={`border rounded-xl p-4 transition-all ${isEditing ? "border-blue-300 bg-blue-50/30" : "border-slate-200 hover:border-slate-300"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Color previews */}
                      <div className="flex gap-1">
                        <div
                          className="w-8 h-8 rounded-lg border border-white shadow"
                          style={{ background: colorInfo?.gradient || colorInfo?.hex || "#4285F4" }}
                          title="Cor do Card"
                        />
                        <div
                          className="w-8 h-8 rounded-lg border border-white shadow"
                          style={{ background: heroColorInfo?.gradient || heroColorInfo?.hex || colorInfo?.gradient || colorInfo?.hex || "#4285F4" }}
                          title="Cor do Hero"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">{mod.title}</h4>
                        <p className="text-xs text-slate-500">
                          Card: {colorInfo?.label || currentColor} · Hero: {heroColorInfo?.label || currentHeroColor} · Ícone: {currentIcon}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingModule(isEditing ? null : mod.key)}
                        className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1"
                      >
                        {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                        {isEditing ? "Fechar" : "Editar"}
                      </button>
                      {custom.color || custom.heroColor || custom.icon ? (
                        <button
                          onClick={() => resetModule(mod.key)}
                          className="px-3 py-1.5 text-sm border border-amber-200 text-amber-600 rounded-lg hover:bg-amber-50"
                        >
                          Resetar
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-4 space-y-4">
                      {/* Home Card Color picker */}
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-2">🏠 Cor do Card (Home)</p>
                        <div className="flex flex-wrap gap-2">
                          {COLOR_OPTIONS.map((color: any) => (
                            <button
                              key={color.key}
                              onClick={() => updateModule(mod.key, "color", color.key)}
                              className={`w-10 h-10 rounded-lg border-2 transition-all flex items-center justify-center ${currentColor === color.key
                                ? "border-blue-500 scale-110 shadow-lg"
                                : "border-transparent hover:border-slate-300"
                                }`}
                              style={{ background: color.gradient || color.hex }}
                              title={color.label}
                            >
                              {currentColor === color.key && (
                                <span className="text-white text-xs font-bold drop-shadow-md">✓</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Hero Color picker */}
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-2">🌟 Cor do Hero (Subpágina)</p>
                        <div className="flex flex-wrap gap-2">
                          {COLOR_OPTIONS.map((color: any) => (
                            <button
                              key={color.key}
                              onClick={() => updateModule(mod.key, "heroColor", color.key)}
                              className={`w-10 h-10 rounded-lg border-2 transition-all flex items-center justify-center ${currentHeroColor === color.key
                                ? "border-blue-500 scale-110 shadow-lg"
                                : "border-transparent hover:border-slate-300"
                                }`}
                              style={{ background: color.gradient || color.hex }}
                              title={color.label}
                            >
                              {currentHeroColor === color.key && (
                                <span className="text-white text-xs font-bold drop-shadow-md">✓</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Icon picker */}
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-2">Ícone Lottie</p>
                        <input
                          type="text"
                          placeholder="Buscar ícone..."
                          value={iconSearch}
                          onChange={(e) => setIconSearch(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm mb-3"
                        />
                        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-[280px] overflow-y-auto p-1">
                          {filteredIcons.map((iconName) => {
                            const isSelected = currentIcon === `flat/${iconName}`;
                            return (
                              <button
                                key={iconName}
                                onClick={() => updateModule(mod.key, "icon", `flat/${iconName}`)}
                                className={`relative aspect-square rounded-lg border-2 p-1.5 transition-all hover:scale-105 flex flex-col items-center justify-center gap-0.5 ${isSelected
                                  ? "border-blue-500 bg-blue-50 shadow-md"
                                  : "border-slate-200 hover:border-slate-300 bg-white"
                                  }`}
                                title={iconName.replace(/wired-flat-\d+-/, "").replace(/-hover.*/, "").replace(/-/g, " ")}
                              >
                                <LottieIcon
                                  animation={`flat/${iconName}`}
                                  size={60}
                                />
                                <span className="text-[9px] text-slate-500 truncate w-full text-center leading-tight mt-1">
                                  {iconName.replace(/wired-flat-\d+-/, "").replace(/-hover.*/, "").replace(/-/g, " ").substring(0, 12)}
                                </span>
                              </button>
                            );
                          })}
                          {filteredIcons.length === 0 && (
                            <p className="col-span-full text-sm text-slate-500 text-center py-4">
                              {flatIcons.length === 0
                                ? "Nenhum ícone flat encontrado. Crie a API /api/admin/flat-icons."
                                : "Nenhum ícone encontrado para a busca."}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
