import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import * as fs from "fs";
import * as path from "path";

/**
 * GET /api/admin/lottie-icons
 * Lists ALL available Lottie icon filenames from public/lottie/ (root + flat/ subfolder).
 * Root-level icons are returned as-is (e.g. "pei_simples").
 * Icons in flat/ are prefixed with "flat/" (e.g. "flat/wired-flat-100-price-tag-sale-hover-flutter").
 * Only accessible by platform admins.
 */
export async function GET() {
    const session = await getSession();
    if (!session || !session.is_platform_admin) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    try {
        const lottieDir = path.join(process.cwd(), "public", "lottie");
        const icons: string[] = [];

        if (!fs.existsSync(lottieDir)) {
            return NextResponse.json({ icons: [] });
        }

        // Root-level icons (e.g. pei_simples.json, dados_simples.json)
        const rootFiles = fs.readdirSync(lottieDir)
            .filter((f) => f.endsWith(".json"))
            .map((f) => f.replace(/\.json$/, ""))
            .sort();
        icons.push(...rootFiles);

        // Flat subfolder icons
        const flatDir = path.join(lottieDir, "flat");
        if (fs.existsSync(flatDir)) {
            const flatFiles = fs.readdirSync(flatDir)
                .filter((f) => f.endsWith(".json"))
                .map((f) => `flat/${f.replace(/\.json$/, "")}`)
                .sort();
            icons.push(...flatFiles);
        }

        return NextResponse.json({ icons });
    } catch (err) {
        console.error("[lottie-icons] error:", err);
        return NextResponse.json({ icons: [] });
    }
}
