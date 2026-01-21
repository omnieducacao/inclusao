# streamlit_app.py
import streamlit as st
from datetime import date
import base64
import os
import time

# ==============================================================================
# 0) CONFIGURAÇÃO DO APP
# ==============================================================================
APP_VERSION = "v132.0 (Home 6 Cards • Estudantes + Escola do PIN)"

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
    initial_sidebar_state="expanded",
)

# ==============================================================================
# 1) ESTADO BASE (mínimo) + AUTH
# ==============================================================================
if "autenticado" not in st.session_state:
    st.session_state["autenticado"] = False

if "usuario_nome" not in st.session_state:
    st.session_state["usuario_nome"] = ""

if "usuario_cargo" not in st.session_state:
    st.session_state["usuario_cargo"] = ""

# Mantém dados para compatibilidade com suas páginas (Home NÃO usa como gate)
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
# 2) HELPERS
# ==============================================================================
def get_base64_image(image_path: str) -> str:
    if not image_path or not os.path.exists(image_path):
        return ""
    with open(image_path, "rb") as img_file:
        return base64.b64encode(img_file.read()).decode()

def get_escola_vinculada() -> str:
    """
    Tentativa robusta de recuperar o nome da escola vinculada ao PIN.
    Como o seu fluxo já "conseguiu trazer a informação do PIN", geralmente
    ela fica em algo como:
      - st.session_state["workspace_name"]
      - st.session_state["escola_nome"]
      - st.session_state["school_name"]
      - st.session_state["workspace"]["name"]
      - st.session_state["workspace"]["school_name"]
    Esta função tenta todas sem quebrar.
    """
    keys_direct = ["escola", "escola_nome", "school_name", "workspace_name", "workspace_label", "workspace_display"]
    for k in keys_direct:
        v = st.session_state.get(k)
        if isinstance(v, str) and v.strip():
            return v.strip()

    w = st.session_state.get("workspace")
    if isinstance(w, dict):
        for k in ["name", "school_name", "escola", "escola_nome", "label", "display_name"]:
            v = w.get(k)
            if isinstance(v, str) and v.strip():
                return v.strip()

    # fallback: se só tiver workspace_id, mostramos uma forma curta
    wsid = st.session_state.get("workspace_id")
    if isinstance(wsid, str) and wsid.strip():
        return f"Workspace {wsid[:8]}…"

    return ""

# ==============================================================================
# 3) CSS GLOBAL (sempre) — evita “duas telas” sobrepondo
# ==============================================================================
st.markdown(
    """
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Nunito:wght@400;600;700&display=swap');
html, body, [class*="css"] { font-family: 'Nunito', sans-serif; color:#2D3748; background:#F7FAFC; }

/* some com o menu padrão de páginas (onde aparece streamlit_app etc.) */
[data-testid="stSidebarNav"] { display: none !important; }

/* esconder header padrão */
[data-testid="stHeader"] { visibility: hidden !important; height: 0px !important; }
</style>
""",
    unsafe_allow_html=True,
)

# ==============================================================================
# 4) LOGIN (único) — sem sobreposição
# ==============================================================================
if not st.session_state["autenticado"]:
    st.markdown(
        """<style>section[data-testid="stSidebar"] { display: none !important; }</style>""",
        unsafe_allow_html=True,
    )

    st.markdown(
        """
<style>
.login-container {
  background: white;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.06);
  text-align: center;
  border: 1px solid #E2E8F0;
  max-width: 480px;
  margin: 40px auto;
}
@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
</style>
""",
        unsafe_allow_html=True,
    )

    c1, c_login, c2 = st.columns([1, 2, 1])
    with c_login:
        st.markdown("<div class='login-container'>", unsafe_allow_html=True)

        img_icone = get_base64_image("omni_icone.png")
        if img_icone:
            st.markdown(
                f"<img src='data:image/png;base64,{img_icone}' style='height:80px; animation: spin 45s linear infinite;'>",
                unsafe_allow_html=True,
            )
        st.markdown("<h2 style='color:#0F52BA; margin:10px 0;'>OMNISFERA</h2>", unsafe_allow_html=True)

        if IS_TEST_ENV:
            if st.button("🚀 ENTRAR (MODO TESTE)", use_container_width=True):
                st.session_state["autenticado"] = True
                st.session_state["usuario_nome"] = "Visitante Teste"
                st.session_state["usuario_cargo"] = "Ambiente de Teste"
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
# 5) TOPBAR + HOME CSS (somente após login)
# ==============================================================================
if IS_TEST_ENV:
    card_bg, card_border, display_text, footer_visibility = (
        "rgba(255, 220, 50, 0.95)",
        "rgba(200, 160, 0, 0.5)",
        "OMNISFERA | TESTE",
        "visible",
    )
else:
    card_bg, card_border, display_text, footer_visibility = (
        "rgba(255, 255, 255, 0.85)",
        "rgba(255, 255, 255, 0.6)",
        f"OMNISFERA {APP_VERSION}",
        "hidden",
    )

