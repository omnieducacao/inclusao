"use client";
import { useRouter } from "next/navigation";
import { Save, Plus, Trash2, Edit2, CheckCircle2, XCircle, AlertTriangle, Eye, Activity, Database, Users, Settings, Lock, FileText, Smartphone, Image as ImageIcon, Link2, Share2, Upload, Play, Pause, X, Megaphone, Download, Camera, ExternalLink } from 'lucide-react';

import { OmniLoader } from "@/components/OmniLoader";
import { LottieIcon } from "@/components/LottieIcon";
import { getSupabase } from "@/lib/supabase";
import { Workspace } from "../lib/admin-types";
import { ENGINE_OPTIONS, SEGMENT_OPTIONS, FEED_CATEGORIES } from "../lib/admin-constants";

import React, { useState, useEffect } from "react";
import { useConfirmar } from "@/components/Confirmar";
export function SimulateButton({ workspaceId, workspaceName }: { workspaceId: string; workspaceName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const { confirmar, dialogo } = useConfirmar();

  async function handleSimulate() {
    if (!(await confirmar({
      titulo: `Ver a plataforma como a escola "${workspaceName}"?`,
      texto: "Você vai navegar com o acesso de coordenação desta escola, até encerrar a simulação.",
      acao: "Simular escola",
    }))) return;
    setErro(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspace_id: workspaceId }),
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setErro(data.error || "Não foi possível iniciar a simulação.");
      }
    } catch { /* expected fallback */
      setErro("Não foi possível iniciar a simulação.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {dialogo}
      <button
        type="button"
        onClick={handleSimulate}
        disabled={loading}
        className="omni-btn omni-btn--secundario omni-btn--pequeno"
      >
        {loading ? <OmniLoader size={16} /> : <Eye size={16} aria-hidden />}
        Simular
      </button>
      {erro && (
        <span className="omni-campo__erro" role="alert" style={{ flexBasis: "100%" }}>
          <AlertTriangle aria-hidden /> {erro}
        </span>
      )}
    </>
  );
}
