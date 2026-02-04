# pages/9_PGI.py
"""
Plano de Gestão Inclusiva (PGI) — Gerador baseado em 5W2H.
Focado na ESCOLA (diferente do PEI, que é do aluno).
Eixos: Infraestrutura, Formação de Equipe, Recursos Pedagógicos.
"""
from __future__ import annotations

import streamlit as st
import os
from datetime import date, datetime
from zoneinfo import ZoneInfo

import omni_utils as ou
from omni_utils import get_icon, icon_title, get_icon_emoji

try:
    from ui_lockdown import hide_streamlit_chrome_if_needed, hide_default_sidebar_nav
    hide_streamlit_chrome_if_needed()
    hide_default_sidebar_nav()
except Exception:
    pass

st.set_page_config(
    page_title="Omnisfera | PGI - Plano de Gestão Inclusiva",
    page_icon="omni_icone.png",
    layout="wide",
    initial_sidebar_state="collapsed",
)

ou.ensure_state()

if not st.session_state.get("autenticado") or not st.session_state.get("workspace_id"):
    ou.render_acesso_bloqueado("Faça login para acessar o Gerador de PGI.")

try:
    from ui.permissions import can_access
    if not can_access("gestao"):
        ou.render_acesso_bloqueado(
            "Apenas gestores podem acessar o Plano de Gestão Inclusiva.",
            "Entre em contato com o responsável pela escola.",
        )
except Exception:
    pass

ou.render_omnisfera_header()
ou.render_navbar(active_tab="PGI")
ou.inject_compact_app_css()

# CSS específico da página PGI
st.markdown("""
<style>
.pgi-hero {
    background: linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #14B8A6 100%);
    border-radius: 20px;
    padding: 2rem 2.5rem;
    margin-bottom: 2rem;
    color: white;
    box-shadow: 0 10px 40px rgba(13, 148, 136, 0.25);
}
.pgi-hero h1 { color: white !important; font-size: 1.85rem !important; margin: 0 0 0.5rem 0 !important; }
.pgi-hero p { color: rgba(255,255,255,0.95) !important; font-size: 1rem !important; margin: 0 !important; line-height: 1.5; }
.pgi-card {
    background: white;
    border-radius: 16px;
    border: 1px solid #E2E8F0;
    padding: 1.5rem 2rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.pgi-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
}
.pgi-table th { background: #F1F5F9; padding: 10px 12px; text-align: left; border-bottom: 2px solid #E2E8F0; }
.pgi-table td { padding: 10px 12px; border-bottom: 1px solid #E2E8F0; }
.pgi-table tr:hover { background: #F8FAFC; }
.pgi-badge { display: inline-block; padding: 4px 10px; border-radius: 99px; font-size: 0.75rem; font-weight: 600; }
.pgi-badge-infra { background: #DBEAFE; color: #1E40AF; }
.pgi-badge-equipe { background: #FEF3C7; color: #B45309; }
.pgi-badge-pedag { background: #D1FAE5; color: #047857; }
.pgi-badge-pgei { background: #E0E7FF; color: #4338CA; }
.pgi-badge-com { background: #FCE7F3; color: #BE185D; }
.pgi-info-box { background: #F0FDFA; border-left: 4px solid #0F766E; padding: 1rem 1.25rem; border-radius: 0 12px 12px 0; margin: 1rem 0; }
.pgi-info-box h4 { color: #0F766E; margin: 0 0 0.5rem 0; font-size: 1rem; }
.pgi-quote { background: #F8FAFC; border-left: 3px solid #CBD5E1; padding: 1rem; border-radius: 0 8px 8px 0; font-style: italic; color: #475569; margin: 1rem 0; }
.pgi-caso { background: white; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.25rem; margin: 1rem 0; box-shadow: 0 2px 4px rgba(0,0,0,0.04); }
.pgi-caso strong { color: #0F766E; }
</style>
""", unsafe_allow_html=True)

# Estado das ações cadastradas e dimensionamento preliminar
if "pgi_acoes" not in st.session_state:
    st.session_state.pgi_acoes = []
