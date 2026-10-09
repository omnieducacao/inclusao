import { readFile } from "fs/promises";
import { join } from "path";
import { siglaDoCodigo, type ComponenteOmni, type DescritorOmni } from "@/lib/matriz-omni";

/**
 * Só no servidor: lê a disciplina do disco e acha o descritor pelo código.
 * Fica fora de lib/matriz-omni.ts porque aquele arquivo também vai para o navegador
 * (Matriz Omni, ParametroItem), e o navegador não tem "fs".
 */
export async function descritorOmni(codigo: string): Promise<{ componente: string; descritor: DescritorOmni } | null> {
    const sigla = siglaDoCodigo(codigo);
    if (!sigla) return null;
    try {
        const raw = await readFile(join(process.cwd(), "data", "matriz-omni", `${sigla}.json`), "utf8");
        const comp = JSON.parse(raw) as ComponenteOmni;
        const descritor = comp.descritores.find((d) => d.codigo === codigo);
        return descritor ? { componente: comp.componente, descritor } : null;
    } catch {
        return null;
    }
}
