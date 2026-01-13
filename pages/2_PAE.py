import streamlit as st
import os
from openai import OpenAI
import json
import pandas as pd
from datetime import date
import base64

# ==============================================================================
# 1. CONFIGURAÇÃO E SEGURANÇA (VISUAL OMNISFERA)
# ==============================================================================
st.set_page_config(page_title="Omnisfera | PAE", page_icon="🧩", layout="wide")

def get_base64_image(image_path):
    if not os.path.exists(image_path): return ""
    with open(image_path, "rb") as img_file:
        return base64.b64encode(img_file.read()).decode()

def verificar_acesso():
    if "autenticado" not in st.session_state or not st.session_state["autenticado"]:
        st.error("🔒 Acesso Negado. Por favor, faça login na Página Inicial.")
        st.stop()
    
    # --- CSS GLOBAL OMNISFERA (PAE EDITION - ROXO) ---
    st.markdown("""
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Nunito:wght@400;600;700&display=swap');
            
            /* Fundo e Tipografia */
            html, body, [class*="css"] { 
                font-family: 'Nunito', sans-serif; 
                color: #2D3748; 
                background-color: #F7FAFC;
            }
            
            /* Ajuste do Topo */
            .block-container { padding-top: 1rem !important; padding-bottom: 5rem !important; }
            [data-testid="stHeader"] { background-color: rgba(0,0,0,0); visibility: visible; }

            /* --- HERO BANNER --- */
            .dash-hero { 
                background: linear-gradient(135deg, #0F52BA 0%, #062B61 100%); 
                border-radius: 16px;
                margin-bottom: 25px; 
                box-shadow: 0 4px 10px rgba(15, 82, 186, 0.2);
                color: white;
                position: relative;
                overflow: hidden;
                padding: 30px 40px;
                display: flex; align-items: center; justify-content: flex-start;
            }
            .hero-logo-img { max-height: 70px; width: auto; margin-bottom: 5px; }
            .hero-subtitle { color: rgba(255,255,255,0.9); font-size: 1rem; margin-top: 5px; font-weight: 400; font-style: italic; font-family: 'Inter', sans-serif; }
            .hero-bg-icon { position: absolute; right: 30px; font-size: 5rem; opacity: 0.1; color: white; transform: rotate(-10deg); top: 10px; }

            /* --- CARDS (CONTAINERS) --- */
            [data-testid="stVerticalBlockBorderWrapper"] {
                background-color: white;
                border-radius: 12px;
                padding: 20px;
                border: 1px solid #E2E8F0;
                box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                margin-bottom: 20px;
            }

            /* --- INPUTS --- */
            .stTextInput input, .stTextArea textarea, .stSelectbox div[data-baseweb="select"] {
                border-radius: 8px !important; border-color: #E2E8F0 !important;
                background-color: #FAFAFA !important;
            }
            .stTextInput input:focus, .stTextArea textarea:focus {
                border-color: #805AD5 !important; /* Roxo PAE */
                box-shadow: 0 0 0 1px #805AD5 !important;
            }

            /* --- BOTÕES (ROXO) --- */
            div[data-testid="column"] .stButton button { 
                border-radius: 8px !important; font-weight: 700 !important; 
                background-color: #805AD5 !important; 
                border: none !important; color: white !important;
            }
            div[data-testid="column"] .stButton button:hover { background-color: #6B46C1 !important; }

            /* --- ABAS (CLEAN PURPLE) --- */
            .stTabs [data-baseweb="tab-list"] { gap: 8px; }
            .stTabs [data-baseweb="tab"] {
                height: 40px; border-radius: 20px !important;
                background-color: white; border: 1px solid #E2E8F0;
                color: #718096; font-weight: 600; font-size: 0.9rem;
            }
            .stTabs [aria-selected="true"] {
                background-color: #F3E8FF !important;
                color: #805AD5 !important;
                border: 1px solid #805AD5 !important;
            }

            /* --- RESUMO ALUNO --- */
            .student-header { 
                display: flex; gap: 30px; align-items: center; 
                padding-bottom: 15px; border-bottom: 1px solid #E2E8F0; margin-bottom: 20px;
            }
            .sh-item { display: flex; flex-direction: column; }
            .sh-label { font-size: 0.75rem; color: #718096; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
            .sh-val { font-size: 1.1rem; color: #2D3748; font-weight: 800; font-family: 'Inter', sans-serif; }
            .tag-hiperfoco { 
                background-color: #FAF5FF; color: #805AD5; padding: 2px 10px; 
                border-radius: 12px; font-size: 0.85rem; font-weight: 700; border: 1px solid #E9D8FD;
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

# --- BANCO DE DADOS ---
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

# --- HERO BANNER (COM LOGO PAE) ---
logo_pae_b64 = get_base64_image("pae.png")
logo_html = f'<img src="data:image/png;base64,{logo_pae_b64}" class="hero-logo-img">' if logo_pae_b64 else '<h1 style="color:white; margin:0;">PAE Clínico</h1>'

st.markdown(f"""
<div class="dash-hero">
    <div style="flex-grow: 1;">
        {logo_html}
        <div class="hero-subtitle">Plano de Atendimento Educacional Especializado & Sala de Recursos</div>
    </div>
    <i class="ri-puzzle-fill hero-bg-icon"></i>
</div>
""", unsafe_allow_html=True)

if not st.session_state.banco_estudantes:
    st.warning("⚠️ Nenhum aluno com PEI encontrado. Cadastre no módulo PEI primeiro.")
    st.stop()

# --- SELEÇÃO DE ALUNO (CARD) ---
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
            <div class="sh-item">
                <span class="sh-label">Série</span>
                <span class="sh-val">{aluno.get('serie', '-')}</span>
            </div>
            <div class="sh-item">
                <span class="sh-label">Hiperfoco</span>
                <span class="sh-val"><span class="tag-hiperfoco">{hf}</span></span>
            </div>
        </div>
    """, unsafe_allow_html=True)

    with st.expander("📄 Ver Dados do PEI (Base)", expanded=False):
        st.info(aluno.get('ia_sugestao', 'Nenhum dado de PEI processado ainda.'))

