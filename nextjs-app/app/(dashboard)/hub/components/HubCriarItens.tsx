"use client";

import { CriarDoZero } from "./HubCriarDoZero";
import type { StudentFull, EngineId, MesaDaFerramenta } from "../hub-types";

/** Itens no padrão do INEP: texto-base, distratores com o porquê do erro e grade de correção. */
export function CriarItens({ student, engine, onEngineChange, mesa }: {
  student: StudentFull | null;
  engine: EngineId;
  onEngineChange: (e: EngineId) => void;
  mesa: MesaDaFerramenta;
}) {
  return (
    <CriarDoZero
      student={student}
      engine={engine}
      onEngineChange={onEngineChange}
      mesa={mesa}
      apiEndpoint="/api/hub/criar-itens"
      rotuloGerar="Criar itens"
      dicaGerar="Padrão do INEP: texto-base, distratores pensados e grade de correção. Demora um pouco mais."
    />
  );
}
