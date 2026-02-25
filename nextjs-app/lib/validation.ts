import { NextResponse } from "next/server";
import { z, ZodError, ZodSchema } from "zod";

/**
 * Parse and validate a JSON request body against a Zod schema.
 * Returns the validated data or a 400 error response.
 * 
 * Usage:
 *   const result = await parseBody(req, mySchema);
 *   if (result.error) return result.error;
 *   const data = result.data; // fully typed
 */
export async function parseBody<T>(
    req: Request,
    schema: ZodSchema<T>
): Promise<{ data: T; error?: never } | { data?: never; error: NextResponse }> {
    let raw: unknown;
    try {
        raw = await req.json();
    } catch {
        return {
            error: NextResponse.json(
                { error: "Payload inválido. Envie um JSON válido." },
                { status: 400 }
            ),
        };
    }

    const result = schema.safeParse(raw);
    if (!result.success) {
        const issues = result.error.issues
            .slice(0, 5)
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; ");
        return {
            error: NextResponse.json(
                { error: `Dados inválidos: ${issues}` },
                { status: 400 }
            ),
        };
    }

    return { data: result.data };
}

// ==========================================
// Reusable field schemas
// ==========================================

/** Trimmed non-empty string */
export const nonEmpty = z.string().trim().min(1, "Campo obrigatório");

/** Optional trimmed string */
export const optStr = z.string().trim().optional().default("");

/** Valid AI engine ID */
export const engineId = z
    .enum(["red", "blue", "green", "yellow", "orange"])
    .optional()
    .default("red");

/** Email validation */
export const email = z.string().trim().email("Email inválido").toLowerCase();

/** Password with minimum length */
export const password = z.string().min(4, "Senha deve ter pelo menos 4 caracteres");

// ==========================================
// Auth Schemas
// ==========================================

export const loginSchema = z.object({
    email: email,
    password: password,
});

export const adminLoginSchema = z.object({
    email: email,
    password: password,
});

// ==========================================
// Student Schemas
// ==========================================

export const createStudentSchema = z.object({
    name: nonEmpty,
    grade: optStr,
    class_group: optStr,
    diagnosis: optStr,
    pei_data: z.record(z.string(), z.unknown()).optional().nullable(),
});

export const updateStudentSchema = z.object({
    name: z.string().trim().optional(),
    grade: z.string().trim().optional().nullable(),
    class_group: z.string().trim().optional().nullable(),
    diagnosis: z.string().trim().optional().nullable(),
});

// ==========================================
// Member Schemas
// ==========================================

export const createMemberSchema = z.object({
    action: z.literal("create_master").optional(),
    nome: nonEmpty,
    email: email,
    password: password,
    telefone: optStr,
    cargo: optStr,
    can_estudantes: z.boolean().optional().default(false),
    can_pei: z.boolean().optional().default(false),
    can_pei_professor: z.boolean().optional().default(false),
    can_paee: z.boolean().optional().default(false),
    can_hub: z.boolean().optional().default(false),
    can_diario: z.boolean().optional().default(false),
    can_avaliacao: z.boolean().optional().default(false),
    can_gestao: z.boolean().optional().default(false),
    link_type: z.string().optional().default("todos"),
    teacher_assignments: z.any().optional(),
    student_ids: z.array(z.string()).optional(),
});

// ==========================================
// Hub / AI Generation Schemas
// ==========================================

export const criarAtividadeSchema = z.object({
    assunto: z.string().trim().optional().default(""),
    engine: engineId,
    habilidades: z.array(z.string()).optional().default([]),
    ei_mode: z.boolean().optional().default(false),
    ei_idade: z.string().optional(),
    ei_campo: z.string().optional(),
    ei_objetivos: z.array(z.string()).optional(),
    estudante: z.object({
        nome: z.string().optional(),
        serie: z.string().optional(),
        hiperfoco: z.string().optional(),
        perfil: z.string().optional(),
        ia_sugestao: z.string().optional(),
    }).optional(),
    verbos_bloom: z.array(z.string()).optional(),
    qtd_questoes: z.number().int().min(1).max(20).optional(),
    tipo_questao: z.enum(["Objetiva", "Discursiva"]).optional(),
    qtd_imagens: z.number().int().min(0).max(5).optional(),
    checklist_adaptacao: z.record(z.string(), z.boolean()).optional(),
});

