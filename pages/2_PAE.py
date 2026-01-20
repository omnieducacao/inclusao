import streamlit as st
import os
from openai import OpenAI
import json
from datetime import date
import base64

# ==============================================================================
# CONFIG
# ==============================================================================
st.set_page_config(
    page_title="Plano de Ação (PAEE) | Omnisfera",
    page_icon="🧩",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# ==============================================================================
# TOPBAR MENU
# ==============================================================================
from ui_nav import render_topbar_nav
render_topbar_nav(active="paee")

# ==============================================================================
# SEGURANÇA
# ==============================================================================
if not st.session_state.get("autenticado", False):
    st.error("🔒 Acesso negado. Faça login na Home.")
    st.stop()

# ==============================================================================
# CSS DO MÓDULO (coerente, sem PNG)
# ==============================================================================
st.markdown("""
<link rel="stylesheet" href="https://cdn-uicons.flaticon.com/uicons-solid-rounded/css/uicons-solid-rounded.css">
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
:root{
  --paee:#22A765;
  --paee2:#1F8F59;
  --ink:#0F172A;
  --muted:#64748B;
  --bg:#F7FAFC;
  --card:#FFFFFF;
  --stroke:#E2E8F0;
  --radius:18px;
}

html,body,[class*="css"]{
  font-family:'Nunito',sans-serif;
  background:var(--bg);
  color:#2D3748;
}

/* garante respiro da topbar */
.block-container{padding-top:86px !important; padding-bottom:4rem !important;}

[data-testid="stSidebar"], [data-testid="stSidebarNav"]{display:none !important;}
header[data-testid="stHeader"]{display:none !important;}
[data-testid="stToolbar"]{display:none !important;}

/* Header premium (sem PNG) */
.module-header{
  background: var(--card);
  border: 1px solid rgba(226,232,240,0.9);
  border-radius: 18px;
  padding: 18px 18px;
  box-shadow: 0 16px 42px rgba(15,23,42,0.06);
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:14px;
  margin: 10px 0 14px 0;
  position:relative;
  overflow:hidden;
}
.module-left{display:flex; align-items:center; gap:14px;}
.tile{
  width:54px; height:54px; border-radius:16px;
  background: linear-gradient(135deg, var(--paee), var(--paee2));
  display:flex; align-items:center; justify-content:center;
  box-shadow: 0 16px 30px rgba(34,167,101,0.25);
}
.tile i{color:white; font-size:22px; line-height:1;}
.module-title{
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
  font-weight: 950;
  font-size: 1.05rem;
  color: var(--ink);
  letter-spacing: .02em;
}
.module-sub{
  margin-top: 2px;
  color: var(--muted);
  font-weight: 750;
  font-size: 0.92rem;
}
.module-mark{
  font-weight: 950;
  letter-spacing: .14em;
  text-transform: uppercase;
  font-size: 0.72rem;
  color: rgba(15,23,42,0.45);
}

/* Card do estudante */
.student-card{
  background: var(--card);
  border: 1px solid rgba(226,232,240,0.9);
  border-radius: 16px;
  padding: 16px 18px;
  margin-bottom: 14px;
  display:flex;
  justify-content:space-between;
  gap: 14px;
  box-shadow: 0 14px 30px rgba(15,23,42,0.04);
}
.student-k{font-size:.72rem; color:rgba(100,116,139,0.95); font-weight:900; text-transform:uppercase; letter-spacing:.12em;}
.student-v{font-size:1.06rem; color:var(--ink); font-weight:900;}
.student-v-green{font-size:1.06rem; color:var(--paee); font-weight:950;}

/* Caixa pedagógica */
.pedagogia-box{
  background:#F8FAFC;
  border:1px solid rgba(226,232,240,0.9);
  border-left:4px solid var(--paee);
  padding: 16px 16px;
  border-radius: 14px;
  margin-bottom: 14px;
  color:#475569;
  font-weight:650;
}

/* Tabs */
div[data-baseweb="tab-border"], div[data-baseweb="tab-highlight"]{display:none !important;}
.stTabs [data-baseweb="tab-list"]{
  gap:8px; display:flex; flex-wrap:nowrap; overflow-x:auto; white-space:nowrap;
  padding:10px 5px; scrollbar-width:none;
}
.stTabs [data-baseweb="tab-list"]::-webkit-scrollbar{display:none;}
.stTabs [data-baseweb="tab"]{
  height:38px; border-radius:999px !important;
  background:#FFFFFF; border:1px solid rgba(226,232,240,0.95);
  color:#64748B; font-weight:900; font-size:.76rem;
  padding:0 18px; letter-spacing:.08em; text-transform:uppercase;
  transition: all .16s ease; box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  flex-shrink:0;
}
.stTabs [data-baseweb="tab"]:hover{background:#F1F5F9; color:#334155;}
.stTabs [aria-selected="true"]{
  background: rgba(34,167,101,0.08) !important;
  border-color: rgba(34,167,101,0.55) !important;
  color: var(--paee) !important;
  box-shadow: 0 0 10px rgba(34,167,101,0.18) !important;
}

/* Inputs / botões */
.stTextInput input, .stTextArea textarea, .stSelectbox div[data-baseweb="select"]{
  border-radius: 12px !important;
  border-color: rgba(226,232,240,0.95) !important;
}
div[data-testid="column"] .stButton button{
  border-radius: 12px !important;
  font-weight: 950 !important;
  text-transform: uppercase;
  height: 48px !important;
  background: var(--paee) !important;
  color: white !important;
  border: none !important;
  letter-spacing: .06em;
}
div[data-testid="column"] .stButton button:hover{
  background: var(--paee2) !important;
}
</style>
""", unsafe_allow_html=True)

# ==============================================================================
# HEADER
# ==============================================================================
st.markdown("""
<div class="module-header">
  <div class="module-left">
    <div class="tile"><i class="fi fi-sr-track"></i></div>
    <div>
      <div class="module-title">Plano de Ação (PAEE) & Tecnologia Assistiva</div>
      <div class="module-sub">Sala de Recursos • Eliminação de Barreiras • Articulação com a sala regular</div>
    </div>
  </div>
  <div class="module-mark">OMNISFERA</div>
</div>
""", unsafe_allow_html=True)

# ==============================================================================
# BANCO
# ==============================================================================
ARQUIVO_DB = "banco_alunos.json"

def carregar_banco():
    usuario_atual = st.session_state.get("usuario_nome", "")
    if os.path.exists(ARQUIVO_DB):
        try:
            with open(ARQUIVO_DB, "r", encoding="utf-8") as f:
                todos_alunos = json.load(f)
            return [aluno for aluno in todos_alunos if aluno.get("responsavel") == usuario_atual]
        except Exception:
            return []
    return []

if "banco_estudantes" not in st.session_state or not st.session_state.get("banco_estudantes"):
    st.session_state.banco_estudantes = carregar_banco()

if not st.session_state.banco_estudantes:
    st.warning("⚠️ Nenhum estudante encontrado para o seu usuário. Cadastre no módulo PEI primeiro.")
    st.stop()

# ==============================================================================
# SELEÇÃO
# ==============================================================================
lista_alunos = [a.get("nome", "") for a in st.session_state.banco_estudantes if a.get("nome")]
col_sel, col_info = st.columns([1, 2])
with col_sel:
    nome_aluno = st.selectbox("📂 Selecione o Estudante:", lista_alunos)

aluno = next(a for a in st.session_state.banco_estudantes if a.get("nome") == nome_aluno)

serie_aluno = (aluno.get("serie", "") or "").lower()
is_ei = ("infantil" in serie_aluno) or ("creche" in serie_aluno) or ("pré" in serie_aluno) or ("pre" in serie_aluno)

st.markdown(f"""
<div class="student-card">
  <div style="flex:1;">
    <div class="student-k">Nome</div>
    <div class="student-v">{aluno.get('nome','-')}</div>
  </div>
  <div style="flex:1;">
    <div class="student-k">Série</div>
    <div class="student-v">{aluno.get('serie','-')}</div>
  </div>
  <div style="flex:1;">
    <div class="student-k">Hiperfoco</div>
    <div class="student-v-green">{aluno.get('hiperfoco','-')}</div>
  </div>
</div>
""", unsafe_allow_html=True)

if is_ei:
    st.info("🧸 **Modo Educação Infantil ativado:** foco em Campos de Experiência (BNCC) e participação no brincar.")

with st.expander("📄 Ver resumo do PEI (base para o PAEE)", expanded=False):
    st.info(aluno.get("ia_sugestao", "Nenhum dado de PEI processado ainda."))

# ==============================================================================
# OPENAI KEY
# ==============================================================================
api_key = st.secrets.get("OPENAI_API_KEY", "")

# ==============================================================================
# FUNÇÕES IA
# ==============================================================================
def gerar_diagnostico_barreiras(api_key, aluno, obs_prof):
    client = OpenAI(api_key=api_key)
    prompt = f"""
ATUAR COMO: Especialista em AEE.
ALUNO: {aluno['nome']} | HIPERFOCO: {aluno.get('hiperfoco')}
RESUMO PEI: {aluno.get('ia_sugestao', '')[:1000]}
OBSERVAÇÃO ATUAL: {obs_prof}

CLASSIFIQUE AS BARREIRAS (Lei Brasileira de Inclusão):
1) Barreiras Comunicacionais
2) Barreiras Metodológicas
3) Barreiras Atitudinais
4) Barreiras Tecnológicas/Instrumentais
SAÍDA: Tabela Markdown.
"""
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5
    )
    return resp.choices[0].message.content