escola_vinculada = get_escola_vinculada()

st.markdown(
    f"""
<style>
/* Flaticon UIcons v3.0.0 */
@import url('https://cdn-uicons.flaticon.com/3.0.0/uicons-solid-rounded/css/uicons-solid-rounded.css');
@import url('https://cdn-uicons.flaticon.com/3.0.0/uicons-solid-straight/css/uicons-solid-straight.css');
@import url('https://cdn-uicons.flaticon.com/3.0.0/uicons-bold-rounded/css/uicons-bold-rounded.css');

/* conteúdo não fica atrás da barra */
.block-container {{ padding-top: 130px !important; padding-bottom: 2rem !important; }}

/* TOPBAR fixa */
.logo-container {{
  display:flex; align-items:center; justify-content:flex-start; gap:15px;
  position: fixed; top:0; left:0; width:100%; height:90px;
  background-color: rgba(247, 250, 252, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  z-index: 99999;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  padding-left: 40px; padding-top: 5px;
}}
.header-subtitle-text {{
  font-weight: 600; font-size: 1rem; color: #718096;
  border-left: 2px solid #CBD5E0; padding-left: 15px;
  height: 40px; display: flex; align-items: center;
}}
.logo-icon-spin {{ height:75px; width:auto; animation: spin 45s linear infinite; }}
.logo-text-static {{ height:45px; width:auto; }}

.omni-badge {{
  position: fixed; top: 15px; right: 15px;
  background: {card_bg}; border: 1px solid {card_border};
  backdrop-filter: blur(12px);
  padding: 6px 14px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.06);
  z-index: 999990;
  display:flex; flex-direction:column; align-items:flex-end; justify-content:center;
  gap: 2px;
  pointer-events: none;
}}
.omni-text {{
  font-family:'Inter', sans-serif;
  font-weight: 800; font-size: 0.6rem; color: #2D3748;
  letter-spacing: 1.5px; text-transform: uppercase;
}}
.omni-school {{
  font-family:'Nunito', sans-serif;
  font-weight: 700;
  font-size: 0.78rem;
  color: #2D3748;
  opacity: 0.92;
  max-width: 340px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}}

@keyframes spin {{ from {{ transform: rotate(0deg); }} to {{ transform: rotate(360deg); }} }}

/* Hero */
.dash-hero {{
  background: radial-gradient(circle at top right, #0F52BA, #062B61);
  border-radius: 16px;
  margin: 10px 0 20px 0;
  box-shadow: 0 10px 25px -5px rgba(15, 82, 186, 0.3);
  color: white;
  padding: 25px 35px;
  display: flex;
  align-items: center;
  border: 1px solid rgba(255,255,255,0.1);
  min-height: 100px;
}}
.hero-title {{
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 1.5rem;
  margin: 0;
}}
.hero-sub {{
  margin-top: 6px;
  font-weight: 700;
  color: rgba(255,255,255,0.85);
}}

/* HOME CARDS — 3 por linha (desktop), responsivo */
.home-grid {{
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}}
@media (max-width: 1100px) {{ .home-grid {{ grid-template-columns: repeat(2, minmax(0, 1fr)); }} }}
@media (max-width: 700px)  {{ .home-grid {{ grid-template-columns: repeat(1, minmax(0, 1fr)); }} }}

.home-card {{
  background: white;
  border-radius: 18px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
  padding: 16px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 92px;
  transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease;
}}
.home-card:hover {{
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(15,82,186,0.07);
  border-color: rgba(49,130,206,0.35);
}}

.home-ic {{
  width: 44px; height: 44px;
  border-radius: 14px;
  display:flex; align-items:center; justify-content:center;
  background: rgba(15,82,186,0.08);
  border: 1px solid rgba(15,82,186,0.12);
}}
.home-ic i {{
  font-size: 22px;
  line-height: 1;
  color: #0F52BA;
}}

.home-txt {{ display:flex; flex-direction:column; gap:3px; }}
.home-title {{
  font-family:'Inter',sans-serif;
  font-weight:800;
  font-size:0.95rem;
  color:#1A202C;
  margin:0;
}}
.home-sub {{
  font-size:0.78rem;
  color:#718096;
  margin:0;
  font-weight:600;
}}

/* botão invisível cobrindo o card */
.home-btn-wrap {{ position: relative; }}
.home-btn-wrap button {{
  position: absolute;
  inset: 0;
  opacity: 0.01;
  height: 100%;
  z-index: 10;
}}
.home-btn-wrap [data-testid="stButton"] {{ margin: 0; }}
.home-btn-wrap [data-testid="stButton"] > button {{ padding: 0 !important; }}
.home-btn-wrap [data-testid="stButton"] > button:focus {{ outline: none !important; box-shadow: none !important; }}

/* borda por módulo (sutil) */
.b-blue {{ border-bottom: 4px solid #3182CE; }}
.b-purple {{ border-bottom: 4px solid #805AD5; }}
.b-teal {{ border-bottom: 4px solid #38B2AC; }}
.b-slate {{ border-bottom: 4px solid #4A5568; }}

/* footer */
footer {{ visibility: {footer_visibility} !important; }}
</style>
""",
    unsafe_allow_html=True,
)

