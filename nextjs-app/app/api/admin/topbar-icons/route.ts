import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import * as fs from "fs";
import * as path from "path";

/**
 * GET /api/admin/topbar-icons
 * Lists all available topbar Lottie icon filenames from public/lottie/topbar/.
 * Returns names prefixed with "topbar/" for use with LottieIcon component.
 * Only accessible by platform admins.
 */
export async function GET() {
    const session = await getSession();
    if (!session || !session.is_platform_admin) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    try {
        const topbarDir = path.join(process.cwd(), "public", "lottie", "topbar");

        if (!fs.existsSync(topbarDir)) {
            return NextResponse.json({ icons: [] });
        }

        const files = fs.readdirSync(topbarDir)
            .filter((f) => f.endsWith(".json"))
            .map((f) => `topbar/${f.replace(/\.json$/, "")}`)
            .sort();

        return NextResponse.json({ icons: files });
    } catch (err) {
        console.error("[topbar-icons] error:", err);
        return NextResponse.json({ icons: [] });
    }
}