def gerar_projetos_ei_bncc(api_key, aluno, campo_exp):
    client = OpenAI(api_key=api_key)
    prompt = f"""
ATUAR COMO: Pedagogo Especialista em Educação Infantil e Inclusão.
ALUNO: {aluno['nome']} (Educação Infantil).
HIPERFOCO: {aluno.get('hiperfoco', 'Brincadeiras')}.
RESUMO (PEI): {aluno.get('ia_sugestao', '')[:800]}

Crie 3 experiências lúdicas para "{campo_exp}".
Use hiperfoco, reduza barreiras, seja sensorial e concreta.
"""
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )
    return resp.choices[0].message.content

def gerar_plano_habilidades(api_key, aluno, foco_treino):
    client = OpenAI(api_key=api_key)
    prompt = f"""
Crie um PLANO DE INTERVENÇÃO AEE.
FOCO: {foco_treino}
ALUNO: {aluno['nome']} | HIPERFOCO: {aluno.get('hiperfoco')}
Gere 3 METAS SMART (estratégia + recurso + frequência).
"""
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )
    return resp.choices[0].message.content

def sugerir_tecnologia_assistiva(api_key, aluno, dificuldade):
    client = OpenAI(api_key=api_key)
    prompt = f"""
Sugestão de TECNOLOGIA ASSISTIVA.
Aluno: {aluno['nome']}
Dificuldade: {dificuldade}

Sugira baixa/média/alta tecnologia (tópicos práticos).
"""
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )
    return resp.choices[0].message.content

