/**
 * SCRUM-66: regrava com a ENCRYPTION_KEY nova os campos que estão cifrados com a antiga.
 * Passo a passo e cuidados: docs/SEGREDOS.md. Quem roda é o Rodrigo, no Mac, com as chaves em
 * variáveis de ambiente (nunca como argumento, nunca em arquivo do repositório).
 *
 * Variáveis:
 *   ENCRYPTION_KEY_ANTIGA   chave que cifrou os dados até hoje (64 caracteres hex)
 *   ENCRYPTION_KEY_NOVA     chave nova (64 caracteres hex; gere com `openssl rand -hex 32`)
 *   SUPABASE_URL            URL do projeto
 *   SUPABASE_SERVICE_KEY    chave de serviço do projeto
 *
 * Uso:
 *   node scripts/recriptografar.mjs               simulação: só conta, não grava nada
 *   node scripts/recriptografar.mjs --aplicar     regrava (cada valor é conferido antes de gravar)
 *   node scripts/recriptografar.mjs --verificar   confere se tudo abre com a chave nova (não grava)
 *
 * É seguro repetir: o que já está na chave nova é pulado. O script nunca imprime valores
 * (só contagens e ids), e um valor que nenhuma das duas chaves abre é deixado como está.
 */
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";

const ALGORITMO = "aes-256-gcm";
const PREFIXO = "enc:";
const TAMANHO_PAGINA = 200;

/** Mesmos campos de lib/encryption.ts (SENSITIVE_PEI_FIELDS e SENSITIVE_PAEE_FIELDS). */
const CAMPOS_PEI = ["diagnostico", "lista_medicamentos", "historico", "orientacoes_especialistas", "orientacoes_por_profissional", "detalhes_diagnostico", "estudo_caso", "nome", "nasc", "acompanhante_nome"];
const CAMPOS_PAEE = ["conteudo_diagnostico_barreiras", "input_original_diagnostico_barreiras"];

/** Onde há dado cifrado: colunas de texto e campos dentro de colunas JSON. */
export const ALVOS = [
    { tabela: "students", colunas: ["diagnosis"], json: { pei_data: CAMPOS_PEI, paee_data: CAMPOS_PAEE } },
    { tabela: "family_medicacao_updates", colunas: ["medicamento", "dosagem", "observacao"], json: {} },
    { tabela: "family_laudos", colunas: ["transcricao"], json: {} },
    { tabela: "family_mensagens", colunas: ["texto"], json: {} },
    // lib/colunas-cifradas.ts (SCRUM-231)
    { tabela: "workspace_members", colunas: ["telefone"], json: {} },
    { tabela: "workspace_masters", colunas: ["telefone"], json: {} },
    { tabela: "family_responsibles", colunas: ["telefone"], json: {} },
];

export function chaveDeHex(hex, nome) {
    if (!/^[0-9a-fA-F]{64}$/.test(hex || "")) throw new Error(`${nome} deve ter 64 caracteres hex (32 bytes).`);
    return Buffer.from(hex, "hex");
}

function abrir(valor, chave) {
    const partes = valor.slice(PREFIXO.length).split(":");
    if (partes.length !== 3) throw new Error("formato inválido");
    const [iv, tag, texto] = partes;
    const d = createDecipheriv(ALGORITMO, chave, Buffer.from(iv, "base64"), { authTagLength: 16 });
    d.setAuthTag(Buffer.from(tag, "base64"));
    return d.update(texto, "base64", "utf8") + d.final("utf8");
}

function cifrar(texto, chave) {
    const iv = randomBytes(12);
    const c = createCipheriv(ALGORITMO, chave, iv, { authTagLength: 16 });
    const cifrado = c.update(texto, "utf8", "base64") + c.final("base64");
    return `${PREFIXO}${iv.toString("base64")}:${c.getAuthTag().toString("base64")}:${cifrado}`;
}

/**
 * Situação de um valor: "texto_plano" (não é cifrado, fica como está), "recifrado" (abria com a
 * chave antiga; novo valor em `valor`), "ja_na_nova" (já abre com a nova) ou "desconhecida"
 * (nenhuma das duas abre: não mexe).
 */
export function recifrarCampo(valor, chaveAntiga, chaveNova) {
    if (typeof valor !== "string" || !valor.startsWith(PREFIXO)) return { estado: "texto_plano", valor };
    let claro;
    try {
        claro = abrir(valor, chaveAntiga);
    } catch {
        try {
            abrir(valor, chaveNova);
            return { estado: "ja_na_nova", valor };
        } catch {
            return { estado: "desconhecida", valor };
        }
    }
    const novo = cifrar(claro, chaveNova);
    if (abrir(novo, chaveNova) !== claro) throw new Error("conferência falhou: o valor novo não abre igual");
    return { estado: "recifrado", valor: novo };
}

