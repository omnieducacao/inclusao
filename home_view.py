import streamlit as st
from datetime import date
import base64
import os
import time

# Supabase
from supabase import create_client

# --- ESCONDE O MENU PADRÃO (Pages / streamlit_app / etc.) ---
st.markdown("""
<style>
/* Esconde o menu de páginas padrão do Streamlit */
[data-testid="stSidebarNav"] { display: none !important; }
</style>
""", unsafe_allow_html=True)

# ==============================================================================
# 1. CONFIGURAÇÃO INICIAL E AMBIENTE
# ==============================================================================
APP_VERSION = "v128.0 (Leitura Blindada)"

try:
    IS_TEST_ENV = st.secrets.get("ENV") == "TESTE"
except Exception:
    IS_TEST_ENV = False

titulo_pag = "[TESTE] Omnisfera" if IS_TEST_ENV else "Omnisfera | Ecossistema"
icone_pag = "omni_icone.png" if os.path.exists("omni_icone.png") else "🌐"

st.set_page_config(
    page_title=titulo_pag,
    page_icon=icone_pag,
    layout="wide",
    initial_sidebar_state="expanded"
)

# ==============================================================================
# 1.1. ESTADO BASE (ALUNO)
# ==============================================================================
default_state = {
    "nome": "",
    "nasc": date(2015, 1, 1),
    "serie": None,
    "turma": "",
    "diagnostico": "",
    "lista_medicamentos": [],
    "composicao_familiar_tags": [],
    "historico": "",
    "familia": "",
    "hiperfoco": "",
    "potencias": [],
    "rede_apoio": [],
    "orientacoes_especialistas": "",
    "checklist_evidencias": {},
    "nivel_alfabetizacao": "Não se aplica (Educação Infantil)",
    "barreiras_selecionadas": {},
    "niveis_suporte": {},
    "estrategias_acesso": [],
    "estrategias_ensino": [],
    "estrategias_avaliacao": [],
    "ia_sugestao": "",
    "checklist_hub": {},
    "student_id": None,
}

if "dados" not in st.session_state:
    st.session_state.dados = default_state.copy()

# ==============================================================================
# 1.2. SUPABASE
# ==============================================================================
@st.cache_resource
def get_sb():
    url = st.secrets.get("SUPABASE_URL", "")
    key = st.secrets.get("SUPABASE_ANON_KEY", "")
    if not url or not key:
        return None
    return create_client(url, key)

sb = get_sb()

def get_workspace_id():
    return st.session_state.get("workspace_id")

def sb_list_students():
    if not sb:
        return []
    ws = get_workspace_id()
    q = sb.table("students").select("id,name,birth_date,grade,class_group,diagnosis,created_at")
    if ws:
        q = q.eq("workspace_id", ws)
    res = q.order("created_at", desc=True).execute()
    return res.data or []

def sb_delete_student(student_id: str):
    if not sb:
        return False, "Supabase não configurado."
    ws = get_workspace_id()
    q = sb.table("students").delete().eq("id", student_id)
    if ws:
        q = q.eq("workspace_id", ws)
    q.execute()
    return True, "Aluno removido."

def load_student_to_session(row: dict):
    st.session_state.dados["student_id"] = row.get("id")
    st.session_state.dados["nome"] = row.get("name", "") or ""
    st.session_state.dados["serie"] = row.get("grade", None)
    st.session_state.dados["turma"] = row.get("class_group", "") or ""
    st.session_state.dados["diagnostico"] = row.get("diagnosis", "") or ""

    bd = row.get("birth_date")
    if isinstance(bd, str):
        try:
            st.session_state.dados["nasc"] = date.fromisoformat(bd)
        except Exception:
            pass

if "banco_estudantes" not in st.session_state:
    st.session_state.banco_estudantes = sb_list_students() if sb else []

# ==============================================================================
# 2. UTILITÁRIOS
# ==============================================================================
def get_base64_image(image_path: str) -> str:
    if not os.path.exists(image_path):
        return ""
    with open(image_path, "rb") as img_file:
        return base64.b64encode(img_file.read()).decode()

