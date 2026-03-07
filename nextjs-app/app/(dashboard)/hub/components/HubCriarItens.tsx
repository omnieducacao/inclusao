"use client";

import { GraduationCap } from "lucide-react";
import { CriarDoZero } from "./HubCriarDoZero";
import type { HubToolProps } from "../hub-types";

export function CriarItens({
  student,
  engine,
  onEngineChange,
  onClose,
}: HubToolProps) {
  return (
    <CriarDoZero
      student={student}
      engine={engine}
      onEngineChange={onEngineChange}
      onClose={onClose}
      apiEndpoint="/api/hub/criar-itens"
      label="Criar Itens (Avançado)"
      infoBanner={
        <div className="px-4 py-3 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-sm">
          <GraduationCap className="w-4 h-4 inline mr-2" />
          <strong>Modo Avançado (INEP/BNI)</strong> — Gera itens com texto-base obrigatório, distratores com diagnóstico de erro e grade de correção para discursivas. Mais completo, porém pode levar mais tempo para gerar.
        </div>
      }
    />
  );
}
