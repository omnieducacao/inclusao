"use client";

import { useState } from "react";
import { aiLoadingStart, aiLoadingStop } from "@/hooks/useAILoading";
import { OmniLoader } from "@/components/OmniLoader";
import { RotateCw, Sparkles, CheckCircle2, XCircle, Pill, AlertCircle, UploadCloud, FileCheck, Plus } from "lucide-react";
import type { PEIData } from "@/lib/pei";
import type { EngineId } from "@/lib/ai-engines";

// Helper para validar e parsear respostas JSON (duplicated from PEIClient for isolation)
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

// ─── TransicaoAnoButton ─────────────────────────────────────────────────────

export function TransicaoAnoButton({ studentId, studentName }: { studentId: string; studentName?: string }) {
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const ano = new Date().getFullYear();
    async function handleClick() {
        setLoading(true);
        setErro(null);
        try {
            const res = await fetch(`/api/pei/relatorio-transicao?studentId=${encodeURIComponent(studentId)}&ano=${ano}`);
            if (!res.ok) {
                const d = await res.json();
                setErro(d.error || "Não deu para gerar o relatório.");
                return;
            }
            const data = await res.json();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Transicao_${(studentName || "Estudante").toString().replace(/\s+/g, "_")}_${ano}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch { /* expected fallback */
            setErro("Não deu para gerar o relatório. Tente de novo.");
        } finally {
            setLoading(false);
        }
    }
    return (
        <span style={{ display: "inline-grid", gap: 8, justifyItems: "start" }}>
            <button
                type="button"
                onClick={handleClick}
                disabled={loading}
                className="omni-btn omni-btn--secundario omni-btn--pequeno"
            >
                {loading ? <OmniLoader size={16} /> : <RotateCw aria-hidden size={16} />}
                Relatório de transição {ano}
            </button>
            {erro && (
                <span className="omni-aviso omni-aviso--erro" role="alert" style={{ display: "grid" }}>
                    <AlertCircle className="omni-aviso__icone" aria-hidden />
                    <span>
                        <span className="omni-aviso__texto" style={{ display: "block" }}>{erro}</span>
                    </span>
                </span>
            )}
        </span>
    );
}

// ─── LaudoPdfSection ────────────────────────────────────────────────────────

export function LaudoPdfSection({
    peiData,
    onDiagnostico,
    onMedicamentos,
}: {
    peiData: PEIData;
    onDiagnostico: (v: string) => void;
    onMedicamentos: (meds: { nome: string; posologia?: string; escola?: boolean }[]) => void;
}) {
    const [file, setFile] = useState<File | null>(null);
    const [engine, setEngine] = useState<EngineId>("orange");
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [extraido, setExtraido] = useState<{ diagnostico: string; medicamentos: { nome: string; posologia?: string }[] } | null>(null);
    const [medsRevisao, setMedsRevisao] = useState<Array<{ nome: string; posologia: string; escola: boolean }>>([]);
    const [modoRevisao, setModoRevisao] = useState(false);

    async function extrair() {
        if (!file) {
            setErro("Escolha um arquivo (PDF ou imagem).");
            return;
        }
        setLoading(true);
        setErro(null);
        setExtraido(null);
        setModoRevisao(false);
        aiLoadingStart(engine || "orange", "pei");
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("engine", engine);
            const res = await fetch("/api/pei/extrair-laudo", { method: "POST", body: formData });
            const data = await parseJsonResponse(res, "/api/pei/extrair-laudo");
            const resultado = {
                diagnostico: data.diagnostico || "",
                medicamentos: data.medicamentos || [],
            };
            setExtraido(resultado);
            if (resultado.medicamentos.length > 0) {
                setMedsRevisao(resultado.medicamentos.map((m: { nome: string; posologia?: string }) => ({ nome: m.nome || "", posologia: m.posologia || "", escola: false })));
                setModoRevisao(true);
            }
        } catch (e) {
            setErro(e instanceof Error ? e.message : "Não deu para ler o laudo.");
        } finally {
            setLoading(false);
            aiLoadingStop();
        }
    }

    function aplicar() {
        if (!extraido) return;
        onDiagnostico(extraido.diagnostico);
        if (modoRevisao && medsRevisao.length > 0) {
            const existentes = peiData.lista_medicamentos || [];
            const novos = medsRevisao.filter((m) => m.nome && !existentes.some((e) => (e.nome || "").toLowerCase() === m.nome.toLowerCase()));
            onMedicamentos([...existentes, ...novos]);
        } else {
            const meds = extraido.medicamentos.map((m) => ({ ...m, escola: false }));
            const existentes = peiData.lista_medicamentos || [];
            const novos = meds.filter((m) => m.nome && !existentes.some((e) => (e.nome || "").toLowerCase() === (m.nome || "").toLowerCase()));
            onMedicamentos([...existentes, ...novos]);
        }
        setExtraido(null);
        setFile(null);
        setModoRevisao(false);
        setMedsRevisao([]);
    }

    const ehImagem = !!file && (file.type.includes("image") || /\.(jpg|jpeg|png|webp)$/i.test(file.name));

    return (
        <div style={{ display: "grid", gap: 12 }}>
            <p className="omni-apoio" style={{ margin: 0, maxWidth: "70ch" }}>
                Se o estudante tem laudo, envie aqui: a leitura automática traz o diagnóstico e as medicações para você conferir. O laudo informa o estudo de caso; a lei não permite exigir laudo.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16, alignItems: "start" }}>
                <label className={`omni-soltar md:col-span-2 ${file ? "omni-soltar--feito" : ""}`}>
                    <input
                        type="file"
                        accept=".pdf,application/pdf,.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                            const selectedFile = e.target.files?.[0];
                            setFile(selectedFile || null);
                            setExtraido(null);
                            setErro(null);
                            setModoRevisao(false);
                            setMedsRevisao([]);
                        }}
                        aria-describedby="laudo-arquivo-dica"
                    />
                    {file ? <FileCheck aria-hidden /> : <UploadCloud aria-hidden />}
                    <span style={{ fontWeight: 700, color: "var(--tinta)" }}>
                        {file ? file.name : "Escolha o laudo ou arraste para cá"}
                    </span>
                    <span id="laudo-arquivo-dica" className="omni-soltar__dica">
                        {file
                            ? ehImagem
                                ? "Imagem escolhida: o texto será lido da foto. Depois, toque em Ler o laudo."
                                : "PDF escolhido. Depois, toque em Ler o laudo."
                            : "PDF, JPG, PNG ou WebP"}
                    </span>
                </label>
                <button
                    type="button"
                    onClick={extrair}
                    disabled={loading || !file}
                    className="omni-btn omni-btn--primario"
                    style={{ width: "100%" }}
                >
                    {loading ? (
                        <>
                            <OmniLoader size={16} />
                            Lendo o laudo…
                        </>
                    ) : (
                        <>
                            <Sparkles aria-hidden size={18} />
                            Ler o laudo
                        </>
                    )}
                </button>
            </div>
            {erro && (
                <div className="omni-aviso omni-aviso--erro" role="alert">
                    <AlertCircle className="omni-aviso__icone" aria-hidden />
                    <div>
                        <div className="omni-aviso__texto">{erro}</div>
                    </div>
                </div>
            )}

            {modoRevisao && medsRevisao.length > 0 && (
                <section className="omni-cartao" style={{ display: "grid", gap: 12, borderColor: "var(--atencao)" }} aria-labelledby="laudo-meds-titulo">
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Pill aria-hidden size={20} style={{ color: "var(--tinta-2)" }} />
                        <h5 id="laudo-meds-titulo" className="omni-cartao__titulo" style={{ margin: 0 }}>Medicações encontradas no laudo</h5>
                    </div>
                    <p className="omni-apoio" style={{ margin: 0 }}>Confira antes de adicionar.</p>
                    <div style={{ display: "grid", gap: 8 }}>
                        {medsRevisao.map((m, i) => (
                            <div key={i} className="omni-cartao--plano grid grid-cols-1 sm:grid-cols-12" style={{ gap: 8, alignItems: "center", padding: 8, borderRadius: "var(--o-radius-md)" }}>
                                <div className="sm:col-span-5">
                                    <input type="text" aria-label={`Medicação ${i + 1}: nome`} value={m.nome} onChange={(e) => { const novas = [...medsRevisao]; novas[i].nome = e.target.value; setMedsRevisao(novas); }} className="omni-entrada" placeholder="Nome do remédio" />
                                </div>
                                <div className="sm:col-span-4">
                                    <input type="text" aria-label={`Medicação ${i + 1}: como toma`} value={m.posologia} onChange={(e) => { const novas = [...medsRevisao]; novas[i].posologia = e.target.value; setMedsRevisao(novas); }} className="omni-entrada" placeholder="Como toma (dose e horário)" />
                                </div>
                                <div className="sm:col-span-3">
                                    <label className="omni-caixa" style={{ fontSize: 15 }}>
                                        <input type="checkbox" checked={m.escola} onChange={(e) => { const novas = [...medsRevisao]; novas[i].escola = e.target.checked; setMedsRevisao(novas); }} /> Toma na escola
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        <button type="button" onClick={aplicar} className="omni-btn omni-btn--primario">
                            <CheckCircle2 aria-hidden size={18} /> Adicionar ao PEI
                        </button>
                        <button type="button" onClick={() => { setModoRevisao(false); setMedsRevisao([]); }} className="omni-btn omni-btn--secundario">
                            <XCircle aria-hidden size={18} /> Cancelar
                        </button>
                    </div>
                </section>
            )}

            {extraido && !modoRevisao && (
                <section className="omni-cartao" style={{ display: "grid", gap: 12, borderColor: "var(--sucesso)" }} aria-labelledby="laudo-lido-titulo">
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <CheckCircle2 aria-hidden size={20} style={{ color: "var(--sucesso)" }} />
                        <h5 id="laudo-lido-titulo" className="omni-cartao__titulo" style={{ margin: 0 }}>Laudo lido. Confira o que veio.</h5>
                    </div>
                    <div>
                        <div className="omni-rotulo" style={{ marginBottom: 4 }}>Diagnóstico</div>
                        <p className="omni-cartao--plano" style={{ margin: 0, padding: 8, borderRadius: "var(--o-radius-sm)", font: "400 15px/22px var(--font-sans)", color: "var(--tinta)" }}>{extraido.diagnostico || "—"}</p>
                    </div>
                    {extraido.medicamentos.length > 0 && (
                        <div>
                            <div className="omni-rotulo" style={{ marginBottom: 4 }}>Medicações</div>
                            <ul className="omni-cartao--plano" style={{ margin: 0, padding: "8px 8px 8px 28px", borderRadius: "var(--o-radius-sm)", font: "400 15px/22px var(--font-sans)", color: "var(--tinta)" }}>
                                {extraido.medicamentos.map((m, i) => (
                                    <li key={i}>{m.nome}{m.posologia ? ` (${m.posologia})` : ""}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <button type="button" onClick={aplicar} className="omni-btn omni-btn--primario" style={{ justifySelf: "start" }}>
                        <CheckCircle2 aria-hidden size={18} /> Levar para o PEI
                    </button>
                </section>
            )}
        </div>
    );
}

// ─── MedicamentosForm ───────────────────────────────────────────────────────

export function MedicamentosForm({
    peiData,
    onAdd,
    onRemove,
}: {
    peiData: PEIData;
    onAdd: (nome: string, posologia: string, escola: boolean) => void;
    onRemove: (i: number) => void;
}) {
    const [nome, setNome] = useState("");
    const [posologia, setPosologia] = useState("");
    const [escola, setEscola] = useState(false);
    const lista = peiData.lista_medicamentos || [];

    return (
        <div className="omni-cartao" style={{ display: "grid", gap: 12 }}>
            <label className="omni-caixa">
                <input type="checkbox" checked={lista.length > 0} readOnly />
                <span style={{ fontWeight: 700 }}>O estudante toma medicação todo dia?</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-7" style={{ gap: 8, alignItems: "center" }}>
                <div className="md:col-span-3">
                    <input type="text" aria-label="Nome do remédio" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" className="omni-entrada" />
                </div>
                <div className="md:col-span-2">
                    <input type="text" aria-label="Como toma" value={posologia} onChange={(e) => setPosologia(e.target.value)} placeholder="Como toma" className="omni-entrada" />
                </div>
                <div className="md:col-span-2">
                    <label className="omni-caixa" style={{ fontSize: 15 }}>
                        <input type="checkbox" checked={escola} onChange={(e) => setEscola(e.target.checked)} /> Toma na escola
                    </label>
                </div>
            </div>
            <button type="button" onClick={() => { if (nome.trim()) { onAdd(nome.trim(), posologia.trim(), escola); setNome(""); setPosologia(""); setEscola(false); } }} className="omni-btn omni-btn--secundario omni-btn--pequeno" style={{ justifySelf: "start" }}>
                <Plus aria-hidden size={16} /> Adicionar
            </button>
            {lista.length > 0 && (
                <ul style={{ listStyle: "none", margin: 0, padding: "12px 0 0", borderTop: "1px solid var(--borda)", display: "grid", gap: 8 }}>
                    {lista.map((m, i) => (
                        <li key={i} className="omni-cartao--plano" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "8px 12px", borderRadius: "var(--o-radius-md)" }}>
                            <span style={{ font: "400 15px/22px var(--font-sans)", color: "var(--tinta)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                                <Pill aria-hidden size={16} style={{ color: "var(--tinta-2)" }} />
                                <strong>{m.nome || ""}</strong>{m.posologia ? ` (${m.posologia})` : ""}
                                {m.escola && <span className="omni-estado omni-estado--info">Na escola</span>}
                            </span>
                            <button type="button" onClick={() => onRemove(i)} className="omni-btn omni-btn--discreto omni-btn--pequeno" aria-label={`Tirar ${m.nome || "medicação"}`}>Tirar</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