# ==============================================================================
# 3. SISTEMA DE SEGURANÇA
# ==============================================================================
if "autenticado" not in st.session_state:
    st.session_state["autenticado"] = False

if not st.session_state["autenticado"]:
    st.markdown("""<style>section[data-testid="stSidebar"] { display: none !important; }</style>""", unsafe_allow_html=True)
    c1, c_login, c2 = st.columns([1, 2, 1])
    with c_login:
        st.markdown("""
            <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Nunito:wght@400;600;700&display=swap');
            html, body, [class*="css"] { font-family: 'Nunito', sans-serif; background:#F7FAFC; }
            .login-container {
                background: white; padding: 30px; border-radius: 20px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.06);
                text-align: center; border: 1px solid #E2E8F0;
                max-width: 480px; margin: 40px auto;
            }
            @keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
            </style>
            """, unsafe_allow_html=True)

        st.markdown("<div class='login-container'>", unsafe_allow_html=True)
        img_icone = get_base64_image("omni_icone.png")
        if img_icone:
            st.markdown(f"<img src='data:image/png;base64,{img_icone}' style='height:80px; animation: spin 45s linear infinite;'>", unsafe_allow_html=True)
        st.markdown("<h2 style='color:#0F52BA; margin:10px 0;'>OMNISFERA</h2>", unsafe_allow_html=True)

        if IS_TEST_ENV:
            if st.button("🚀 ENTRAR (MODO TESTE)", use_container_width=True):
                st.session_state["autenticado"] = True
                st.session_state["usuario_nome"] = "Visitante Teste"
                st.rerun()
        else:
            nome = st.text_input("Nome", placeholder="Seu Nome")
            cargo = st.text_input("Cargo", placeholder="Seu Cargo")
            senha = st.text_input("Senha", type="password", placeholder="Senha de Acesso")

            if st.button("ACESSAR", use_container_width=True):
                hoje = date.today()
                senha_mestra = "PEI_START_2026" if hoje <= date(2026, 1, 19) else "OMNI_PRO"
                if senha == senha_mestra and nome:
                    st.session_state["autenticado"] = True
                    st.session_state["usuario_nome"] = nome
                    st.session_state["usuario_cargo"] = cargo
                    st.rerun()
                else:
                    st.error("Dados incorretos.")
        st.markdown("</div>", unsafe_allow_html=True)
    st.stop()

# ==============================================================================
# 4. TOPBAR OMNISFERA (ESTILO ATUALIZADO)
# ==============================================================================
if IS_TEST_ENV:
    display_text, footer_visibility = "OMNISFERA | TESTE", "visible"
else:
    display_text, footer_visibility = f"OMNISFERA {APP_VERSION}", "hidden"

st.markdown(f"""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Nunito:wght@400;600;700&display=swap');
/* Importação dos Remix Icons (Flat Icons) */
@import url("https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css");

html, body, [class*="css"] {{
  font-family: 'Nunito', sans-serif;
  color: #2D3748;
  background-color: #F7FAFC;
}}

.block-container {{
  padding-top: 130px !important;
  padding-bottom: 2rem !important;
}}

/* --- HEADER FIXO --- */
.logo-container {{
  display: flex; align-items: center; justify-content: flex-start; gap: 15px;
  position: fixed; top: 0; left: 0; width: 100%; height: 90px;
  background-color: rgba(247, 250, 252, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  z-index: 99999;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  padding-left: 40px; padding-top: 5px;
}}

.header-subtitle-text {{
  font-family: 'Nunito', sans-serif; font-weight: 600; font-size: 1rem; color: #718096;
  border-left: 2px solid #CBD5E0; padding-left: 15px;
  height: 40px; display: flex; align-items: center;
}}

.logo-icon-spin {{ height: 75px; width: auto; animation: spin 45s linear infinite; }}
.logo-text-static {{ height: 45px; width: auto; }}

@keyframes spin {{ from {{ transform: rotate(0deg); }} to {{ transform: rotate(360deg); }} }}

/* --- CARDS FLAT (MODERNOS) --- */
.flat-card {{
    background: white;
    border-radius: 16px;
    padding: 20px;
    border: 1px solid #E2E8F0;
    box-shadow: 0 4px 6px rgba(0,0,0,0.02);
    display: flex;
    flex-direction: column;
    align-items: flex-start; /* Alinhado a esquerda */
    height: 140px;
    position: relative;
    transition: all 0.2s ease;
}}

.flat-card:hover {{
    transform: translateY(-3px);
    box-shadow: 0 10px 15px rgba(0,0,0,0.05);
    border-color: #CBD5E0;
}}

.flat-icon {{
    width: 40px; height: 40px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.5rem;
    margin-bottom: 12px;
}}

.flat-title {{
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    font-size: 1.1rem;
    color: #2D3748;
    margin-bottom: 4px;
}}

.flat-desc {{
    font-size: 0.8rem;
    color: #718096;
    line-height: 1.3;
}}

/* Esconde UI padrão */
[data-testid="stHeader"] {{ visibility: hidden !important; height: 0px !important; }}
footer {{ visibility: {footer_visibility} !important; }}
</style>
""", unsafe_allow_html=True)

