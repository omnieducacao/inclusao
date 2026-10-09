/**
 * Matriz de Referência do ENEM (INEP): as 4 áreas, as competências de área e as 120 habilidades.
 * Texto copiado do documento oficial do INEP, sem reescrever. O Criar itens usa como parâmetro do item.
 */

export type AreaEnem = "LC" | "MT" | "CN" | "CH";

export type HabilidadeEnem = { h: number; texto: string };
export type CompetenciaEnem = { n: number; texto: string; habilidades: HabilidadeEnem[] };
export type MatrizArea = { sigla: AreaEnem; nome: string; competencias: CompetenciaEnem[] };

export const MATRIZ_ENEM: MatrizArea[] = [
    {
        sigla: "LC",
        nome: "Linguagens, Códigos e suas Tecnologias",
        competencias: [
            {
                n: 1,
                texto: "Aplicar as tecnologias da comunicação e da informação na escola, no trabalho e em outros contextos relevantes para sua vida.",
                habilidades: [
                    {
                        h: 1,
                        texto: "Identificar as diferentes linguagens e seus recursos expressivos como elementos de caracterização dos sistemas de comunicação."
                    },
                    {
                        h: 2,
                        texto: "Recorrer aos conhecimentos sobre as linguagens dos sistemas de comunicação e informação para resolver problemas sociais."
                    },
                    {
                        h: 3,
                        texto: "Relacionar informações geradas nos sistemas de comunicação e informação, considerando a função social desses sistemas."
                    },
                    {
                        h: 4,
                        texto: "Reconhecer posições críticas aos usos sociais que são feitos das linguagens e dos sistemas de comunicação e informação."
                    }
                ]
            },
            {
                n: 2,
                texto: "Conhecer e usar língua(s) estrangeira(s) moderna(s) como instrumento de acesso a informações e a outras culturas e grupos sociais",
                habilidades: [
                    {
                        h: 5,
                        texto: "Associar vocábulos e expressões de um texto em LEM ao seu tema."
                    },
                    {
                        h: 6,
                        texto: "Utilizar os conhecimentos da LEM e de seus mecanismos como meio de ampliar as possibilidades de acesso a informações, tecnologias e culturas."
                    },
                    {
                        h: 7,
                        texto: "Relacionar um texto em LEM, as estruturas linguísticas, sua função e seu uso social."
                    },
                    {
                        h: 8,
                        texto: "Reconhecer a importância da produção cultural em LEM como representação da diversidade cultural e linguística."
                    }
                ]
            },
            {
                n: 3,
                texto: "Compreender e usar a linguagem corporal como relevante para a própria vida, integradora social e formadora da identidade.",
                habilidades: [
                    {
                        h: 9,
                        texto: "Reconhecer as manifestações corporais de movimento como originárias de necessidades cotidianas de um grupo social."
                    },
                    {
                        h: 10,
                        texto: "Reconhecer a necessidade de transformação de hábitos corporais em função das necessidades cinestésicas."
                    },
                    {
                        h: 11,
                        texto: "Reconhecer a linguagem corporal como meio de interação social, considerando os limites de desempenho e as alternativas de adaptação para diferentes indivíduos."
                    }
                ]
            },
            {
                n: 4,
                texto: "Compreender a arte como saber cultural e estético gerador de significação e integrador da organização do mundo e da própria identidade.",
                habilidades: [
                    {
                        h: 12,
                        texto: "Reconhecer diferentes funções da arte, do trabalho da produção dos artistas em seus meios culturais."
                    },
                    {
                        h: 13,
                        texto: "Analisar as diversas produções artísticas como meio de explicar diferentes culturas, padrões de beleza e preconceitos."
                    },
                    {
                        h: 14,
                        texto: "Reconhecer o valor da diversidade artística e das inter-relações de elementos que se apresentam nas manifestações de vários grupos sociais e étnicos."
                    }
                ]
            },
            {
                n: 5,
                texto: "Analisar, interpretar e aplicar recursos expressivos das linguagens, relacionando textos com seus contextos, mediante a natureza, função, organização, estrutura das manifestações, de acordo com as condições de produção e recepção.",
                habilidades: [
                    {
                        h: 15,
                        texto: "Estabelecer relações entre o texto literário e o momento de sua produção, situando aspectos do contexto histórico, social e político."
                    },
                    {
                        h: 16,
                        texto: "Relacionar informações sobre concepções artísticas e procedimentos de construção do texto literário."
                    },
                    {
                        h: 17,
                        texto: "Reconhecer a presença de valores sociais e humanos atualizáveis e permanentes no patrimônio literário nacional."
                    }
                ]
            },
            {
                n: 6,
                texto: "Compreender e usar os sistemas simbólicos das diferentes linguagens como meios de organização cognitiva da realidade pela constituição de significados, expressão, comunicação e informação.",
                habilidades: [
                    {
                        h: 18,
                        texto: "Identificar os elementos que concorrem para a progressão temática e para a organização e estruturação de textos de diferentes gêneros e tipos."
                    },
                    {
                        h: 19,
                        texto: "Analisar a função da linguagem predominante nos textos em situações específicas de interlocução."
                    },
                    {
                        h: 20,
                        texto: "Reconhecer a importância do patrimônio linguístico para a preservação da memória e da identidade nacional."
                    }
                ]
            },
            {
                n: 7,
                texto: "Confrontar opiniões e pontos de vista sobre as diferentes linguagens e suas manifestações específicas.",
                habilidades: [
                    {
                        h: 21,
                        texto: "Reconhecer em textos de diferentes gêneros, recursos verbais e não-verbais utilizados com a finalidade de criar e mudar comportamentos e hábitos."
                    },
                    {
                        h: 22,
                        texto: "Relacionar, em diferentes textos, opiniões, temas, assuntos e recursos linguísticos."
                    },
                    {
                        h: 23,
                        texto: "Inferir em um texto quais são os objetivos de seu produtor e quem é seu público alvo, pela análise dos procedimentos argumentativos utilizados."
                    },
                    {
                        h: 24,
                        texto: "Reconhecer no texto estratégias argumentativas empregadas para o convencimento do público, tais como a intimidação, sedução, comoção, chantagem, entre outras."
                    }
                ]
            },
            {
                n: 8,
                texto: "Compreender e usar a língua portuguesa como língua materna, geradora de significação e integradora da organização do mundo e da própria identidade.",
                habilidades: [
                    {
                        h: 25,
                        texto: "Identificar, em textos de diferentes gêneros, as marcas linguísticas que singularizam as variedades linguísticas sociais, regionais e de registro."
                    },
                    {
                        h: 26,
                        texto: "Relacionar as variedades linguísticas a situações específicas de uso social."
                    },
                    {
                        h: 27,
                        texto: "Reconhecer os usos da norma padrão da língua portuguesa nas diferentes situações de comunicação."
                    }
                ]
            },
            {
                n: 9,
                texto: "Entender os princípios, a natureza, a função e o impacto das tecnologias da comunicação e da informação na sua vida pessoal e social, no desenvolvimento do conhecimento, associando-o aos conhecimentos científicos, às linguagens que lhes dão suporte, às demais tecnologias, aos processos de produção e aos problemas que se propõem solucionar.",
                habilidades: [
                    {
                        h: 28,
                        texto: "Reconhecer a função e o impacto social das diferentes tecnologias da comunicação e informação."
                    },
                    {
                        h: 29,
                        texto: "Identificar pela análise de suas linguagens, as tecnologias da comunicação e informação."
                    },
                    {
                        h: 30,
                        texto: "Relacionar as tecnologias de comunicação e informação ao desenvolvimento das sociedades e ao conhecimento que elas produzem."
                    }
                ]
            }
        ]
    },
    {
        sigla: "MT",
        nome: "Matemática e suas Tecnologias",
        competencias: [
            {
                n: 1,
                texto: "Construir significados para os números naturais, inteiros, racionais e reais.",
                habilidades: [
                    {
                        h: 1,
                        texto: "Reconhecer, no contexto social, diferentes significados e representações dos números e operações - naturais, inteiros, racionais ou reais."
                    },
                    {
                        h: 2,
                        texto: "Identificar padrões numéricos ou princípios de contagem."
                    },
                    {
                        h: 3,
                        texto: "Resolver situação-problema envolvendo conhecimentos numéricos."
                    },
                    {
                        h: 4,
                        texto: "Avaliar a razoabilidade de um resultado numérico na construção de argumentos sobre afirmações quantitativas."
                    },
                    {
                        h: 5,
                        texto: "Avaliar propostas de intervenção na realidade utilizando conhecimentos numéricos."
                    }
                ]
            },
            {
                n: 2,
                texto: "Utilizar o conhecimento geométrico para realizar a leitura e a representação da realidade e agir sobre ela.",
                habilidades: [
                    {
                        h: 6,
                        texto: "Interpretar a localização e a movimentação de pessoas/objetos no espaço tridimensional e sua representação no espaço bidimensional."
                    },
                    {
                        h: 7,
                        texto: "Identificar características de figuras planas ou espaciais."
                    },
                    {
                        h: 8,
                        texto: "Resolver situação-problema que envolva conhecimentos geométricos de espaço e forma."
                    },
                    {
                        h: 9,
                        texto: "Utilizar conhecimentos geométricos de espaço e forma na seleção de argumentos propostos como solução de problemas do cotidiano."
                    }
                ]
            },
            {
                n: 3,
                texto: "Construir noções de grandezas e medidas para a compreensão da realidade e a solução de problemas do cotidiano.",
                habilidades: [
                    {
                        h: 10,
                        texto: "Identificar relações entre grandezas e unidades de medida."
                    },
                    {
                        h: 11,
                        texto: "Utilizar a noção de escalas na leitura de representação de situação do cotidiano."
                    },
                    {
                        h: 12,
                        texto: "Resolver situação-problema que envolva medidas de grandezas."
                    },
                    {
                        h: 13,
                        texto: "Avaliar o resultado de uma medição na construção de um argumento consistente."
                    },
                    {
                        h: 14,
                        texto: "Avaliar proposta de intervenção na realidade utilizando conhecimentos geométricos relacionados a grandezas e medidas."
                    }
                ]
            },
            {
                n: 4,
                texto: "Construir noções de variação de grandezas para a compreensão da realidade e a solução de problemas do cotidiano.",
                habilidades: [
                    {
                        h: 15,
                        texto: "Identificar a relação de dependência entre grandezas."
                    },
                    {
                        h: 16,
                        texto: "Resolver situação-problema envolvendo a variação de grandezas, direta ou inversamente proporcionais."
                    },
                    {
                        h: 17,
                        texto: "Analisar informações envolvendo a variação de grandezas como recurso para a construção de argumentação."
                    },
                    {
                        h: 18,
                        texto: "Avaliar propostas de intervenção na realidade envolvendo variação de grandezas."
                    }
                ]
            },
            {
                n: 5,
                texto: "Modelar e resolver problemas que envolvem variáveis socioeconômicas ou técnico-científicas, usando representações algébricas.",
                habilidades: [
                    {
                        h: 19,
                        texto: "Identificar representações algébricas que expressem a relação entre grandezas."
                    },
                    {
                        h: 20,
                        texto: "Interpretar gráfico cartesiano que represente relações entre grandezas."
                    },
                    {
                        h: 21,
                        texto: "Resolver situação-problema cuja modelagem envolva conhecimentos algébricos."
                    },
                    {
                        h: 22,
                        texto: "Utilizar conhecimentos algébricos/geométricos como recurso para a construção de argumentação."
                    },
                    {
                        h: 23,
                        texto: "Avaliar propostas de intervenção na realidade utilizando conhecimentos algébricos."
                    }
                ]
            },
            {
                n: 6,
                texto: "Interpretar informações de natureza científica e social obtidas da leitura de gráficos e tabelas, realizando previsão de tendência, extrapolação, interpolação e interpretação.",
                habilidades: [
                    {
                        h: 24,
                        texto: "Utilizar informações expressas em gráficos ou tabelas para fazer inferências."
                    },
                    {
                        h: 25,
                        texto: "Resolver problema com dados apresentados em tabelas ou gráficos."
                    },
                    {
                        h: 26,
                        texto: "Analisar informações expressas em gráficos ou tabelas como recurso para a construção de argumentos."
                    }
                ]
            },
            {
                n: 7,
                texto: "Compreender o caráter aleatório e não-determinístico dos fenômenos naturais e sociais e utilizar instrumentos adequados para medidas, determinação de amostras e cálculos de probabilidade para interpretar informações de variáveis apresentadas em uma distribuição estatística.",
                habilidades: [
                    {
                        h: 27,
                        texto: "Calcular medidas de tendência central ou de dispersão de um conjunto de dados expressos em uma tabela de frequências de dados agrupados (não em classes) ou em gráficos."
                    },
                    {
                        h: 28,
                        texto: "Resolver situação-problema que envolva conhecimentos de estatística e probabilidade."
                    },
                    {
                        h: 29,
                        texto: "Utilizar conhecimentos de estatística e probabilidade como recurso para a construção de argumentação."
                    },
                    {
                        h: 30,
                        texto: "Avaliar propostas de intervenção na realidade utilizando conhecimentos de estatística e probabilidade."
                    }
                ]
            }
        ]
    },
    {
        sigla: "CN",
        nome: "Ciências da Natureza e suas Tecnologias",
        competencias: [
            {
                n: 1,
                texto: "Compreender as ciências naturais e as tecnologias a elas associadas como construções humanas, percebendo seus papéis nos processos de produção e no desenvolvimento econômico e social da humanidade.",
                habilidades: [
                    {
                        h: 1,
                        texto: "Reconhecer características ou propriedades de fenômenos ondulatórios ou oscilatórios, relacionando-os a seus usos em diferentes contextos."
                    },
                    {
                        h: 2,
                        texto: "Associar a solução de problemas de comunicação, transporte, saúde ou outro, com o correspondente desenvolvimento científico e tecnológico."
                    },
                    {
                        h: 3,
                        texto: "Confrontar interpretações científicas com interpretações baseadas no senso comum, ao longo do tempo ou em diferentes culturas."
                    },
                    {
                        h: 4,
                        texto: "Avaliar propostas de intervenção no ambiente, considerando a qualidade da vida humana ou medidas de conservação, recuperação ou utilização sustentável da biodiversidade."
                    }
                ]
            },
            {
                n: 2,
                texto: "Identificar a presença e aplicar as tecnologias associadas às ciências naturais em diferentes contextos.",
                habilidades: [
                    {
                        h: 5,
                        texto: "Dimensionar circuitos ou dispositivos elétricos de uso cotidiano."
                    },
                    {
                        h: 6,
                        texto: "Relacionar informações para compreender manuais de instalação ou utilização de aparelhos, ou sistemas tecnológicos de uso comum."
                    },
                    {
                        h: 7,
                        texto: "Selecionar testes de controle, parâmetros ou critérios para a comparação de materiais e produtos, tendo em vista a defesa do consumidor, a saúde do trabalhador ou a qualidade de vida."
                    }
                ]
            },
            {
                n: 3,
                texto: "Associar intervenções que resultam em degradação ou conservação ambiental a processos produtivos e sociais e a instrumentos ou ações científico-tecnológicos.",
                habilidades: [
                    {
                        h: 8,
                        texto: "Identificar etapas em processos de obtenção, transformação, utilização ou reciclagem de recursos naturais, energéticos ou matérias-primas, considerando processos biológicos, químicos ou físicos neles envolvidos."
                    },
                    {
                        h: 9,
                        texto: "Compreender a importância dos ciclos biogeoquímicos ou do fluxo energia para a vida, ou da ação de agentes ou fenômenos que podem causar alterações nesses processos."
                    },
                    {
                        h: 10,
                        texto: "Analisar perturbações ambientais, identificando fontes, transporte e(ou) destino dos poluentes ou prevendo efeitos em sistemas naturais, produtivos ou sociais."
                    },
                    {
                        h: 11,
                        texto: "Reconhecer benefícios, limitações e aspectos éticos da biotecnologia, considerando estruturas e processos biológicos envolvidos em produtos biotecnológicos."
                    },
                    {
                        h: 12,
                        texto: "Avaliar impactos em ambientes naturais decorrentes de atividades sociais ou econômicas, considerando interesses contraditórios."
                    }
                ]
            },
            {
                n: 4,
                texto: "Compreender interações entre organismos e ambiente, em particular aquelas relacionadas à saúde humana, relacionando conhecimentos científicos, aspectos culturais e características individuais.",
                habilidades: [
                    {
                        h: 13,
                        texto: "Reconhecer mecanismos de transmissão da vida, prevendo ou explicando a manifestação de características dos seres vivos."
                    },
                    {
                        h: 14,
                        texto: "Identificar padrões em fenômenos e processos vitais dos organismos, como manutenção do equilíbrio interno, defesa, relações com o ambiente, sexualidade, entre outros."
                    },
                    {
                        h: 15,
                        texto: "Interpretar modelos e experimentos para explicar fenômenos ou processos biológicos em qualquer nível de organização dos sistemas biológicos."
                    },
                    {
                        h: 16,
                        texto: "Compreender o papel da evolução na produção de padrões, processos biológicos ou na organização taxonômica dos seres vivos."
                    }
                ]
            },
            {
                n: 5,
                texto: "Entender métodos e procedimentos próprios das ciências naturais e aplicá-los em diferentes contextos.",
                habilidades: [
                    {
                        h: 17,
                        texto: "Relacionar informações apresentadas em diferentes formas de linguagem e representação usadas nas ciências físicas, químicas ou biológicas, como texto discursivo, gráficos, tabelas, relações matemáticas ou linguagem simbólica."
                    },
                    {
                        h: 18,
                        texto: "Relacionar propriedades físicas, químicas ou biológicas de produtos, sistemas ou procedimentos tecnológicos às finalidades a que se destinam."
                    },
                    {
                        h: 19,
                        texto: "Avaliar métodos, processos ou procedimentos das ciências naturais que contribuam para diagnosticar ou solucionar problemas de ordem social, econômica ou ambiental."
                    }
                ]
            },
            {
                n: 6,
                texto: "Apropriar-se de conhecimentos da física para, em situações problema, interpretar, avaliar ou planejar intervenções científico- tecnológicas.",
                habilidades: [
                    {
                        h: 20,
                        texto: "Caracterizar causas ou efeitos dos movimentos de partículas, substâncias, objetos ou corpos celestes."
                    },
                    {
                        h: 21,
                        texto: "Utilizar leis físicas e (ou) químicas para interpretar processos naturais ou tecnológicos inseridos no contexto da termodinâmica e(ou) do eletromagnetismo."
                    },
                    {
                        h: 22,
                        texto: "Compreender fenômenos decorrentes da interação entre a radiação e a matéria em suas manifestações em processos naturais ou tecnológicos, ou em suas implicações biológicas, sociais, econômicas ou ambientais."
                    },
                    {
                        h: 23,
                        texto: "Avaliar possibilidades de geração, uso ou transformação de energia em ambientes específicos, considerando implicações éticas, ambientais, sociais e/ou econômicas."
                    }
                ]
            },
            {
                n: 7,
                texto: "Apropriar-se de conhecimentos da química para, em situações problema, interpretar, avaliar ou planejar intervenções científico- tecnológicas.",
                habilidades: [
                    {
                        h: 24,
                        texto: "Utilizar códigos e nomenclatura da química para caracterizar materiais, substâncias ou transformações químicas."
                    },
                    {
                        h: 25,
                        texto: "Caracterizar materiais ou substâncias, identificando etapas, rendimentos ou implicações biológicas, sociais, econômicas ou ambientais de sua obtenção ou produção."
                    },
                    {
                        h: 26,
                        texto: "Avaliar implicações sociais, ambientais e/ou econômicas na produção ou no consumo de recursos energéticos ou minerais, identificando transformações químicas ou de energia envolvidas nesses processos."
                    },
                    {
                        h: 27,
                        texto: "Avaliar propostas de intervenção no meio ambiente aplicando conhecimentos químicos, observando riscos ou benefícios."
                    }
                ]
            },
            {
                n: 8,
                texto: "Apropriar-se de conhecimentos da biologia para, em situações problema, interpretar, avaliar ou planejar intervenções científico- tecnológicas.",
                habilidades: [
                    {
                        h: 28,
                        texto: "Associar características adaptativas dos organismos com seu modo de vida ou com seus limites de distribuição em diferentes ambientes, em especial em ambientes brasileiros."
                    },
                    {
                        h: 29,
                        texto: "Interpretar experimentos ou técnicas que utilizam seres vivos, analisando implicações para o ambiente, a saúde, a produção de alimentos, matérias primas ou produtos industriais."
                    },
                    {
                        h: 30,
                        texto: "Avaliar propostas de alcance individual ou coletivo, identificando aquelas que visam à preservação e a implementação da saúde individual, coletiva ou do ambiente."
                    }
                ]
            }
        ]
    },
    {
        sigla: "CH",
        nome: "Ciências Humanas e suas Tecnologias",
        competencias: [
            {
                n: 1,
                texto: "Compreender os elementos culturais que constituem as identidades",
                habilidades: [
                    {
                        h: 1,
                        texto: "Interpretar historicamente e/ou geograficamente fontes documentais acerca de aspectos da cultura."
                    },
                    {
                        h: 2,
                        texto: "Analisar a produção da memória pelas sociedades humanas."
                    },
                    {
                        h: 3,
                        texto: "Associar as manifestações culturais do presente aos seus processos históricos."
                    },
                    {
                        h: 4,
                        texto: "Comparar pontos de vista expressos em diferentes fontes sobre determinado aspecto da cultura."
                    },
                    {
                        h: 5,
                        texto: "Identificar as manifestações ou representações da diversidade do patrimônio cultural e artístico em diferentes sociedades."
                    }
                ]
            },
            {
                n: 2,
                texto: "Compreender as transformações dos espaços geográficos como produto das relações socioeconômicas e culturais de poder.",
                habilidades: [
                    {
                        h: 6,
                        texto: "Interpretar diferentes representações gráficas e cartográficas dos espaços geográficos."
                    },
                    {
                        h: 7,
                        texto: "Identificar os significados histórico-geográficos das relações de poder entre as nações"
                    },
                    {
                        h: 8,
                        texto: "Analisar a ação dos estados nacionais no que se refere à dinâmica dos fluxos populacionais e no enfrentamento de problemas de ordem econômico-social."
                    },
                    {
                        h: 9,
                        texto: "Comparar o significado histórico-geográfico das organizações políticas e socioeconômicas em escala local, regional ou mundial."
                    },
                    {
                        h: 10,
                        texto: "Reconhecer a dinâmica da organização dos movimentos sociais e a importância da participação da coletividade na transformação da realidade histórico-geográfica."
                    }
                ]
            },
            {
                n: 3,
                texto: "Compreender a produção e o papel histórico das instituições sociais, políticas e econômicas, associando-as aos diferentes grupos, conflitos e movimentos sociais.",
                habilidades: [
                    {
                        h: 11,
                        texto: "Identificar registros de práticas de grupos sociais no tempo e no espaço."
                    },
                    {
                        h: 12,
                        texto: "Analisar o papel da justiça como instituição na organização das sociedades."
                    },
                    {
                        h: 13,
                        texto: "Analisar a atuação dos movimentos sociais que contribuíram para mudanças ou rupturas em processos de disputa pelo poder."
                    },
                    {
                        h: 14,
                        texto: "Comparar diferentes pontos de vista, presentes em textos analíticos e interpretativos, sobre situação ou fatos de natureza histórico-geográfica acerca das instituições sociais, políticas e econômicas."
                    },
                    {
                        h: 15,
                        texto: "Avaliar criticamente conflitos culturais, sociais, políticos, econômicos ou ambientais ao longo da história."
                    }
                ]
            },
            {
                n: 4,
                texto: "Entender as transformações técnicas e tecnológicas e seu impacto nos processos de produção, no desenvolvimento do conhecimento e na vida social.",
                habilidades: [
                    {
                        h: 16,
                        texto: "Identificar registros sobre o papel das técnicas e tecnologias na organização do trabalho e/ou da vida social."
                    },
                    {
                        h: 17,
                        texto: "Analisar fatores que explicam o impacto das novas tecnologias no processo de territorialização da produção."
                    },
                    {
                        h: 18,
                        texto: "Analisar diferentes processos de produção ou circulação de riquezas e suas implicações sócio-espaciais."
                    },
                    {
                        h: 19,
                        texto: "Reconhecer as transformações técnicas e tecnológicas que determinam as várias formas de uso e apropriação dos espaços rural e urbano."
                    },
                    {
                        h: 20,
                        texto: "Selecionar argumentos favoráveis ou contrários às modificações impostas pelas novas tecnologias à vida social e ao mundo do trabalho."
                    }
                ]
            },
            {
                n: 5,
                texto: "Utilizar os conhecimentos históricos para compreender e valorizar os fundamentos da cidadania e da democracia, favorecendo uma atuação consciente do indivíduo na sociedade.",
                habilidades: [
                    {
                        h: 21,
                        texto: "Identificar o papel dos meios de comunicação na construção da vida social."
                    },
                    {
                        h: 22,
                        texto: "Analisar as lutas sociais e conquistas obtidas no que se refere às mudanças nas legislações ou nas políticas públicas."
                    },
                    {
                        h: 23,
                        texto: "Analisar a importância dos valores éticos na estruturação política das sociedades."
                    },
                    {
                        h: 24,
                        texto: "Relacionar cidadania e democracia na organização das sociedades."
                    },
                    {
                        h: 25,
                        texto: "Identificar estratégias que promovam formas de inclusão social."
                    }
                ]
            },
            {
                n: 6,
                texto: "Compreender a sociedade e a natureza, reconhecendo suas interações no espaço em diferentes contextos históricos e geográficos.",
                habilidades: [
                    {
                        h: 26,
                        texto: "Identificar em fontes diversas o processo de ocupação dos meios físicos e as relações da vida humana com a paisagem."
                    },
                    {
                        h: 27,
                        texto: "Analisar de maneira crítica as interações da sociedade com o meio físico, levando em consideração aspectos históricos e(ou) geográficos."
                    },
                    {
                        h: 28,
                        texto: "Relacionar o uso das tecnologias com os impactos sócio-ambientais em diferentes contextos histórico-geográficos."
                    },
                    {
                        h: 29,
                        texto: "Reconhecer a função dos recursos naturais na produção do espaço geográfico, relacionando-os com as mudanças provocadas pelas ações humanas."
                    },
                    {
                        h: 30,
                        texto: "Avaliar as relações entre preservação e degradação da vida no planeta nas diferentes escalas."
                    }
                ]
            }
        ]
    }
];

