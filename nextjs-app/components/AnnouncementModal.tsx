"use client";

import { useState, useEffect, useRef } from "react";
import { Info, AlertTriangle, AlertCircle, X } from "lucide-react";

type Announcement = {
    id: string;
    title: string;
    message: string;
    type: "info" | "warning" | "alert";
    target: string;
    active: boolean;
    created_at: string;
    expires_at?: string;
};

/**
 * AnnouncementModal - mostra os comunicados ainda não vistos num diálogo na primeira visita.
 * Depois que a pessoa fecha, os comunicados ficam no sino de notificações.
 * Onda 20: <dialog> nativo do design system (omni-dialogo) no lugar do Modal antigo;
 * fechar (Esc, X ou botão) faz o mesmo que antes: marca como visto e passa ao próximo.
 */
export function AnnouncementModal() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const dialogoRef = useRef<HTMLDialogElement | null>(null);

    useEffect(() => {
        fetchUnviewed();
    }, []);

    async function fetchUnviewed() {
        try {
            const res = await fetch("/api/announcements/unviewed");
            if (res.ok) {
                const data = await res.json();
                setAnnouncements(data.announcements || []);
            }
        } catch (err) {
            console.error("Error fetching unviewed announcements:", err);
        } finally {
            setLoading(false);
        }
    }

    async function markAsViewed(announcementId: string) {
        try {
            await fetch("/api/announcements/mark-viewed", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ announcementId, shownAsModal: true }),
            });
        } catch (err) {
            console.error("Error marking announcement as viewed:", err);
        }
    }

    function handleClose() {
        if (announcements[currentIndex]) {
            markAsViewed(announcements[currentIndex].id);
        }
        if (currentIndex < announcements.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setAnnouncements([]);
        }
    }

    const aberto = !loading && announcements.length > 0 && !!announcements[currentIndex];

    // Abre o <dialog> como modal (prende o foco e fecha com Esc)
    useEffect(() => {
        const d = dialogoRef.current;
        if (!aberto || !d) return;
        if (!d.open) {
            try { d.showModal(); } catch { d.setAttribute("open", ""); }
        }
    }, [aberto, currentIndex]);

    if (loading || announcements.length === 0) {
        return null;
    }

    const current = announcements[currentIndex];
    if (!current) return null;

    const typeConfig = {
        info: { cor: "var(--info)", suave: "var(--info-suave)", Icone: Info, nome: "Informação" },
        warning: { cor: "var(--atencao)", suave: "var(--atencao-suave)", Icone: AlertTriangle, nome: "Atenção" },
        alert: { cor: "var(--erro)", suave: "var(--erro-suave)", Icone: AlertCircle, nome: "Alerta" },
    };

    const config = typeConfig[current.type] || typeConfig.info;
    const Icone = config.Icone;
    const ultimo = currentIndex >= announcements.length - 1;

    return (
        <dialog
            ref={dialogoRef}
            className="omni-dialogo"
            aria-labelledby="omni-comunicado-novo-titulo"
            onCancel={(e) => { e.preventDefault(); handleClose(); }}
        >
            <div className="omni-dialogo__corpo">
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <h2 id="omni-comunicado-novo-titulo" className="omni-dialogo__titulo" style={{ margin: 0, flex: 1 }}>
                        {current.title}
                    </h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="omni-btn omni-btn--discreto omni-btn--icone omni-btn--pequeno"
                        style={{ width: 36, color: "var(--tinta-2)" }}
                        aria-label="Fechar comunicado"
                    >
                        <X aria-hidden />
                    </button>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 16, borderRadius: "var(--o-radius-md)", background: config.suave }}>
                    <Icone aria-hidden style={{ width: 22, height: 22, flexShrink: 0, marginTop: 2, color: config.cor }} />
                    <span className="omni-so-leitor">{config.nome}:</span>
                    <p style={{ margin: 0, whiteSpace: "pre-wrap", font: "400 16px/26px var(--font-sans)", color: "var(--tinta)" }}>
                        {current.message}
                    </p>
                </div>
            </div>
            <div className="omni-dialogo__acoes" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <p className="omni-apoio" style={{ margin: 0 }}>
                    {currentIndex + 1} de {announcements.length}
                </p>
                <button type="button" onClick={handleClose} className="omni-btn omni-btn--primario" autoFocus>
                    {ultimo ? "Entendi" : "Próximo"}
                </button>
            </div>
        </dialog>
    );
}
