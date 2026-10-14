import { getSession } from "@/lib/session";
import { PageHero } from "@/components/PageHero";
import { PageAccentProvider } from "@/components/PageAccentProvider";
import TelaCarregando from "@/components/brand/TelaCarregando";
import { cicloAtivo } from "@/lib/paee";
import { getAdminConfig } from "@/lib/getAdminConfig";
import { getStudentsWithFallback } from "@/lib/getStudentWithFallback";
import dynamic from "next/dynamic";
import { VisaoEscola, type LinhaVisao } from "@/components/evolucao/VisaoEscola";
import { podeVer } from "@/lib/navegacao";
import { situacaoDoPei, hojeBrasilia } from "@/lib/inicio";
import { ComoFunciona } from "@/components/tutorial/ComoFunciona";

const MonitoramentoClient = dynamic(
  () => import("./MonitoramentoClient").then(mod => ({ default: mod.MonitoramentoClient })),
  { loading: () => <TelaCarregando variante="secao" mensagens={["Abrindo o monitoramento…"]} /> }
);

type Props = { searchParams: Promise<{ student?: string }> };

export default async function MonitoramentoPage({ searchParams }: Props) {
  const session = await getSession();
  const workspaceId = session?.workspace_id;
  const params = await searchParams;
  const studentId = params.student || null;

  const { students, student } = await getStudentsWithFallback(workspaceId, studentId, "Monitoramento");
  const adminConfig = await getAdminConfig();
  const hoje = hojeBrasilia();
  // Onda 10: sem estudante escolhido, a tela abre com a visão da coordenação
  const linhas: LinhaVisao[] = studentId ? [] : students.map((s) => ({
    id: s.id, name: s.name, grade: s.grade, class_group: s.class_group,
    pei: situacaoDoPei(s.pei_data, hoje),
    paeeAtivo: Boolean(cicloAtivo(s.paee_ciclos, s.planejamento_ativo)),
  }));

  return (
    <PageAccentProvider adminKey="monitoramento" serverConfig={adminConfig}>
      <div className="space-y-6">
        <PageHero moduleKey="monitoramento" serverConfig={adminConfig}
          title="Evolução e dados"
          desc={studentId ? "A evolução por descritor, da diagnóstica aos períodos da processual, e o resumo do diário de bordo." : "Onde a escola está com os PEIs e o AEE, e quem precisa de atenção agora."}
        />
        <ComoFunciona modulo="evolucao" />

        {!studentId && students.length > 0 && <VisaoEscola linhas={linhas} podeAgir={{ pei: podeVer({ permissao: "can_pei" }, session || {}), paee: podeVer({ permissao: "can_paee" }, session || {}) }} />}

        <MonitoramentoClient
          students={students.map((s) => ({ id: s.id, name: s.name, grade: s.grade, class_group: s.class_group }))}
          studentId={studentId}
          student={student}
        />
      </div>
    </PageAccentProvider>
  );
}
