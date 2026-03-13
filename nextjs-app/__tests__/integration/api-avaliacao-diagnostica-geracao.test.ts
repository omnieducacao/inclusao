import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as criarItemPost } from '@/app/api/avaliacao-diagnostica/criar-item/route';
import { POST as resultadoQualitativoPost } from '@/app/api/avaliacao-diagnostica/resultado-qualitativo/route';
import { POST as perfilFuncionamentoPost } from '@/app/api/avaliacao-diagnostica/perfil-funcionamento/route';
import { POST as estrategiasPraticasPost } from '@/app/api/avaliacao-diagnostica/estrategias-praticas/route';
import { requireAuth } from '@/lib/permissions';
import { chatCompletionText, chatCompletionJson } from '@/lib/ai-engines';

// Mocks
vi.mock('@/lib/permissions', () => ({
    requireAuth: vi.fn(),
}));

vi.mock('@/lib/session', () => ({
    getSession: vi.fn(() => Promise.resolve({ workspace_id: 'ws-1', user_id: 'user-1' })),
}));

vi.mock('@/lib/ai-engines', () => ({
    chatCompletionText: vi.fn(),
    chatCompletionJson: vi.fn(),
    getEngineError: vi.fn(() => null),
    getEngineErrorWithWorkspace: vi.fn(() => Promise.resolve(null)),
}));

vi.mock('@/lib/rate-limit', () => ({
    rateLimitResponse: vi.fn(() => null),
    RATE_LIMITS: { AI_GENERATION: {} },
}));

describe('API Avaliação Diagnóstica > Geração Progressiva e Análises', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (requireAuth as any).mockResolvedValue({
            session: { workspace_id: 'ws-1', user_id: 'user-1' }
        });
    });

    describe('POST /api/avaliacao-diagnostica/criar-item', () => {
        it('retorna 400 se faltar disciplina e habilidade', async () => {
            const req = new Request('http://localhost/api/avaliacao-diagnostica/criar-item', {
                method: 'POST',
                body: JSON.stringify({ serie: '6º Ano' }), // Faltando disciplina e habilidade
            });

            const res = await criarItemPost(req);
            expect(res.status).toBe(400);

            const data = await res.json();
            // Correção da asserção com base na implementação real
            expect(data.error).toBe('Informe uma habilidade ou disciplina.');
        });

        it('gera um item com sucesso (paginação 1 a 1)', async () => {
            const mockResponse = JSON.stringify({
                habilidade_bncc_ref: 'EF06MA01',
                enunciado: 'Resolva a equação...',
                gabarito: 'A',
                alternativas: { 'A': '10', 'B': '20' }
            });

            (chatCompletionText as any).mockResolvedValueOnce(mockResponse);

            const req = new Request('http://localhost/api/avaliacao-diagnostica/criar-item', {
                method: 'POST',
                body: JSON.stringify({
                    disciplina: 'Matemática',
                    serie: '6º Ano',
                    numero_questao: 1,
                    habilidade_alvo: { codigo: 'EF06MA01', habilidade: 'Ler números' }
                }),
            });

            const res = await criarItemPost(req);
            expect(res.status).toBe(200);

            const data = await res.json();
            // Verificando de acordo com o JSON mockado
            expect(data.questao).toBeDefined();
            expect(data.questao.gabarito).toBe('A');
        });
    });

    describe('POST /api/avaliacao-diagnostica/resultado-qualitativo', () => {
        it('gera análise qualitativa das respostas', async () => {
            const mockJson = {
                resumo_geral: 'Estudante com bom domínio matemático',
                grupo_sugerido: 'avancado',
                mapa_competencias: { dominadas: ['EF06MA01'] }
            };

            (chatCompletionJson as any).mockResolvedValueOnce(mockJson);

            const req = new Request('http://localhost/api/avaliacao-diagnostica/resultado-qualitativo', {
                method: 'POST',
                body: JSON.stringify({
                    nome_aluno: 'Felipe',
                    disciplina: 'Matemática',
                    questoes: [{ id: 'Q1', habilidade_bncc_ref: 'EF06MA01', gabarito: 'A' }],
                    respostas: { 'Q1': 'A' }
                }),
            });

            const res = await resultadoQualitativoPost(req);
            expect(res.status).toBe(200);

            const data = await res.json();
            // Asserção consertada ("avancado")
            expect(data.resultado.grupo_sugerido).toBe('avancado');
        });
    });

    describe('POST /api/avaliacao-diagnostica/perfil-funcionamento', () => {
        it('gera perfil de funcionamento NEE', async () => {
            const mockJson = {
                perfil_cognitivo: 'Dificuldade de atenção.',
                areas_forca: ['Comunicação visual']
            };

            (chatCompletionText as any).mockResolvedValueOnce(JSON.stringify(mockJson));
            // getEngineErrorWithWorkspace calls getEngineError in the codebase 

            const req = new Request('http://localhost/api/avaliacao-diagnostica/perfil-funcionamento', {
                method: 'POST',
                body: JSON.stringify({
                    nome: 'Ana',
                    serie: '5º Ano',
                    diagnostico: 'TDAH',
                    dimensoes_avaliadas: [{ dimensao: 'Atenção', nivel_observado: 1 }]
                }),
            });

            const res = await perfilFuncionamentoPost(req);
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data.perfil.areas_forca).toContain('Comunicação visual');
        });
    });

    describe('POST /api/avaliacao-diagnostica/estrategias-praticas', () => {
        it('gera relatório de estratégias inclusivas', async () => {
            const mockJson = {
                recomendacoes_gerais: ['Usar mapas mentais'],
                adaptacao_avaliacoes: 'Tempo extra de 30 minutos'
            };

            (chatCompletionText as any).mockResolvedValueOnce(JSON.stringify(mockJson));

            const req = new Request('http://localhost/api/avaliacao-diagnostica/estrategias-praticas', {
                method: 'POST',
                body: JSON.stringify({
                    nome: 'Ana',
                    serie: '5º Ano',
                    diagnostico: 'TDAH',
                    dimensoes_com_dificuldade: [{ dimensao: 'Atenção', nivel: 1, observacao: 'Dispersa' }]
                }),
            });

            const res = await estrategiasPraticasPost(req);
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data.estrategias.recomendacoes_gerais).toContain('Usar mapas mentais');
        });
    });
});
