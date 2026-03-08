"use client";

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitalsReporter() {
    useReportWebVitals((metric) => {
        // Em desenvolvimento, só reportamos se a flag explícita estiver ligada
        if (process.env.NODE_ENV !== 'production' && !process.env.NEXT_PUBLIC_REPORT_VITALS_DEV) {
            return;
        }

        const body = JSON.stringify({
            id: metric.id,
            name: metric.name,
            value: metric.value.toString(),
            label: "web-vital",
            path: window.location.pathname,
            timestamp: new Date().toISOString()
        });

        if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/vitals', body);
        } else {
            fetch('/api/vitals', {
                method: 'POST',
                body,
                keepalive: true,
                headers: { 'Content-Type': 'application/json' }
            }).catch(() => { });
        }
    });

    return null;
}
