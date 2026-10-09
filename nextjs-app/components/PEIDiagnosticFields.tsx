"use client";

import type React from "react";
import { AlertTriangle, Check, CheckCircle2, XCircle, FileCheck } from "lucide-react";
import type { PEIData } from "@/lib/pei";

/**
 * Campos condicionais exibidos na aba Estudante baseados no diagnóstico.
 * Quando o professor digita o diagnóstico, mostra checklist específico.
 */

type DiagnosticoProfile = {
    label: string;
    keywords: string[];
    fields: { key: string; label: string; options?: string[] }[];
};

const PERFIS_DIAGNOSTICO: DiagnosticoProfile[] = [
    {
        label: "TEA (Transtorno do Espectro Autista)",
        keywords: ["tea", "autis", "espectro autista", "asperger"],
        fields: [
            { key: "tea_nivel_suporte_dsm5", label: "Nível de Suporte DSM-5", options: ["Nível 1 — Necessita apoio", "Nível 2 — Necessita apoio substancial", "Nível 3 — Necessita apoio muito substancial"] },
            { key: "tea_comunicacao", label: "Comunicação", options: ["Verbal fluente", "Verbal com restrições", "Pouco verbal", "Não verbal", "Usa CAA (Comunicação Alternativa)"] },
            { key: "tea_sensibilidades", label: "Sensibilidades Sensoriais", options: ["Auditiva", "Visual", "Tátil", "Olfativa/Gustativa", "Vestibular", "Proprioceptiva"] },
            { key: "tea_interesses_restritos", label: "Interesses Restritos/Repetitivos", options: ["Estereotipias motoras", "Rituais/rotinas fixas", "Interesses intensamente focalizados", "Hipo/hiper-reatividade sensorial"] },
            { key: "tea_rigidez_comportamental", label: "Rigidez Comportamental", options: ["Leve — aceita mudanças com preparação", "Moderada — precisa de antecipação visual", "Severa — desregulação intensa a mudanças"] },
        ],
    },
    {
        label: "TDAH (Transtorno de Déficit de Atenção e Hiperatividade)",
        keywords: ["tdah", "déficit de atenção", "deficit de atencao", "hiperativ"],
        fields: [
            { key: "tdah_tipo", label: "Tipo Apresentação", options: ["Predominantemente Desatento", "Predominantemente Hiperativo-Impulsivo", "Combinado"] },
            { key: "tdah_manejo_medicamentoso", label: "Manejo Medicamentoso", options: ["Sem medicação", "Metilfenidato (Ritalina)", "Lisdexanfetamina (Venvanse)", "Atomoxetina (Strattera)", "Outro"] },
            { key: "tdah_momento_critico", label: "Momento Crítico no Dia", options: ["Início da manhã (pré-medicação)", "Meio da manhã", "Após almoço", "Final da tarde (efeito passando)", "Variável"] },
            { key: "tdah_estrategia_foco", label: "Estratégias de Foco que Funcionam", options: ["Fragmentar tarefas", "Timer visual", "Pausas programadas", "Lugar à frente na sala", "Fone com música calma", "Objeto fidget", "Checklist visual"] },
        ],
    },
    {
        label: "Dislexia / Transtorno de Aprendizagem",
        keywords: ["dislexia", "disortografia", "discalculia", "transtorno de aprendiz", "distúrbio de aprendiz"],
        fields: [
            { key: "ta_tipo", label: "Tipo", options: ["Dislexia (leitura)", "Disortografia (escrita)", "Discalculia (matemática)", "Dislexia + Disortografia", "Misto"] },
            { key: "ta_nivel_leitura", label: "Nível de Leitura Funcional", options: ["Não decodifica", "Decodifica com dificuldade", "Lê palavras simples", "Lê frases curtas", "Lê textos com adaptação"] },
            { key: "ta_recursos_preferenciais", label: "Recursos que Facilitam", options: ["Fonte ampliada", "Espaçamento maior", "Leitura em voz alta", "Audiobooks", "Régua de leitura", "Texto digital (TTS)", "Calculadora (discalculia)"] },
        ],
    },
    {
        label: "Deficiência Intelectual",
        keywords: ["deficiência intelectual", "deficiencia intelectual", "di ", "atraso global", "atraso cognitivo"],
        fields: [
            { key: "di_nivel", label: "Nível de Comprometimento", options: ["Leve (QI 50-69)", "Moderado (QI 35-49)", "Severo (QI 20-34)", "Profundo (QI < 20)", "Não especificado"] },
            { key: "di_autonomia_avd", label: "Autonomia em AVDs", options: ["Independente", "Supervisão em algumas atividades", "Apoio em várias atividades", "Dependência significativa"] },
            { key: "di_comunicacao", label: "Comunicação Funcional", options: ["Verbal funcional", "Verbal restrita", "Comunicação gestual", "Usa CAA", "Comunicação não convencional"] },
        ],
    },
    {
        label: "Deficiência Física / Motora",
        keywords: ["deficiência física", "deficiencia fisica", "paralisia", "cadeirante", "motor"],
        fields: [
            { key: "df_tipo", label: "Tipo", options: ["Paralisia Cerebral", "Lesão Medular", "Amputação", "Malformação congênita", "Distrofia muscular", "Outro"] },
            { key: "df_mobilidade", label: "Mobilidade", options: ["Deambula independente", "Usa órtese/prótese", "Cadeira de rodas manual", "Cadeira de rodas motorizada", "Necessita acompanhante"] },
            { key: "df_motricidade_fina", label: "Motricidade Fina", options: ["Preservada", "Parcialmente comprometida", "Significativamente comprometida", "Usa adaptações (engrossador, suporte)"] },
            { key: "df_acesso_escola", label: "Acessibilidade na Escola", options: ["Acessível", "Parcialmente acessível", "Barreiras significativas"] },
        ],
    },
    {
        label: "Deficiência Auditiva / Surdez",
        keywords: ["deficiência auditiva", "deficiencia auditiva", "surdez", "surdo", "perda auditiva", "hipoacusia"],
        fields: [
            { key: "da_tipo", label: "Tipo de Perda", options: ["Condutiva", "Neurossensorial", "Mista", "Surdez bilateral profunda"] },
            { key: "da_recurso", label: "Recurso Auditivo", options: ["AASI (aparelho auditivo)", "Implante coclear", "Sistema FM", "Sem recurso auditivo"] },
            { key: "da_comunicacao", label: "Comunicação", options: ["Libras como L1", "Libras + Português (bilíngue)", "Oralizado", "Em aquisição de Libras", "Comunicação Total"] },
            { key: "da_interprete", label: "Intérprete de Libras", options: ["Sim, disponível", "Não disponível (necessário)", "Não necessário"] },
        ],
    },
    {
        label: "Deficiência Visual",
        keywords: ["deficiência visual", "deficiencia visual", "cegueira", "baixa visão", "baixa visao"],
        fields: [
            { key: "dv_tipo", label: "Tipo", options: ["Cegueira total", "Baixa visão leve", "Baixa visão moderada", "Baixa visão severa"] },
            { key: "dv_recurso", label: "Recursos", options: ["Braille", "Material ampliado", "Lupa/amplificação", "Leitor de tela", "Alto contraste", "Audiodescrição"] },
        ],
    },
    {
        label: "Altas Habilidades / Superdotação",
        keywords: ["altas habilidades", "superdotação", "superdotacao", "ah/sd", "ahsd"],
        fields: [
            { key: "ahsd_area", label: "Área de Destaque", options: ["Acadêmico-intelectual", "Criativo-produtivo", "Liderança", "Artístico", "Psicomotor"] },
            { key: "ahsd_enriquecimento", label: "Tipo de Enriquecimento", options: ["Suplementação curricular", "Aceleração de conteúdo", "Projetos de pesquisa", "Mentoria", "Atividades extracurriculares", "Agrupamento por interesse"] },
            { key: "ahsd_desafios", label: "Desafios Observados", options: ["Tédio/desmotivação", "Dificuldade social com pares", "Perfeccionismo", "Assincronia desenvolvimento", "Dupla excepcionalidade (AH + outro diagnóstico)"] },
        ],
    },
];

