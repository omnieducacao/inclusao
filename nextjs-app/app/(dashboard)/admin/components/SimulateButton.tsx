"use client";
import { useRouter } from "next/navigation";
import { Save, Plus, Trash2, Edit2, CheckCircle2, XCircle, AlertTriangle, Eye, Activity, Database, Users, Settings, Lock, FileText, Smartphone, Image as ImageIcon, Link2, Share2, Upload, Loader2, Play, Pause, X, Megaphone, Download, Camera, ExternalLink } from 'lucide-react';

import { OmniLoader } from "@/components/OmniLoader";
import { LottieIcon } from "@/components/LottieIcon";
import { getSupabase } from "@/lib/supabase";
import { Workspace } from "../lib/admin-types";
import { ENGINE_OPTIONS, SEGMENT_OPTIONS, FEED_CATEGORIES } from "../lib/admin-constants";

import React, { useState, useEffect } from "react";
export function SimulateButton({ workspaceId, workspaceName }: { workspaceId: string; workspaceName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSimulate() {
    if (!confirm(`Deseja simular a escola "${workspaceName}"?\nVocê verá a plataforma como o master desta escola.`)) return;
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
        alert(data.error || "Erro ao iniciar simulação.");
      }
    } catch { /* expected fallback */
      alert("Erro ao iniciar simulação.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleSimulate}
      disabled={loading}
      className="px-3 py-1.5 text-sm border border-amber-400 text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 flex items-center gap-1 disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
      Simular
    </button>
  );
}