# Render topbar
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
<div class="omni-badge">
  <span class="omni-text">{display_text}</span>
  {"<span class='omni-school'>"+escola_vinculada+"</span>" if escola_vinculada else ""}
</div>
""",
    unsafe_allow_html=True,
)

# ==============================================================================
# 6) SIDEBAR (NAV PRÓPRIA + USUÁRIO)
# ==============================================================================
with st.sidebar:
    st.markdown("### 🧭 Navegação")

    # Estudantes (nova pasta/arquivo)
    if st.button("👥 Estudantes", use_container_width=True):
        st.switch_page("pages/0_Alunos.py")

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

    # Escola do PIN (também na sidebar)
    if escola_vinculada:
        st.caption("🏫 Escola vinculada")
        st.markdown(f"**{escola_vinculada}**")

    st.markdown("---")
    st.markdown(f"**👤 {st.session_state.get('usuario_nome', '')}**")
    st.caption(st.session_state.get("usuario_cargo", ""))

    if st.button("Sair", use_container_width=True):
        st.session_state["autenticado"] = False
        st.rerun()

# ==============================================================================
# 7) HOME (conteúdo)
# ==============================================================================
primeiro_nome = ""
try:
    primeiro_nome = (st.session_state.get("usuario_nome", "") or "").split()[0]
except Exception:
    primeiro_nome = ""

st.markdown(
    f"""
<div class="dash-hero">
  <div>
    <div class="hero-title">Olá, {primeiro_nome}!</div>
    {"<div class='hero-sub'>🏫 "+escola_vinculada+"</div>" if escola_vinculada else ""}
  </div>
</div>
""",
    unsafe_allow_html=True,
)

# ==============================================================================
# 7.1) HOME — 6 CARDS (3 por linha)
# - removemos o card HOME
# - adicionamos ESTUDANTES -> pages/0_Alunos.py
# ==============================================================================
st.markdown("### 🚀 Acesso Rápido")

def _handle(dest: str):
    if dest == "ALUNOS":
        st.switch_page("pages/0_Alunos.py")
    elif dest == "PEI":
        st.switch_page("pages/1_PEI.py")
    elif dest == "PAEE":
        st.switch_page("pages/2_PAE.py")
    elif dest == "HUB":
        st.switch_page("pages/3_Hub_Inclusao.py")
    elif dest == "DIARIO":
        st.toast("🛠️ Diário de Bordo — em breve neste build.", icon="✨")
        time.sleep(0.2)
    elif dest == "DADOS":
        st.toast("🛠️ Evolução & Dados — em breve neste build.", icon="✨")
        time.sleep(0.2)
    else:
        st.toast("🛠️ Em breve.", icon="✨")
        time.sleep(0.2)

cards = [
    # label, subtitle, icon_class, dest, border_class
    ("Estudantes", "Gestão e seleção de alunos", "fi fi-br-users", "ALUNOS", "b-slate"),
    ("Estratégias & PEI", "Plano Educacional Individualizado", "fi fi-sr-book-open-cover", "PEI", "b-blue"),
    ("Plano de Ação / PAEE", "Sala de Recursos e intervenções", "fi fi-ss-puzzle", "PAEE", "b-purple"),
    ("Hub de Recursos", "Materiais, adaptações e apoio", "fi fi-sr-rocket", "HUB", "b-teal"),
    ("Diário de Bordo", "Registros e acompanhamentos", "fi fi-br-notebook", "DIARIO", "b-slate"),
    ("Evolução & Dados", "Dashboards e indicadores", "fi fi-br-chart-histogram", "DADOS", "b-slate"),
]

st.markdown("<div class='home-grid'>", unsafe_allow_html=True)

for idx, (title, sub, icon_class, dest, border) in enumerate(cards):
    st.markdown(
        f"""
<div class="home-btn-wrap">
  <div class="home-card {border}">
    <div class="home-ic"><i class="{icon_class}"></i></div>
    <div class="home-txt">
      <div class="home-title">{title}</div>
      <div class="home-sub">{sub}</div>
    </div>
  </div>
</div>
""",
        unsafe_allow_html=True,
    )
    if st.button("open", key=f"home_card_{idx}", use_container_width=True):
        _handle(dest)

st.markdown("</div>", unsafe_allow_html=True)

# ==============================================================================
# 8) FOOTER
# ==============================================================================
st.markdown(
    "<div style='text-align: center; color: #CBD5E0; font-size: 0.7rem; margin-top: 40px;'>Omnisfera desenvolvida por RODRIGO A. QUEIROZ</div>",
    unsafe_allow_html=True,
)
