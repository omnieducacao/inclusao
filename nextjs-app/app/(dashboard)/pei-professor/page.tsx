import { redirect } from "next/navigation";

/**
 * /pei-professor → redireciona para /pei-regente (rota consolidada)
 * A rota /pei-professor era a versão legada simplificada.
 * Todo o fluxo PEI-Professor agora vive em /pei-regente.
 */
export default function PEIProfessorPage() {
    redirect("/pei-regente");
}
