/**
 * Regras de qualidade das ferramentas (onda 3, parte 2).
 *
 * Trazidas do OmniProf (lib/hub-prompts.ts, auditorias de 03 a 10/2026), onde foram testadas com
 * professores. Vale a regra: melhoria num prompt de um produto deve chegar ao outro. Enquanto não
 * houver um pacote compartilhado entre OmniProf e Omnisfera, este arquivo é a cópia de referência
 * na Omnisfera — ao mudar uma regra lá, atualize aqui (e vice-versa).
 */

export const REGRA_IDIOMA = "Resposta OBRIGATORIAMENTE em português do Brasil.";

export const REGRA_TITULO_PT =
  'Títulos em português: maiúscula só na primeira palavra e em nomes próprios. Proibido o Title Case de inglês (errado: "Urbanização Acelerada e Suas Consequências"; certo: "Urbanização acelerada e suas consequências").';

export const REGRA_FONTE_TEXTO =
  'Se o texto-base for apresentado como fonte, informe autor, obra e data reais. Sem esses dados, escreva "Texto adaptado para fins didáticos". Nunca cite fonte sem atribuição. Nunca ponha fala entre aspas atribuída a pessoa real, a menos que seja citação conhecida e literal (com obra e data).';

export const REGRA_FATOS =
  "Não invente dado numérico, estatística, data nem 'fato surpreendente' sem fonte real. Se não houver fato checável, use pergunta ou analogia.";

export const REGRA_TEMAS_SENSIVEIS =
  "TEMAS SENSÍVEIS (escravidão, violência, genocídio, racismo): é proibido pedir que alunos interpretem, dramatizem ou representem vítimas. Preferir análise de fontes, documentos e debate mediado.";

export const REGRA_DISTRATORES =
  "Distratores devem ser plausíveis, baseados em erros comuns de raciocínio ou lacunas de competência. Proibido absurdo óbvio. A alternativa correta NÃO pode ser a mais longa nem a mais detalhada: todas com tamanho e estrutura parecidos.";

export const REGRA_GABARITO =
  "Distribua o gabarito entre as letras. Em 5 questões, no máximo 2 com a mesma letra — nunca 3 iguais.";

export const REGRA_HIPERFOCO =
  "Use o hiperfoco como gancho em parte do material (contexto, exemplo ou analogia), dizendo quando é analogia. Nunca invente nem distorça fato histórico, científico ou data para encaixar o hiperfoco: se ele não existia na época ou não tem relação real com o tema, use-o só como comparação com o presente.";

export const REGRA_ADAPTAR_NAO_SIMPLIFICAR = `REGRA FUNDAMENTAL: adaptar NÃO é simplificar. Mantenha o mesmo nível cognitivo (complexidade do pensamento exigido), mudando só a forma de apresentação, a linguagem e o suporte.
- Preserve os objetivos de aprendizagem e a competência avaliada (verbo de Bloom equivalente): se a questão pede "analisar", a adaptada também pede "analisar".
- Mude a FORMA (linguagem, layout, apoio visual) — não o CONTEÚDO.
- A versão do aluno não traz gabarito, notas pedagógicas nem cita diagnóstico.
- Ignore texto em magenta ou azul saturado e blocos de "resposta do livro do professor": são gabarito, não enunciado.`;

export const REGRA_SEM_ROTULO =
  "O material é para o estudante e a turma: nunca escreva diagnóstico, laudo, CID, \"aluno com deficiência\" nem o nome das anotações do PEI no texto que vai para o aluno.";

type TipoFerramenta = "adaptar" | "questoes" | "aula" | "dinamica" | "abertura" | "ei" | "visual";

/** Bloco de regras comuns, acrescentado ao fim de cada prompt das ferramentas. */
export function regrasDaFerramenta(tipo: TipoFerramenta): string {
  const linhas = [REGRA_IDIOMA, REGRA_TITULO_PT, REGRA_SEM_ROTULO, REGRA_HIPERFOCO];
  if (tipo !== "visual") linhas.push(REGRA_FONTE_TEXTO, REGRA_FATOS);
  if (tipo === "adaptar") linhas.push(REGRA_ADAPTAR_NAO_SIMPLIFICAR);
  if (tipo === "questoes" || tipo === "adaptar") linhas.push(REGRA_DISTRATORES, REGRA_GABARITO);
  if (tipo === "dinamica" || tipo === "aula" || tipo === "abertura" || tipo === "questoes") linhas.push(REGRA_TEMAS_SENSIVEIS);
  if (tipo === "dinamica") {
    linhas.push("Atividades inclusivas: sem eliminação, sem contato físico intenso ou situação constrangedora, com alternativa para quem tem mobilidade reduzida; todos participam.");
  }
  return `\n\nREGRAS DE QUALIDADE (obrigatórias):\n${linhas.map((l) => `- ${l}`).join("\n")}`;
}