if "pgi_dimensionamento" not in st.session_state:
    st.session_state.pgi_dimensionamento = {}

TIPOS_ACAO = {
    "infraestrutura": ("Infraestrutura (Acessibilidade física)", "pgi-badge-infra", "ri-building-line"),
    "formacao_equipe": ("Formação de Equipe (Capacitação docente/staff)", "pgi-badge-equipe", "ri-team-line"),
    "recursos_pedagogicos": ("Recursos Pedagógicos (Tecnologia assistiva)", "pgi-badge-pedag", "ri-tools-line"),
    "dimensionamento_pgei": ("Dimensionamento / Equipe (PGEI)", "pgi-badge-pgei", "ri-bar-chart-line"),
    "comunicacao_procedimentos": ("Comunicação e procedimentos institucionais", "pgi-badge-com", "ri-chat-3-line"),
}
PERFIS_ATENDIMENTO = ["TEA", "Deficiência física", "Deficiência intelectual", "Dificuldades de aprendizagem", "Altas habilidades", "Comportamentos disruptivos", "Outro"]

# ==============================================================================
# 1. HERO SECTION
# ==============================================================================
st.markdown("""
<div class="pgi-hero">
    <h1>Plano de Gestão Inclusiva — PGI</h1>
    <p>Estruture o acolhimento antes da matrícula. Organize sua escola nos eixos de <strong>Infraestrutura</strong>, <strong>Equipe</strong> e <strong>Cultura</strong>.</p>
</div>
""", unsafe_allow_html=True)

# ==============================================================================
# 2. ABAS: INICIAL (Acolhimento) | GERADOR (5W2H)
# ==============================================================================
tab_inicial, tab_gerador = st.tabs(["Inicial — Acolhimento", "Gerador — O Plano da Escola"])

