/**
 * Logger estruturado simples para Omnisfera
 * Usa console no client, pode ser extendido para Winston/Pino no servidor
 */

const isProd = process.env.NODE_ENV === 'production';
const isClient = typeof window !== 'undefined';

// Em produção no cliente, não loga nada (exceto erros)
// Em desenvolvimento, loga normalmente
const shouldLog = !isProd || !isClient;

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => {
    if (shouldLog && process.env.DEBUG === 'true') {
      console.debug(`[DEBUG] ${message}`, meta);
    }
  },
  
  info: (message: string, meta?: Record<string, unknown>) => {
    if (shouldLog) {
      console.info(`[INFO] ${message}`, meta);
    }
  },
  
  warn: (message: string, meta?: Record<string, unknown>) => {
    if (shouldLog) {
      console.warn(`[WARN] ${message}`, meta);
    }
  },
  
  error: (message: string, meta?: Record<string, unknown>) => {
    // Erros sempre logam, mesmo em produção no cliente
    console.error(`[ERROR] ${message}`, meta);
  },
};

export default logger;
