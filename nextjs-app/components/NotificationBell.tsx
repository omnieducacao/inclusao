"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, X, AlertTriangle, Info, AlertCircle, ExternalLink, Megaphone, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Notification = {
    id: string;
    type: string;
    title: string;
    description: string;
    severity: "info" | "warning" | "alert";
    studentId?: string;
    studentName?: string;
};

type Announcement = {
    id: string;
    title: string;
    message: string;
    type: "info" | "warning" | "alert";
};

/**
 * NotificationBell — shows a bell icon with a badge count.
 * Fetches notifications on hover/click from /api/notifications.
 */
// Onda 16: o professor vai para o PEI do professor; o alerta do AEE abre a ficha do estudante
function destinoDaNotificacao(id: string, type: string, studentId: string): string {
    if (id.startsWith("pei-devolutiva-")) return "/pei-regente?aba=disciplina";
    if (id.startsWith("pei-ciencia-")) return "/pei-regente";
    if (id.startsWith("diario-alerta-")) return `/estudantes/${studentId}`;
    return type === "diario" ? `/diario?studentId=${studentId}` : `/pei?studentId=${studentId}`;
}
function rotuloDaNotificacao(id: string, type: string): string {
    if (id.startsWith("pei-devolutiva-") || id.startsWith("pei-ciencia-")) return "Abrir PEI do professor";
    if (id.startsWith("diario-alerta-")) return "Abrir a ficha";
    return type === "diario" ? "Ir para Diário" : "Ir para PEI";
}