# --- ABA INICIAL: Acolhimento dos estudantes ---
with tab_inicial:
    st.markdown("### 1. Acolhimento dos estudantes")

    st.markdown("""
    A inclusão de estudantes com deficiência no ambiente escolar é um compromisso essencial para a construção de uma sociedade mais equitativa e democrática. 
    **Todos os estudantes**, com deficiência ou não, devem ser acolhidos em uma escola que não apenas os receba, mas os integre plenamente por meio de práticas 
    pedagógicas significativas e inclusivas.

    No entanto, receber o aluno com deficiência não significa automaticamente que ele será incluído, pois há inúmeras condições a serem observadas 
    a fim de que essa inclusão se efetue.
    """)

    st.markdown("#### Elementos fundamentais para o acolhimento inclusivo")
    st.markdown("Para que a inclusão seja uma realidade, algumas condições são indispensáveis:")

    st.markdown("""
    **1. Políticas inclusivas claras e transparentes**  
    A escola deve adotar políticas que garantam o acesso e a permanência de todos os alunos. Isso inclui um Projeto Político-Pedagógico (PPP) que contemple a diversidade como um valor essencial.

    **2. Ambientes acessíveis**  
    A infraestrutura escolar deve ser adaptada para atender às necessidades dos estudantes com deficiência, com a disponibilização de recursos como rampas, banheiros adaptados, tecnologias assistivas e materiais pedagógicos acessíveis.

    **3. Formação continuada de educadores**  
    É essencial que professores e demais agentes educativos sejam capacitados continuamente para desenvolver práticas pedagógicas inclusivas e acolhedoras. A realização desse trabalho exige que os profissionais se disponham a enfrentar eventual sentimento de insegurança, tendo em vista a complexa responsabilidade assumida, o desafio das limitações individuais dos alunos(as), as expectativas e frustrações quanto ao progresso da escolarização.
    """)

    st.markdown("---")
    st.markdown("#### Exemplo de atuação dos gestores")

    st.markdown("""
    **Mediação com formação de conscientização:**  
    Organizar encontros educativos para famílias e alunos, com especialistas, para abordar os benefícios da inclusão e combater preconceitos. Esses eventos podem incluir palestras, rodas de conversa ou dinâmicas para desenvolver empatia e sensibilização.

    **Elaboração de um código de conduta inclusivo:**  
    Revisar ou criar um código de conduta para a comunidade escolar, estabelecendo consequências claras para atitudes de discriminação e promovendo valores como respeito e acolhimento.
    """)

    st.markdown("---")
    st.markdown("#### Caso ilustrativo")

    with st.container():
        st.markdown("**Situação:**")
        st.markdown("Em uma escola particular, um grupo de pais reclamou que o desempenho acadêmico da turma havia caído após a inclusão de um aluno autista com dificuldades de interação. As famílias pressionaram a gestão para transferir o estudante.")

        st.markdown("**Ação do gestor:**")
        st.markdown("O diretor organizou uma reunião com os pais da turma, trazendo um especialista em educação inclusiva para esclarecer como a diversidade beneficia o ambiente escolar. Além disso, iniciou um programa de formação para os professores sobre práticas inclusivas, e reforçou o valor da inclusão no projeto pedagógico da escola.")

        st.markdown("**Resultado:**")
        st.markdown("Os pais passaram a compreender a importância do processo inclusivo, e o clima de aceitação na escola melhorou. O aluno foi mantido na turma, e a escola viu um aumento no engajamento das famílias em atividades escolares.")

    st.markdown("---")
    st.markdown("#### O papel da gestão escolar no acolhimento")

    st.markdown("""
    Os gestores desempenham um papel estratégico no acolhimento de estudantes com deficiência. Eles devem garantir:

    - **Formação em serviço:** Organizar encontros e capacitações que fortaleçam as práticas dos educadores, promovendo a troca de experiências e a resolução de dúvidas.
    - **Mediação de conflitos:** Agir de forma proativa frente a atitudes preconceituosas, seja por parte de alunos, famílias ou mesmo outros profissionais da escola.
    - **Apoio emocional aos educadores:** Reconhecer os desafios enfrentados pelos professores e oferecer suporte para lidar com sentimentos de insegurança ou frustração.
    """)

    st.info("O trabalho inclusivo com alunos deve constar do Projeto Pedagógico da escola e ser informado às famílias, de modo que, já no ato da matrícula, saibam da obrigatoriedade da instituição em fornecer tal espaço educativo. **A matrícula é direito constitucional do aluno com deficiência e de todos os cidadãos.**")

    st.markdown("---")
    st.markdown("#### Aspectos legais do acolhimento")

    st.markdown("""
    A escola **não pode negar a matrícula** aos alunos com deficiência, com transtornos de comportamento e/ou de aprendizagem sob a alegação de falta de vagas. 
    A Lei 7.853/89 art. 8º, inciso I, define como crime a recusa ou suspensão de matrícula de alunos nessas condições. O Decreto nº 3.298, de 20 de dezembro de 1999, regulamenta a Lei 7.853/89.
    """)

    st.markdown('*"Na escola inclusiva professores e alunos aprendem uma lição que a vida dificilmente ensina: respeitar as diferenças. E, esse é o primeiro passo para se construir uma sociedade mais justa."* — Mantoan (2003)')

    st.markdown("---")
    st.markdown("#### Boas práticas no acolhimento")

    st.markdown("""
    1. **Criação de um plano de acolhimento personalizado**  
    Cada estudante com deficiência tem necessidades e características únicas. A elaboração de um plano de acolhimento, envolvendo familiares, educadores e profissionais especializados, permite atender essas especificidades.

    2. **Atividades de integração**  
    Organizar dinâmicas de grupo, projetos interativos e momentos de convivência pode ajudar a construir vínculos entre os estudantes e promover uma cultura de respeito às diferenças.

    3. **Envolvimento da família**  
    Realizar reuniões regulares com as famílias para discutir as necessidades e os avanços dos estudantes fortalece a parceria escola-comunidade.

    4. **Redes de apoio externas**  
    Estabelecer parcerias com ONGs, instituições de saúde e outros órgãos pode proporcionar suporte adicional às práticas inclusivas da escola.
    """)

    st.markdown("---")
    st.markdown("### 2. Atendimento ao aluno — compromisso e ação")

    with st.expander("📖 Bloco 2.1 — Conceito e referência", expanded=True):
        st.markdown("""
        O aluno, seja qual for sua condição ou necessidade, é o **centro do projeto escolar** em qualquer modalidade educativa. A escola deve oferecer condições para o seu pleno desenvolvimento. Garantir o acompanhamento sistemático e contínuo, integrando dados e informações tanto da área pedagógica quanto da área socioemocional, além dos relacionados aos modos de convivência na comunidade escolar, supõe uma equipe de profissionais em movimento sinérgico, aptos para realizar um conjunto de tarefas articuladas.

        *Referência: VALADÃO, M. P. B.; VALADÃO, P. B.; COELHO, J. T. (org.). Referencial de Educação Inclusiva. SINEP-BA. Garimpo Editorial. São Paulo, 2024.*
        """)

    with st.expander("📋 Bloco 2.2 — PGEI: estrutura e equipe"):
        st.markdown("""
        A escola deve prever no seu Projeto Pedagógico um **Plano Geral de Educação Inclusiva (PGEI)** que pode estar no bojo da orientação educacional ou se constituir como um departamento (Serviço de Apoio à Inclusão, Orientação às Práticas Inclusivas, entre outras).

        **Equipe atuante:** orientadores(as) educacionais, psicólogos(as), psicopedagogos(as), professores(as) habilitados. O coordenador(a) pedagógico(a) terá papel importante na adaptação curricular aos planos individuais (PEI/PDI).

        **Recepção e documentação:** Cabe ao orientador(a) educacional ou psicólogo(a) escolar receber a família e especialistas externos, registrar dados (relatórios médicos, laudos, orientações técnicas, autorizações das famílias, agenda de atendimentos, contatos dos profissionais externos), arquivá-los com garantia de sigilo e disponibilizar ao setor pedagógico o conteúdo necessário à personalização do currículo no PEI/PDI.

        *Quando a escola não conta com equipe multidisciplinar ampla, o coordenador pedagógico pode assumir a recepção, acompanhamento e orientação de docentes e famílias.*
        """)

    with st.expander("📊 Bloco 2.3 — Questões preliminares para o PGEI"):
        st.markdown("""
        1. **Número total de alunos** e número de alunos com deficiência matriculados  
        2. **Número de profissionais por período** e horas efetivas de permanência da equipe de inclusão

        Essas variáveis impactam o dimensionamento do atendimento e a qualidade das ações inclusivas: determinam alocação de recursos (professores de apoio, mediadores, intérpretes de Libras), orientam a organização da rotina e influenciam prioridades e tempo para cada intervenção.
        """)

    with st.expander("✅ Bloco 2.4 — Check-list prático para elaboração do PGEI"):
        st.markdown("""
        - Levantar o número total de alunos e os perfis específicos (com deficiência, altas habilidades, etc.)
        - Identificar necessidades específicas de cada perfil (intérpretes, materiais adaptados)
        - Dimensionar a equipe de inclusão e verificar carga horária disponível
        - Planejar ações coletivas e individuais, alinhadas ao PPP
        - Garantir formação continuada para toda a equipe escolar
        - Estabelecer indicadores para avaliar a implementação (participação, frequência)
        """)

    with st.expander("📊 Bloco 2.5 — Tabela de dimensionamento + exemplo de aplicação"):
        st.markdown("""
        | Questão Preliminar | Exemplo | Ação Sugestiva |
        |-------------------|---------|----------------|
        | Nº de alunos com deficiência | 5 em escola com 300 alunos | Contratar 1 mediador para cada aluno que demande suporte contínuo |
        | Perfil dos alunos | Deficiência física, TEA, altas habilidades | Mapear necessidades (acessibilidade, intérpretes, materiais adaptados) |
        | Nº de profissionais por período | 2 professores de apoio; 1 coordenador | Avaliar ampliação da equipe conforme turnos de maior demanda |
        | Horas efetivas da equipe | 6h/dia; demandas extras 4h/semana | Realocar em horários estratégicos ou solicitar ampliação |
        """)
        st.markdown("**Exemplo:** Escola com 10 alunos (4 TEA, 2 def. física, 3 dificuldades aprendizagem, 1 altas habilidades). Equipe: 2 mediadores + 1 coordenador.")
        st.markdown("**Desafios comuns:** Insuficiência de mediadores; falta de planejamento para altas habilidades.")
        st.markdown("**Soluções propostas:** Contratar mediador adicional; criar grupo de enriquecimento curricular para altas habilidades; reorganizar rotina para priorizar horários de maior demanda.")

    with st.expander("👥 Bloco 2.6 — Perfis contemplados no PGEI"):
        st.markdown("""
        O PGEI considera perfis singulares: alunos com **deficiência**, **comportamentos disruptivos**, **transtornos e/ou dificuldades de aprendizagem específicas** e **altas habilidades**. Use esses perfis ao cadastrar ações no Gerador.
        """)

    st.markdown("---")
    st.markdown("### 3. Equipe de trabalho em ação")

    with st.expander("👥 Bloco 3.1 — Papéis da equipe (orientador, psicólogo, AT)"):
        st.markdown("""
        O Setor de Orientação Educacional deve contar com **psicólogo(a) escolar**, **orientador(a) educacional** e **assistentes pedagógicas (APs)**.

        - **Orientador(a) educacional:** Dinâmicas entre alunos, professores e famílias; bem-estar e integração social; pontes entre currículo e desempenho.
        - **Psicólogo(a) escolar:** Estudos de caso; acompanhamento do cumprimento do PEI/PDI; organização de encontros com famílias e profissionais externos; supervisão de ATs e APs. Não assume função terapêutica.
        - **Atendente terapêutico (AT):** Atendimento individual e exclusivo do aluno, vínculo com família/clínica, inserido via Termo de Compromisso. Custeado pelo Estado ou família. Política de Proteção aos Direitos das Pessoas com TEA garante acompanhante especializado em sala quando há comprovada necessidade (BRASIL, 2012).
        """)

    with st.expander("🔒 Bloco 3.2 — Comunicação e sigilo"):
        st.markdown("""
        Uma das questões fundamentais é a **comunicação interna** entre profissionais que atuam com o aluno, a troca com profissionais externos e o **diálogo com as famílias**. Em todos os casos, o sigilo e a reserva de informações devem ser respeitados conforme o limite da atuação de cada profissional. A responsabilidade pela privacidade do aluno é de todos; cabe à equipe de educação inclusiva a tarefa de filtrar dados e informações.
        """)

