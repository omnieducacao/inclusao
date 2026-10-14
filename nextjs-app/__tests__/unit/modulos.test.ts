import { describe, it, expect } from "vitest";
import { permissoesDesligadas } from "@/lib/modules";

describe("Módulos da escola", () => {
  it("módulo desligado tira as permissões das telas dele", () => {
    expect(permissoesDesligadas(["pei", "paee", "hub", "diario", "avaliacao"])).toEqual([]);
    expect(permissoesDesligadas(["pei", "hub", "diario", "avaliacao"])).toEqual(["can_paee"]);
    expect(permissoesDesligadas(["paee"])).toEqual(["can_pei", "can_pei_professor", "can_hub", "can_diario", "can_avaliacao"]);
  });
});