export const planoAulaSchema = z.object({
    assunto: z.string().optional().default(""),
    engine: engineId,
    serie: z.string().optional().default(""),
    duracao: z.string().optional().default(""),
    duracao_minutos: z.number().optional(),
    materia: z.string().optional(),
    metodologia: z.string().optional().default(""),
    objetivo: z.string().optional().default(""),
    habilidades: z.array(z.string()).optional().default([]),
    habilidades_bncc: z.array(z.string()).optional(),
    unidade_tematica: z.string().optional(),
    objeto_conhecimento: z.string().optional(),
    qtd_alunos: z.number().optional(),
    tecnica: z.string().optional(),
    recursos: z.array(z.string()).optional(),
    estudante: z.object({
        nome: z.string().optional(),
        serie: z.string().optional(),
        hiperfoco: z.string().optional(),
        perfil: z.string().optional(),
        ia_sugestao: z.string().optional(),
    }).optional(),
}).passthrough();

export const adaptarAtividadeSchema = z.object({
    texto: z.string().min(1, "Texto da atividade é obrigatório"),
    engine: engineId,
    estudante: z.object({
        nome: z.string().optional(),
        serie: z.string().optional(),
        diagnostico: z.string().optional(),
        hiperfoco: z.string().optional(),
    }).optional(),
    checklist_adaptacao: z.record(z.string(), z.boolean()).optional(),
});

// ==========================================
// PEI Schemas
// ==========================================

export const peiConsultoriaSchema = z.object({
    engine: engineId,
    modo_pratico: z.boolean().optional().default(false),
    feedback: z.string().optional(),
    peiData: z.record(z.string(), z.unknown()).optional(),
    // Allow passthrough for PEI data fields
}).passthrough();

// ==========================================
// PAEE Schemas
// ==========================================

export const diagnosticoBarreirasSchema = z.object({
    observacoes: nonEmpty,
    studentId: z.string().optional(),
    studentName: nonEmpty,
    diagnosis: z.string().optional().default(""),
    contextoPei: z.string().optional().default(""),
    feedback: z.string().optional(),
    engine: engineId,
});

export const planoHabilidadesSchema = z.object({
    focoTreino: z.string().optional().default(""),
    studentId: z.string().optional(),
    studentName: z.string().optional().default(""),
    contextoPei: z.string().optional().default(""),
    feedback: z.string().optional(),
    engine: engineId,
}).passthrough();

// ==========================================
// School Schemas
// ==========================================

export const createClassSchema = z.object({
    school_year_id: nonEmpty,
    grade_id: nonEmpty,
    class_group: z.string().optional().default("A"),
});

// ==========================================
// Monitoring Schemas
// ==========================================

export const assessmentSchema = z.object({
    student_id: nonEmpty,
    rubric_data: z.record(z.string(), z.string()).optional().default({}),
    observation: z.string().optional().nullable(),
});

// ==========================================
// Hub — remaining AI tools
// ==========================================

const estudanteField = z.object({
    nome: z.string().optional(),
    serie: z.string().optional(),
    diagnostico: z.string().optional(),
    hiperfoco: z.string().optional(),
    ia_sugestao: z.string().optional(),
    perfil: z.string().optional(),
}).optional();

export const hubAdaptarProvaSchema = z.object({
    texto: z.string().min(1, "Texto da prova é obrigatório"),
    engine: engineId,
    estudante: estudanteField,
    checklist_adaptacao: z.record(z.string(), z.boolean()).optional(),
}).passthrough();

export const hubRoteiroSchema = z.object({
    materia: z.string().optional().default("Geral"),
    assunto: z.string().optional().default(""),
    engine: engineId,
    aluno: z.any().optional(),
    ano: z.string().optional(),
    unidade_tematica: z.string().optional(),
    objeto_conhecimento: z.string().optional(),
    habilidades_bncc: z.array(z.string()).optional(),
}).passthrough();

export const hubDinamicaSchema = z.object({
    materia: z.string().optional().default("Geral"),
    assunto: z.string().optional().default(""),
    engine: engineId,
    aluno: z.any().optional(),
    qtd_alunos: z.number().optional().default(25),
    caracteristicas_turma: z.string().optional().default(""),
    ano: z.string().optional(),
    unidade_tematica: z.string().optional(),
    objeto_conhecimento: z.string().optional(),
    habilidades_bncc: z.array(z.string()).optional(),
}).passthrough();

