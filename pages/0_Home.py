import streamlit as st
import os
from openai import OpenAI
import json
import pandas as pd
from datetime import date, datetime, timedelta
import base64
import requests
import time

# ==============================================================================
# 1. CONFIGURAÇÃO
# ==============================================================================
st.set_page_config(
    page_title="AEE & Execução | Omnisfera", 
    page_icon="🧩", 
    layout="wide",
    initial_sidebar_state="expanded"
)

# ==============================================================================
# 2. CSS & VISUAL
# ==============================================================================
try:
    IS_TEST_ENV = st.secrets.get("ENV") == "TESTE"
except:
    IS_TEST_ENV = False

def get_logo_base64():
    caminhos = ["omni_icone.png", "logo.png", "iconeaba.png"]
    for c in caminhos:
        if os.path.exists(c):
            with open(c, "rb") as f:
                return f"data:image/png;base64,{base64.b64encode(f.read()).decode()}"
    return "https://cdn-icons-png.flaticon.com/512/1183/1183672.png"

src_logo_giratoria = get_logo_base64()

if IS_TEST_ENV:
    card_bg, card_border = "rgba(255, 220, 50, 0.95)", "rgba(200, 160, 0, 0.5)"
else:
    card_bg, card_border = "rgba(255, 255, 255, 0.85)", "rgba(255, 255, 255, 0.6)"

st.markdown(f"""
<link href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css" rel="stylesheet">
<style>
    .omni-badge {{
        position: fixed; top: 15px; right: 15px;
        background: {card_bg}; border: 1px solid {card_border};
        backdrop-filter: blur(8px); padding: 4px 30px;
        min-width: 260px; justify-content: center;
        border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        z-index: 999990; display: flex; align-items: center; gap: 10px;
        pointer-events: none;
    }}
    .omni-text {{ font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 0.9rem; color: #2D3748; letter-spacing: 1px; }}
    .omni-logo-spin {{ height: 26px; width: 26px; animation: spin-slow 10s linear infinite; }}
    @keyframes spin-slow {{ from {{ transform: rotate(0deg); }} to {{ transform: rotate(360deg); }} }}

    .mod-card-rect {{ background: white; border-radius: 16px; border: 1px solid #E2E8F0; padding: 20px; display: flex; align-items: center; gap: 20px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }}
    .icon-box {{ width: 60px; height: 60px; background: #FAF5FF; color: #805AD5; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; }}
    
    .week-badge {{ background: #805AD5; color: white; padding: 2px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }}
    .resource-box {{ background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin: 15px 0; }}
</style>
<div class="omni-badge">
    <img src="{src_logo_giratoria}" class="omni-logo-spin">
    <span class="omni-text">OMNISFERA</span>
</div>
""", unsafe_allow_html=True)

# ==============================================================================
# 3. DADOS
# ==============================================================================
if "autenticado" not in st.session_state or not st.session_state["autenticado"]:
    st.error("🔒 Acesso Negado."); st.stop()

if "dados" not in st.session_state:
    st.session_state.dados = {}

# Sidebar
with st.sidebar:
    st.image("ominisfera.png" if os.path.exists("ominisfera.png") else src_logo_giratoria, width=120)
    st.markdown("---")
    # Tenta voltar para 0_Home.py se existir, senão Home.py
    if st.button("🏠 Home", use_container_width=True): 
        st.switch_page("0_Home.py" if os.path.exists("0_Home.py") else "Home.py")
    if st.button("📘 Voltar ao PEI", use_container_width=True): st.switch_page("pages/1_PEI.py")

# ==============================================================================
# 4. API & FUNÇÕES
# ==============================================================================
if 'OPENAI_API_KEY' in st.secrets: api_key = st.secrets['OPENAI_API_KEY']
else: api_key = st.sidebar.text_input("Chave OpenAI:", type="password")

# --- FUNÇÕES IA ---
def gerar_cronograma_aee(api_key, aluno, dados_pei, semanas, frequencia, foco_principal):
    client = OpenAI(api_key=api_key)
    prompt = f"""
    ATUAR COMO: Especialista em AEE.
    OBJETIVO: Criar CRONOGRAMA DE INTERVENÇÃO para {semanas} semanas.
    ALUNO: {aluno['nome']} | SÉRIE: {aluno.get('serie')} | FREQ: {frequencia}
    HIPERFOCO: {aluno.get('hiperfoco', 'Não informado')}
    FOCO: {foco_principal}
    SAÍDA JSON: {{ "fases": [ {{ "nome_fase": "...", "semanas": [ {{ "semana": 1, "tema": "...", "atividade": "...", "recurso": "..." }} ] }} ] }}
    """
    try:
        resp = client.chat.completions.create(
            model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}], response_format={"type": "json_object"}
        )
        return json.loads(resp.choices[0].message.content)
    except Exception as e: return {"erro": str(e)}

def gerar_recurso_generico(api_key, tipo, contexto):
    client = OpenAI(api_key=api_key)
    prompt = f"Crie um recurso de AEE do tipo: {tipo}. Contexto: {contexto}. Saída em Markdown."
    try:
        resp = client.chat.completions.create(model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}])
        return resp.choices[0].message.content
    except Exception as e: return str(e)