/** Detecta qual(is) perfil(is) de diagnóstico se aplicam. */
function detectProfiles(diagnostico: string): DiagnosticoProfile[] {
    if (!diagnostico || diagnostico.trim().length < 2) return [];
    const lower = diagnostico.toLowerCase();
    return PERFIS_DIAGNOSTICO.filter(p =>
        p.keywords.some(kw => lower.includes(kw))
    );
}

/**
 * Componente de campos condicionais por diagnóstico.
 * Inserido na aba "Estudante" logo abaixo do campo de diagnóstico.
 */
export function DiagnosticConditionalFields({
    peiData,
    onUpdate,
}: {
    peiData: PEIData;
    onUpdate: (key: string, value: unknown) => void;
}) {
    const profiles = detectProfiles(peiData.diagnostico || "");
    if (profiles.length === 0) return null;

    const detalhes = (peiData.detalhes_diagnostico || {}) as Record<string, string | string[]>;

    return (
        <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
            {profiles.map((profile, pi) => (
                <section
                    key={profile.label}
                    className="omni-cartao omni-cartao--plano"
                    style={{ display: "grid", gap: 14, borderLeft: "4px solid var(--acao)" }}
                    aria-labelledby={`diag-perfil-${pi}`}
                >
                    <h5 id={`diag-perfil-${pi}`} style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, font: "700 15px/22px var(--font-sans)", color: "var(--tinta)" }}>
                        <FileCheck aria-hidden size={18} style={{ color: "var(--acao)", flex: "none" }} />
                        Detalhes: {profile.label}
                    </h5>
                    <div style={{ display: "grid", gap: 14 }}>
                        {profile.fields.map((field) => {
                            const value = detalhes[field.key];
                            const isMulti = field.key.includes("sensibilidades") || field.key.includes("estrategia_foco") || field.key.includes("recursos_preferenciais") || field.key.includes("interesses_restritos") || field.key.includes("desafios");

                            if (isMulti && field.options) {
                                const selected = Array.isArray(value) ? value : [];
                                return (
                                    <fieldset key={field.key} className="omni-escolhas">
                                        <legend>{field.label}</legend>
                                        {field.options.map((opt) => {
                                            const active = selected.includes(opt);
                                            return (
                                                <button
                                                    key={opt}
                                                    type="button"
                                                    aria-pressed={active}
                                                    onClick={() => {
                                                        const next = active ? selected.filter((s) => s !== opt) : [...selected, opt];
                                                        onUpdate("detalhes_diagnostico", { ...detalhes, [field.key]: next });
                                                    }}
                                                    className="omni-chip"
                                                >
                                                    <Check className="omni-chip__marca" aria-hidden />
                                                    {opt}
                                                </button>
                                            );
                                        })}
                                    </fieldset>
                                );
                            }

                            // Single select
                            if (field.options) {
                                return (
                                    <label key={field.key} className="omni-campo">
                                        <span className="omni-campo__rotulo">{field.label}</span>
                                        <select
                                            value={(typeof value === "string" ? value : "") || ""}
                                            onChange={(e) => onUpdate("detalhes_diagnostico", { ...detalhes, [field.key]: e.target.value })}
                                            className="omni-entrada"
                                        >
                                            <option value="">Escolha…</option>
                                            {field.options.map((opt) => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </label>
                                );
                            }

                            return null;
                        })}
                    </div>
                </section>
            ))}
        </div>
    );
}


