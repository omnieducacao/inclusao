import pino from 'pino';

/**
 * Omnisfera V5 Corporate Logger
 * - Development: Uses pino-pretty for standard terminal output
 * - Production: Emits structured JSON logs (NDJSON) compatible with Datadog/ELK
 */
export const logger = pino({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  transport: process.env.NODE_ENV === 'development'
    ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname,env',
        translateTime: 'SYS:standard',
      },
    }
    : undefined,
  base: {
    env: process.env.NODE_ENV,
    region: process.env.VERCEL_REGION || 'local',
  },
});
