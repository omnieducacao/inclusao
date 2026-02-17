"use client";

import { useState, useEffect } from "react";
import { X, Info, AlertTriangle, AlertCircle } from "lucide-react";

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
                {/* Header */}
                <div className={`${config.bg} ${config.border} border-b px-6 py-4 flex items-center gap-3`}>
                    <div>{config.icon}</div>
                    <h2 className={`font-semibold text-lg flex-1 ${config.text}`}>
                        {current.title}
                    </h2>
                    <button
                        onClick={handleClose}
                        className={`${config.text} opacity-60 hover:opacity-100 transition-opacity`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {current.message}
                    </p>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 px-6 py-4 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        {currentIndex + 1} de {announcements.length}
                    </p>
                    <button
                        onClick={handleClose}
                        className={`${config.buttonBg} text-white px-6 py-2 rounded-lg font-medium transition-colors`}
                    >
                        {currentIndex < announcements.length - 1 ? "Próximo" : "Entendi"}
                    </button>
                </div>
            </div>
        </div>
    );
}