/**
 * Checklist de Compliance LBI (Lei Brasileira de Inclusão).
 * Valida campos obrigatórios antes de exportar PDF oficial.
 */

type ComplianceItem = {
    label: string;
    check: (data: PEIData) => boolean;
    severity: "obrigatorio" | "recomendado";
    ref: string; // Referência legal
};

const COMPLIANCE_ITEMS: ComplianceItem[] = [
    { label: "Identificação do estudante (nome)", check: (d) => Boolean(d.nome?.trim()), severity: "obrigatorio", ref: "Art. 28 LBI" },
    { label: "Série/Ano escolar", check: (d) => Boolean(d.serie), severity: "obrigatorio", ref: "Art. 28 LBI" },
    // Onda 18: o laudo e o diagnóstico entram quando existem, mas a lei não permite exigi-los
    { label: "Diagnóstico, se houver laudo", check: (d) => Boolean(d.diagnostico?.trim()), severity: "recomendado", ref: "Art. 2º LBI · a avaliação é biopsicossocial" },
    {
        label: "Barreiras identificadas", check: (d) => {
            const b = d.barreiras_selecionadas || {};
            return Object.values(b).some(arr => Array.isArray(arr) && arr.length > 0);
        }, severity: "obrigatorio", ref: "Art. 3º LBI"
    },
    {
        label: "Estratégias pedagógicas (acesso, ensino ou avaliação)", check: (d) => {
            return (d.estrategias_acesso?.length || 0) + (d.estrategias_ensino?.length || 0) + (d.estrategias_avaliacao?.length || 0) > 0;
        }, severity: "obrigatorio", ref: "Art. 28 §II LBI"
    },
    { label: "Habilidades BNCC ou Objetivos EI selecionados", check: (d) => (Array.isArray(d.habilidades_bncc_selecionadas) && d.habilidades_bncc_selecionadas.length > 0) || (Array.isArray((d as Record<string, unknown>).bncc_ei_objetivos) && ((d as Record<string, unknown>).bncc_ei_objetivos as unknown[]).length > 0), severity: "obrigatorio", ref: "BNCC / Resolução CNE 2/2001" },
    { label: "Rede de apoio (profissionais)", check: (d) => Array.isArray(d.rede_apoio) && d.rede_apoio.length > 0, severity: "recomendado", ref: "Art. 18 LBI" },
    { label: "Potencialidades do estudante", check: (d) => Array.isArray(d.potencias) && d.potencias.length > 0, severity: "recomendado", ref: "Art. 27 LBI" },
    { label: "Monitoramento (status da meta)", check: (d) => Boolean(d.status_meta && d.status_meta !== "Não Iniciado"), severity: "recomendado", ref: "Art. 28 §V LBI" },
    { label: "Parecer geral", check: (d) => Boolean(d.parecer_geral?.trim()), severity: "recomendado", ref: "Art. 28 §V LBI" },
];

