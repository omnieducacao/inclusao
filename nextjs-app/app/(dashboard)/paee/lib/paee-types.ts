import { gerarPdfJornada } from "@/lib/paee-pdf-export";
import type { CicloPAEE, MetaPei, ConfigCiclo } from "@/lib/paee";
import type { EngineId } from "@/lib/ai-engines";
import {
  extrairMetasDoPei,
  criarCronogramaBasico,
  fmtDataIso,
  badgeStatus,
  FREQUENCIAS,
} from "@/lib/paee";
import { LISTAS_BARREIRAS, NIVEIS_SUPORTE } from "@/lib/pei";
import { Map, AlertTriangle, Target, Puzzle, Users, Search, FileText, ExternalLink } from "lucide-react";
import { FormattedTextDisplay } from "@/components/FormattedTextDisplay";
import { PEISummaryPanel } from "@/components/PEISummaryPanel";
import { ResumoAnexosEstudante } from "@/components/ResumoAnexosEstudante";
import { OmniLoader } from "@/components/OmniLoader";
import { Card } from "@omni/ds";

type Student = { id: string; name: string };
export type StudentFull = Student & {
  grade?: string | null;
  diagnosis?: string | null;
  pei_data?: Record<string, unknown>;
  paee_ciclos?: CicloPAEE[];
  planejamento_ativo?: string | null;
  paee_data?: Record<string, unknown>;
};

type Props = {
  students: Student[];
  studentId: string | null;
  student: StudentFull | null;
};

type TabId = "mapear-barreiras" | "plano-habilidades" | "tec-assistiva" | "articulacao" | "planejamento" | "execucao" | "jornada";

