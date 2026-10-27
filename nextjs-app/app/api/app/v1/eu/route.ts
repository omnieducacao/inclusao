import { NextResponse } from "next/server";
import { pessoaDoPedido } from "@/lib/app/sessao";
import { papeisDaPessoa } from "@/lib/app/papeis";

/** Frente 6 · GET /api/app/v1/eu → quem está logado e os papéis que tem. */
export async function GET(req: Request) {
  const pessoaId = await pessoaDoPedido(req);
  if (!pessoaId) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const papeis = await papeisDaPessoa(pessoaId);
  if (!papeis) return NextResponse.json({ error: "Conta desativada." }, { status: 403 });
  return NextResponse.json(papeis);
}
