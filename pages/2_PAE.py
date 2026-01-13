import streamlit as st
import os
from openai import OpenAI
import json
import pandas as pd
from datetime import date

# ==============================================================================
# 1. CONFIGURAÇÃO E SEGURANÇA (VISUAL OMNISFERA)
# ==============================================================================
st.set_page_config(page_title="Omnisfera | PAE", page_icon="🧩", layout="wide")

def verificar_acesso():
    if "autenticado" not in st.session_state or not st.session_state["autenticado"]:
        st.error("🔒 Acesso Negado. Por favor, faça login na Página Inicial.")
        st.stop()
    
    # --- CSS GLOBAL OMNISFERA (DESIGN SYSTEM) ---
    st.markdown("""
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Nunito:wght@400;600;700&display=swap');
            
            /* Fundo e Tipografia Geral */
            html, body, [class*="css"] { 
                font-family: 'Nunito', sans-serif; 
                color: #2D3748; 
                background-color: #F7FAFC; /* Fundo Gelo */
            }
            
            /* Ajuste do Topo */
            .block-container { padding-top: 1rem !important; padding-bottom: 5rem !important; }
            [data-testid="stHeader"] { background-color: rgba(0,0,0,0); visibility: visible; }

            /* --- HERO BANNER SLIM --- */
            .dash-hero { 
                background: linear-gradient(135deg, #0F52BA 0%, #062B61 100%); 
                border-radius: 12px;
                margin-bottom: 25px; 
                box-shadow: 0 4px 10px rgba(15, 82, 186, 0.2);
                color: white;
                position: relative;
                overflow: hidden;
                padding: 25px 40px;
                display: flex; align-items: center; justify-content: flex-start;
            }
            .hero-title { font-family: 'Inter', sans-serif; font-weight: 700; font-size: 1.8rem; margin: 0; line-height: 1.1; }
            .hero-subtitle { color: rgba(255,255,255,0.9); font-size: 0.95rem; margin-top: 5px; font-weight: 400; font-style: italic; }
            .hero-bg-icon { position: absolute; right: 30px; font-size: 4rem; opacity: 0.1; color: white; transform: rotate(-10deg); top: 10px; }

            /* --- CARDS (CONTAINERS BRANCOS) --- */
            [data-testid="stVerticalBlockBorderWrapper"] {
                background-color: white;
                border-radius: 12px;
                padding: 20px;
                border: 1px solid #E2E8F0;
                box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                margin-bottom: 20px;
            }

            /* --- INPUTS & WIDGETS --- */
            .stTextInput input, .stTextArea textarea, .stSelectbox div[data-baseweb="select"] {
                border-radius: 8px !important; border-color: #E2E8F0 !important;
                background-color: #FAFAFA !important;
            }
            .stTextInput input:focus, .stTextArea textarea:focus {
                border-color: #805AD5 !important; /* Roxo do PAE no Foco */
                box-shadow: 0 0 0 1px #805AD5 !important;
            }

            /* --- BOTÕES --- */
            div[data-testid="column"] .stButton button { 
                border-radius: 8px !important; font-weight: 700 !important; 
                background-color: #805AD5 !important; /* Roxo PAE */
                border: none !important; color: white !important;
            }
            div[data-testid="column"] .stButton button:hover { background-color: #6B46C1 !important; }

            /* --- RESUMO ALUNO (CUSTOM HEADER) --- */
            .student-header { 
                display: flex; gap: 20px; align-items: center; 
                padding-bottom: 10px; border-bottom: 1px solid #E2E8F0; margin-bottom: 15px;
            }
            .sh-item { display: flex; flex-direction: column; }
            .sh-label { font-size: 0.75rem; color: #718096; font-weight: 700; text-transform: uppercase; }
            .sh-val { font-size: 1.1rem; color: #2D3748; font-weight: 800; font-family: 'Inter', sans-serif; }
            .tag-hiperfoco { 
                background-color: #F3E8FF; color: #805AD5; padding: 2px 10px; 
                border-radius: 12px; font-size: 0.8rem; font-weight: 700; display: inline-block;
            }
        </style>
        <link href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css" rel="stylesheet">
    """, unsafe_allow_html=True)

