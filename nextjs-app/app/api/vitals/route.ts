import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Evitar logs excessivos em dev local, mas manter API funcionando
        if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_REPORT_VITALS_DEV) {
            return NextResponse.json({ success: true, message: "Ignored in dev" });
        }

        const sb = getSupabase();

        // Tenta salvar usando uma tabela web_vitals caso exista
        // Se ela não existir, não deve quebrar a API, servimos silenciosamente
        const res = await sb.from("web_vitals").insert({
            id: body.id,
            name: body.name,
            value: parseFloat(body.value),
            path: body.path,
            timestamp: body.timestamp || new Date().toISOString()
        });

        if (res.error) {
            // Em caso de erro (tabela não existente), podemos tratar sutilmente
            // Apenas emitir log, sem travar o Next client beacon
            logger.warn({ err: res.error.message }, "API Vitals falhou ao persistir DB (tabela inexistente ou sem permissão):");
        }

        return NextResponse.json({ success: true });
    } catch {
        // Fallback silencioso para não interromper navegação do usuário
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