# --- RENDER HEADER ---
icone_b64 = get_base64_image("omni_icone.png")
texto_b64 = get_base64_image("omni_texto.png")

logo_icon_html = (
    f'<img src="data:image/png;base64,{icone_b64}" class="logo-icon-spin">'
    if icone_b64
    else '<div style="width:75px;height:75px;border-radius:20px;display:flex;align-items:center;justify-content:center;background:white;border:1px solid #E2E8F0;">🌐</div>'
)
logo_text_html = (
    f'<img src="data:image/png;base64,{texto_b64}" class="logo-text-static">'
    if texto_b64
    else '<div style="font-family:Inter,sans-serif;font-weight:800;font-size:1.2rem;color:#0F52BA;">OMNISFERA</div>'
)

st.markdown(
    f"""
<div class="logo-container">
  {logo_icon_html}
  {logo_text_html}
  <div class="header-subtitle-text">Ecossistema de Inteligência Pedagógica</div>
</div>
""",
    unsafe_allow_html=True,
)

# ==============================================================================
# 5. HOME (conteúdo)
# ==============================================================================

# Sidebar
with st.sidebar:
    st.markdown("### 🧭 Navegação")
    if st.button("🏠 Home", use_container_width=True):
        st.rerun()

    col1, col2 = st.columns(2)
    with col1:
        if st.button("📘 PEI", use_container_width=True):
            st.switch_page("pages/1_PEI.py")
    with col2:
        if st.button("🧩 PAEE", use_container_width=True):
            st.switch_page("pages/2_PAE.py")

    if st.button("🚀 Hub", use_container_width=True):
        st.switch_page("pages/3_Hub_Inclusao.py")

    st.markdown("---")
    st.markdown(f"**👤 {st.session_state.get('usuario_nome', '')}**")
    st.caption(st.session_state.get("usuario_cargo", ""))
    if st.button("Sair", use_container_width=True):
        st.session_state["autenticado"] = False
        st.rerun()

# Hero
primeiro_nome = ""
try:
    primeiro_nome = st.session_state.get("usuario_nome", "").split()[0]
except Exception:
    primeiro_nome = ""

