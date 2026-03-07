"use client";
import { Save, Plus, Trash2, Edit2, CheckCircle2, XCircle, AlertTriangle, Eye, Activity, Database, Users, Settings, Lock, FileText, Smartphone, Image as ImageIcon, Link2, Share2, Upload, Loader2, Play, Pause, X, Megaphone, Download, Camera, ExternalLink } from 'lucide-react';

import { OmniLoader } from "@/components/OmniLoader";
import { LottieIcon } from "@/components/LottieIcon";
import { getSupabase } from "@/lib/supabase";
import { Workspace } from "../lib/admin-types";
import { ENGINE_OPTIONS, SEGMENT_OPTIONS, FEED_CATEGORIES } from "../lib/admin-constants";

import React, { useState, useEffect } from "react";
export function TermoTab() {
  const [termsText, setTermsText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      console.error("Erro ao carregar termos:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/platform-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "terms_of_use", value: termsText }),
      });

      if (res.ok) {
        alert("Termo salvo. Os usuários verão a nova versão no próximo primeiro acesso.");
      } else {
        const error = await res.json().catch(() => ({}));
        alert(`Erro ao salvar: ${error.error || "Erro desconhecido"}`);
      }
    } catch (err) {
      console.error("Erro ao salvar termos:", err);
      alert("Erro ao salvar termo.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <h3 className="text-xl font-bold text-slate-900 mb-2">📜 Termo de Uso e Confidencialidade</h3>
      <p className="text-slate-600 text-sm mb-4">Este texto aparece no primeiro acesso de cada usuário após o login.</p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Texto do termo</label>
          <textarea
            value={termsText}
            onChange={(e) => setTermsText(e.target.value)}
            rows={14}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm"
            placeholder="Digite o texto do termo de uso..."
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar termo
        </button>
      </div>
    </div>
  );
}