# --- GESTÃO DE CHAVES ---
if 'OPENAI_API_KEY' in st.secrets: api_key = st.secrets['OPENAI_API_KEY']
else: api_key = st.sidebar.text_input("Chave OpenAI:", type="password")

# --- FUNÇÕES DE IA DO PAE (INTACTAS) ---
def gerar_diagnostico_barreiras(api_key, aluno, obs_prof):
    client = OpenAI(api_key=api_key)
    prompt = f"""
    ATUAR COMO: Especialista em AEE (Atendimento Educacional Especializado).
    OBJETIVO: Analisar o PEI do aluno e o relato do professor para mapear BARREIRAS.
    ALUNO: {aluno['nome']} | HIPERFOCO: {aluno.get('hiperfoco')}
    RESUMO PEI: {aluno.get('ia_sugestao', '')[:1000]}
    OBSERVAÇÃO PROFESSOR: {obs_prof}
    
    CLASSIFIQUE AS BARREIRAS (Lei Brasileira de Inclusão):
    1. **Barreiras Comunicacionais**
    2. **Barreiras Metodológicas**
    3. **Barreiras Atitudinais**
    4. **Barreiras Tecnológicas**
    
    SAÍDA: Tabela Markdown clara.
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
    HIPERFOCO: {aluno.get('hiperfoco')} (USE COMO ESTRATÉGIA).
    
    GERE 3 METAS SMART:
    1. **Meta de Longo Prazo** (6 meses)
    2. **Estratégia com Hiperfoco**
    3. **Recurso Necessário**
    """
    try:
        resp = client.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}], temperature=0.7)
        return resp.choices[0].message.content
    except Exception as e: return str(e)