# --- VISUAL DASHBOARD (SEM PLOTLY) ---
def renderizar_dashboard_execucao(aluno, data_revisao, progresso_pct):
    html = f"""
    <style>
        .timeline-header {{ background: white; border-radius: 12px; padding: 20px; border: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }}
        .prog-bar-bg {{ width: 100%; height: 10px; background: #F1F5F9; border-radius: 5px; overflow: hidden; margin-top: 10px; }}
        .prog-bar-fill {{ height: 100%; background: linear-gradient(90deg, #8B5CF6, #6D28D9); width: {progresso_pct}%; transition: width 1s; }}
    </style>
    <div class="timeline-header">
        <div style="flex-grow: 1; padding-right: 30px;">
            <h3 style="margin:0; color: #1E293B; font-size: 1.2rem;">📊 Execução: {aluno.get('nome')}</h3>
            <div style="font-size: 0.85rem; color: #64748B; margin-top: 4px;">Revisão: <strong>{data_revisao}</strong></div>
            <div class="prog-bar-bg"><div class="prog-bar-fill"></div></div>
        </div>
        <div style="text-align: right;"><div style="font-size: 1.8rem; font-weight: 800; color: #8B5CF6;">{progresso_pct}%</div></div>
    </div>
    """
    return html

# ==============================================================================
# 5. UI PRINCIPAL
# ==============================================================================
aluno = {"nome": st.session_state.dados.get("nome", "Aluno"), "serie": st.session_state.dados.get("serie", ""), "hiperfoco": st.session_state.dados.get("hiperfoco", "")}
USUARIO = st.session_state.get("usuario_nome", "Especialista").split()[0]

st.markdown(f"""
<div class="mod-card-rect">
    <div class="icon-box"><i class="ri-calendar-todo-fill"></i></div>
    <div>
        <div style="font-weight:800; font-size:1.4rem; color:#1E293B;">Sala de Recursos (AEE)</div>
        <div style="color:#64748B;">Planejamento estratégico para <strong>{aluno['nome']}</strong>.</div>
    </div>
</div>
""", unsafe_allow_html=True)

# --- AQUI ESTAVA O ERRO: DEFINIR ABAS ANTES DE USAR ---
tab_planejamento, tab_ferramentas, tab_articulacao = st.tabs([
    "📅 PLANEJAMENTO & EXECUÇÃO", "🧰 CAIXA DE FERRAMENTAS", "🤝 ARTICULAÇÃO"
])

# -----------------------------------------------------------------------------
# ABA 1: PLANEJAMENTO (Onde o erro acontecia)
# -----------------------------------------------------------------------------
with tab_planejamento:
    # Dashboard
    if 'cronograma_aee' in st.session_state:
        st.markdown(renderizar_dashboard_execucao(aluno, "30/Dez", 25), unsafe_allow_html=True)
    else:
        st.info("Gere um cronograma abaixo para ativar o painel.")

    col_reg, col_cron = st.columns([1, 1.5], gap="large")
    
    # Coluna Esquerda: Diário
    with col_reg:
        st.markdown("#### 📝 Diário de Bordo")
        with st.container(border=True):
            desc = st.text_area("Registro do dia:", height=100)
            eng = st.slider("Engajamento", 1, 5, 3)
            if st.button("💾 Salvar Registro", use_container_width=True):
                st.success("Salvo!")

    # Coluna Direita: Cronograma
    with col_cron:
        st.markdown("### 🗓️ Planejamento")
        if 'cronograma_aee' not in st.session_state:
            c1, c2 = st.columns(2)
            dt_inicio = c1.date_input("Início", date.today())
            dt_fim = c2.date_input("Revisão", date.today() + timedelta(days=60))
            foco = st.text_input("Foco:", value=aluno.get("hiperfoco", ""))
            
            if st.button("✨ Gerar Ciclo", use_container_width=True):
                with st.spinner("Planejando..."):
                    plano = gerar_cronograma_aee(api_key, aluno, {}, 8, "2x", foco)
                    if "erro" not in plano:
                        st.session_state['cronograma_aee'] = plano
                        st.rerun()
        
        if 'cronograma_aee' in st.session_state:
            cronograma = st.session_state['cronograma_aee']
            for fase in cronograma.get('fases', []):
                st.markdown(f"#### 🚩 {fase['nome_fase']}")
                for sem in fase['semanas']:
                    with st.expander(f"Semana {sem['semana']}: {sem['tema']}"):
                        st.write(sem['atividade'])
                        st.checkbox("Concluído", key=f"chk_{sem['semana']}")

# -----------------------------------------------------------------------------
# ABA 2: FERRAMENTAS
# -----------------------------------------------------------------------------
with tab_ferramentas:
    st.markdown("### 🧰 Recursos")
    tipo = st.selectbox("Tipo:", ["Tecnologia Assistiva", "Atividade Lúdica", "Adaptação"])
    if st.button("Gerar Recurso"):
        res = gerar_recurso_generico(api_key, tipo, f"Aluno: {aluno['nome']}")
        st.markdown(res)

# -----------------------------------------------------------------------------
# ABA 3: ARTICULAÇÃO
# -----------------------------------------------------------------------------
with tab_articulacao:
    st.markdown("### 🤝 Ponte Sala de Aula")
    st.write("Gere relatórios para o professor regente aqui.")
