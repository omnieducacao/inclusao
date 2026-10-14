"use client";

/**
 * Leva para as telas do cliente só o "pode ou não pode" de cada módulo (nada da sessão em si),
 * calculado no layout do servidor com a mesma regra do menu (lib/navegacao.ts).
 */
import { createContext, useContext } from "react";
import type { Permissao } from "@/lib/jornada";

export type MapaPermissoes = Partial<Record<Permissao, boolean>>;

const Ctx = createContext<MapaPermissoes>({});

export function PermissoesProvider({ pode, children }: { pode: MapaPermissoes; children: React.ReactNode }) {
  return <Ctx.Provider value={pode}>{children}</Ctx.Provider>;
}

export function usePermissoes(): MapaPermissoes {
  return useContext(Ctx);
}