export function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
    const ref = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const fetchNotifications = useCallback(async () => {
        if (fetched) return;
        setLoading(true);
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setTotal(data.total || 0);
                setFetched(true);
            }
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }, [fetched]);

    // Close on click outside or Escape key
    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                e.preventDefault();
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    const handleToggle = () => {
        if (!open) fetchNotifications();
        setOpen((prev) => !prev);
    };

    const handleDismiss = async (notificationId: string) => {
        try {
            // Optimistically remove from UI
            setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
            setTotal((prev) => Math.max(0, prev - 1));

            // If it's an announcement, mark as dismissed in backend
            if (notificationId.startsWith("announcement-")) {
                await fetch("/api/notifications/dismiss", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ notificationId }),
                });
            }
        } catch (err) {
            console.error("Error dismissing notification:", err);
        }
    };

    const handleAnnouncementClick = async (notificationId: string) => {
        if (!notificationId.startsWith("announcement-")) return;

        // Fetch announcement details from backend
        const announcementId = notificationId.replace("announcement-", "");
        try {
            const res = await fetch("/api/admin/announcements");
            if (res.ok) {
                const data = await res.json();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const announcement = data.announcements?.find((a: any) => a.id === announcementId);
                if (announcement) {
                    setSelectedAnnouncement({
                        id: announcement.id,
                        title: announcement.title,
                        message: announcement.message,
                        type: announcement.type || "info"
                    });
                    setOpen(false);
                }
            }
        } catch (err) {
            console.error("Error fetching announcement:", err);
        }
    };

    // Onda 20: cores do design system (erro, atenção, informação) em vez da paleta do Tailwind
    const corDaSeveridade = (severity: string) => {
        switch (severity) {
            case "alert":
                return { cor: "var(--erro)", suave: "var(--erro-suave)" };
            case "warning":
                return { cor: "var(--atencao)", suave: "var(--atencao-suave)" };
            default:
                return { cor: "var(--info)", suave: "var(--info-suave)" };
        }
    };

    const getSeverityIcon = (severity: string, tamanho = 16) => {
        const estilo = { width: tamanho, height: tamanho, flexShrink: 0, marginTop: 2, color: corDaSeveridade(severity).cor };
        switch (severity) {
            case "alert":
                return <AlertCircle aria-hidden style={estilo} />;
            case "warning":
                return <AlertTriangle aria-hidden style={estilo} />;
            default:
                return <Info aria-hidden style={estilo} />;
        }
    };

    const nomeDaSeveridade = (severity: string) =>
        severity === "alert" ? "Alerta" : severity === "warning" ? "Atenção" : "Informação";

    // Comunicado aberto: <dialog> nativo (prende o foco, fecha com Esc)
    const dialogoRef = useRef<HTMLDialogElement | null>(null);
    useEffect(() => {
        const d = dialogoRef.current;
        if (!selectedAnnouncement || !d) return;
        if (!d.open) {
            try { d.showModal(); } catch { d.setAttribute("open", ""); }
        }
    }, [selectedAnnouncement]);
    const fecharComunicado = () => {
        dialogoRef.current?.close();
        setSelectedAnnouncement(null);
    };

    return (
        <div ref={ref} style={{ position: "relative" }}>
            <button
                type="button"
                onClick={handleToggle}
                className="omni-btn omni-btn--discreto omni-btn--icone"
                style={{ position: "relative", color: open ? "var(--tinta)" : "var(--tinta-2)" }}
                title="Notificações"
                aria-label={`Notificações${total > 0 ? ` (${total} pendentes)` : ''}`}
                aria-expanded={open}
                aria-haspopup="true"
            >
                <Bell aria-hidden style={{ width: 20, height: 20 }} />
                {total > 0 && (
                    <span
                        aria-hidden
                        style={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            minWidth: 18,
                            height: 18,
                            padding: "0 4px",
                            borderRadius: 999,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "var(--erro)",
                            color: "var(--sobre-acao)",
                            border: "2px solid var(--superficie)",
                            font: "700 10px/1 var(--font-sans)",
                        }}
                    >
                        {total > 9 ? "9+" : total}
                    </span>
                )}
            </button>

            {open && (
                <div
                    role="region"
                    aria-label="Notificações"
                    style={{
                        position: "absolute",
                        right: 0,
                        top: "calc(100% + 8px)",
                        width: "min(320px, calc(100vw - 32px))",
                        maxHeight: "60vh",
                        overflow: "hidden",
                        zIndex: 60, // = --camada-menu
                        background: "var(--superficie)",
                        border: "1px solid var(--borda)",
                        borderRadius: "var(--o-radius-lg) var(--o-radius-xs) var(--o-radius-lg) var(--o-radius-lg)",
                        boxShadow: "var(--sombra-2)",
                    }}
                >
                    {/* Cabeçalho */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "8px 8px 8px 16px", background: "var(--superficie-2)", borderBottom: "1px solid var(--borda)" }}>
                        <h3 style={{ margin: 0, font: "700 15px/20px var(--font-sans)", color: "var(--tinta)" }}>
                            Notificações
                            {total > 0 && (
                                <span style={{ marginLeft: 8, font: "500 13px/18px var(--font-mono)", color: "var(--tinta-3)" }}>({total})</span>
                            )}
                        </h3>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="omni-btn omni-btn--discreto omni-btn--icone omni-btn--pequeno"
                            style={{ width: 36, color: "var(--tinta-2)" }}
                            aria-label="Fechar notificações"
                        >
                            <X aria-hidden />
                        </button>
                    </div>

                    {/* Conteúdo */}
                    <div style={{ overflowY: "auto", maxHeight: "50vh" }} aria-live="polite" aria-busy={loading}>
                        {loading && (
                            <p className="omni-apoio" style={{ margin: 0, padding: "32px 16px", textAlign: "center" }}>
                                Verificando…
                            </p>
                        )}

                        {!loading && notifications.length === 0 && (
                            <div style={{ padding: "32px 16px", textAlign: "center", display: "grid", justifyItems: "center", gap: 4 }}>
                                <CheckCircle2 aria-hidden style={{ width: 28, height: 28, color: "var(--sucesso)", marginBottom: 4 }} />
                                <p style={{ margin: 0, font: "700 15px/20px var(--font-sans)", color: "var(--tinta)" }}>Tudo em dia!</p>
                                <p className="omni-apoio" style={{ margin: 0, fontSize: 13 }}>Nenhuma notificação pendente.</p>
                            </div>
                        )}

                        {!loading && notifications.length > 0 && (
                            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                                {notifications.map((n) => {
                                    const sev = corDaSeveridade(n.severity);
                                    return (
                                        <li
                                            key={n.id}
                                            style={{
                                                padding: "12px 8px 12px 12px",
                                                background: sev.suave,
                                                borderLeft: `4px solid ${sev.cor}`,
                                                borderBottom: "1px solid var(--borda)",
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                                                {getSeverityIcon(n.severity)}
                                                <span className="omni-so-leitor">{nomeDaSeveridade(n.severity)}:</span>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    {n.type === "announcement" ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAnnouncementClick(n.id)}
                                                            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: 0, margin: "0 0 2px", background: "none", border: 0, cursor: "pointer", textAlign: "left", textDecoration: "underline", textUnderlineOffset: 3, font: "700 13px/18px var(--font-sans)", color: "var(--tinta)" }}
                                                        >
                                                            <Megaphone aria-hidden style={{ width: 14, height: 14, flexShrink: 0 }} />
                                                            {n.title}
                                                        </button>
                                                    ) : (
                                                        <p style={{ margin: "0 0 2px", font: "700 13px/18px var(--font-sans)", color: "var(--tinta)" }}>{n.title}</p>
                                                    )}
                                                    <p style={{ margin: 0, font: "400 13px/19px var(--font-sans)", color: "var(--tinta-2)" }}>
                                                        {n.description}
                                                    </p>
                                                    {n.studentId && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setOpen(false);
                                                                router.push(destinoDaNotificacao(n.id, n.type, n.studentId!));
                                                            }}
                                                            style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 4, padding: 0, background: "none", border: 0, cursor: "pointer", font: "700 12px/16px var(--font-sans)", color: "var(--acao)" }}
                                                            aria-label={`${rotuloDaNotificacao(n.id, n.type)} de ${n.studentName || 'estudante'}`}
                                                        >
                                                            <ExternalLink aria-hidden style={{ width: 12, height: 12 }} />
                                                            {rotuloDaNotificacao(n.id, n.type)}
                                                        </button>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDismiss(n.id);
                                                    }}
                                                    className="omni-btn omni-btn--discreto omni-btn--icone omni-btn--pequeno"
                                                    style={{ width: 32, minHeight: 32, flexShrink: 0, alignSelf: "center", color: "var(--tinta-2)" }}
                                                    title="Dispensar notificação"
                                                    aria-label={`Dispensar notificação: ${n.title}`}
                                                >
                                                    <X aria-hidden />
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {/* Comunicado aberto */}
            {selectedAnnouncement && (
                <dialog
                    ref={dialogoRef}
                    className="omni-dialogo"
                    aria-labelledby="omni-comunicado-titulo"
                    onCancel={(e) => { e.preventDefault(); fecharComunicado(); }}
                >
                    <div className="omni-dialogo__corpo">
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                            {getSeverityIcon(selectedAnnouncement.type, 24)}
                            <h2 id="omni-comunicado-titulo" className="omni-dialogo__titulo" style={{ margin: 0, flex: 1 }}>
                                {selectedAnnouncement.title}
                            </h2>
                        </div>
                        <p style={{ margin: 0, whiteSpace: "pre-wrap", font: "400 16px/26px var(--font-sans)", color: "var(--tinta-2)" }}>
                            {selectedAnnouncement.message}
                        </p>
                    </div>
                    <div className="omni-dialogo__acoes">
                        <button type="button" onClick={fecharComunicado} className="omni-btn omni-btn--primario" autoFocus>
                            Fechar
                        </button>
                    </div>
                </dialog>
            )}
        </div>
    );
}
