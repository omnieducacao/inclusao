"use client";
import { HOME_MODULES } from "../lib/admin-constants";
import { type CardCustomization } from "../lib/admin-types";
import { COLOR_OPTIONS } from "../lib/admin-constants";
import { Save, Plus, Trash2, Edit2, CheckCircle2, XCircle, AlertTriangle, Eye, Activity, Database, Users, Settings, Lock, FileText, Smartphone, Image as ImageIcon, Link2, Share2, Upload, Play, Pause, X, Megaphone, Download, Camera, ExternalLink } from 'lucide-react';

import { OmniLoader } from "@/components/OmniLoader";
import { LottieIcon } from "@/components/LottieIcon";
import { getSupabase } from "@/lib/supabase";
import { Workspace } from "../lib/admin-types";
import { ENGINE_OPTIONS, SEGMENT_OPTIONS, FEED_CATEGORIES } from "../lib/admin-constants";

import React, { useState, useEffect } from "react";
import { Check, Palette, RotateCcw } from "lucide-react";
import { MensagemAdmin, type Mensagem } from "./MensagemAdmin";
export function AparenciaTab() {
  const [customizations, setCustomizations] = useState<CardCustomization>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [flatIcons, setFlatIcons] = useState<string[]>([]);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [iconSearch, setIconSearch] = useState("");
  const [mensagem, setMensagem] = useState<Mensagem | null>(null);

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
    setMensagem(null);
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
        setMensagem({ tipo: "sucesso", texto: "Aparência salva. Os cartões mudam quando a página inicial for recarregada." });
      } else {
        setMensagem({ tipo: "erro", texto: "Não foi possível salvar a aparência." });
      }
    } catch { /* expected fallback */
      setMensagem({ tipo: "erro", texto: "Sem conexão com o servidor. Tente de novo." });
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

  const amostra = { width: 32, height: 32, borderRadius: "var(--o-radius-sm)", border: "1px solid var(--borda)" } as const;
  const corBotao = (selecionada: boolean) => ({
    width: 40, height: 40, borderRadius: "var(--o-radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
    border: selecionada ? "3px solid var(--tinta)" : "1px solid var(--borda)",
    outlineOffset: 2,
  } as const);

  return (
    <section className="omni-cartao" aria-labelledby="aparencia-titulo">
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h3 id="aparencia-titulo" style={{ font: "800 18px/24px var(--font-sans)", color: "var(--tinta)", display: "flex", alignItems: "center", gap: 8 }}>
            <Palette size={20} aria-hidden /> Aparência dos cartões da página inicial
          </h3>
          <p className="omni-apoio" style={{ marginTop: 4 }}>
            Escolha a cor e o ícone de cada módulo na página inicial.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="omni-btn omni-btn--primario"
        >
          {saving ? <OmniLoader size={18} /> : <Save size={18} aria-hidden />}
          Salvar alterações
        </button>
      </div>

      <MensagemAdmin mensagem={mensagem} onFechar={() => setMensagem(null)} />

      {loading ? (
        <p className="omni-apoio" role="status" style={{ display: "flex", alignItems: "center", gap: 8, padding: "24px 0" }}>
          <OmniLoader size={20} /> Carregando…
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
                className="omni-cartao omni-cartao--plano"
                style={{ padding: 16, ...(isEditing ? { background: "var(--superficie)", borderColor: "var(--acao)" } : {}) }}
              >
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Amostras de cor */}
                    <div style={{ display: "flex", gap: 4 }}>
                      <div
                        style={{ ...amostra, background: colorInfo?.gradient || colorInfo?.hex || "#4285F4" }}
                        title="Cor do cartão"
                      />
                      <div
                        style={{ ...amostra, background: heroColorInfo?.gradient || heroColorInfo?.hex || colorInfo?.gradient || colorInfo?.hex || "#4285F4" }}
                        title="Cor do topo da página do módulo"
                      />
                    </div>
                    <div>
                      <h4 style={{ font: "700 16px/22px var(--font-sans)", color: "var(--tinta)" }}>{mod.title}</h4>
                      <p className="omni-apoio" style={{ fontSize: 13 }}>
                        Cartão: {colorInfo?.label || currentColor} · Topo: {heroColorInfo?.label || currentHeroColor} · Ícone: {currentIcon}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setEditingModule(isEditing ? null : mod.key)}
                      aria-expanded={isEditing}
                      className="omni-btn omni-btn--secundario omni-btn--pequeno"
                    >
                      {isEditing ? <X size={16} aria-hidden /> : <Edit2 size={16} aria-hidden />}
                      {isEditing ? "Fechar" : "Editar"}
                    </button>
                    {custom.color || custom.heroColor || custom.icon ? (
                      <button
                        type="button"
                        onClick={() => resetModule(mod.key)}
                        className="omni-btn omni-btn--discreto omni-btn--pequeno"
                      >
                        <RotateCcw size={16} aria-hidden /> Voltar ao padrão
                      </button>
                    ) : null}
                  </div>
                </div>

                {isEditing && (
                  <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Cor do cartão */}
                    <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                      <legend className="omni-campo__rotulo" style={{ marginBottom: 8 }}>Cor do cartão na página inicial</legend>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {COLOR_OPTIONS.map((color: any) => (
                          <button
                            type="button"
                            key={color.key}
                            onClick={() => updateModule(mod.key, "color", color.key)}
                            aria-pressed={currentColor === color.key}
                            aria-label={color.label}
                            style={{ ...corBotao(currentColor === color.key), background: color.gradient || color.hex }}
                            title={color.label}
                          >
                            {currentColor === color.key && (
                              <Check size={18} aria-hidden style={{ color: "#fff", filter: "drop-shadow(0 1px 1px rgba(0,0,0,.5))" }} />
                            )}
                          </button>
                        ))}
                      </div>
                    </fieldset>

                    {/* Cor do topo */}
                    <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                      <legend className="omni-campo__rotulo" style={{ marginBottom: 8 }}>Cor do topo da página do módulo</legend>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {COLOR_OPTIONS.map((color: any) => (
                          <button
                            type="button"
                            key={color.key}
                            onClick={() => updateModule(mod.key, "heroColor", color.key)}
                            aria-pressed={currentHeroColor === color.key}
                            aria-label={color.label}
                            style={{ ...corBotao(currentHeroColor === color.key), background: color.gradient || color.hex }}
                            title={color.label}
                          >
                            {currentHeroColor === color.key && (
                              <Check size={18} aria-hidden style={{ color: "#fff", filter: "drop-shadow(0 1px 1px rgba(0,0,0,.5))" }} />
                            )}
                          </button>
                        ))}
                      </div>
                    </fieldset>

                    {/* Ícone */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <label className="omni-campo">
                        <span className="omni-campo__rotulo">Ícone animado</span>
                        <input
                          type="search"
                          placeholder="Buscar ícone"
                          value={iconSearch}
                          onChange={(e) => setIconSearch(e.target.value)}
                          className="omni-entrada"
                        />
                      </label>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))", gap: 8, maxHeight: 280, overflowY: "auto", padding: 4 }}>
                        {filteredIcons.map((iconName) => {
                          const isSelected = currentIcon === `flat/${iconName}`;
                          const nomeIcone = iconName.replace(/wired-flat-\d+-/, "").replace(/-hover.*/, "").replace(/-/g, " ");
                          return (
                            <button
                              type="button"
                              key={iconName}
                              onClick={() => updateModule(mod.key, "icon", `flat/${iconName}`)}
                              aria-pressed={isSelected}
                              style={{
                                position: "relative", aspectRatio: "1 / 1", borderRadius: "var(--o-radius-sm)", padding: 6, cursor: "pointer",
                                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                                border: isSelected ? "2px solid var(--acao)" : "1px solid var(--borda)",
                                background: isSelected ? "var(--acao-suave)" : "var(--superficie)",
                              }}
                              title={nomeIcone}
                            >
                              <LottieIcon
                                animation={`flat/${iconName}`}
                                size={60}
                              />
                              <span style={{ fontSize: 10, lineHeight: "12px", color: "var(--tinta-2)", width: "100%", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 4 }}>
                                {nomeIcone.substring(0, 12)}
                              </span>
                            </button>
                          );
                        })}
                        {filteredIcons.length === 0 && (
                          <p className="omni-apoio" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "16px 0" }}>
                            {flatIcons.length === 0
                              ? "Nenhum ícone disponível no momento."
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
    </section>
  );
}