verificar_acesso()

# --- BARRA LATERAL ---
with st.sidebar:
    try:
        if os.path.exists("ominisfera.png"): st.image("ominisfera.png", width=150)
        else: st.write("🌐 OMNISFERA")
    except: st.write("🌐 OMNISFERA")
    
    st.markdown("---")
    if st.button("🏠 Voltar para Home", use_container_width=True):
        st.switch_page("Home.py")
    st.markdown("---")

# ==============================================================================
# 2. SISTEMA PAE (LÓGICA PRESERVADA)
# ==============================================================================

# --- BANCO DE DADOS (Leitura do PEI) ---
ARQUIVO_DB = "banco_alunos.json"

def carregar_banco():
    if os.path.exists(ARQUIVO_DB):
        try:
            with open(ARQUIVO_DB, "r", encoding="utf-8") as f:
                return json.load(f)
        except: return []
    return []

if 'banco_estudantes' not in st.session_state or not st.session_state.banco_estudantes:
    st.session_state.banco_estudantes = carregar_banco()

# --- HERO BANNER (VISUAL OMNISFERA) ---
st.markdown("""
<div class="dash-hero">
    <div style="flex-grow: 1;">
        <h1 class="hero-title">PAE Clínico</h1>
        <p class="hero-subtitle">Plano de Atendimento Educacional Especializado</p>
    </div>
    <i class="ri-puzzle-line hero-bg-icon"></i>
</div>
""", unsafe_allow_html=True)

if not st.session_state.banco_estudantes:
    st.warning("⚠️ Nenhum aluno com PEI encontrado. Cadastre no módulo PEI primeiro.")
    st.stop()

# --- SELEÇÃO DE ALUNO (DENTRO DE CARD) ---
with st.container(border=True):
    col_sel, col_info = st.columns([1, 2])
    with col_sel:
        lista_alunos = [a['nome'] for a in st.session_state.banco_estudantes]
        nome_aluno = st.selectbox("📂 Selecione o Estudante:", lista_alunos)

    aluno = next(a for a in st.session_state.banco_estudantes if a['nome'] == nome_aluno)

    # Exibe Resumo do Aluno (Design Clean)
    hf = aluno.get('hiperfoco', 'Não informado')
    st.markdown(f"""
        <div class="student-header">
            <div class="sh-item">
                <span class="sh-label">Estudante</span>
                <span class="sh-val">{aluno.get('nome')}</span>
            </div>
            <div class="sh-item" style="margin-left: 20px;">
                <span class="sh-label">Série</span>
                <span class="sh-val">{aluno.get('serie', '-')}</span>
            </div>
            <div class="sh-item" style="margin-left: 20px;">
                <span class="sh-label">Hiperfoco</span>
                <span class="sh-val"><span class="tag-hiperfoco">{hf}</span></span>
            </div>
        </div>
    """, unsafe_allow_html=True)

    with st.expander("📄 Ver Resumo Completo do PEI (Contexto)", expanded=False):
        st.info(aluno.get('ia_sugestao', 'Nenhum dado de PEI processado ainda.'))

# --- GESTÃO DE CHAVES ---
if 'OPENAI_API_KEY' in st.secrets: api_key = st.secrets['OPENAI_API_KEY']
else: api_key = st.sidebar.text_input("Chave OpenAI:", type="password")

