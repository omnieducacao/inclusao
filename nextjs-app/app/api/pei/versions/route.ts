import { parseBody, peiVersionCreateSchema } from "@/lib/validation";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

/**
 * GET /api/pei/versions?studentId=xxx
 * Returns the list of PEI version snapshots for a student.
 * Snapshots are stored in the student's pei_data._versions array.
 *
 * POST /api/pei/versions
 * Creates a new version snapshot from the current pei_data.
 *
 * PATCH /api/pei/versions
 * Restores a specific version by its index.
 */

type VersionEntry = {
    version: number;
    timestamp: string;
    label: string;
    snapshot: Record<string, unknown>;
};

export async function GET(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const url = new URL(req.url);
    const studentId = url.searchParams.get("studentId");
    if (!studentId) {
        return NextResponse.json({ error: "studentId obrigatório" }, { status: 400 });
    }

    const sb = getSupabase();
    const { data } = await sb
        .from("students")
        .select("pei_data")
        .eq("id", studentId)
        .eq("workspace_id", session.workspace_id)
        .single();

    const peiData = (data?.pei_data || {}) as Record<string, unknown>;
    const versions = (peiData._versions || []) as VersionEntry[];

    // Return versions without the full snapshots (to keep response small)
    const summaries = versions.map((v) => ({
        version: v.version,
        timestamp: v.timestamp,
        label: v.label,
        // Include a preview of key fields
        preview: {
            diagnostico: (v.snapshot.diagnostico as string)?.substring(0, 80) || "",
            hiperfoco: (v.snapshot.hiperfoco as string)?.substring(0, 60) || "",
            has_ia_sugestao: !!v.snapshot.ia_sugestao,
            has_mapa_mental: !!v.snapshot.mapa_mental,
        },
    }));

    return NextResponse.json({ versions: summaries, total: versions.length });
}

export async function POST(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const parsed = await parseBody(req, peiVersionCreateSchema);
    if (parsed.error) return parsed.error;
    const body = parsed.data;
    const { studentId, label } = body;
    if (!studentId) {
        return NextResponse.json({ error: "studentId obrigatório" }, { status: 400 });
    }

    const sb = getSupabase();
    const { data } = await sb
        .from("students")
        .select("pei_data")
        .eq("id", studentId)
        .eq("workspace_id", session.workspace_id)
        .single();

    if (!data) {
        return NextResponse.json({ error: "Estudante não encontrado" }, { status: 404 });
    }

    const peiData = (data.pei_data || {}) as Record<string, unknown>;
    const versions = (peiData._versions || []) as VersionEntry[];

    // Create snapshot (excluding _versions from snapshot to avoid nesting)
    const { _versions: _, ...snapshotData } = peiData;

    const newVersion: VersionEntry = {
        version: versions.length + 1,
        timestamp: new Date().toISOString(),
        label: label || `Versão ${versions.length + 1}`,
        snapshot: snapshotData,
    };

    // Keep max 20 versions
    const updatedVersions = [...versions, newVersion].slice(-20);
    const updatedPeiData = { ...peiData, _versions: updatedVersions };

    const { error } = await sb
        .from("students")
        .update({ pei_data: updatedPeiData })
        .eq("id", studentId)
        .eq("workspace_id", session.workspace_id);

    if (error) {
        console.error("Erro ao salvar versão:", error);
        return NextResponse.json({ error: "Erro ao salvar versão" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, version: newVersion.version });
}

export async function PATCH(req: Request) {
    const session = await getSession();
    if (!session?.workspace_id) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { studentId, versionIndex } = body;
    if (!studentId || versionIndex === undefined) {
        return NextResponse.json({ error: "studentId e versionIndex obrigatórios" }, { status: 400 });
    }

    const sb = getSupabase();
    const { data } = await sb
        .from("students")
        .select("pei_data")
        .eq("id", studentId)
        .eq("workspace_id", session.workspace_id)
        .single();

    if (!data) {
        return NextResponse.json({ error: "Estudante não encontrado" }, { status: 404 });
    }

    const peiData = (data.pei_data || {}) as Record<string, unknown>;
    const versions = (peiData._versions || []) as VersionEntry[];

    if (versionIndex < 0 || versionIndex >= versions.length) {
        return NextResponse.json({ error: "Versão inválida" }, { status: 400 });
    }

    const target = versions[versionIndex];
    // Restore the snapshot, keeping the version history
    const restoredData = { ...target.snapshot, _versions: versions };

    const { error } = await sb
        .from("students")
        .update({ pei_data: restoredData })
        .eq("id", studentId)
        .eq("workspace_id", session.workspace_id);

    if (error) {
        console.error("Erro ao restaurar versão:", error);
        return NextResponse.json({ error: "Erro ao restaurar versão" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, restored: target.version });
}
