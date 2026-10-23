/**
 * LGPD — máscara de dados pessoais e de saúde antes de qualquer texto ir para um provedor de IA.
 *
 * Cada dado achado vira um token numerado ([CPF_1], [EMAIL_1]...) e `restaurar` devolve os
 * valores originais na resposta da IA. O provedor nunca recebe o valor; o laudo transcrito
 * continua fiel para quem o lê. O mesmo valor sempre recebe o mesmo token.
 *
 * Cobre: CPF, RG, e-mail, telefone, data de nascimento, registro profissional (CRM, CRP...),
 * "Dr./Dra." + nome, nome depois de "paciente/aluno" e de "responsável/mãe/pai", e nomes informados pela rota
 * (escola, responsáveis, médicos). Nomes soltos no meio do texto só são pegos pelos três
 * últimos meios; nome do estudante continua no lib/anonymize.ts.
 */

export type MascaraPII = {
    texto: string;
    /** Devolve os valores originais no lugar dos tokens (use na resposta da IA). */
    restaurar: (texto: string) => string;
    /** Quantos dados foram mascarados, por tipo. */
    contagem: Record<string, number>;
    total: number;
};

export type OpcoesPII = {
    /** Nome da escola e outros nomes que a rota conhece: { ESCOLA: "Escola X", RESPONSAVEL: "Ana Souza" }. */
    nomes?: Record<string, string | null | undefined>;
};

// Letra maiúscula inicial de nome próprio (inclui acentos) e partículas que ficam em minúscula.
const MAIUSC = "A-ZÁÀÂÃÉÊÍÓÔÕÚÇ";
const MINUSC = "a-záàâãéêíóôõúç";
const PALAVRA_NOME = `[${MAIUSC}][${MINUSC}'’-]+`;
const PARTICULA = "(?:d[aeo]s?|e|von|van|de la)";
const NOME_PROPRIO = `${PALAVRA_NOME}(?:\\s+(?:${PARTICULA}\\s+)?${PALAVRA_NOME}){0,3}`;

type Regra = { tipo: string; re: RegExp; grupo?: number };

const REGRAS: Regra[] = [
    // CPF formatado ou só dígitos (11, sem dígito colado antes ou depois)
    { tipo: "CPF", re: /(?<!\d)\d{3}\.\d{3}\.\d{3}-\d{2}(?!\d)/g },
    { tipo: "CPF", re: /(?<![\d.,-])\d{11}(?![\d.,-])/g },
    // Cartão Nacional de Saúde (15 dígitos)
    { tipo: "CNS", re: /(?<![\d.,-])\d{15}(?![\d.,-])/g },
    // RG com a palavra RG antes
    { tipo: "RG", re: /\bR\.?G\.?\s*(?:n[ºo°.]?\s*)?[:.-]?\s*(\d{1,2}\.?\d{3}\.?\d{3}-?[\dxX]?)/gi, grupo: 1 },
    { tipo: "EMAIL", re: /[\p{L}\d._%+-]+@[\p{L}\d.-]+\.[\p{L}]{2,}/gu },
    // Telefone: (11) 91234-5678, 11 91234-5678, +55 11 91234-5678
    { tipo: "TELEFONE", re: /(?<!\d)(?:\+?55\s?)?\(\d{2}\)\s?9?\d{4}[-\s]?\d{4}(?!\d)/g },
    { tipo: "TELEFONE", re: /(?<!\d)(?:\+?55\s?)?\d{2}\s?9\d{4}[-\s]?\d{4}(?!\d)/g },
    // Data de nascimento: a data que vem junto de "nascimento", "nasc." ou "nascido(a) em"
    { tipo: "NASCIMENTO", re: /(?:data\s+de\s+nascimento|nascimento|nasc\.?|DN|nascid[oa]\s+em)[^\d\n]{0,12}(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4})/gi, grupo: 1 },
    // Registro profissional: CRM-SP 12345, CRM/SP 123456, CRP 06/12345, CRFa 2-1234
    { tipo: "REGISTRO", re: /\b(?:CRM|CRP|CRFa?|CREFITO|COREN|CRN|CRO)(?:[-/\s]?[A-Z]{2})?[\s:nº°.-]*\d{1,2}[\d./-]{2,10}\b/g },
    // Doutor(a) + nome
    { tipo: "PROFISSIONAL", re: new RegExp(`\\b(?:Dr\\.?|Dra\\.?|Doutor|Doutora)\\s+(${NOME_PROPRIO})`, "g"), grupo: 1 },
    // Nome do paciente/estudante logo depois do rótulo
    { tipo: "PACIENTE", re: new RegExp(`\\b(?:Paciente|Nome(?:\\s+completo)?|Aluno|Aluna|Estudante|Crian[çc]a)\\s*[:–-]\\s*(${NOME_PROPRIO})`, "g"), grupo: 1 },
    // Nome depois de responsável / mãe / pai / genitor / tutor
    {
        tipo: "RESPONSAVEL",
        // sem a flag i: [A-Z] precisa continuar significando "inicial maiúscula"
        re: new RegExp(`\\b(?:[Rr]espons[áa]vel(?:\\s+[Ll]egal)?|[Mm][ãa]e|[Pp]ai|[Gg]enitor[a]?|[Tt]utor[a]?|[Aa]v[óo])\\b\\s*(?:[:,-]|é|se chama|chamad[oa])\\s*(${NOME_PROPRIO})`, "g"),
        grupo: 1,
    },
];

function escaparRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export type MascaraReutilizavel = {
    /** Mascara um texto; os tokens são compartilhados entre todas as chamadas desta máscara. */
    mascarar: (texto: string) => string;
    restaurar: (texto: string) => string;
    readonly contagem: Record<string, number>;
    readonly total: number;
};

/** Uma máscara para uma conversa inteira: mensagens diferentes usam o mesmo mapa de tokens. */
export function criarMascaraPII(opcoes: OpcoesPII = {}): MascaraReutilizavel {
    const porToken = new Map<string, string>(); // token -> original
    const porValor = new Map<string, string>(); // tipo|valor -> token
    const contagem: Record<string, number> = {};
    const serial: Record<string, number> = {};

    const tokenPara = (tipo: string, valor: string): string => {
        const chave = `${tipo}|${valor.toLowerCase()}`;
        const existente = porValor.get(chave);
        if (existente) return existente;
        serial[tipo] = (serial[tipo] || 0) + 1;
        const token = `[${tipo}_${serial[tipo]}]`;
        porValor.set(chave, token);
        porToken.set(token, valor);
        contagem[tipo] = (contagem[tipo] || 0) + 1;
        return token;
    };

    // Nomes que a rota já conhece (escola, responsáveis...): mais longos primeiro
    const conhecidos = Object.entries(opcoes.nomes || {})
        .filter((e): e is [string, string] => typeof e[1] === "string" && e[1].trim().length > 3)
        .sort((a, b) => b[1].length - a[1].length);

    const mascarar = (entrada: string): string => {
        let texto = entrada;

        for (const [tipo, nome] of conhecidos) {
            const re = new RegExp(escaparRegex(nome.trim()), "gi");
            texto = texto.replace(re, (achado) => tokenPara(tipo.toUpperCase(), achado));
        }

        for (const regra of REGRAS) {
            texto = texto.replace(regra.re, (...args) => {
                const achado = args[0] as string;
                const valor = regra.grupo ? (args[regra.grupo] as string | undefined) : achado;
                if (!valor) return achado;
                const token = tokenPara(regra.tipo, valor);
                return regra.grupo ? achado.replace(valor, token) : token;
            });
        }

        // Um nome achado pelo rótulo ("Paciente: Beatriz Almeida") também aparece solto no resto do texto
        for (const tipo of ["PACIENTE", "RESPONSAVEL", "PROFISSIONAL"]) {
            for (const [token, original] of porToken) {
                if (!token.startsWith(`[${tipo}_`) || original.length < 5) continue;
                texto = texto.replace(new RegExp(escaparRegex(original), "gi"), token);
            }
        }
        return texto;
    };

    const restaurar = (resposta: string): string => {
        if (!porToken.size) return resposta;
        let saida = resposta;
        for (const [token, original] of porToken) saida = saida.split(token).join(original);
        return saida;
    };

    return {
        mascarar,
        restaurar,
        get contagem() {
            return contagem;
        },
        get total() {
            return Object.values(contagem).reduce((a, b) => a + b, 0);
        },
    };
}

/** Atalho para um texto só. */
export function mascararPII(entrada: string, opcoes: OpcoesPII = {}): MascaraPII {
    const m = criarMascaraPII(opcoes);
    const texto = m.mascarar(entrada);
    return { texto, restaurar: m.restaurar, contagem: m.contagem, total: m.total };
}
