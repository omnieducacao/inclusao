"use client";

import { useState, useEffect } from "react";
import { Info, AlertTriangle, AlertCircle } from "lucide-react";
import { Modal, Button } from "@omni/ds";

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
 * AnnouncementModal - shows unviewed announcements in a modal on first visit
 * After user closes modal, announcements go to notification bell
 */
export function AnnouncementModal() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

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

    if (loading || announcements.length === 0) {
        return null;
    }

    const current = announcements[currentIndex];
    if (!current) return null;

    const typeConfig = {
        info: {
            bg: "bg-blue-50",
            border: "border-blue-200",
            text: "text-blue-900",
            icon: <Info className="w-6 h-6 text-blue-600" />,
            buttonBg: "bg-blue-600 hover:bg-blue-700",
        },
        warning: {
            bg: "bg-amber-50",
            border: "border-amber-200",
            text: "text-amber-900",
            icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
            buttonBg: "bg-amber-600 hover:bg-amber-700",
        },
        alert: {
            bg: "bg-red-50",
            border: "border-red-200",
            text: "text-red-900",
            icon: <AlertCircle className="w-6 h-6 text-red-600" />,
            buttonBg: "bg-red-600 hover:bg-red-700",
        },
    };

    const config = typeConfig[current.type] || typeConfig.info;

    return (
        <Modal
            open={true}
            onClose={handleClose}
            title={current.title}
            showClose={true}
            size="md"
        >
            <div className="flex flex-col gap-4">
                <div className={`p-4 rounded-xl flex items-start gap-3 ${config.bg} ${config.border} border`}>
                    <div className="mt-0.5 shrink-0">{config.icon}</div>
                    <p className={`whitespace-pre-wrap leading-relaxed ${config.text}`}>
                        {current.message}
                    </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-[var(--omni-text-muted)]">
                        {currentIndex + 1} de {announcements.length}
                    </p>
                    <Button onClick={handleClose}>
                        {currentIndex < announcements.length - 1 ? "Próximo" : "Entendi"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}