def sugerir_tecnologia_assistiva(api_key, aluno, dificuldade):
    client = OpenAI(api_key=api_key)
    prompt = f"""
    SUGESTÃO DE TECNOLOGIA ASSISTIVA.
    Aluno: {aluno['nome']}. Dificuldade: {dificuldade}.
    Sugira 3 Níveis: Baixa (DIY), Média e Alta Tecnologia.
    """
    try:
        resp = client.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}], temperature=0.7)
        return resp.choices[0].message.content
    except Exception as e: return str(e)

def gerar_documento_articulacao(api_key, aluno, frequencia, acoes):
    client = OpenAI(api_key=api_key)
    prompt = f"""
    ESCREVA UMA CARTA DE ARTICULAÇÃO (AEE -> SALA REGULAR).
    De: Professor do AEE. Para: Professores da Sala Regular.
    Aluno: {aluno['nome']}.
    Conteúdo: Atendimento {frequencia}. Trabalhando: {acoes}.
    Dê 3 dicas práticas para a sala regular. Tom colaborativo.
    """
    try:
        resp = client.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}], temperature=0.7)
        return resp.choices[0].message.content
    except Exception as e: return str(e)

# --- ABAS (ESTILIZADAS) ---
tab_barreiras, tab_plano, tab_tec, tab_ponte = st.tabs([
    "🔍 Mapear Barreiras", 
    "🎯 Plano de Habilidades", 
    "🛠️ Tec. Assistiva", 
    "🌉 Cronograma & Articulação"
])

# 1. BARREIRAS
with tab_barreiras:
    with st.container(border=True):
        st.markdown("#### 🔍 Diagnóstico de Acessibilidade")
        st.info("Identifique o que impede a participação plena do estudante.")
        obs_aee = st.text_area("Observações do AEE:", placeholder="Ex: Dificuldade motora fina, não segura o lápis...", height=100)
        
        if st.button("Analisar Barreiras (IA)", type="primary"):
            if not api_key: st.error("Configure a API Key."); st.stop()
            with st.spinner("Mapeando barreiras..."):
                res = gerar_diagnostico_barreiras(api_key, aluno, obs_aee)
                st.markdown("---")
                st.markdown(res)

# 2. PLANO DE HABILIDADES
with tab_plano:
    with st.container(border=True):
        st.markdown("#### 🎯 Treino de Habilidades")
        st.info(f"Estratégia baseada no Hiperfoco: **{aluno.get('hiperfoco', 'Geral')}**")
        foco = st.selectbox("Foco da Intervenção:", ["Funções Executivas", "Autonomia/AVD", "Coordenação Motora", "Comunicação Alternativa", "Habilidades Sociais"])
        
        if st.button("Gerar Plano de Intervenção", type="primary"):
            with st.spinner("Criando plano..."):
                res = gerar_plano_habilidades(api_key, aluno, foco)
                st.markdown("---")
                st.markdown(res)

# 3. TECNOLOGIA ASSISTIVA
with tab_tec:
    with st.container(border=True):
        st.markdown("#### 🛠️ Recursos & TA")
        dif = st.text_input("Dificuldade específica:", placeholder="Ex: Não consegue ler letras pequenas")
        
        if st.button("Sugerir Recursos", type="primary"):
            with st.spinner("Buscando soluções..."):
                res = sugerir_tecnologia_assistiva(api_key, aluno, dif)
                st.markdown("---")
                st.markdown(res)

# 4. ARTICULAÇÃO
with tab_ponte:
    with st.container(border=True):
        st.markdown("#### 🌉 Ponte com a Sala Regular")
        c1, c2 = st.columns(2)
        freq = c1.selectbox("Frequência:", ["1x semana", "2x semana", "Diário"])
        turno = c2.selectbox("Turno:", ["Manhã", "Tarde"])
        acoes = st.text_area("Resumo do trabalho no AEE:", height=70)
        
        if st.button("Gerar Carta de Articulação", type="primary"):
            with st.spinner("Escrevendo carta..."):
                carta = gerar_documento_articulacao(api_key, aluno, f"{freq} ({turno})", acoes)
                st.markdown("---")
                st.markdown(carta)
                st.download_button("📥 Baixar Carta", carta, f"Carta_{aluno['nome']}.txt")
