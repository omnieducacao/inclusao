import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { JORNADA } from "@/lib/jornada";
import { TUTORIAIS, videoDoTutorial } from "@/lib/tutoriais";

describe("Tutoriais dos módulos", () => {
  it("toda etapa da jornada tem passo a passo", () => {
    for (const id of Object.keys(JORNADA) as (keyof typeof TUTORIAIS)[]) {
      const t = TUTORIAIS[id];
      expect(t, id).toBeTruthy();
      expect(t.passos.length, id).toBeGreaterThan(1);
    }
  });
  it("os vídeos marcados existem em public/tutoriais", () => {
    for (const t of Object.values(TUTORIAIS)) {
      const v = videoDoTutorial(t.id);
      if (!v) continue;
      for (const f of [v.mp4, v.webm, v.capa]) expect(existsSync(path.join(process.cwd(), "public", f)), f).toBe(true);
    }
  });
});
