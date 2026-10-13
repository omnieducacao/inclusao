"use client";
import { Save, Plus, Trash2, Edit2, CheckCircle2, XCircle, AlertTriangle, Eye, Activity, Database, Users, Settings, Lock, FileText, Smartphone, Image as ImageIcon, Link2, Share2, Upload, Play, Pause, X, Megaphone, Download, Camera, ExternalLink } from 'lucide-react';

import { OmniLoader } from "@/components/OmniLoader";
import { LottieIcon } from "@/components/LottieIcon";
import { getSupabase } from "@/lib/supabase";
import { Workspace } from "../lib/admin-types";
import { ENGINE_OPTIONS, SEGMENT_OPTIONS, FEED_CATEGORIES } from "../lib/admin-constants";

import React, { useState, useEffect } from "react";
import { MensagemAdmin, type Mensagem } from "./MensagemAdmin";
export function TermoTab() {
  const [termsText, setTermsText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensagem, setMensagem] = useState<Mensagem | null>(null);

  useEffect(() => {
    loadTerms();
  }, []);

  async function loadTerms() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/platform-config?key=terms_of_use");
      if (res.ok) {
        const data = await res.json();
        const value = data.value || "";
        if (value) {
          setTermsText(value);
        } else {
          // Valor padrão
          setTermsText(
            "1. Uso profissional: A Omnisfera é uma ferramenta profissional de apoio à inclusão.\n\n" +
            "2. Confidencialidade: É proibido inserir dados pessoais sensíveis de estudantes.\n\n" +
            "3. Responsabilidade: Recomendações da IA devem ser validadas por profissionais.\n\n" +
            "4. Segurança: Credenciais são pessoais e intransferíveis.\n\n" +
            "5. Conformidade: O uso deve seguir políticas e legislação vigente."
          );
        }
      }
    } catch (err) {
      /* client-side */ console.error("Erro ao carregar termos:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMensagem(null);
    try {
      const res = await fetch("/api/admin/platform-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "terms_of_use", value: termsText }),
      });

      if (res.ok) {
        setMensagem({ tipo: "sucesso", texto: "Termo salvo. Quem entrar pela primeira vez verá a nova versão." });
      } else {
        const error = await res.json().catch(() => ({}));
        setMensagem({ tipo: "erro", texto: `Não foi possível salvar o termo. ${error.error || ""}`.trim() });
      }
    } catch (err) {
      /* client-side */ console.error("Erro ao salvar termos:", err);
      setMensagem({ tipo: "erro", texto: "Não foi possível salvar o termo. Tente de novo." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="omni-cartao">
        <p className="omni-apoio" role="status" style={{ display: "flex", alignItems: "center", gap: 8, padding: "24px 0" }}>
          <OmniLoader size={20} /> Carregando termo…
        </p>
      </div>
    );
  }

  return (
    <section className="omni-cartao" aria-labelledby="termo-titulo">
      <h3 id="termo-titulo" style={{ font: "800 18px/24px var(--font-sans)", color: "var(--tinta)", display: "flex", alignItems: "center", gap: 8 }}>
        <FileText size={20} aria-hidden /> Termo de uso e confidencialidade
      </h3>
      <p className="omni-apoio">Este texto aparece no primeiro acesso de cada usuário, depois de entrar.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <label className="omni-campo" style={{ maxWidth: "none" }}>
          <span className="omni-campo__rotulo">Texto do termo</span>
          <textarea
            value={termsText}
            onChange={(e) => setTermsText(e.target.value)}
            rows={14}
            className="omni-entrada"
            style={{ fontFamily: "var(--font-mono)", fontSize: 14 }}
            placeholder="Escreva o texto do termo de uso."
          />
        </label>
        <MensagemAdmin mensagem={mensagem} onFechar={() => setMensagem(null)} />
        <div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="omni-btn omni-btn--primario"
          >
            {saving ? <OmniLoader size={18} /> : <Save size={18} aria-hidden />}
            Salvar termo
          </button>
        </div>
      </div>
    </section>
  );
}
