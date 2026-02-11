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
    metodologia: z.string().optional().default(""),
    objetivo: z.string().optional().default(""),
    habilidades: z.array(z.string()).optional().default([]),
    estudante: z.object({
        nome: z.string().optional(),
        serie: z.string().optional(),
        hiperfoco: z.string().optional(),
    }).optional(),
});

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
    observacoes: z.string().optional().default(""),
    studentName: nonEmpty,
    diagnosis: z.string().optional().default(""),
    contextoPaee: z.string().optional().default(""),
    feedback: z.string().optional(),
    engine: engineId,
});

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