/** Calcula o que mudar numa linha. Devolve { mudancas, contagem } sem tocar no banco. */
export function recifrarLinha(alvo, linha, chaveAntiga, chaveNova) {
    const mudancas = {};
    const contagem = { recifrado: 0, ja_na_nova: 0, desconhecida: 0, texto_plano: 0 };
    const contar = (r) => {
        contagem[r.estado] += 1;
        return r;
    };

    for (const coluna of alvo.colunas) {
        if (linha[coluna] === null || linha[coluna] === undefined) continue;
        const r = contar(recifrarCampo(linha[coluna], chaveAntiga, chaveNova));
        if (r.estado === "recifrado") mudancas[coluna] = r.valor;
    }
    for (const [coluna, campos] of Object.entries(alvo.json)) {
        const objeto = linha[coluna];
        if (!objeto || typeof objeto !== "object") continue;
        let mudou = false;
        const nivel = (obj) => {
            const copia = { ...obj };
            for (const campo of campos) {
                if (copia[campo] === null || copia[campo] === undefined) continue;
                const r = contar(recifrarCampo(copia[campo], chaveAntiga, chaveNova));
                if (r.estado === "recifrado") {
                    copia[campo] = r.valor;
                    mudou = true;
                }
            }
            return copia;
        };
        const copia = nivel(objeto);
        // cópias do PEI no histórico de versões (_versions[].snapshot) levam os mesmos campos
        if (Array.isArray(copia._versions)) {
            copia._versions = copia._versions.map((v) =>
                v && typeof v === "object" && v.snapshot && typeof v.snapshot === "object" ? { ...v, snapshot: nivel(v.snapshot) } : v);
        }
        if (mudou) mudancas[coluna] = copia;
    }
    return { mudancas, contagem };
}

function somar(total, parcial) {
    for (const k of Object.keys(total)) total[k] += parcial[k] || 0;
}

function colunasDoAlvo(alvo) {
    return ["id", ...alvo.colunas, ...Object.keys(alvo.json)].join(",");
}

/**
 * Percorre as tabelas. `sb` é um cliente do supabase-js (ou algo com a mesma interface).
 * modo: "simular" (só conta), "aplicar" (grava) ou "verificar" (só confere com a chave nova).
 */
export async function executar({ sb, chaveAntiga, chaveNova, modo = "simular", log = console.log }) {
    const resumo = {};
    let erros = 0;

    for (const alvo of ALVOS) {
        const total = { recifrado: 0, ja_na_nova: 0, desconhecida: 0, texto_plano: 0 };
        let linhas = 0;
        let gravadas = 0;

        for (let de = 0; ; de += TAMANHO_PAGINA) {
            const { data, error } = await sb.from(alvo.tabela).select(colunasDoAlvo(alvo)).order("id").range(de, de + TAMANHO_PAGINA - 1);
            if (error) {
                log(`ERRO ao ler ${alvo.tabela}: ${error.message}`);
                erros += 1;
                break;
            }
            if (!data || data.length === 0) break;

            for (const linha of data) {
                linhas += 1;
                // "verificar": sem chave antiga (null), então só conta o que abre com a nova ("ja_na_nova")
                // e o que não abre ("desconhecida"); nunca há o que regravar
                const { mudancas, contagem } = recifrarLinha(alvo, linha, modo === "verificar" ? null : chaveAntiga, chaveNova);
                somar(total, contagem);

                if (modo === "aplicar" && Object.keys(mudancas).length > 0) {
                    const { error: erroGravar } = await sb.from(alvo.tabela).update(mudancas).eq("id", linha.id);
                    if (erroGravar) {
                        log(`ERRO ao gravar ${alvo.tabela} id=${linha.id}: ${erroGravar.message}`);
                        erros += 1;
                    } else {
                        gravadas += 1;
                    }
                }
            }
            if (data.length < TAMANHO_PAGINA) break;
        }

        resumo[alvo.tabela] = { linhas, ...total, gravadas };
        log(
            `${alvo.tabela}: ${linhas} linhas | a recifrar: ${total.recifrado} | já na chave nova: ${total.ja_na_nova} | ` +
            `não abre com nenhuma: ${total.desconhecida} | texto plano: ${total.texto_plano}` +
            (modo === "aplicar" ? ` | linhas gravadas: ${gravadas}` : "")
        );
    }
    return { resumo, erros };
}

async function principal() {
    const argumentos = process.argv.slice(2);
    const modo = argumentos.includes("--aplicar") ? "aplicar" : argumentos.includes("--verificar") ? "verificar" : "simular";

    const chaveAntiga = chaveDeHex(process.env.ENCRYPTION_KEY_ANTIGA, "ENCRYPTION_KEY_ANTIGA");
    const chaveNova = chaveDeHex(process.env.ENCRYPTION_KEY_NOVA, "ENCRYPTION_KEY_NOVA");
    if (chaveAntiga.equals(chaveNova)) throw new Error("A chave nova é igual à antiga.");

    const url = process.env.SUPABASE_URL;
    const servico = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !servico) throw new Error("Defina SUPABASE_URL e SUPABASE_SERVICE_KEY.");

    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(url, servico);

    console.log(modo === "aplicar" ? "MODO: aplicar (grava no banco)" : modo === "verificar" ? "MODO: verificar (não grava)" : "MODO: simulação (não grava; use --aplicar para gravar)");
    const { erros, resumo } = await executar({ sb, chaveAntiga, chaveNova, modo });

    if (modo === "verificar") {
        const naoAbrem = Object.values(resumo).reduce((n, t) => n + t.desconhecida, 0);
        console.log(naoAbrem === 0 && erros === 0 ? "OK: todo valor cifrado abre com a chave nova." : `ATENÇÃO: ${naoAbrem} valor(es) não abrem com a chave nova (veja 'não abre com nenhuma').`);
        if (naoAbrem > 0) process.exitCode = 1;
    }
    if (erros > 0) process.exitCode = 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    principal().catch((e) => {
        console.error("Falhou:", e.message);
        process.exit(1);
    });
}
