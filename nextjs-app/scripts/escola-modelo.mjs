// SCRUM-275 · Colégio Modelo. Uso e cuidados em scripts/escola-modelo/criar.ts.
import { createJiti } from "jiti";
import { fileURLToPath } from "node:url";
import path from "node:path";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jiti = createJiti(import.meta.url, { alias: { "@": raiz } });
const { main } = await jiti.import("./escola-modelo/criar.ts");
try {
  await main(process.argv.slice(2));
} catch (erro) {
  console.error(`\nParou: ${erro instanceof Error ? erro.message : erro}`);
  console.error("Se a escola chegou a ser criada pela metade, rode com --apagar e tente de novo.");
  process.exit(1);
}