def gerar_documento_articulacao(api_key, aluno, frequencia, acoes):
    client = OpenAI(api_key=api_key)
    prompt = f"""
Escreva uma CARTA DE ARTICULAÇÃO (AEE -> SALA REGULAR).
Aluno: {aluno['nome']}
Frequência: {frequencia}
Ações no AEE: {acoes}

Inclua objetivo + 3 combinados práticos + tom colaborativo.
"""
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )
    return resp.choices[0].message.content

# ==============================================================================
# ABAS
# ==============================================================================
if is_ei:
    tab_barreiras, tab_projetos, tab_rotina, tab_ponte = st.tabs([
        "🔍 Barreiras no Brincar",
        "🧸 Banco de Experiências",
        "🏠 Rotina & Adaptação",
        "🌉 Articulação"
    ])

    with tab_barreiras:
        st.markdown("<div class='pedagogia-box'><strong>Diagnóstico do brincar:</strong> barreira não é 'não escrever' — é não participar da interação.</div>", unsafe_allow_html=True)
        obs_aee = st.text_area("Observação do brincar:", placeholder="Ex: Isola-se no parquinho, não aceita texturas...", height=100)
        if st.button("Mapear Barreiras do Brincar", type="primary"):
            if not api_key:
                st.error("Configure a chave OpenAI em Secrets.")
                st.stop()
            with st.spinner("Analisando..."):
                st.markdown(gerar_diagnostico_barreiras(api_key, aluno, obs_aee))

    with tab_projetos:
        st.markdown("<div class='pedagogia-box'><strong>Banco de experiências (BNCC):</strong> propostas lúdicas usando o hiperfoco.</div>", unsafe_allow_html=True)
        campo_bncc = st.selectbox("Campo de Experiência (BNCC):", [
            "O eu, o outro e o nós (Identidade e Interação)",
            "Corpo, gestos e movimentos (Motricidade)",
            "Traços, sons, cores e formas (Artes)",
            "Escuta, fala, pensamento e imaginação (Oralidade)",
            "Espaços, tempos, quantidades, relações e transformações (Cognição)"
        ])
        if st.button("✨ Gerar Atividades Lúdicas", type="primary"):
            if not api_key:
                st.error("Configure a chave OpenAI em Secrets.")
                st.stop()
            with st.spinner("Criando..."):
                st.markdown(gerar_projetos_ei_bncc(api_key, aluno, campo_bncc))

    with tab_rotina:
        st.markdown("<div class='pedagogia-box'><strong>Adaptação de rotina:</strong> recursos visuais e sensoriais para EI.</div>", unsafe_allow_html=True)
        dif_rotina = st.text_input("Dificuldade na rotina:", placeholder="Ex: Hora do soninho, Desfralde, Alimentação")
        if st.button("Sugerir Adaptação", type="primary"):
            if not api_key:
                st.error("Configure a chave OpenAI em Secrets.")
                st.stop()
            with st.spinner("Buscando recursos..."):
                st.markdown(sugerir_tecnologia_assistiva(api_key, aluno, f"Rotina EI: {dif_rotina}"))

