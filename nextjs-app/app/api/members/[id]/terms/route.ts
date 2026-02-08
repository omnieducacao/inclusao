import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.workspace_id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id } = await params;

  // Verificar se o membro pertence ao workspace do usuário
  if (session.user_role === "member" && session.member?.id !== id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const sb = getSupabase();
  const { data, error } = await sb
    .from("workspace_members")
    .select("terms_accepted")
    .eq("id", id)
    .eq("workspace_id", session.workspace_id)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar termos aceitos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar informações." },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: "Membro não encontrado." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    terms_accepted: data.terms_accepted || false,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.workspace_id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id } = await params;

  // Verificar se o membro pertence ao workspace do usuário
  if (session.user_role === "member" && session.member?.id !== id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { accepted } = body;

    if (typeof accepted !== "boolean") {
      return NextResponse.json(
        { error: "Campo 'accepted' deve ser um booleano." },
        { status: 400 }
      );
    }

    const sb = getSupabase();
    const { error } = await sb
      .from("workspace_members")
      .update({
        terms_accepted: accepted,
        terms_accepted_at: accepted ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .eq("workspace_id", session.workspace_id);

    if (error) {
      console.error("Erro ao atualizar termos aceitos:", error);
      return NextResponse.json(
        { error: "Erro ao salvar aceite dos termos." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro ao processar aceite de termos:", err);
    return NextResponse.json(
      { error: "Erro ao processar solicitação." },
      { status: 500 }
    );
  }
}