st.markdown(
    f"""
    <div style="
        background: radial-gradient(circle at top right, #0F52BA, #062B61);
        border-radius: 16px; margin: 10px 0 30px 0;
        box-shadow: 0 10px 25px -5px rgba(15, 82, 186, 0.3); color: white;
        padding: 30px 40px; display: flex; align-items: center;
        border: 1px solid rgba(255,255,255,0.1); min-height: 120px;">
        <div>
            <div style="font-family:'Inter'; font-weight:700; font-size:1.8rem;">Olá, {primeiro_nome}!</div>
            <div style="opacity:0.9; font-size:0.95rem; margin-top:5px;">Seja bem-vindo ao seu workspace de inclusão.</div>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

# Ferramentas (Cards com Ícones Flat)
st.markdown("### 🚀 Acesso Rápido")
c1, c2, c3 = st.columns(3)

def render_flat_card(col, icon_class, icon_color, title, subtitle, key, path):
    with col:
        # Renderiza o visual do card
        st.markdown(f"""
        <div class="flat-card">
            <div class="flat-icon" style="background-color: {icon_color}15; color: {icon_color};">
                <i class="{icon_class}"></i>
            </div>
            <div class="flat-title">{title}</div>
            <div class="flat-desc">{subtitle}</div>
        </div>
        """, unsafe_allow_html=True)
        
        # Botão invisível sobreposto para clique
        st.markdown("""
        <style>
        div[data-testid="stVerticalBlock"] > div:has(div.flat-card) { position: relative; }
        </style>
        """, unsafe_allow_html=True)
        
        if st.button("Abrir", key=key, use_container_width=True):
            if st.session_state.dados.get("nome") or "Alunos" in title: # Permite ir para PEI se tiver aluno, ou Hub direto
                st.switch_page(path)
            else:
                st.toast("⚠️ Selecione um aluno abaixo primeiro!", icon="👇")
                time.sleep(0.3)

# Cards com Remix Icons render_flat_card(c1, "ri-book-open-fill", "#3182CE", "Plano de Ensino (PEI)", "Gestão de metas e adaptações.", "btn_pei", "pages/1_PEI.py")
render_flat_card(c2, "ri-puzzle-2-fill", "#805AD5", "Sala de Recursos (PAEE)", "Atendimento especializado.", "btn_paee", "pages/2_PAE.py")
render_flat_card(c3, "ri-rocket-2-fill", "#38B2AC", "Hub de Inclusão", "Banco de materiais e IA.", "btn_hub", "pages/3_Hub_Inclusao.py")

# --- LISTA DE ALUNOS (SUPABASE) ---
st.markdown("---")
st.markdown("### 🗄️ Banco de Estudantes (Supabase)")

if st.session_state.dados.get("nome"):
    st.success(f"✅ Aluno Ativo: **{st.session_state.dados['nome']}**")
else:
    st.info("👇 Selecione um aluno para começar ou vá ao PEI para criar um novo.")

if not sb:
    st.error("❌ Supabase não configurado. Verifique SUPABASE_URL e SUPABASE_ANON_KEY em st.secrets.")
else:
    colA, colB = st.columns([1, 3])
    with colA:
        if st.button("🔄 Recarregar lista", use_container_width=True):
            st.session_state.banco_estudantes = sb_list_students()
            st.rerun()
    with colB:
        ws = get_workspace_id()
        if ws:
            st.caption(f"Workspace ativo: {ws}")
        else:
            st.caption("Workspace_id não encontrado.")

    alunos = st.session_state.banco_estudantes or []
    if not alunos:
        st.warning("Nenhum aluno encontrado.")
    else:
        for i, aluno in enumerate(alunos):
            nome = aluno.get("name", "")
            if not nome: continue

            with st.container():
                c_info, c_act = st.columns([4, 1])
                with c_info:
                    st.markdown(f"**{nome}** | {aluno.get('grade', '-')}")
                    st.caption(f"Diagnóstico: {aluno.get('diagnosis', '---')}")

                with c_act:
                    if st.button("📂 Carregar", key=f"load_{i}", use_container_width=True):
                        load_student_to_session(aluno)
                        st.toast(f"Carregado: {nome}", icon="✅")
                        time.sleep(0.2)
                        st.rerun()

                    if st.button("🗑️", key=f"del_{i}", type="secondary", use_container_width=True):
                        ok, msg = sb_delete_student(aluno.get("id"))
                        if ok:
                            st.success(msg)
                            st.session_state.banco_estudantes = sb_list_students()
                            st.rerun()
                        else:
                            st.error(msg)
                st.markdown("<hr style='margin:5px 0;'>", unsafe_allow_html=True)

# Footer
st.markdown(
    "<div style='text-align: center; color: #CBD5E0; font-size: 0.7rem; margin-top: 40px;'>Omnisfera desenvolvida por RODRIGO A. QUEIROZ</div>",
    unsafe_allow_html=True,
)