# --- FUNÇÕES DE IA DO PAE (INTACTAS) ---
def gerar_diagnostico_barreiras(api_key, aluno, obs_prof):
    client = OpenAI(api_key=api_key)
    prompt = f"""
    ATUAR COMO: Especialista em AEE (Atendimento Educacional Especializado).
    OBJETIVO: Analisar o PEI do aluno e o relato do professor para mapear BARREIRAS (não deficiências).
    
    ALUNO: {aluno['nome']} | HIPERFOCO: {aluno.get('hiperfoco')}
    RESUMO PEI: {aluno.get('ia_sugestao', '')[:1000]}
    OBSERVAÇÃO ATUAL DO PROFESSOR AEE: {obs_prof}
    
    CLASSIFIQUE AS BARREIRAS ENCONTRADAS (Lei Brasileira de Inclusão):
    1. **Barreiras Comunicacionais:** (Ex: falta de Libras, escrita, comunicação alternativa)
    2. **Barreiras Metodológicas:** (Ex: métodos de ensino que não atingem o aluno)
    3. **Barreiras Atitudinais:** (Ex: isolamento, bullying, descrença da capacidade)
    4. **Barreiras Tecnológicas/Instrumentais:** (Ex: falta de engrossador, material adaptado)
    
    SAÍDA: Tabela Markdown clara e direta.
    """
    try:
        resp = client.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}], temperature=0.5)
        return resp.choices[0].message.content
    except Exception as e: return f"Erro: {str(e)}"

def gerar_plano_habilidades(api_key, aluno, foco_treino):
    client = OpenAI(api_key=api_key)
    prompt = f"""
    CRIE UM PLANO DE INTERVENÇÃO PARA SALA DE RECURSOS (AEE).
    FOCO: Desenvolvimento de Habilidades (Não reforço escolar).
    ÁREA DO TREINO: {foco_treino}
    
    ALUNO: {aluno['nome']}
    HIPERFOCO: {aluno.get('hiperfoco')} (USE O HIPERFOCO COMO ESTRATÉGIA DE ENGAJAMENTO).
    
    GERE 3 METAS SMART:
    1. **Meta de Longo Prazo:** (O que queremos em 6 meses?)
    2. **Estratégia com Hiperfoco:** (Como usar {aluno.get('hiperfoco')} para treinar isso?)
    3. **Recurso Necessário:** (O que construir ou usar?)
    """
    try:
        resp = client.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}], temperature=0.7)
        return resp.choices[0].message.content
    except Exception as e: return str(e)

def sugerir_tecnologia_assistiva(api_key, aluno, dificuldade):
    client = OpenAI(api_key=api_key)
    prompt = f"""
    SUGESTÃO DE TECNOLOGIA ASSISTIVA E RECURSOS.
    Aluno: {aluno['nome']}. Dificuldade Específica relatada: {dificuldade}.
    
    Sugira 3 Níveis de Solução:
    1. **Baixa Tecnologia (DIY):** Algo que o professor pode fazer com papelão, velcro, garrafa PET.
    2. **Média Tecnologia:** Materiais pedagógicos estruturados ou adaptações físicas simples.
    3. **Alta Tecnologia:** Apps, softwares ou hardware específico.
    """
    try:
        resp = client.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}], temperature=0.7)
        return resp.choices[0].message.content
    except Exception as e: return str(e)

def gerar_documento_articulacao(api_key, aluno, frequencia, acoes):
    client = OpenAI(api_key=api_key)
    prompt = f"""
    ESCREVA UMA CARTA DE ARTICULAÇÃO (AEE -> SALA REGULAR).
    De: Professor do AEE.
    Para: Professores da Sala Regular.
    Aluno: {aluno['nome']}.
    
    Conteúdo:
    - Informe que o aluno será atendido {frequencia}.
    - Explique que no AEE estamos trabalhando: {acoes}.
    - Dê 3 dicas práticas de como o professor da sala regular pode ajudar a generalizar essas conquistas na aula dele.
    - Tom: Colaborativo, profissional e parceiro.
    """
    try:
        resp = client.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}], temperature=0.7)
        return resp.choices[0].message.content
    except Exception as e: return str(e)

