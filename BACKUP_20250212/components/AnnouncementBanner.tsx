"use client";

import { useState, useEffect } from "react";
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

export function AnnouncementBanner() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetch("/api/admin/announcements")
            .then((res) => res.json())
            .then((data) => setAnnouncements(data.announcements || []))
            .catch(() => { });
    }, []);

    const visible = announcements.filter((a) => !dismissed.has(a.id));
    if (visible.length === 0) return null;

    const typeConfig = {
        info: {
            bg: "bg-blue-50 border-blue-200",
            text: "text-blue-900",
            icon: <Info className="w-5 h-5 text-blue-600" />,
        },
        warning: {
            bg: "bg-amber-50 border-amber-200",
            text: "text-amber-900",
            icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
        },
        alert: {
            bg: "bg-red-50 border-red-200",
            text: "text-red-900",
            icon: <AlertCircle className="w-5 h-5 text-red-600" />,
        },
    };

    return (
        <div className="space-y-2 mb-4">
            {visible.map((a) => {
                const config = typeConfig[a.type] || typeConfig.info;
                return (
                    <div
                        key={a.id}
                        className={`${config.bg} border rounded-xl px-4 py-3 flex items-start gap-3`}
                    >
                        <div className="mt-0.5">{config.icon}</div>
                        <div className="flex-1">
                            <p className={`font-semibold text-sm ${config.text}`}>{a.title}</p>
                            <p className={`text-sm mt-0.5 opacity-80 ${config.text}`}>{a.message}</p>
                        </div>
                        <button
                            onClick={() => setDismissed((prev) => new Set([...prev, a.id]))}
                            className="text-slate-400 hover:text-slate-600 mt-0.5"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