# --- ABA GERADOR: Formulário 5W2H e tabela ---
with tab_gerador:
    st.markdown(f"### {icon_title('O Gerador', 'fluxo', 22, '#0F766E')}", unsafe_allow_html=True)
    st.caption("Cadastre ações usando o framework 5W2H. Alinhe com o PGEI: Infraestrutura, Formação, Recursos Pedagógicos ou Dimensionamento da equipe.")

    with st.expander("📐 Dimensionamento preliminar (opcional)", expanded=False):
        st.caption("Preencha conforme as questões do PGEI. Esses números orientam as ações que você vai cadastrar.")
        d1, d2 = st.columns(2)
        with d1:
            n_total = st.number_input("Nº total de alunos", min_value=0, value=st.session_state.pgi_dimensionamento.get("n_total", 0), key="dim_n_total")
            n_deficiencia = st.number_input("Nº alunos com deficiência / necessidades específicas", min_value=0, value=st.session_state.pgi_dimensionamento.get("n_deficiencia", 0), key="dim_n_def")
        with d2:
            n_prof = st.number_input("Nº profissionais da equipe de inclusão", min_value=0, value=st.session_state.pgi_dimensionamento.get("n_prof", 0), key="dim_n_prof")
            horas_dia = st.number_input("Horas efetivas da equipe por dia", min_value=0.0, value=float(st.session_state.pgi_dimensionamento.get("horas_dia", 0)), key="dim_horas", step=0.5)
        if n_total or n_deficiencia or n_prof or horas_dia:
            st.session_state.pgi_dimensionamento = {"n_total": n_total, "n_deficiencia": n_deficiencia, "n_prof": n_prof, "horas_dia": horas_dia}

    with st.expander("💡 Dicas do PGEI — use na aba Inicial para referência", expanded=False):
        st.markdown("""
        - **Infraestrutura:** rampas, banheiros adaptados, tecnologias assistivas  
        - **Formação:** capacitação docente, HTPC, formação sobre LDB/BNCC  
        - **Recursos pedagógicos:** materiais adaptados, intérpretes de Libras  
        - **Dimensionamento PGEI:** alocação de mediadores, ampliação de carga horária, reorganização de turnos  
        - **Comunicação e procedimentos:** fluxo de recepção à família, arquivamento de documentação PEI/PDI
        """)

    st.markdown("**Ações sugeridas** (clique para adicionar rapidamente ao plano)")
    sug_cols = st.columns(4)
    def _add_acao_rapida(o_que, por_que, tipo):
        st.session_state.pgi_acoes.append({
            "tipo": tipo,
            "o_que": o_que,
            "por_que": por_que,
            "quem": "",
            "onde": "",
            "como": "",
            "prazo": date.today().isoformat(),
            "custo": "",
            "perfil": [],
            "criado_em": datetime.now(ZoneInfo("America/Sao_Paulo")).isoformat(),
        })
        st.rerun()
    with sug_cols[0]:
        if st.button("➕ Contratar mediador", key="sug_mediador", use_container_width=True):
            _add_acao_rapida("Contratar mediador adicional para alunos com maior necessidade de suporte", "Insuficiência de mediadores (dimensionamento PGEI)", "dimensionamento_pgei")
    with sug_cols[1]:
        if st.button("➕ Grupo enriquecimento", key="sug_altas", use_container_width=True):
            _add_acao_rapida("Criar grupo de enriquecimento curricular para altas habilidades", "Atendimento diferenciado em horários de menor demanda", "dimensionamento_pgei")
    with sug_cols[2]:
        if st.button("➕ Reorganizar rotina", key="sug_rotina", use_container_width=True):
            _add_acao_rapida("Reorganizar rotina da equipe para priorizar horários de maior demanda", "Otimização do dimensionamento", "dimensionamento_pgei")
    with sug_cols[3]:
        if st.button("➕ Fluxo recepção/doc.", key="sug_fluxo", use_container_width=True):
            _add_acao_rapida("Estabelecer fluxo de recepção à família e arquivamento de documentação PEI/PDI", "Garantir sigilo e disponibilizar ao setor pedagógico", "comunicacao_procedimentos")

    tipo_acao = st.radio(
        "Tipo de Ação:",
        options=list(TIPOS_ACAO.keys()),
        format_func=lambda k: TIPOS_ACAO[k][0],
        horizontal=True,
        key="pgi_tipo_radio",
    )

    with st.form("pgi_form", clear_on_submit=True):
        c1, c2 = st.columns(2)
        with c1:
            o_que = st.text_input(
                "O QUE (Ação prática)",
                placeholder="Ex: Adaptação de banheiros / Aquisição de rampas móveis / Formação sobre LDB / Contratar mediador adicional / Grupo de enriquecimento para altas habilidades",
                help="Descreva a ação concreta. Para PGEI: contratar mediador, ampliar carga horária, mapear perfis.",
            )
            por_que = st.text_area(
                "POR QUE (Justificativa)",
                placeholder="Ex: Garantia de acesso (Módulo 2, LBI) / Dimensionamento PGEI: insuficiência de mediadores para demanda atual / Formação continuada para práticas inclusivas",
                height=80,
            )
        with c2:
            quem = st.text_input(
                "QUEM (Responsável)",
                placeholder="Ex: Coordenação pedagógica / Secretaria de obras",
            )
            onde = st.text_input(
                "ONDE (Local)",
                placeholder="Ex: Bloco A, sala 12 / Salas de aula / Laboratório de informática",
            )
            col_prazo, col_custo = st.columns(2)
            with col_prazo:
                prazo = st.date_input("PRAZO", value=date.today(), min_value=date.today())
            with col_custo:
                custo = st.text_input(
                    "CUSTO (R$)",
                    placeholder="Ex: 5.000,00 ou A definir",
                )
            como = st.text_input(
                "COMO (Método)",
                placeholder="Ex: Contratação de empresa especializada / Palestra em horário de HTPC",
            )
            perfil = st.multiselect(
                "Perfil de atendimento (opcional)",
                options=PERFIS_ATENDIMENTO,
                default=[],
                help="TEA, deficiência física, altas habilidades, etc. — conforme PGEI",
            )

        if st.form_submit_button("➕ Adicionar ação ao plano"):
            if not o_que or not o_que.strip():
                st.error("Informe a ação (O QUE) para cadastrar.")
            else:
                st.session_state.pgi_acoes.append({
                    "tipo": tipo_acao,
                    "o_que": o_que.strip(),
                    "por_que": (por_que or "").strip(),
                    "quem": (quem or "").strip(),
                    "onde": (onde or "").strip(),
                    "como": (como or "").strip(),
                    "prazo": prazo.isoformat() if prazo else "",
                    "custo": (custo or "").strip(),
                    "perfil": perfil if perfil else [],
                    "criado_em": datetime.now(ZoneInfo("America/Sao_Paulo")).isoformat(),
                })
                st.success("Ação adicionada ao plano da escola.")
                st.rerun()

    # ÁREA DE RESULTADO — O PLANO DA ESCOLA
    st.markdown("---")
    st.markdown(f"### {icon_title('O Plano da Escola', 'visualizar', 22, '#0F766E')}", unsafe_allow_html=True)

    acoes = st.session_state.pgi_acoes

    if not acoes:
        st.info("Nenhuma ação cadastrada ainda. Use o formulário acima para adicionar.")
    else:
        # Tabela
        for i, a in enumerate(acoes):
            tipo_label, badge_class, _ = TIPOS_ACAO.get(a["tipo"], ("—", "pgi-badge-infra", ""))
            col_tipo, col_resto, col_act = st.columns([1, 4, 1])
            with col_tipo:
                st.markdown(f'<span class="pgi-badge {badge_class}">{tipo_label.split(" (")[0]}</span>', unsafe_allow_html=True)
            with col_resto:
                st.markdown(f"**{a['o_que']}**")
                if a.get("por_que"):
                    st.caption(f"Por quê: {a['por_que'][:120]}{'...' if len(a.get('por_que','')) > 120 else ''}")
                sub = st.columns(4)
                with sub[0]:
                    st.caption(f"👤 {a.get('quem') or '—'}")
                with sub[1]:
                    st.caption(f"📍 {a.get('onde') or '—'}")
                with sub[2]:
                    prazo_fmt = a.get("prazo", "")
                    if prazo_fmt:
                        try:
                            d = datetime.fromisoformat(prazo_fmt).date()
                            prazo_fmt = d.strftime("%d/%m/%Y")
                        except Exception:
                            pass
                    st.caption(f"📅 {prazo_fmt or '—'}")
                with sub[3]:
                    st.caption(f"💰 {a.get('custo') or '—'}")
                if a.get("perfil"):
                    st.caption(f"📌 Perfis: {', '.join(a['perfil'])}")
            with col_act:
                if st.button("🗑️", key=f"pgi_del_{i}", help="Remover"):
                    st.session_state.pgi_acoes.pop(i)
                    st.rerun()
            st.divider()

        # Exportar PDF
        def _gerar_pdf_pgi(acoes_list):
            from fpdf import FPDF
            import io

            class PDFPGI(FPDF):
                def header(self):
                    self.set_font("Arial", "B", 14)
                    self.set_text_color(15, 118, 110)
                    self.cell(0, 10, "Plano de Gestao Inclusiva (PGI)", 0, 1, "C")
                    self.set_draw_color(200, 200, 200)
                    self.line(10, 25, 200, 25)
                    self.ln(8)

                def section_title(self, txt):
                    self.set_font("Arial", "B", 11)
                    self.set_text_color(30, 40, 50)
                    self.cell(0, 8, txt, 0, 1)
                    self.ln(2)

            def _limpar(s):
                if not s:
                    return ""
                t = str(s).replace("\n", " ").replace("\r", " ")[:500]
                try:
                    return t.encode("latin-1", "replace").decode("latin-1")
                except Exception:
                    return "".join(c if ord(c) < 256 else "?" for c in t)

            pdf = PDFPGI()
            pdf.add_page()
            pdf.set_font("Arial", "", 10)
            pdf.cell(0, 6, f"Documento gerado em: {datetime.now(ZoneInfo('America/Sao_Paulo')).strftime('%d/%m/%Y %H:%M')}", 0, 1)
            pdf.ln(6)

            tipo_map = {
                "infraestrutura": "Infraestrutura (Acessibilidade fisica)",
                "formacao_equipe": "Formacao de Equipe (Capacitacao docente/staff)",
                "recursos_pedagogicos": "Recursos Pedagogicos (Tecnologia assistiva)",
                "dimensionamento_pgei": "Dimensionamento / Equipe (PGEI)",
                "comunicacao_procedimentos": "Comunicacao e procedimentos institucionais",
            }

            for i, a in enumerate(acoes_list, 1):
                pdf.section_title(f"Acao {i}: {tipo_map.get(a.get('tipo',''), a.get('tipo',''))}")
                pdf.set_font("Arial", "B", 10)
                pdf.cell(0, 6, "O QUE:", 0, 1)
                pdf.set_font("Arial", "", 10)
                pdf.multi_cell(0, 6, _limpar(a.get("o_que", "")))
                pdf.cell(0, 6, "POR QUE:", 0, 1)
                pdf.multi_cell(0, 6, _limpar(a.get("por_que", "")))
                pdf.cell(0, 6, "QUEM:", 0, 1)
                pdf.multi_cell(0, 6, _limpar(a.get("quem", "")))
                pdf.cell(0, 6, "ONDE:", 0, 1)
                pdf.multi_cell(0, 6, _limpar(a.get("onde", "")) or "A definir")
                pdf.cell(0, 6, "COMO:", 0, 1)
                pdf.multi_cell(0, 6, _limpar(a.get("como", "")) or "A definir")
                pdf.cell(0, 6, "PRAZO:", 0, 1)
                prazo_pdf = a.get("prazo", "")
                if prazo_pdf:
                    try:
                        d = datetime.fromisoformat(prazo_pdf).date()
                        prazo_pdf = d.strftime("%d/%m/%Y")
                    except Exception:
                        pass
                pdf.multi_cell(0, 6, prazo_pdf or "A definir")
                pdf.cell(0, 6, "CUSTO (R$):", 0, 1)
                pdf.multi_cell(0, 6, _limpar(a.get("custo", "")) or "A definir")
                perfis = a.get("perfil") or []
                if perfis:
                    pdf.cell(0, 6, "PERFIL DE ATENDIMENTO:", 0, 1)
                    pdf.multi_cell(0, 6, _limpar(", ".join(perfis)))
                pdf.ln(6)

            buf = io.BytesIO()
            pdf.output(buf)
            return buf.getvalue()

        st.markdown("---")
        col_btn, _ = st.columns([1, 3])
        with col_btn:
            pdf_bytes = _gerar_pdf_pgi(acoes)
            st.download_button(
                "Exportar PGI em PDF",
                pdf_bytes,
                file_name=f"PGI_Plano_Gestao_Inclusiva_{date.today().strftime('%Y%m%d')}.pdf",
                mime="application/pdf",
                type="primary",
                use_container_width=True,
            )
