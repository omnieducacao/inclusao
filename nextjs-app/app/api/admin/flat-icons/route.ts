import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import * as fs from "fs";
import * as path from "path";
import { logger } from "@/lib/logger";

/**
 * GET /api/admin/flat-icons
 * Lists all available flat Lottie icon filenames from public/lottie/flat/.
 * Only accessible by platform admins.
 */
export async function GET() {
    const session = await getSession();
    if (!session || !session.is_platform_admin) {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    try {
        const flatDir = path.join(process.cwd(), "public", "lottie", "flat");

        if (!fs.existsSync(flatDir)) {
            return NextResponse.json({ icons: [] });
        }

        const files = fs.readdirSync(flatDir)
            .filter((f) => f.endsWith(".json"))
            .map((f) => f.replace(/\.json$/, ""))
            .sort();

        return NextResponse.json({ icons: files });
    } catch (err) {
        logger.error({ err: err }, "[flat-icons] error:");
        return NextResponse.json({ icons: [] });
    }
}