export const hubInclusaoBrincarSchema = z.object({
    engine: engineId,
    aluno: z.any().optional(),
    estudante: estudanteField,
    tema: z.string().optional(),
    feedback: z.string().optional(),
}).passthrough();

export const hubPapoMestreSchema = z.object({
    materia: z.string().optional().default("Geral"),
    assunto: z.string().optional().default(""),
    engine: engineId,
    aluno: z.any().optional(),
    hiperfoco: z.string().optional(),
    nome_estudante: z.string().optional(),
    tema_turma: z.string().optional(),
}).passthrough();

export const hubRotinaAvdSchema = z.object({
    engine: engineId,
    aluno: z.any().optional(),
    estudante: estudanteField,
    feedback: z.string().optional(),
    rotina_detalhada: z.string().optional(),
    topico_foco: z.string().optional(),
}).passthrough();

export const hubMapaMentalSchema = z.object({
    texto: z.string().optional().default(""),
    engine: engineId,
    aluno: z.any().optional(),
    tipo: z.string().optional(),
    materia: z.string().optional(),
    assunto: z.string().optional(),
    plano_texto: z.string().optional(),
    estudante: estudanteField,
    unidade_tematica: z.string().optional(),
    objeto_conhecimento: z.string().optional(),
}).passthrough();

export const hubGerarImagemSchema = z.object({
    prompt: z.string().optional().default(""),
    prioridade: z.enum(["BANCO", "IA"]).optional().default("BANCO"),
    engine: engineId,
}).passthrough();

export const hubEstudioImagemSchema = z.object({
    tipo: z.enum(["ilustracao", "caa"]).optional().default("ilustracao"),
    prompt: z.string().optional().default(""),
    feedback: z.string().optional(),
    engine: engineId,
}).passthrough();

export const hubGerarDocxSchema = z.object({
    texto: z.string().min(1, "Texto é obrigatório"),
    titulo: z.string().optional(),
    filename: z.string().optional(),
    mapa_imagens: z.record(z.string(), z.string()).optional(),
    formato_inclusivo: z.boolean().optional(),
}).passthrough();

// ==========================================
// PEI — remaining tools
// ==========================================

export const peiDataEngineSchema = z.object({
    engine: engineId,
    peiData: z.record(z.string(), z.unknown()).optional(),
    feedback: z.string().optional(),
}).passthrough();

export const peiExportSchema = z.object({
    peiData: z.record(z.string(), z.unknown()),
});

export const peiVersionCreateSchema = z.object({
    studentId: nonEmpty,
    label: z.string().optional(),
});

export const peiVersionRestoreSchema = z.object({
    studentId: nonEmpty,
    versionIndex: z.number().int().min(0),
});

// ==========================================
// PAEE — remaining tools
// ==========================================

export const paeeDocumentoArticulacaoSchema = z.object({
    frequencia: z.string().optional().default(""),
    acoes: nonEmpty,
    studentId: z.string().optional(),
    studentName: nonEmpty,
    contextoPei: z.string().optional().default(""),
    diagnosis: z.string().optional().default(""),
    feedback: z.string().optional(),
    engine: engineId,
});

export const paeeTecnologiaAssistivaSchema = z.object({
    dificuldade: nonEmpty,
    studentId: z.string().optional(),
    studentName: nonEmpty,
    contextoPei: z.string().optional().default(""),
    feedback: z.string().optional(),
    engine: engineId,
});

export const paeeMapaMentalSchema = z.object({
    texto: nonEmpty,
    nome: z.string().optional().default(""),
    hiperfoco: z.string().optional().default(""),
    engine: engineId,
}).passthrough();

export const paeeJornadaGamificadaSchema = z.object({
    engine: engineId,
    aluno: z.any().optional(),
    estudante: estudanteField,
    ciclo: z.any().optional(),
    estilo: z.string().optional(),
    feedback: z.string().optional(),
    nome_fonte: z.string().optional(),
    origem: z.string().optional(),
    texto_fonte: z.string().optional(),
}).passthrough();

