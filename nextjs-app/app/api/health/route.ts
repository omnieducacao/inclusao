/**
 * Health Check — GET /api/health (público)
 *
 * Usado pelo Render e por monitores. Onda 1: passou a ser público (antes redirecionava para o
 * login) e mostra só o essencial — sem mensagens de erro do banco nem detalhes do servidor.
 * Como faz uma consulta leve ao banco, chamá-lo de tempos em tempos também evita que o
 * Supabase do plano gratuito pause por falta de uso.
 */
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  const inicio = Date.now();
  let banco: "ok" | "erro" = "ok";
  try {
    const { error } = await getSupabase().from("workspaces").select("id").limit(1);
    if (error) {
      banco = "erro";
      logger.error({ err: error.message }, "health: banco respondeu com erro");
    }
  } catch (err) {
    banco = "erro";
    logger.error({ err }, "health: banco inacessível");
  }

  return NextResponse.json(
    { status: banco === "ok" ? "healthy" : "unhealthy", banco, ms: Date.now() - inicio },
    { status: banco === "ok" ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}

// HEAD para checagens leves (sem tocar no banco)
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