else:
    tab_barreiras, tab_plano, tab_tec, tab_ponte = st.tabs([
        "🔍 Mapear Barreiras",
        "🎯 Plano de Habilidades",
        "🛠️ Tec. Assistiva",
        "🌉 Cronograma & Articulação"
    ])

    with tab_barreiras:
        st.markdown("<div class='pedagogia-box'><strong>Diagnóstico de acessibilidade:</strong> o que impede participação?</div>", unsafe_allow_html=True)
        obs_aee = st.text_area("Observações iniciais do AEE (opcional):", placeholder="Ex: recusa escrita, evita leitura em voz alta...", height=100)
        if st.button("Analisar Barreiras via IA", type="primary"):
            if not api_key:
                st.error("Configure a chave OpenAI em Secrets.")
                st.stop()
            with st.spinner("Analisando..."):
                st.markdown(gerar_diagnostico_barreiras(api_key, aluno, obs_aee))

    with tab_plano:
        st.markdown("<div class='pedagogia-box'><strong>Treino de habilidades:</strong> foco e rotina para progresso real.</div>", unsafe_allow_html=True)
        foco = st.selectbox("Foco do atendimento:", ["Funções Executivas", "Autonomia", "Coordenação Motora", "Comunicação", "Habilidades Sociais"])
        if st.button("Gerar Plano", type="primary"):
            if not api_key:
                st.error("Configure a chave OpenAI em Secrets.")
                st.stop()
            with st.spinner("Planejando..."):
                st.markdown(gerar_plano_habilidades(api_key, aluno, foco))

    with tab_tec:
        st.markdown("<div class='pedagogia-box'><strong>Tecnologia assistiva:</strong> autonomia e acesso curricular.</div>", unsafe_allow_html=True)
        dif_especifica = st.text_input("Dificuldade específica:", placeholder="Ex: não segura o lápis, não acompanha leitura...")
        if st.button("Sugerir Recursos", type="primary"):
            if not api_key:
                st.error("Configure a chave OpenAI em Secrets.")
                st.stop()
            with st.spinner("Buscando..."):
                st.markdown(sugerir_tecnologia_assistiva(api_key, aluno, dif_especifica))

with tab_ponte:
    st.markdown("<div class='pedagogia-box'><strong>Ponte com a sala regular:</strong> carta prática de colaboração.</div>", unsafe_allow_html=True)
    c1, c2 = st.columns(2)
    freq = c1.selectbox("Frequência:", ["1x/sem", "2x/sem", "3x/sem", "Diário"])
    turno = c2.selectbox("Turno:", ["Manhã", "Tarde"])
    acoes_resumo = st.text_area("Trabalho no AEE:", placeholder="Ex: CAA, rotina visual, treino FE...", height=80)

    if st.button("Gerar Carta", type="primary"):
        if not api_key:
            st.error("Configure a chave OpenAI em Secrets.")
            st.stop()
        with st.spinner("Escrevendo..."):
            carta = gerar_documento_articulacao(api_key, aluno, f"{freq} ({turno})", acoes_resumo)
            st.markdown("### 📄 Documento gerado")
            st.markdown(carta)
            st.download_button("📥 Baixar Carta", carta, "Carta_Articulacao.txt")