# --- ABAS DO PAE (EM CARDS) ---
tab_barreiras, tab_plano, tab_tec, tab_ponte = st.tabs([
    "🔍 Mapear Barreiras", 
    "🎯 Plano de Habilidades", 
    "🛠️ Tec. Assistiva", 
    "🌉 Cronograma & Articulação"
])

# 1. BARREIRAS (Diagnóstico)
with tab_barreiras:
    with st.container(border=True):
        st.write("### 🔍 Diagnóstico de Acessibilidade")
        st.info("O PAE começa identificando o que impede o aluno de participar, não a doença dele.")
        
        obs_aee = st.text_area("Observações Iniciais do AEE (Opcional):", placeholder="Ex: O aluno se recusa a escrever, mas fala muito sobre dinossauros. Tem dificuldade motora fina.", height=100)
        
        if st.button("Analisar Barreiras via IA", type="primary", use_container_width=True):
            if not api_key: st.error("Insira a chave OpenAI."); st.stop()
            with st.spinner("Cruzando dados do PEI com Observações..."):
                res_barreiras = gerar_diagnostico_barreiras(api_key, aluno, obs_aee)
                st.markdown("---")
                st.markdown(res_barreiras)

# 2. PLANO DE HABILIDADES (Treino)
with tab_plano:
    with st.container(border=True):
        st.write("### 🎯 Treino de Habilidades (Não Curricular)")
        st.info(f"Vamos usar o hiperfoco **({aluno.get('hiperfoco')})** para desenvolver funções mentais superiores.")
        
        foco = st.selectbox("Qual o foco do atendimento agora?", 
            ["Funções Executivas (Atenção/Memória)", "Autonomia e AVDs", "Coordenação Motora", "Comunicação Alternativa", "Habilidades Sociais"])
        
        if st.button("Gerar Plano de Intervenção", type="primary", use_container_width=True):
            with st.spinner("Criando estratégias engajadoras..."):
                res_plano = gerar_plano_habilidades(api_key, aluno, foco)
                st.markdown("---")
                st.markdown(res_plano)

# 3. TECNOLOGIA ASSISTIVA
with tab_tec:
    with st.container(border=True):
        st.write("### 🛠️ Caixa de Ferramentas")
        dif_especifica = st.text_input("Qual a dificuldade específica a ser superada?", placeholder="Ex: Não consegue segurar o lápis / Não consegue ler textos longos")
        
        if st.button("Sugerir Recursos", type="primary", use_container_width=True):
            with st.spinner("Buscando soluções no banco de dados de TA..."):
                res_ta = sugerir_tecnologia_assistiva(api_key, aluno, dif_especifica)
                st.markdown("---")
                st.markdown(res_ta)

# 4. ARTICULAÇÃO (A Ponte)
with tab_ponte:
    with st.container(border=True):
        st.write("### 🌉 A Ponte com a Sala Regular")
        c1, c2 = st.columns(2)
        freq = c1.selectbox("Frequência do Atendimento:", ["1x por semana", "2x por semana", "3x por semana", "Diário"])
        turno = c2.selectbox("Turno:", ["Contraturno Manhã", "Contraturno Tarde"])
        
        acoes_resumo = st.text_area("O que está sendo trabalhado no AEE?", placeholder="Ex: Uso de prancha de comunicação e treino de foco.", height=70)
        
        if st.button("Gerar Carta de Articulação", type="primary", use_container_width=True):
            with st.spinner("Redigindo documento oficial..."):
                carta = gerar_documento_articulacao(api_key, aluno, f"{freq} ({turno})", acoes_resumo)
                st.markdown("---")
                st.markdown("### 📄 Documento Gerado")
                st.markdown(carta)
                st.download_button("📥 Baixar Carta (.txt)", carta, "Carta_Articulacao.txt", use_container_width=True)