export const paeeRelatorioCicloSchema = z.object({
    studentId: nonEmpty,
    ciclo: z.any(),
    engine: engineId,
});

// ==========================================
// Diário
// ==========================================

export const diarioAnaliseSchema = z.object({
    registros: z.array(z.any()).min(1, "Nenhum registro para analisar."),
    nomeEstudante: z.string().optional().default("Estudante"),
    diagnostico: z.string().optional().default(""),
    engine: engineId,
});

// ==========================================
// PGI
// ==========================================

export const pgiPatchSchema = z.object({
    acoes: z.array(z.any()).optional(),
    dimensionamento: z.record(z.string(), z.unknown()).optional(),
});

export const pgiGerarAcoesSchema = z.object({
    dimensionamento: z.record(z.string(), z.unknown()),
    engine: z.enum(["red", "blue", "green"]).optional().default("red"),
});

// ==========================================
// Monitoring — sugerir rubricas
// ==========================================

export const sugerirRubricasSchema = z.object({
    studentId: nonEmpty,
    engine: engineId,
});

// ==========================================
// BNCC
// ==========================================

export const bnccSugerirSchema = z.object({
    serie: nonEmpty,
    tipo: nonEmpty,
    habilidades: z.array(z.any()).min(1, "Habilidades obrigatórias"),
    diagnostico: z.string().optional(),
    barreiras: z.array(z.string()).optional(),
    potencias: z.array(z.string()).optional(),
    hiperfoco: z.string().optional(),
});

// ==========================================
// Members — update
// ==========================================

export const updateMemberSchema = z.object({
    action: z.string().optional(),
    nome: z.string().optional(),
    email: z.string().optional(),
    password: z.string().optional(),
    telefone: z.string().optional(),
    cargo: z.string().optional(),
    can_estudantes: z.boolean().optional(),
    can_pei: z.boolean().optional(),
    can_pei_professor: z.boolean().optional(),
    can_paee: z.boolean().optional(),
    can_hub: z.boolean().optional(),
    can_diario: z.boolean().optional(),
    can_avaliacao: z.boolean().optional(),
    can_gestao: z.boolean().optional(),
    link_type: z.enum(["todos", "turma", "tutor"]).optional(),
    teacher_assignments: z.any().optional(),
    student_ids: z.array(z.string()).optional(),
}).passthrough();

// ==========================================
// Students — PATCH data routes
// ==========================================

export const studentPatchDataSchema = z.record(z.string(), z.unknown());

// ==========================================
// School — years, grades
// ==========================================

export const schoolYearCreateSchema = z.object({
    name: z.string().optional(),
    label: z.string().optional(),
    year: z.string().optional(),
}).passthrough();

export const schoolGradePatchSchema = z.object({
    grade_id: z.string().optional(),
    grade_ids: z.array(z.string()).optional(),
    enabled: z.boolean().optional(),
}).passthrough();

// ==========================================
// Admin Schemas
// ==========================================

export const adminWorkspaceCreateSchema = z.object({
    name: nonEmpty,
    segments: z.array(z.string()).min(1, "Selecione ao menos um segmento"),
    ai_engines: z.array(z.string()).min(1, "Selecione ao menos um motor de IA"),
}).passthrough();

export const adminWorkspacePatchSchema = z.record(z.string(), z.unknown());

export const adminAnnouncementSchema = z.object({
    action: z.enum(["create", "toggle", "delete"]),
    announcement: z.object({
        title: z.string().optional().default(""),
        message: z.string().optional().default(""),
        type: z.enum(["info", "warning", "alert"]).optional().default("info"),
        target: z.string().optional().default("all"),
        expires_at: z.string().optional(),
    }).optional(),
    announcement_id: z.string().optional(),
}).passthrough();

export const adminIssueCreateSchema = z.object({
    title: nonEmpty,
    description: z.string().optional().default(""),
    severity: z.string().optional().default("média"),
    workspace_id: z.string().optional(),
    source: z.string().optional().default(""),
    created_by: z.string().optional().default(""),
    ai_insight: z.string().optional(),
}).passthrough();

export const adminIssuePatchSchema = z.object({
    status: z.string().optional(),
    resolution_notes: z.string().optional(),
}).passthrough();

export const adminPlatformConfigSchema = z.record(z.string(), z.unknown());
