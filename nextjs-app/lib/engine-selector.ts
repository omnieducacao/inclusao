import type { EngineId } from "./ai-engines";
import { getEngineError } from "./ai-engines";

/**
 * Seleciona o motor de IA apropriado com fallback automático.
 * 
 * Regras:
 * - PEI: DeepSeek (red) padrão, opções Kimi (blue) e Claude (green)
 * - PAEE: DeepSeek (red) sempre
 * - Jornada Gamificada (mapa mental): Gemini (yellow) sempre
 * - Extrair Laudo: ChatGPT (orange) sempre (sem opções)
 * - Imagens: Gemini (yellow) sempre
 * - Hub: DeepSeek (red) padrão, opções Kimi (blue) e Claude (green)
 * - Fallback: ChatGPT (orange) quando outros falharem
 */

export type ModuleType = "pei" | "paee" | "paee_mapa_mental" | "extrair_laudo" | "imagens" | "hub";

/**
 * Retorna o motor padrão para um módulo específico.
 */
export function getDefaultEngine(module: ModuleType): EngineId {
  switch (module) {
    case "pei":
    case "hub":
      return "red"; // DeepSeek
    case "paee":
      return "red"; // DeepSeek
    case "paee_mapa_mental":
    case "imagens":
      return "yellow"; // Gemini
    case "extrair_laudo":
      return "orange"; // ChatGPT
    default:
      return "red";
  }
}

/**
 * Retorna os motores disponíveis para seleção em um módulo.
 */
export function getAvailableEngines(module: ModuleType): EngineId[] {
  switch (module) {
    case "pei":
    case "hub":
      return ["red", "blue", "green"]; // DeepSeek, Kimi, Claude
    case "paee":
      return ["red"]; // Apenas DeepSeek
    case "paee_mapa_mental":
    case "imagens":
      return ["yellow"]; // Apenas Gemini
    case "extrair_laudo":
      return ["orange"]; // Apenas ChatGPT (sem opções)
    default:
      return ["red"];
  }
}

/**
 * Valida e retorna o motor a ser usado, aplicando fallback se necessário.
 */
export function selectEngine(
  module: ModuleType,
  requestedEngine?: string | null,
  fallbackToOrange = true
): { engine: EngineId; error?: string } {
  const available = getAvailableEngines(module);
  const defaultEngine = getDefaultEngine(module);

  // Se nenhum motor foi solicitado, usa o padrão
  if (!requestedEngine || requestedEngine.trim() === "") {
    const err = getEngineError(defaultEngine);
    if (err && fallbackToOrange && defaultEngine !== "orange") {
      // Fallback para ChatGPT se o motor padrão não estiver disponível
      const orangeErr = getEngineError("orange");
      if (!orangeErr) {
        return { engine: "orange" };
      }
    }
    return { engine: defaultEngine, error: err || undefined };
  }

  // Valida se o motor solicitado está disponível para o módulo
  const requested = requestedEngine.trim() as EngineId;
  if (!available.includes(requested)) {
    // Se não estiver disponível, usa o padrão
    const err = getEngineError(defaultEngine);
    if (err && fallbackToOrange && defaultEngine !== "orange") {
      const orangeErr = getEngineError("orange");
      if (!orangeErr) {
        return { engine: "orange" };
      }
    }
    return { engine: defaultEngine, error: err || undefined };
  }

  const engine = requested;
  const err = getEngineError(engine);
  
  // Se o motor solicitado não estiver disponível, tenta fallback
  if (err && fallbackToOrange && engine !== "orange") {
    const orangeErr = getEngineError("orange");
    if (!orangeErr) {
      return { engine: "orange" };
    }
  }

  return { engine, error: err || undefined };
}

/**
 * Tenta usar um motor e, se falhar, faz fallback para ChatGPT.
 */
export async function withFallback<T>(
  module: ModuleType,
  requestedEngine: string | null | undefined,
  fn: (engine: EngineId) => Promise<T>
): Promise<T> {
  const { engine, error } = selectEngine(module, requestedEngine, true);
  
  if (error && engine !== "orange") {
    // Tenta fallback para ChatGPT
    const orangeErr = getEngineError("orange");
    if (!orangeErr) {
      try {
        return await fn("orange");
      } catch {
        // Se fallback também falhar, lança erro original
        throw new Error(error);
      }
    }
    throw new Error(error);
  }

  try {
    return await fn(engine);
  } catch (err) {
    // Se falhar e não for ChatGPT, tenta fallback
    if (engine !== "orange") {
      const orangeErr = getEngineError("orange");
      if (!orangeErr) {
        try {
          return await fn("orange");
        } catch {
          // Se fallback também falhar, lança erro original
          throw err;
        }
      }
    }
    throw err;
  }
}
