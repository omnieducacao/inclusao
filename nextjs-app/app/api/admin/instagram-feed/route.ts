import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

/**
 * GET /api/admin/instagram-feed
 * Lista todos os posts (admin only)
 */
export async function GET() {
    try {
        const session = await getSession();
        if (!session?.is_platform_admin) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const sb = getSupabase();
        const { data, error } = await sb
            .from("omnisfera_feed")
            .select("*")
            .order("position", { ascending: false })
            .order("created_at", { ascending: false });

        if (error) throw error;
        return NextResponse.json({ posts: data || [] });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        console.error("[admin/instagram-feed] GET error:", err);
        return NextResponse.json({ error: err.message || "Erro interno" }, { status: 500 });
    }
}

/**
 * POST /api/admin/instagram-feed
 * Cria novo post com upload de imagens (FormData)
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.is_platform_admin) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const formData = await req.formData();
        const title = formData.get("title") as string | null;
        const caption = formData.get("caption") as string | null;
        const category = (formData.get("category") as string) || "instagram";
        const instagramUrl = formData.get("instagram_url") as string | null;

        // Collect image files
        const imageFiles: File[] = [];
        for (let i = 0; i < 8; i++) {
            const file = formData.get(`image_${i}`) as File | null;
            if (file && file.size > 0) {
                imageFiles.push(file);
            }
        }

        if (imageFiles.length === 0) {
            return NextResponse.json({ error: "Envie pelo menos 1 imagem." }, { status: 400 });
        }

        const sb = getSupabase();

        // Upload images to storage
        const imageUrls: string[] = [];
        for (const file of imageFiles) {
            const ext = file.name.split(".").pop() || "jpg";
            const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
            const filePath = `posts/${fileName}`;

            const buffer = Buffer.from(await file.arrayBuffer());
            const { error: uploadError } = await sb.storage
                .from("omnisfera-feed")
                .upload(filePath, buffer, {
                    contentType: file.type,
                    cacheControl: "3600",
                    upsert: false,
                });

            if (uploadError) {
                console.error("[upload] Error:", uploadError);
                throw new Error(`Erro no upload: ${uploadError.message}`);
            }

            const { data: urlData } = sb.storage
                .from("omnisfera-feed")
                .getPublicUrl(filePath);

            imageUrls.push(urlData.publicUrl);
        }

        // Insert post
        const { data, error } = await sb
            .from("omnisfera_feed")
            .insert({
                title: title || null,
                caption: caption || null,
                category,
                instagram_url: instagramUrl || null,
                images: imageUrls,
                published: true,
                position: 0,
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ post: data }, { status: 201 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        console.error("[admin/instagram-feed] POST error:", err);
        return NextResponse.json({ error: err.message || "Erro interno" }, { status: 500 });
    }
}