export function LBIComplianceChecklist({ peiData }: { peiData: PEIData }) {
    const results = COMPLIANCE_ITEMS.map(item => ({
        ...item,
        passed: item.check(peiData),
    }));

    const obrigatorios = results.filter(r => r.severity === "obrigatorio");
    const recomendados = results.filter(r => r.severity === "recomendado");
    const obrigatoriosPassed = obrigatorios.filter(r => r.passed).length;
    const recomendadosPassed = recomendados.filter(r => r.passed).length;
    const allObrigatoriosPassed = obrigatoriosPassed === obrigatorios.length;

    const linha: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: "var(--o-radius-sm)", background: "var(--superficie-2)", font: "400 14px/20px var(--font-sans)", color: "var(--tinta)" };
    const referencia: React.CSSProperties = { font: "500 12px/16px var(--font-mono)", color: "var(--tinta-3)" };

    return (
        <section className="omni-cartao" style={{ display: "grid", gap: 14 }} aria-labelledby="lbi-titulo">
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <h4 id="lbi-titulo" style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, font: "700 15px/22px var(--font-sans)", color: "var(--tinta)" }}>
                    <FileCheck aria-hidden size={18} style={{ color: "var(--acao)", flex: "none" }} />
                    O que a LBI (Lei Brasileira de Inclusão) pede
                </h4>
                {allObrigatoriosPassed ? (
                    <span className="omni-estado omni-estado--sucesso"><CheckCircle2 aria-hidden /> Pronto para exportar</span>
                ) : (
                    <span className="omni-estado omni-estado--atencao"><AlertTriangle aria-hidden /> Falta preencher</span>
                )}
            </div>

            {/* Obrigatórios */}
            <div>
                <p className="omni-rotulo" style={{ margin: "0 0 8px" }}>
                    Obrigatórios ({obrigatoriosPassed}/{obrigatorios.length})
                </p>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 4 }}>
                    {obrigatorios.map((item) => (
                        <li key={item.label} style={linha}>
                            {item.passed ? (
                                <CheckCircle2 aria-label="feito" size={16} style={{ color: "var(--sucesso)", flex: "none" }} />
                            ) : (
                                <XCircle aria-label="falta" size={16} style={{ color: "var(--erro)", flex: "none" }} />
                            )}
                            <span style={{ flex: 1 }}>{item.label}</span>
                            <span style={referencia}>{item.ref}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Recomendados */}
            <div>
                <p className="omni-rotulo" style={{ margin: "0 0 8px" }}>
                    Recomendados ({recomendadosPassed}/{recomendados.length})
                </p>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 4 }}>
                    {recomendados.map((item) => (
                        <li key={item.label} style={linha}>
                            {item.passed ? (
                                <CheckCircle2 aria-label="feito" size={16} style={{ color: "var(--sucesso)", flex: "none" }} />
                            ) : (
                                <AlertTriangle aria-label="falta" size={16} style={{ color: "var(--atencao)", flex: "none" }} />
                            )}
                            <span style={{ flex: 1 }}>{item.label}</span>
                            <span style={referencia}>{item.ref}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Alerta */}
            {!allObrigatoriosPassed && (
                <div className="omni-aviso omni-aviso--atencao" role="status">
                    <AlertTriangle className="omni-aviso__icone" aria-hidden />
                    <div>
                        <div className="omni-aviso__texto">
                            Preencha os itens obrigatórios antes de exportar o PDF oficial. Sem eles, o documento pode ser considerado incompleto pela Lei 13.146/2015.
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
