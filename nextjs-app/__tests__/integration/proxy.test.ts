import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from '@/proxy';
import * as rateLimitModule from '@/lib/upstash-rate-limit';

// Mocks necessários para isolar o test
vi.mock('@/lib/upstash-rate-limit', () => ({
    checkRateLimit: vi.fn(),
}));

vi.mock('jose', () => ({
    jwtVerify: vi.fn(),
}));

vi.mock('@/lib/jwt-secret', () => ({
    getSecret: vi.fn(() => new Uint8Array([1, 2, 3])),
}));

describe('Middleware Proxy - Firewall e Controle de Acesso', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve liberar rota pública /seguranca com status bypass', async () => {
        const req = new NextRequest('http://localhost/seguranca');
        const res = await proxy(req);

        // Retorno de NextResponse.next() no Next.js Server Side resulta numa resposta que possui middlewares definidos mas sem redirect explícito HTTP code (ex. 307)
        // Check for no redirect url or status 200
        expect(res.headers.get('x-middleware-rewrite') || res.status).toBeTruthy();
        expect(res.status).not.toBe(307); // Not a redirection to /login
    });

    it('deve retornar HTTP 429 Too Many Requests ao sofrer ataque em rotas de IA /api/ai-engines', async () => {
        const req = new NextRequest('http://localhost/api/ai-engines/deepseek');

        // Mockando rate limiter para falhar e dizer q não há remaining
        vi.spyOn(rateLimitModule, 'checkRateLimit').mockResolvedValue({
            success: false,
            limit: 10,
            remaining: 0,
            reset: Date.now()
        });

        const res = await proxy(req);

        expect(res.status).toBe(429);
        expect(res.headers.get('Content-Type')).toBe('application/json');

        const data = await res.json();
        expect(data.error).toBe("Too Many Requests");
        expect(data.message).toBe("Limite de operações de IA atingido. Tente novamente em um minuto.");
    });

    it('deve redirecionar usuário não autenticado querendo acessar /dashboard', async () => {
        // Rota protegida batendo sem cookies
        const req = new NextRequest('http://localhost/dashboard');
        const res = await proxy(req);

        expect(res.status).toBe(307); // Temporary Redirect in Next.js response
        expect(res.headers.get('Location')).toContain('/login?redirect=%2Fdashboard');
    });
});