/** Disciplina (nome oficial da BNCC) → área do ENEM. */
const AREA_DA_DISCIPLINA: Record<string, AreaEnem> = {
    "Língua Portuguesa": "LC",
    "Língua Inglesa": "LC",
    "Língua Espanhola": "LC",
    "Arte": "LC",
    "Educação Física": "LC",
    "Matemática": "MT",
    "Ciências": "CN",
    "Biologia": "CN",
    "Física": "CN",
    "Química": "CN",
    "Ciências da Natureza": "CN",
    "História": "CH",
    "Geografia": "CH",
    "Filosofia": "CH",
    "Sociologia": "CH",
    "Ciências Humanas": "CH",
    "Ensino Religioso": "CH",
};

export function areaEnemDaDisciplina(componente: string): AreaEnem | null {
    return AREA_DA_DISCIPLINA[componente?.trim()] ?? null;
}

export function areaEnem(sigla: AreaEnem): MatrizArea {
    return MATRIZ_ENEM.find((a) => a.sigla === sigla)!;
}

/** "CH-H26" → habilidade, competência e área, ou null se o código não existir. */
export function habilidadeEnem(codigo: string): { area: MatrizArea; competencia: CompetenciaEnem; habilidade: HabilidadeEnem } | null {
    const m = /^(LC|MT|CN|CH)-H(\d{1,2})$/.exec((codigo || "").trim().toUpperCase());
    if (!m) return null;
    const area = areaEnem(m[1] as AreaEnem);
    const h = Number(m[2]);
    for (const competencia of area.competencias) {
        const habilidade = competencia.habilidades.find((x) => x.h === h);
        if (habilidade) return { area, competencia, habilidade };
    }
    return null;
}

/** Bloco que vai no prompt: o parâmetro do item, com o texto oficial. */
export function blocoParametroEnem(codigo: string): string {
    const r = habilidadeEnem(codigo);
    if (!r) return "";
    return [
        `PARÂMETRO DO ITEM (Matriz de Referência do ENEM — use exatamente este texto, sem reescrever):`,
        `- Área: ${r.area.nome}`,
        `- Competência de área ${r.competencia.n}: ${r.competencia.texto}`,
        `- H${r.habilidade.h}: ${r.habilidade.texto}`,
    ].join("\n");
}
