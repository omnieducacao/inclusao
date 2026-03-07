"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { createPEISnapshot } from "@/components/PEIVersionHistory";
import type { PEIData } from "@/lib/pei";

// ─── Types ──────────────────────────────────────────────────────────────────────

export type TabId =
    | "inicio"
    | "estudante"
    | "evidencias"
    | "rede"
    | "mapeamento"
    | "plano"
    | "monitoramento"
    | "bncc"
    | "consultoria"
    | "regentes"
    | "consolidacao"
    | "dashboard";

export const TABS: { id: TabId; label: string }[] = [
    { id: "inicio", label: "Início" },
    { id: "estudante", label: "Estudante" },
    { id: "evidencias", label: "Evidências" },
    { id: "rede", label: "Rede de Apoio" },
    { id: "mapeamento", label: "Mapeamento" },
    { id: "plano", label: "Plano de Ação" },
    { id: "monitoramento", label: "Monitoramento" },
    { id: "bncc", label: "BNCC" },
    { id: "consultoria", label: "Consultoria IA" },
    { id: "regentes", label: "Regentes" },
    { id: "consolidacao", label: "Consolidação" },
    { id: "dashboard", label: "Dashboard" },
];

// ─── Helpers ────────────────────────────────────────────────────────────────────

async function parseJsonResponse(res: Response, url?: string) {
    if (!res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            throw new Error(data.error || `HTTP ${res.status}${url ? ` em ${url}` : ""}`);
        }
        throw new Error(`HTTP ${res.status}: ${res.statusText}${url ? ` em ${url}` : ""}`);
    }
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Resposta não é JSON${url ? ` de ${url}` : ""}`);
    }
    return res.json();
}

function _isFilled(value: unknown): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") {
        const obj = value as Record<string, unknown>;
        return Object.keys(obj).length > 0 && Object.values(obj).some((v) => _isFilled(v));
    }
    return true;
}

function _abaOk(d: PEIData, key: string): boolean {
    if (key === "INICIO") return _isFilled(d.nome);
    if (key === "ESTUDANTE") return _isFilled(d.nome) && _isFilled(d.serie) && _isFilled(d.turma);
    if (key === "EVIDENCIAS") {
        const chk = d.checklist_evidencias || {};
        return Object.values(chk).some((v) => Boolean(v)) || _isFilled(d.orientacoes_especialistas);
    }
    if (key === "REDE") return _isFilled(d.rede_apoio) || _isFilled(d.orientacoes_especialistas) || _isFilled(d.orientacoes_por_profissional);
    if (key === "MAPEAMENTO") {
        const barreiras = d.barreiras_selecionadas || {};
        const nBar = Object.values(barreiras).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
        return _isFilled(d.hiperfoco) || _isFilled(d.potencias) || nBar > 0;
    }
    if (key === "PLANO") {
        return _isFilled(d.estrategias_acesso) || _isFilled(d.estrategias_ensino) || _isFilled(d.estrategias_avaliacao) ||
            _isFilled(d.outros_acesso) || _isFilled(d.outros_ensino);
    }
    if (key === "MONITORAMENTO") return _isFilled(d.monitoramento_data) && _isFilled(d.status_meta);
    if (key === "IA") return _isFilled(d.ia_sugestao) && (d.status_validacao_pei === "revisao" || d.status_validacao_pei === "aprovado");
    if (key === "DASH") return _isFilled(d.ia_sugestao);
    return false;
}

export function calcularProgresso(d: PEIData): number {
    const checkpoints = ["ESTUDANTE", "EVIDENCIAS", "REDE", "MAPEAMENTO", "PLANO", "MONITORAMENTO", "IA", "DASH"];
    const done = checkpoints.filter((k) => _abaOk(d, k)).length;
    return checkpoints.length > 0 ? Math.round((done / checkpoints.length) * 100) : 0;
}

export function getTabStatus(d: PEIData, tabId: TabId): "complete" | "in-progress" | "empty" {
    switch (tabId) {
        case "inicio": return _isFilled(d.nome) ? "complete" : "empty";
        case "estudante": return _isFilled(d.nome) && _isFilled(d.serie) && _isFilled(d.turma) ? "complete" : _isFilled(d.nome) ? "in-progress" : "empty";
        case "evidencias": {
            const chk = d.checklist_evidencias || {};
            return Object.values(chk).some((v) => v === true) ? "complete" : "empty";
        }
        case "rede": {
            const rede = Array.isArray(d.rede_apoio) ? d.rede_apoio : [];
            return rede.length > 0 ? "complete" : "empty";
        }
        case "mapeamento": {
            const barreiras = d.barreiras_selecionadas || {};
            return Object.values(barreiras).some((arr) => Array.isArray(arr) && arr.length > 0) ? "complete" : "empty";
        }
        case "plano": {
            const tem = _isFilled(d.estrategias_acesso) || _isFilled(d.estrategias_ensino) || _isFilled(d.estrategias_avaliacao) ||
                _isFilled(d.outros_acesso) || _isFilled(d.outros_ensino);
            return tem ? "complete" : "empty";
        }
        case "monitoramento": return _isFilled(d.parecer_geral) ? "complete" : "empty";
        case "bncc": {
            const habs = Array.isArray(d.habilidades_bncc_selecionadas) ? d.habilidades_bncc_selecionadas : [];
            return habs.length > 0 ? "complete" : "empty";
        }
        case "consultoria":
            return _isFilled(d.status_validacao_pei) && d.status_validacao_pei !== "rascunho" ? "complete" : "empty";
        case "dashboard": {
            const p = calcularProgresso(d);
            return p >= 50 ? "complete" : p > 0 ? "in-progress" : "empty";
        }
        default: return "empty";
    }
}

// ─── Hook ───────────────────────────────────────────────────────────────────────

interface UsePEIDataOptions {
    students: { id: string; name: string }[];
    studentId: string | null;
    initialPeiData: Record<string, unknown>;
}

export function usePEIData({ students, studentId, initialPeiData }: UsePEIDataOptions) {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<TabId>("inicio");
    const [peiData, setPeiData] = useState<PEIData>(initialPeiData as PEIData);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
        studentId || searchParams?.get("student") || null
    );
    const [jsonPending, setJsonPending] = useState<PEIData | null>(null);
    const [jsonFileName, setJsonFileName] = useState<string>("");
    const [erroGlobal, setErroGlobal] = useState<string | null>(null);
    const [isLoadingRascunho, setIsLoadingRascunho] = useState(false);
    const [studentPendingId, setStudentPendingId] = useState<string | null>(null);
    const [studentPendingName, setStudentPendingName] = useState<string>("");
    const { markDirty, markClean } = useUnsavedChanges();

    // Refs
    const cloudLoadIdRef = useRef<string | null>(null);
    const skipNextFetchRef = useRef(false);

    // ─── Tab from URL ───────────────────────────────────────────────────
    const tabFromUrl = searchParams?.get("tab");
    useEffect(() => {
        if (!tabFromUrl || !selectedStudentId) return;
        const validTabs: TabId[] = ["inicio", "estudante", "evidencias", "rede", "mapeamento", "plano", "monitoramento", "bncc", "consultoria", "regentes", "consolidacao", "dashboard"];
        if (validTabs.includes(tabFromUrl as TabId)) setActiveTab(tabFromUrl as TabId);
    }, [tabFromUrl, selectedStudentId]);

    // ─── Field Operations ───────────────────────────────────────────────

    const updateField = useCallback(<K extends keyof PEIData>(key: K, value: PEIData[K]) => {
        setPeiData((prev) => ({ ...prev, [key]: value }));
        setSaved(false);
        markDirty();
    }, [markDirty]);

    const toggleChecklist = useCallback((key: string, label: string) => {
        void key; // key is unused but kept for backward compat
        setPeiData((prev) => {
            const checklist = { ...(prev.checklist_evidencias || {}) };
            checklist[label] = !checklist[label];
            return { ...prev, checklist_evidencias: checklist };
        });
        setSaved(false);
    }, []);

    const addMedicamento = useCallback((nome: string, posologia: string, escola: boolean) => {
        if (!nome.trim()) return;
        setPeiData((prev) => {
            const lista = prev.lista_medicamentos || [];
            if (lista.some((m) => (m.nome || "").toLowerCase() === nome.trim().toLowerCase())) return prev;
            return {
                ...prev,
                lista_medicamentos: [...lista, { nome: nome.trim(), posologia, escola }],
            };
        });
        setSaved(false);
    }, []);

    const removeMedicamento = useCallback((i: number) => {
        setPeiData((prev) => {
            const lista = [...(prev.lista_medicamentos || [])];
            lista.splice(i, 1);
            return { ...prev, lista_medicamentos: lista };
        });
        setSaved(false);
    }, []);

    // ─── Save / Update ──────────────────────────────────────────────────

    const handleSave = useCallback(async () => {
        if (!peiData.nome || !peiData.nome.toString().trim()) {
            alert("O nome do estudante é obrigatório. Preencha o campo 'Nome' na aba Estudante.");
            return;
        }
        setSaving(true);
        setErroGlobal(null);
        try {
            const res = await fetch("/api/students", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: peiData.nome.toString().trim(),
                    grade: peiData.serie || null,
                    class_group: peiData.turma || null,
                    diagnosis: peiData.diagnostico || null,
                    pei_data: peiData,
                    privacy_consent: true,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                const novoEstudanteId = data.student?.id;
                if (novoEstudanteId) {
                    setSelectedStudentId(novoEstudanteId);
                    const url = new URL(window.location.href);
                    url.searchParams.set("student", novoEstudanteId);
                    window.history.pushState({}, "", url.toString());
                    setSaved(true);
                    markClean();
                    createPEISnapshot(novoEstudanteId, `Criação — ${new Date().toLocaleDateString("pt-BR")}`);
                    setTimeout(() => setSaved(false), 3000);
                    alert(`✅ Novo estudante "${peiData.nome}" criado e PEI salvo na nuvem com sucesso! ☁️`);
                } else {
                    throw new Error("ID do estudante não retornado");
                }
            } else {
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const data = await res.json();
                    setErroGlobal(data.error || `Erro ao criar estudante (HTTP ${res.status})`);
                    alert(`Erro ao criar estudante: ${data.error || `HTTP ${res.status}`}`);
                } else {
                    setErroGlobal(`Erro ao criar estudante (HTTP ${res.status})`);
                    alert(`Erro ao criar estudante: HTTP ${res.status}`);
                }
            }
        } catch (err) {
            const mensagem = err instanceof Error ? err.message : "Erro ao criar estudante";
            setErroGlobal(mensagem);
            console.error("Erro ao criar estudante:", err);
            alert(`Erro ao criar estudante: ${mensagem}`);
        } finally {
            setSaving(false);
        }
    }, [peiData, markClean]);

    const handleUpdate = useCallback(async () => {
        if (!selectedStudentId) return;
        setSaving(true);
        setErroGlobal(null);
        try {
            const res = await fetch(`/api/students/${selectedStudentId}/pei-data`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pei_data: peiData }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `HTTP ${res.status}`);
            }
            await fetch(`/api/students/${selectedStudentId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: peiData.nome?.toString().trim() || undefined,
                    grade: peiData.serie || undefined,
                    class_group: peiData.turma || undefined,
                    diagnosis: peiData.diagnostico || undefined,
                }),
            });
            setSaved(true);
            markClean();
            createPEISnapshot(selectedStudentId, `Atualização — ${new Date().toLocaleDateString("pt-BR")}`);
            setTimeout(() => setSaved(false), 3000);
            alert(`✅ PEI de "${peiData.nome}" atualizado com sucesso! ☁️`);
        } catch (err) {
            const mensagem = err instanceof Error ? err.message : "Erro ao atualizar PEI";
            setErroGlobal(mensagem);
            alert(`Erro ao atualizar PEI: ${mensagem}`);
        } finally {
            setSaving(false);
        }
    }, [peiData, selectedStudentId, markClean]);

    // ─── Student fetching ───────────────────────────────────────────────

    useEffect(() => {
        if (isLoadingRascunho || studentPendingId) return;
        if (skipNextFetchRef.current) { skipNextFetchRef.current = false; return; }
        if (selectedStudentId && selectedStudentId !== studentId) {
            setErroGlobal(null);
            const studentFromList = students.find((s) => s.id === selectedStudentId);
            if (!studentFromList) { setErroGlobal(null); return; }
            const url = `/api/students/${selectedStudentId}`;
            fetch(url)
                .then(async (res) => {
                    if (!res.ok) { setPeiData({} as PEIData); setSaved(false); setErroGlobal(null); return null; }
                    try { return await parseJsonResponse(res, url); } catch { setPeiData({} as PEIData); setSaved(false); setErroGlobal(null); return null; }
                })
                .then((data) => {
                    if (!data) return;
                    if (data.pei_data) { setPeiData(data.pei_data as PEIData); } else { setPeiData({} as PEIData); }
                    setSaved(false);
                    setErroGlobal(null);
                })
                .catch(() => { setPeiData({} as PEIData); setSaved(false); setErroGlobal(null); });
        }
    }, [selectedStudentId, studentId, students, studentPendingId, isLoadingRascunho]);

    // ─── JSON Pending ───────────────────────────────────────────────────

    useEffect(() => {
        if (jsonPending) {
            setTimeout(() => {
                setPeiData(jsonPending);
                if (cloudLoadIdRef.current) {
                    skipNextFetchRef.current = true;
                    setSelectedStudentId(cloudLoadIdRef.current);
                    cloudLoadIdRef.current = null;
                } else {
                    setSelectedStudentId(null);
                }
                setJsonPending(null);
                setJsonFileName("");
                setSaved(false);
                setErroGlobal(null);
                const url = new URL(window.location.href);
                url.searchParams.delete("student");
                window.history.pushState({}, "", url.toString());
            }, 0);
        }
    }, [jsonPending]);

    const aplicarJson = useCallback(() => {
        if (jsonPending) {
            setPeiData(jsonPending);
            setSelectedStudentId(null);
            setJsonPending(null);
            setJsonFileName("");
            setSaved(false);
            setErroGlobal(null);
            const url = new URL(window.location.href);
            url.searchParams.delete("student");
            window.history.pushState({}, "", url.toString());
        }
    }, [jsonPending]);

    // ─── Computed values ────────────────────────────────────────────────

    const progresso = useMemo(() => calcularProgresso(peiData), [peiData]);

    const tabStatuses = useMemo(() => {
        const map: Record<TabId, "complete" | "in-progress" | "empty"> = {} as Record<TabId, "complete" | "in-progress" | "empty">;
        for (const t of TABS) {
            map[t.id] = getTabStatus(peiData, t.id);
        }
        return map;
    }, [peiData]);

    return {
        // State
        activeTab, setActiveTab,
        peiData, setPeiData,
        saving, saved,
        selectedStudentId, setSelectedStudentId,
        jsonPending, setJsonPending,
        jsonFileName, setJsonFileName,
        erroGlobal, setErroGlobal,
        isLoadingRascunho, setIsLoadingRascunho,
        studentPendingId, setStudentPendingId,
        studentPendingName, setStudentPendingName,

        // Refs
        cloudLoadIdRef, skipNextFetchRef,

        // Operations
        updateField,
        toggleChecklist,
        addMedicamento,
        removeMedicamento,
        handleSave,
        handleUpdate,
        aplicarJson,

        // Computed
        currentStudentId: selectedStudentId,
        progresso,
        tabStatuses,
    };
}
