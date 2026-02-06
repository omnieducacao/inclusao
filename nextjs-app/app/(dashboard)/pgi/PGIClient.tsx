"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TIPOS_ACAO,
  PERFIS_ATENDIMENTO,
  type AcaoPGI,
  type DimensionamentoPGI,
} from "@/lib/pgi";
import { PdfDownloadButton } from "@/components/PdfDownloadButton";

type TabId = "inicial" | "gerador";

export function PGIClient() {
  const [tab, setTab] = useState<TabId>("gerador");
  const [acoes, setAcoes] = useState<AcaoPGI[]>([]);
  const [dimensionamento, setDimensionamento] = useState<DimensionamentoPGI>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pgi");
      const data = await res.json();
      setAcoes(data.acoes ?? []);
      setDimensionamento(data.dimensionamento ?? {});
    } catch {
      setAcoes([]);
      setDimensionamento({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function saveData(nextAcoes: AcaoPGI[], nextDim?: DimensionamentoPGI) {
    try {
      const res = await fetch("/api/pgi", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acoes: nextAcoes,
          dimensionamento: nextDim ?? dimensionamento,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setMessage({ type: "err", text: d.error || "Erro ao salvar." });
        return;
      }
      setAcoes(nextAcoes);
      if (nextDim) setDimensionamento(nextDim);
    } catch {
      setMessage({ type: "err", text: "Erro ao salvar." });
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-amber-50/50 px-3 py-2 text-sm text-amber-800">
        <strong>Recurso destinado à gestão escolar</strong> — direção, coordenação pedagógica e equipe de planejamento.
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setTab("inicial")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
            tab === "inicial"
              ? "bg-teal-50 text-teal-800 border border-slate-200 border-b-0 -mb-px"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Inicial — Acolhimento
        </button>
        <button
          type="button"
          onClick={() => setTab("gerador")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
            tab === "gerador"
              ? "bg-teal-50 text-teal-800 border border-slate-200 border-b-0 -mb-px"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Gerador — O Plano da Escola
        </button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {tab === "inicial" && <AcolhimentoTab />}
      {tab === "gerador" && (
        <GeradorTab
          acoes={acoes}
          dimensionamento={dimensionamento}
          loading={loading}
          onSave={saveData}
          onSuccess={() => setMessage({ type: "ok", text: "Plano atualizado." })}
          onError={(e) => setMessage({ type: "err", text: e })}
        />
      )}
    </div>
  );
}

function AcolhimentoTab() {
  return (
    <div className="prose prose-slate max-w-none space-y-6 text-sm">
      <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4">
        <div className="text-xs font-bold text-teal-800 uppercase tracking-wide mb-1">
          Recurso destinado à gestão escolar
        </div>
        <p className="text-sm text-slate-700">
          Estas informações e o Gerador de Plano foram desenvolvidos para <strong>gestores escolares</strong> — direção,
          coordenação pedagógica e equipe de planejamento — que organizam o acolhimento inclusivo e o PGEI.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-3">1. Acolhimento dos estudantes</h3>
        <p className="mb-4">
          A inclusão de estudantes com deficiência no ambiente escolar é um compromisso essencial para a construção de uma
          sociedade mais equitativa e democrática. <strong>Todos os estudantes</strong>, com deficiência ou não, devem ser
          acolhidos em uma escola que não apenas os receba, mas os integre plenamente por meio de práticas pedagógicas
          significativas e inclusivas.
        </p>
        <p className="mb-4">
          No entanto, receber o aluno com deficiência não significa automaticamente que ele será incluído, pois há inúmeras
          condições a serem observadas a fim de que essa inclusão se efetue.
        </p>

        <h4 className="font-semibold text-slate-800 mb-2">Elementos fundamentais para o acolhimento inclusivo</h4>
        <p className="mb-3">Para que a inclusão seja uma realidade, algumas condições são indispensáveis:</p>
        <div className="space-y-3 mb-4">
          <p>
            <strong>1. Políticas inclusivas claras e transparentes</strong>
            <br />
            A escola deve adotar políticas que garantam o acesso e a permanência de todos os alunos. Isso inclui um Projeto
            Político-Pedagógico (PPP) que contemple a diversidade como um valor essencial.
          </p>
          <p>
            <strong>2. Ambientes acessíveis</strong>
            <br />
            A infraestrutura escolar deve ser adaptada para atender às necessidades dos estudantes com deficiência, com a
            disponibilização de recursos como rampas, banheiros adaptados, tecnologias assistivas e materiais pedagógicos
            acessíveis.
          </p>
          <p>
            <strong>3. Formação continuada de educadores</strong>
            <br />
            É essencial que professores e demais agentes educativos sejam capacitados continuamente para desenvolver práticas
            pedagógicas inclusivas e acolhedoras. A realização desse trabalho exige que os profissionais se disponham a
            enfrentar eventual sentimento de insegurança, tendo em vista a complexa responsabilidade assumida, o desafio das
            limitações individuais dos alunos(as), as expectativas e frustrações quanto ao progresso da escolarização.
          </p>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <h4 className="font-semibold text-slate-800 mb-2">Exemplo de atuação dos gestores</h4>
          <div className="space-y-2 mb-4">
            <p>
              <strong>Mediação com formação de conscientização:</strong>
              <br />
              Organizar encontros educativos para famílias e alunos, com especialistas, para abordar os benefícios da
              inclusão e combater preconceitos. Esses eventos podem incluir palestras, rodas de conversa ou dinâmicas para
              desenvolver empatia e sensibilização.
            </p>
            <p>
              <strong>Elaboração de um código de conduta inclusivo:</strong>
              <br />
              Revisar ou criar um código de conduta para a comunidade escolar, estabelecendo consequências claras para
              atitudes de discriminação e promovendo valores como respeito e acolhimento.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <h4 className="font-semibold text-slate-800 mb-2">Caso ilustrativo</h4>
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
            <p>
              <strong>Situação:</strong>
              <br />
              Em uma escola particular, um grupo de pais reclamou que o desempenho acadêmico da turma havia caído após a
              inclusão de um aluno autista com dificuldades de interação. As famílias pressionaram a gestão para transferir o
              estudante.
            </p>
            <p>
              <strong>Ação do gestor:</strong>
              <br />
              O diretor organizou uma reunião com os pais da turma, trazendo um especialista em educação inclusiva para
              esclarecer como a diversidade beneficia o ambiente escolar. Além disso, iniciou um programa de formação para os
              professores sobre práticas inclusivas, e reforçou o valor da inclusão no projeto pedagógico da escola.
            </p>
            <p>
              <strong>Resultado:</strong>
              <br />
              Os pais passaram a compreender a importância do processo inclusivo, e o clima de aceitação na escola melhorou.
              O aluno foi mantido na turma, e a escola viu um aumento no engajamento das famílias em atividades escolares.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <h4 className="font-semibold text-slate-800 mb-2">O papel da gestão escolar no acolhimento</h4>
          <p className="mb-2">Os gestores desempenham um papel estratégico no acolhimento de estudantes com deficiência. Eles devem garantir:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Formação em serviço:</strong> Organizar encontros e capacitações que fortaleçam as práticas dos
              educadores, promovendo a troca de experiências e a resolução de dúvidas.
            </li>
            <li>
              <strong>Mediação de conflitos:</strong> Agir de forma proativa frente a atitudes preconceituosas, seja por parte
              de alunos, famílias ou mesmo outros profissionais da escola.
            </li>
            <li>
              <strong>Apoio emocional aos educadores:</strong> Reconhecer os desafios enfrentados pelos professores e oferecer
              suporte para lidar com sentimentos de insegurança ou frustração.
            </li>
          </ul>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-800 text-sm">
          O trabalho inclusivo com alunos deve constar do Projeto Pedagógico da escola e ser informado às famílias, de modo
          que, já no ato da matrícula, saibam da obrigatoriedade da instituição em fornecer tal espaço educativo.{" "}
          <strong>A matrícula é direito constitucional do aluno com deficiência e de todos os cidadãos.</strong>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <h4 className="font-semibold text-slate-800 mb-2">Aspectos legais do acolhimento</h4>
          <p className="mb-4">
            A escola <strong>não pode negar a matrícula</strong> aos alunos com deficiência, com transtornos de comportamento
            e/ou de aprendizagem sob a alegação de falta de vagas. A Lei 7.853/89 art. 8º, inciso I, define como crime a
            recusa ou suspensão de matrícula de alunos nessas condições. O Decreto nº 3.298, de 20 de dezembro de 1999,
            regulamenta a Lei 7.853/89.
          </p>
          <p className="italic text-slate-600">
            &quot;Na escola inclusiva professores e alunos aprendem uma lição que a vida dificilmente ensina: respeitar as
            diferenças. E, esse é o primeiro passo para se construir uma sociedade mais justa.&quot; — Mantoan (2003)
          </p>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <h4 className="font-semibold text-slate-800 mb-2">Boas práticas no acolhimento</h4>
          <div className="space-y-2">
            <p>
              <strong>1. Criação de um plano de acolhimento personalizado</strong>
              <br />
              Cada estudante com deficiência tem necessidades e características únicas. A elaboração de um plano de acolhimento,
              envolvendo familiares, educadores e profissionais especializados, permite atender essas especificidades.
            </p>
            <p>
              <strong>2. Atividades de integração</strong>
              <br />
              Organizar dinâmicas de grupo, projetos interativos e momentos de convivência pode ajudar a construir vínculos
              entre os estudantes e promover uma cultura de respeito às diferenças.
            </p>
            <p>
              <strong>3. Envolvimento da família</strong>
              <br />
              Realizar reuniões regulares com as famílias para discutir as necessidades e os avanços dos estudantes fortalece
              a parceria escola-comunidade.
            </p>
            <p>
              <strong>4. Redes de apoio externas</strong>
              <br />
              Estabelecer parcerias com ONGs, instituições de saúde e outros órgãos pode proporcionar suporte adicional às
              práticas inclusivas da escola.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-lg font-bold text-slate-800 mb-3">2. Atendimento ao aluno — compromisso e ação</h3>

        <details className="rounded-lg border border-slate-200 p-4 mb-3" open>
          <summary className="font-semibold text-slate-800 cursor-pointer">
            📖 Bloco 2.1 — Conceito e referência
          </summary>
          <div className="mt-3 text-sm text-slate-600 space-y-2">
            <p>
              O aluno, seja qual for sua condição ou necessidade, é o <strong>centro do projeto escolar</strong> em qualquer
              modalidade educativa. A escola deve oferecer condições para o seu pleno desenvolvimento. Garantir o
              acompanhamento sistemático e contínuo, integrando dados e informações tanto da área pedagógica quanto da área
              socioemocional, além dos relacionados aos modos de convivência na comunidade escolar, supõe uma equipe de
              profissionais em movimento sinérgico, aptos para realizar um conjunto de tarefas articuladas.
            </p>
            <p className="text-xs text-slate-500 italic">
              Referência: VALADÃO, M. P. B.; VALADÃO, P. B.; COELHO, J. T. (org.). Referencial de Educação Inclusiva.
              SINEP-BA. Garimpo Editorial. São Paulo, 2024.
            </p>
          </div>
        </details>

        <details className="rounded-lg border border-slate-200 p-4 mb-3">
          <summary className="font-semibold text-slate-800 cursor-pointer">📋 Bloco 2.2 — PGEI: estrutura e equipe</summary>
          <div className="mt-3 text-sm text-slate-600 space-y-2">
            <p>
              A escola deve prever no seu Projeto Pedagógico um <strong>Plano Geral de Educação Inclusiva (PGEI)</strong> que
              pode estar no bojo da orientação educacional ou se constituir como um departamento (Serviço de Apoio à Inclusão,
              Orientação às Práticas Inclusivas, entre outras).
            </p>
            <p>
              <strong>Equipe atuante:</strong> orientadores(as) educacionais, psicólogos(as), psicopedagogos(as),
              professores(as) habilitados. O coordenador(a) pedagógico(a) terá papel importante na adaptação curricular aos
              planos individuais (PEI/PDI).
            </p>
            <p>
              <strong>Recepção e documentação:</strong> Cabe ao orientador(a) educacional ou psicólogo(a) escolar receber a
              família e especialistas externos, registrar dados (relatórios médicos, laudos, orientações técnicas,
              autorizações das famílias, agenda de atendimentos, contatos dos profissionais externos), arquivá-los com
              garantia de sigilo e disponibilizar ao setor pedagógico o conteúdo necessário à personalização do currículo no
              PEI/PDI.
            </p>
            <p className="text-xs text-slate-500 italic">
              Quando a escola não conta com equipe multidisciplinar ampla, o coordenador pedagógico pode assumir a recepção,
              acompanhamento e orientação de docentes e famílias.
            </p>
          </div>
        </details>

        <details className="rounded-lg border border-slate-200 p-4 mb-3">
          <summary className="font-semibold text-slate-800 cursor-pointer">
            📊 Bloco 2.3 — Questões preliminares para o PGEI
          </summary>
          <div className="mt-3 text-sm text-slate-600 space-y-2">
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                <strong>Número total de alunos</strong> e número de alunos com deficiência matriculados
              </li>
              <li>
                <strong>Número de profissionais por período</strong> e horas efetivas de permanência da equipe de inclusão
              </li>
            </ol>
            <p>
              Essas variáveis impactam o dimensionamento do atendimento e a qualidade das ações inclusivas: determinam alocação
              de recursos (professores de apoio, mediadores, intérpretes de Libras), orientam a organização da rotina e
              influenciam prioridades e tempo para cada intervenção.
            </p>
          </div>
        </details>

        <details className="rounded-lg border border-slate-200 p-4 mb-3">
          <summary className="font-semibold text-slate-800 cursor-pointer">
            ✅ Bloco 2.4 — Check-list prático para elaboração do PGEI
          </summary>
          <div className="mt-3 text-sm text-slate-600">
            <ul className="list-disc pl-5 space-y-1">
              <li>Levantar o número total de alunos e os perfis específicos (com deficiência, altas habilidades, etc.)</li>
              <li>Identificar necessidades específicas de cada perfil (intérpretes, materiais adaptados)</li>
              <li>Dimensionar a equipe de inclusão e verificar carga horária disponível</li>
              <li>Planejar ações coletivas e individuais, alinhadas ao PPP</li>
              <li>Garantir formação continuada para toda a equipe escolar</li>
              <li>Estabelecer indicadores para avaliar a implementação (participação, frequência)</li>
            </ul>
          </div>
        </details>

        <details className="rounded-lg border border-slate-200 p-4 mb-3">
          <summary className="font-semibold text-slate-800 cursor-pointer">
            📊 Bloco 2.5 — Tabela de dimensionamento + exemplo de aplicação
          </summary>
          <div className="mt-3 text-sm text-slate-600 space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-300">
                    <th className="text-left py-2 px-2">Questão Preliminar</th>
                    <th className="text-left py-2 px-2">Exemplo</th>
                    <th className="text-left py-2 px-2">Ação Sugestiva</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-2 px-2">Nº de alunos com deficiência</td>
                    <td className="py-2 px-2">5 em escola com 300 alunos</td>
                    <td className="py-2 px-2">Contratar 1 mediador para cada aluno que demande suporte contínuo</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-2 px-2">Perfil dos alunos</td>
                    <td className="py-2 px-2">Deficiência física, TEA, altas habilidades</td>
                    <td className="py-2 px-2">Mapear necessidades (acessibilidade, intérpretes, materiais adaptados)</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-2 px-2">Nº de profissionais por período</td>
                    <td className="py-2 px-2">2 professores de apoio; 1 coordenador</td>
                    <td className="py-2 px-2">Avaliar ampliação da equipe conforme turnos de maior demanda</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2">Horas efetivas da equipe</td>
                    <td className="py-2 px-2">6h/dia; demandas extras 4h/semana</td>
                    <td className="py-2 px-2">Realocar em horários estratégicos ou solicitar ampliação</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              <strong>Exemplo:</strong> Escola com 10 alunos (4 TEA, 2 def. física, 3 dificuldades aprendizagem, 1 altas
              habilidades). Equipe: 2 mediadores + 1 coordenador.
            </p>
            <p>
              <strong>Desafios comuns:</strong> Insuficiência de mediadores; falta de planejamento para altas habilidades.
            </p>
            <p>
              <strong>Soluções propostas:</strong> Contratar mediador adicional; criar grupo de enriquecimento curricular para
              altas habilidades; reorganizar rotina para priorizar horários de maior demanda.
            </p>
          </div>
        </details>

        <details className="rounded-lg border border-slate-200 p-4 mb-3">
          <summary className="font-semibold text-slate-800 cursor-pointer">
            👥 Bloco 2.6 — Perfis contemplados no PGEI
          </summary>
          <div className="mt-3 text-sm text-slate-600">
            <p>
              O PGEI considera perfis singulares: alunos com <strong>deficiência</strong>,{" "}
              <strong>comportamentos disruptivos</strong>, <strong>transtornos e/ou dificuldades de aprendizagem específicas</strong> e{" "}
              <strong>altas habilidades</strong>. Use esses perfis ao cadastrar ações no Gerador.
            </p>
          </div>
        </details>
      </div>

      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-lg font-bold text-slate-800 mb-3">3. Equipe de trabalho em ação</h3>

        <details className="rounded-lg border border-slate-200 p-4 mb-3">
          <summary className="font-semibold text-slate-800 cursor-pointer">
            👥 Bloco 3.1 — Papéis da equipe (orientador, psicólogo, AT)
          </summary>
          <div className="mt-3 text-sm text-slate-600 space-y-2">
            <p>
              O Setor de Orientação Educacional deve contar com <strong>psicólogo(a) escolar</strong>,{" "}
              <strong>orientador(a) educacional</strong> e <strong>assistentes pedagógicas (APs)</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Orientador(a) educacional:</strong> Dinâmicas entre alunos, professores e famílias; bem-estar e
                integração social; pontes entre currículo e desempenho.
              </li>
              <li>
                <strong>Psicólogo(a) escolar:</strong> Estudos de caso; acompanhamento do cumprimento do PEI/PDI; organização
                de encontros com famílias e profissionais externos; supervisão de ATs e APs. Não assume função terapêutica.
              </li>
              <li>
                <strong>Atendente terapêutico (AT):</strong> Atendimento individual e exclusivo do aluno, vínculo com
                família/clínica, inserido via Termo de Compromisso. Custeado pelo Estado ou família. Política de Proteção aos
                Direitos das Pessoas com TEA garante acompanhante especializado em sala quando há comprovada necessidade
                (BRASIL, 2012).
              </li>
            </ul>
          </div>
        </details>

        <details className="rounded-lg border border-slate-200 p-4 mb-3">
          <summary className="font-semibold text-slate-800 cursor-pointer">🔒 Bloco 3.2 — Comunicação e sigilo</summary>
          <div className="mt-3 text-sm text-slate-600">
            <p>
              Uma das questões fundamentais é a <strong>comunicação interna</strong> entre profissionais que atuam com o
              aluno, a troca com profissionais externos e o <strong>diálogo com as famílias</strong>. Em todos os casos, o
              sigilo e a reserva de informações devem ser respeitados conforme o limite da atuação de cada profissional. A
              responsabilidade pela privacidade do aluno é de todos; cabe à equipe de educação inclusiva a tarefa de filtrar
              dados e informações.
            </p>
          </div>
        </details>
      </div>

      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-lg font-bold text-slate-800 mb-3">4. Salas Multifuncionais (SRM)</h3>

        <details className="rounded-lg border border-slate-200 p-4 mb-3" open>
          <summary className="font-semibold text-slate-800 cursor-pointer">
            📖 Bloco 4.1 — Fundamentos legais e função social
          </summary>
          <div className="mt-3 text-sm text-slate-600 space-y-2">
            <p>
              Em 2008, o <strong>Decreto nº 6.571</strong> instituiu as salas de recursos multifuncionais: ambientes dotados
              de equipamentos, mobiliários, materiais didáticos e pedagógicos para a realização do Atendimento Educacional
              Especializado (AEE).
            </p>
            <p>
              O trabalho nas salas multifuncionais <strong>não substitui</strong> o das classes comuns. O objetivo é superar o
              modelo que separa escolas comuns de classes especiais. A escola deve construir uma proposta pedagógica capaz de
              valorizar as diferenças, com escolarização nas classes comuns e atendimento às necessidades específicas.
            </p>
            <p className="text-xs text-slate-500 italic">
              Decreto nº 6.571, de 17 de setembro de 2008 — Dispõe sobre o AEE e regulamenta o parágrafo único do art. 60 da
              LDB (Lei 9.394/96).
            </p>
          </div>
        </details>

        <details className="rounded-lg border border-slate-200 p-4 mb-3">
          <summary className="font-semibold text-slate-800 cursor-pointer">
            🏫 Bloco 4.2 — Organização e equipamentos da SRM
          </summary>
          <div className="mt-3 text-sm text-slate-600">
            <p>
              As salas de recursos multifuncionais (SRM), instaladas na própria escola comum, devem receber{" "}
              <strong>equipamentos</strong>, <strong>recursos de acessibilidade</strong> e{" "}
              <strong>materiais pedagógicos</strong> que facilitem a escolarização, eliminando obstáculos e promovendo
              autonomia, independência, integração educacional e social.
            </p>
          </div>
        </details>

        <details className="rounded-lg border border-slate-200 p-4 mb-3">
          <summary className="font-semibold text-slate-800 cursor-pointer">
            💡 Bloco 4.3 — Sugestões práticas de baixo custo
          </summary>
          <div className="mt-3 text-sm text-slate-600">
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                <strong>Equipamentos essenciais:</strong> Mesas adaptáveis, cadeiras confortáveis, materiais de apoio visual
                (cartazes com sinais e pictogramas).
              </li>
              <li>
                <strong>Tecnologias assistivas simples:</strong> Softwares gratuitos de leitura de tela, livros digitais,
                programas de leitura e escrita para dificuldades de aprendizagem.
              </li>
              <li>
                <strong>Espaços organizados:</strong> Áreas bem delimitadas para facilitar mobilidade e garantir que todos os
                materiais estejam acessíveis.
              </li>
              <li>
                <strong>Apoios pedagógicos:</strong> Jogos, fantoches, livros em braille e outras opções adaptadas que
                incentivem autonomia e participação ativa.
              </li>
              <li>
                <strong>Parcerias locais:</strong> Doações ou parcerias com ONGs, universidades ou empresas para equipar a
                sala sem sobrecarregar o orçamento.
              </li>
            </ol>
          </div>
        </details>

        <details className="rounded-lg border border-slate-200 p-4 mb-3">
          <summary className="font-semibold text-slate-800 cursor-pointer">
            👥 Bloco 4.4 — Público-alvo do AEE na SRM
          </summary>
          <div className="mt-3 text-sm text-slate-600">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Estudantes com deficiência:</strong> Impedimentos duradouros de natureza física, intelectual, mental ou
                sensorial; prejudicados na interação por obstáculos físicos, materiais ou ausência de recursos específicos.
              </li>
              <li>
                <strong>Estudantes com transtornos globais do desenvolvimento:</strong> Alterações no desenvolvimento
                neuropsicomotor (autismo, síndromes do espectro autista, psicose infantil).
              </li>
              <li>
                <strong>Estudantes com altas habilidades ou superdotação:</strong> Potencial diferenciado nas áreas intelectual,
                acadêmica, liderança, psicomotora, artes e criatividade.
              </li>
            </ul>
          </div>
        </details>

        <details className="rounded-lg border border-slate-200 p-4">
          <summary className="font-semibold text-slate-800 cursor-pointer">
            🤝 Bloco 4.5 — Articulação AEE e classe comum
          </summary>
          <div className="mt-3 text-sm text-slate-600">
            <p>
              A baixa porcentagem de salas de recursos nas escolas comuns prejudica a permanência dos estudantes, obrigando
              deslocamentos para outras unidades. Além disso, reduz o trabalho colaborativo entre professores(as) do AEE e da
              classe comum.
            </p>
            <p className="mt-2">
              É fundamental <strong>alinhamentos constantes</strong> entre os professores do AEE e os da classe comum, mesmo a
              distância, com mediação da coordenação pedagógica quando não for possível o encontro presencial. As trocas
              garantirão a coerência do programa e a prática inclusiva.
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}

function formatPGIText(acoes: AcaoPGI[], dim: DimensionamentoPGI): string {
  const parts: string[] = [];
  if (dim.n_total != null || dim.n_deficiencia != null || dim.n_prof != null) {
    parts.push("DIMENSIONAMENTO PRELIMINAR");
    parts.push(`Nº total de alunos: ${dim.n_total ?? "—"}`);
    parts.push(`Nº alunos com deficiência: ${dim.n_deficiencia ?? "—"}`);
    parts.push(`Nº profissionais inclusão: ${dim.n_prof ?? "—"}`);
    parts.push(`Horas/dia da equipe: ${dim.horas_dia ?? "—"}`);
    parts.push("");
  }
  parts.push("AÇÕES DO PLANO");
  parts.push("—".repeat(40));
  acoes.forEach((a, i) => {
    const [label] = TIPOS_ACAO[a.tipo] ?? ["—"];
    const prazoFmt = a.prazo ? new Date(a.prazo + "T12:00:00").toLocaleDateString("pt-BR") : "—";
    parts.push(`\n${i + 1}. [${label}] ${a.o_que}`);
    if (a.por_que) parts.push(`   POR QUE: ${a.por_que}`);
    if (a.quem) parts.push(`   QUEM: ${a.quem}`);
    if (a.onde) parts.push(`   ONDE: ${a.onde}`);
    if (a.como) parts.push(`   COMO: ${a.como}`);
    parts.push(`   PRAZO: ${prazoFmt}`);
    if (a.custo) parts.push(`   CUSTO: ${a.custo}`);
    if (a.perfil?.length) parts.push(`   PERFIS: ${a.perfil.join(", ")}`);
  });
  return parts.join("\n");
}

type GeradorTabProps = {
  acoes: AcaoPGI[];
  dimensionamento: DimensionamentoPGI;
  loading: boolean;
  onSave: (acoes: AcaoPGI[], dim?: DimensionamentoPGI) => Promise<void>;
  onSuccess: () => void;
  onError: (err: string) => void;
};

function GeradorTab({ acoes, dimensionamento, loading, onSave, onSuccess, onError }: GeradorTabProps) {
  const [tipo, setTipo] = useState("dimensionamento_pgei");
  const [oQue, setOQue] = useState("");
  const [porQue, setPorQue] = useState("");
  const [quem, setQuem] = useState("");
  const [onde, setOnde] = useState("");
  const [como, setComo] = useState("");
  const [prazo, setPrazo] = useState(() => new Date().toISOString().slice(0, 10));
  const [custo, setCusto] = useState("");
  const [perfil, setPerfil] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState<number | null>(null);

  const [dimLocal, setDimLocal] = useState<DimensionamentoPGI>(dimensionamento);
  useEffect(() => {
    setDimLocal(dimensionamento);
  }, [dimensionamento]);

  const nTotal = dimLocal.n_total ?? 0;
  const nDef = dimLocal.n_deficiencia ?? 0;
  const nProf = dimLocal.n_prof ?? 0;
  const horasDia = dimLocal.horas_dia ?? 0;

  async function handleAddAcao(e: React.FormEvent) {
    e.preventDefault();
    if (!oQue.trim()) {
      onError("Informe a ação (O QUE) para cadastrar.");
      return;
    }
    setSaving(true);
    const nova: AcaoPGI = {
      tipo,
      o_que: oQue.trim(),
      por_que: porQue.trim() || undefined,
      quem: quem.trim() || undefined,
      onde: onde.trim() || undefined,
      como: como.trim() || undefined,
      prazo: prazo || undefined,
      custo: custo.trim() || undefined,
      perfil: perfil.length ? perfil : undefined,
      criado_em: new Date().toISOString(),
    };
    await onSave([...acoes, nova]);
    setOQue("");
    setPorQue("");
    setQuem("");
    setOnde("");
    setComo("");
    setCusto("");
    setPerfil([]);
    onSuccess();
    setSaving(false);
  }

  async function addRapida(oQueVal: string, porQueVal: string, tipoVal: string) {
    const nova: AcaoPGI = {
      tipo: tipoVal,
      o_que: oQueVal,
      por_que: porQueVal,
      criado_em: new Date().toISOString(),
    };
    await onSave([...acoes, nova]);
    onSuccess();
  }

  async function remover(i: number) {
    const next = acoes.filter((_, idx) => idx !== i);
    await onSave(next);
    setConfirmDel(null);
    onSuccess();
  }

  async function salvarDimensionamento(
    nTotalVal: number,
    nDefVal: number,
    nProfVal: number,
    horasVal: number
  ) {
    const dim = { n_total: nTotalVal, n_deficiencia: nDefVal, n_prof: nProfVal, horas_dia: horasVal };
    await onSave(acoes, dim);
    onSuccess();
  }

  return (
    <div className="space-y-6">
      {/* Dimensionamento */}
      <details className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
        <summary className="cursor-pointer font-medium text-slate-700">Dimensionamento preliminar (opcional)</summary>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-600 mb-1">Nº total de alunos</label>
            <input
              type="number"
              min={0}
              value={nTotal}
              onChange={(e) => setDimLocal((d) => ({ ...d, n_total: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Nº alunos com deficiência</label>
            <input
              type="number"
              min={0}
              value={nDef}
              onChange={(e) => setDimLocal((d) => ({ ...d, n_deficiencia: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Nº profissionais inclusão</label>
            <input
              type="number"
              min={0}
              value={nProf}
              onChange={(e) => setDimLocal((d) => ({ ...d, n_prof: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Horas/dia da equipe</label>
            <input
              type="number"
              min={0}
              step={0.5}
              value={horasDia}
              onChange={(e) => setDimLocal((d) => ({ ...d, horas_dia: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => salvarDimensionamento(nTotal, nDef, nProf, horasDia)}
          className="mt-2 px-3 py-1.5 text-sm bg-teal-100 text-teal-800 rounded-lg hover:bg-teal-200"
        >
          Salvar dimensionamento
        </button>
      </details>

      {/* Ações rápidas */}
      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Ações sugeridas</p>
        <div className="flex flex-wrap gap-2">
          {[
            ["Contratar mediador adicional", "Insuficiência de mediadores", "dimensionamento_pgei"],
            ["Grupo enriquecimento altas habilidades", "Atendimento diferenciado", "dimensionamento_pgei"],
            ["Reorganizar rotina da equipe", "Otimização do dimensionamento", "dimensionamento_pgei"],
            ["Fluxo recepção família e documentação", "Garantir sigilo e disponibilizar", "comunicacao_procedimentos"],
            ["Equipar SRM com mesas adaptáveis", "Decreto 6.571/2008", "sala_multifuncional"],
            ["Alinhamento AEE + classe comum", "Coerência do programa", "comunicacao_procedimentos"],
          ].map(([oq, pq, t], i) => (
            <button
              key={i}
              type="button"
              onClick={() => addRapida(oq, pq, t)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              ➕ {oq}
            </button>
          ))}
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleAddAcao} className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
        <h4 className="font-semibold text-slate-800">Adicionar ação ao plano</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-600 mb-1">Tipo de ação</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            >
              {Object.entries(TIPOS_ACAO).map(([k, [label]]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-600 mb-1">O QUE (Ação prática) *</label>
            <input
              type="text"
              value={oQue}
              onChange={(e) => setOQue(e.target.value)}
              placeholder="Ex: Contratar mediador / Equipar SRM"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">POR QUE (Justificativa)</label>
            <textarea
              value={porQue}
              onChange={(e) => setPorQue(e.target.value)}
              rows={2}
              placeholder="Ex: Dimensionamento PGEI"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-600 mb-1">QUEM (Responsável)</label>
            <input
              type="text"
              value={quem}
              onChange={(e) => setQuem(e.target.value)}
              placeholder="Ex: Coordenação pedagógica"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">ONDE (Local)</label>
            <input
              type="text"
              value={onde}
              onChange={(e) => setOnde(e.target.value)}
              placeholder="Ex: SRM, Bloco A"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-600 mb-1">COMO (Método)</label>
            <input
              type="text"
              value={como}
              onChange={(e) => setComo(e.target.value)}
              placeholder="Ex: Palestra em HTPC"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">PRAZO</label>
            <input
              type="date"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">CUSTO (R$)</label>
            <input
              type="text"
              value={custo}
              onChange={(e) => setCusto(e.target.value)}
              placeholder="Ex: 5.000,00"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-600 mb-1">Perfil de atendimento</label>
          <div className="flex flex-wrap gap-2">
            {PERFIS_ATENDIMENTO.map((p) => (
              <label key={p} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={perfil.includes(p)}
                  onChange={(e) =>
                    setPerfil((prev) =>
                      e.target.checked ? [...prev, p] : prev.filter((x) => x !== p)
                    )
                  }
                  className="rounded border-slate-300"
                />
                {p}
              </label>
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 disabled:opacity-60"
        >
          {saving ? "Salvando…" : "➕ Adicionar ação ao plano"}
        </button>
      </form>

      {/* Lista de ações */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-slate-800">O Plano da Escola</h4>
          {acoes.length > 0 && (
            <PdfDownloadButton
              text={formatPGIText(acoes, dimLocal)}
              filename={`PGI_${new Date().toISOString().slice(0, 10)}.pdf`}
              title="Plano de Gestão Inclusiva (PGI)"
            />
          )}
        </div>
        {loading ? (
          <p className="text-slate-500">Carregando…</p>
        ) : acoes.length === 0 ? (
          <p className="text-slate-500 p-4 bg-slate-50 rounded-lg">Nenhuma ação cadastrada. Use o formulário ou os botões acima.</p>
        ) : (
          <div className="space-y-4">
            {acoes.map((a, i) => {
              const [label] = TIPOS_ACAO[a.tipo] ?? ["—"];
              const prazoFmt = a.prazo
                ? new Date(a.prazo + "T12:00:00").toLocaleDateString("pt-BR")
                : "—";
              return (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-slate-200 bg-white flex gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-800 mb-2">
                      {label.split(" (")[0]}
                    </span>
                    <p className="font-medium text-slate-800">{a.o_que}</p>
                    {a.por_que && (
                      <p className="text-sm text-slate-500 mt-1">{a.por_que}</p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
                      <span>👤 {a.quem || "—"}</span>
                      <span>📍 {a.onde || "—"}</span>
                      <span>📅 {prazoFmt}</span>
                      <span>💰 {a.custo || "—"}</span>
                    </div>
                    {a.perfil?.length ? (
                      <p className="text-xs text-slate-500 mt-1">Perfis: {a.perfil.join(", ")}</p>
                    ) : null}
                  </div>
                  <div className="shrink-0">
                    {confirmDel === i ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => remover(i)}
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded"
                        >
                          Sim
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDel(null)}
                          className="px-2 py-1 text-xs border border-slate-200 rounded"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDel(i)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        🗑️ Remover
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
