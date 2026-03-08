"use client";

import React from "react";
import { WifiOff, ArrowLeft } from "lucide-react";
import { Button } from "@omni/ds";

export default function OfflinePage() {
    return (
        <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            minHeight: "100vh", backgroundColor: "var(--bg-primary, #0f172a)", color: "var(--text-primary, #f8fafc)",
            padding: 24, textAlign: "center"
        }}>
            <div style={{
                width: 80, height: 80, borderRadius: "50%", background: "rgba(239, 68, 68, 0.1)",
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24
            }}>
                <WifiOff size={40} style={{ color: "#ef4444" }} />
            </div>

            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Você está offline</h1>

            <p style={{ color: "var(--text-secondary, #94a3b8)", maxWidth: 400, marginBottom: 32, lineHeight: 1.6 }}>
                A Omnisfera não conseguiu conectar à internet. O aplicativo tentará se reconectar automaticamente
                assim que a rede for restabelecida, caso a estratégia nativa detecte sua estabilidade.
            </p>

            <Button
                variant="primary"
                onClick={() => window.location.reload()}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
                <ArrowLeft size={16} /> Tentar Reconectar
            </Button>
        </div>
    );
}
