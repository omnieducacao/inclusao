import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

/**
 * PATCH /api/admin/instagram-feed/[id]
 * Atualiza post (caption, published, position, etc.)
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await getSession();
        if (!session?.is_platform_admin) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const body = await req.json();
        const sb = getSupabase();

        const updates: Record<string, any> = {};
        if (body.title !== undefined) updates.title = body.title;
        if (body.caption !== undefined) updates.caption = body.caption;
        if (body.category !== undefined) updates.category = body.category;
        if (body.instagram_url !== undefined) updates.instagram_url = body.instagram_url;
        if (body.published !== undefined) updates.published = body.published;
        if (body.position !== undefined) updates.position = body.position;

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: "Nenhum campo para atualizar" }, { status: 400 });
        }

        const { data, error } = await sb
            .from("omnisfera_feed")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ post: data });
    } catch (err: any) {
        console.error("[admin/instagram-feed/[id]] PATCH error:", err);
        return NextResponse.json({ error: err.message || "Erro interno" }, { status: 500 });
    }
}

/**
 * DELETE /api/admin/instagram-feed/[id]
 * Remove post e imagens do Storage
 */
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await getSession();
        if (!session?.is_platform_admin) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const sb = getSupabase();

        // Get post to find image paths
        const { data: post } = await sb
            .from("omnisfera_feed")
            .select("images")
            .eq("id", id)
            .single();

        // Delete images from storage
        if (post?.images?.length) {
            const paths = post.images.map((url: string) => {
                const match = url.match(/omnisfera-feed\/(.+)$/);
                return match ? match[1] : null;
            }).filter(Boolean);

            if (paths.length > 0) {
                await sb.storage.from("omnisfera-feed").remove(paths);
            }
        }

        // Delete post
        const { error } = await sb
            .from("omnisfera_feed")
            .delete()
            .eq("id", id);

        if (error) throw error;
        return NextResponse.json({ ok: true });
    } catch (err: any) {
        console.error("[admin/instagram-feed/[id]] DELETE error:", err);
        return NextResponse.json({ error: err.message || "Erro interno" }, { status: 500 });
    }
}
