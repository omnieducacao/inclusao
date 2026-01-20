# Home.py
import streamlit as st
import base64, os
from datetime import datetime

# =========================================================
# CONFIG
# =========================================================
APP_VERSION = "v116.0"

PAGES = {
    "estudantes": "pages/0_Alunos.py",
    "pei":        "pages/1_PEI.py",
    "paee":       "pages/2_PAE.py",
    "hub":        "pages/3_Hub_Inclusao.py",
    "diario":     "pages/4_Diario_de_Bordo.py",
    "mon":        "pages/5_Monitoramento_Avaliacao.py",
}

# (Opcional) Se você já tem supabase no projeto, plugamos aqui.
# Se ainda não tiver, o login vai mostrar aviso (sem quebrar a Home).
def _supabase_login(email: str, password: str):
    """
    Tenta autenticar via Supabase Auth.
    Requer st.secrets: SUPABASE_URL e SUPABASE_ANON_KEY (ou SUPABASE_KEY).
    """
    try:
        from supabase import create_client  # supabase-py
        url = st.secrets.get("SUPABASE_URL")
        key = st.secrets.get("SUPABASE_ANON_KEY") or st.secrets.get("SUPABASE_KEY")
        if not url or not key:
            return (False, "Supabase não configurado em secrets (SUPABASE_URL / SUPABASE_ANON_KEY).")

        supabase = create_client(url, key)
        res = supabase.auth.sign_in_with_password({"email": email, "password": password})

        # res.user pode variar por versão; tratamos robusto:
        user = getattr(res, "user", None) or (res.get("user") if isinstance(res, dict) else None)
        if not user:
            return (False, "Credenciais inválidas.")
        return (True, user)
    except Exception as e:
        return (False, f"Falha no login Supabase: {e}")

# =========================================================
# PAGE CONFIG
# =========================================================
icone_pag = "omni_icone.png" if os.path.exists("omni_icone.png") else "🧩"
st.set_page_config(page_title="Omnisfera | Portal", page_icon=icone_pag, layout="wide", initial_sidebar_state="collapsed")

# =========================================================
# SESSION INIT
# =========================================================
if "autenticado" not in st.session_state:
    st.session_state.autenticado = False

if "usuario_nome" not in st.session_state:
    st.session_state.usuario_nome = ""

if "usuario_cargo" not in st.session_state:
    st.session_state.usuario_cargo = ""

if "usuario_email" not in st.session_state:
    st.session_state.usuario_email = ""

# =========================================================
# UTIL
# =========================================================
def get_base64_image(path: str) -> str:
    if not os.path.exists(path):
        return ""
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()

def goto(page_path: str):
    # garante que existe o arquivo
    if not os.path.exists(page_path):
        st.error(f"Página não encontrada: {page_path}")
        st.stop()
    st.switch_page(page_path)

def logout():
    st.session_state.autenticado = False
    # opcional: limpar dados
    # st.session_state.usuario_nome = ""
    # st.session_state.usuario_cargo = ""
    # st.session_state.usuario_email = ""
    st.rerun()

# =========================================================
# GLOBAL CSS (High Design / Estável)
# - Carrega TODOS os packs Flaticon usados: sr, rr, br, ss
# =========================================================
st.markdown("""
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">

<!-- Flaticon UIcons packs (para fi-sr / fi-rr / fi-br / fi-ss) -->
<link rel="stylesheet" href="https://cdn-uicons.flaticon.com/uicons-solid-rounded/css/uicons-solid-rounded.css">
<link rel="stylesheet" href="https://cdn-uicons.flaticon.com/uicons-regular-rounded/css/uicons-regular-rounded.css">
<link rel="stylesheet" href="https://cdn-uicons.flaticon.com/uicons-brands/css/uicons-brands.css">
<link rel="stylesheet" href="https://cdn-uicons.flaticon.com/uicons-solid-straight/css/uicons-solid-straight.css">

<style>
:root{
  --bg: #F7FAFC;
  --text: #0F172A;
  --muted: #64748B;
  --border: #E2E8F0;

  /* acentos por módulo (elegantes / menos saturados) */
  --c-home: #1F2A44;
  --c-est:  #2563EB;
  --c-pei:  #3B82F6;
  --c-paee: #22C55E;
  --c-hub:  #F59E0B;
  --c-di:   #F97316;
  --c-mon:  #A855F7;

  --shadow1: 0 10px 30px rgba(15,23,42,0.06);
  --shadow2: 0 14px 38px rgba(15,23,42,0.10);
}

html, body, [class*="css"]{
  font-family: 'Nunito', system-ui, -apple-system, Segoe UI, Roboto, Arial;
  background: var(--bg);
  color: var(--text);
}

header[data-testid="stHeader"]{display:none !important;}
[data-testid="stSidebar"]{display:none !important;}
[data-testid="stSidebarNav"]{display:none !important;}
[data-testid="stToolbar"]{display:none !important;}

.block-container{
  padding-top: 116px !important;
  padding-left: 2rem !important;
  padding-right: 2rem !important;
  padding-bottom: 2rem !important;
}

@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
@keyframes fadeInUp{from{opacity:0; transform:translateY(10px);}to{opacity:1; transform:translateY(0);}}

/* =========================================================
   HEADER FIXO (Omnisfera)
   ========================================================= */
.portal-header{
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 92px;
  z-index: 99999;
  display:flex;
  align-items:center;
  gap: 14px;
  padding: 10px 28px;
  background: rgba(247,250,252,0.88);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(226,232,240,0.85);
  box-shadow: 0 6px 18px rgba(15,23,42,0.05);
}

.portal-logo-wrap{
  display:flex;
  align-items:center;
  gap: 12px;
  min-width: 320px;
}

.portal-logo-spin{
  height: 58px;
  width:auto;
  animation: spin 45s linear infinite;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.10));
}

.portal-logo-text{
  height: 28px;
  width:auto;
}

.portal-subtitle{
  font-family:'Inter', sans-serif;
  font-weight: 700;
  font-size: 0.96rem;
  color: #64748B;
  border-left: 2px solid rgba(203,213,225,0.9);
  padding-left: 14px;
  height: 40px;
  display:flex;
  align-items:center;
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.portal-right{
  margin-left:auto;
  display:flex;
  align-items:center;
  gap: 10px;
  color: rgba(15,23,42,0.55);
  font-family:'Inter', sans-serif;
  font-weight: 800;
  font-size: 0.72rem;
  letter-spacing: .12em;
  text-transform: uppercase;
}

/* =========================================================
   HERO
   ========================================================= */
.hero{
  background: radial-gradient(circle at top right, #0F52BA, #062B61);
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(15, 82, 186, 0.30);
  color: white;
  position: relative;
  overflow: hidden;
  padding: 22px 28px;
  display:flex;
  align-items:center;
  justify-content: space-between;
  border: 1px solid rgba(255,255,255,0.12);
  min-height: 96px;
  animation: fadeInUp .55s ease;
}

.hero-title{
  font-family:'Inter', sans-serif;
  font-weight: 900;
  font-size: 1.45rem;
  margin:0;
  line-height:1.1;
}

.hero-subtitle{
  font-family:'Inter', sans-serif;
  font-size: 0.92rem;
  opacity: 0.92;
  font-weight: 500;
  margin-top: 6px;
}

.hero-bg{
  position:absolute;
  right: 20px;
  top: 6px;
  font-size: 5.8rem;
  opacity: 0.08;
  transform: rotate(-10deg);
}

.section-title{
  font-family:'Inter', sans-serif;
  font-weight: 900;
  font-size: 1.02rem;
  color:#0F172A;
  margin: 20px 0 12px 0;
  display:flex;
  align-items:center;
  gap: 10px;
}

/* =========================================================
   CARDS GRID (alto padrão)
   ========================================================= */
.tools-grid{
  display:grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 14px;
}

.tool-card{
  grid-column: span 4;
  background: white;
  border-radius: 18px;
  border: 1px solid var(--border);
  box-shadow: 0 2px 8px rgba(15,23,42,0.03);
  overflow: hidden;
  animation: fadeInUp .55s ease;
  transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease;
}

.tool-card:hover{
  transform: translateY(-3px);
  box-shadow: var(--shadow2);
  border-color: rgba(203,213,225,1);
}

.tool-topbar{
  height: 4px;
  width: 100%;
}

.tool-body{
  padding: 16px 16px 12px 16px;
  display:flex;
  gap: 12px;
  align-items:flex-start;
}

.tool-ico{
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display:flex;
  align-items:center;
  justify-content:center;
  color: white;
  flex: 0 0 auto;
  box-shadow: 0 8px 18px rgba(15,23,42,0.10);
}

.tool-ico i{
  font-size: 20px;
  line-height: 1;
  display:flex;
}

.tool-meta{flex:1;}
.tool-title{
  font-family:'Inter', sans-serif;
  font-weight: 900;
  font-size: 0.95rem;
  margin: 0;
  color:#0F172A;
}
.tool-desc{
  margin-top: 6px;
  color: #64748B;
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.25;
}
.tool-brand{
  margin-top: 10px;
  font-family:'Inter', sans-serif;
  font-weight: 900;
  font-size: 0.62rem;
  letter-spacing: .18em;
  color: rgba(15,23,42,0.35);
  text-transform: uppercase;
}

/* CTA integrado */
.tool-cta{
  padding: 0 16px 16px 16px;
}
.tool-cta button{
  width:100%;
  height: 44px;
  border-radius: 14px !important;
  font-family:'Inter', sans-serif !important;
  font-weight: 900 !important;
  border: 1px solid rgba(226,232,240,1) !important;
  background: rgba(248,250,252,1) !important;
  color: rgba(15,23,42,0.80) !important;
  transition: transform .14s ease, box-shadow .14s ease, filter .14s ease;
}
.tool-cta button:hover{
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(15,23,42,0.08);
  filter: brightness(1.02);
}

/* =========================================================
   LOGIN CARD
   ========================================================= */
.login-wrap{
  max-width: 520px;
  margin: 0 auto;
}
.login-card{
  background: white;
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 22px;
  box-shadow: var(--shadow1);
}
.login-title{
  font-family:'Inter', sans-serif;
  font-weight: 900;
  margin: 0 0 6px 0;
}
.login-sub{
  color: var(--muted);
  font-weight: 700;
  margin: 0 0 16px 0;
}
.termo-box{
  background: #F8FAFC;
  border: 1px solid rgba(226,232,240,1);
  border-radius: 14px;
  padding: 12px;
  max-height: 110px;
  overflow-y: auto;
  font-size: 0.78rem;
  color: rgba(15,23,42,0.75);
  line-height: 1.35;
  margin-bottom: 12px;
}

/* Rodapé */
.footer{
  margin-top: 26px;
  display:flex;
  align-items:center;
  justify-content: space-between;
  color: rgba(100,116,139,0.9);
  font-weight: 800;
  font-size: 0.8rem;
}
.footer .who{
  font-weight: 900;
  color: rgba(15,23,42,0.72);
}
.footer button{
  border-radius: 12px !important;
  height: 40px !important;
  font-weight: 900 !important;
}

@media (max-width: 900px){
  .tool-card{ grid-column: span 12; }
  .portal-subtitle{ display:none; }
  .block-container{ padding-top: 110px !important; }
}
</style>
""", unsafe_allow_html=True)

# =========================================================
# HEADER RENDER
# =========================================================
icone_b64 = get_base64_image("omni_icone.png")
texto_b64 = get_base64_image("omni_texto.png")

header_html = """
<div class="portal-header">
  <div class="portal-logo-wrap">
    <div style="width:58px;height:58px;border-radius:999px;background:conic-gradient(from 0deg,#3B82F6,#22C55E,#F59E0B,#F97316,#A855F7,#3B82F6);"></div>
    <div style="display:flex;flex-direction:column;gap:2px;">
      <div style="font-family:Inter,sans-serif;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#0F172A;font-size:.88rem;">OMNISFERA</div>
      <div style="font-family:Inter,sans-serif;font-weight:700;color:#64748B;font-size:.80rem;">Ecossistema de Inteligência Pedagógica e Inclusiva</div>
    </div>
  </div>
  <div class="portal-right">""" + APP_VERSION + """</div>
</div>
"""

if icone_b64 and texto_b64:
    header_html = f"""
<div class="portal-header">
  <div class="portal-logo-wrap">
    <img src="data:image/png;base64,{icone_b64}" class="portal-logo-spin" alt="Omnisfera"/>
    <img src="data:image/png;base64,{texto_b64}" class="portal-logo-text" alt="Omnisfera"/>
    <div class="portal-subtitle">Ecossistema de Inteligência Pedagógica e Inclusiva</div>
  </div>
  <div class="portal-right">{APP_VERSION}</div>
</div>
"""

st.markdown(header_html, unsafe_allow_html=True)

# =========================================================
# LOGIN
# =========================================================
if not st.session_state.autenticado:
    st.markdown("<div class='login-wrap'>", unsafe_allow_html=True)

    st.markdown("""
<div class="login-card">
  <div class="login-title">Acesso</div>
  <div class="login-sub">Entre com suas credenciais de usuário.</div>

  <div class="termo-box">
    <strong>Termo de Confidencialidade (Versão Beta)</strong><br><br>
    Ao acessar, você reconhece que este sistema está em fase de testes, e concorda em não compartilhar informações,
    telas, fluxos ou resultados sem autorização. Evite inserir dados sensíveis reais de estudantes sem permissão institucional.
  </div>
</div>
""", unsafe_allow_html=True)

    # Inputs (fora do HTML para funcionar)
    with st.container():
        aceitou = st.checkbox("Li e concordo com o Termo de Confidencialidade.", value=False)

        c1, c2 = st.columns(2)
        with c1:
            nome = st.text_input("Nome", placeholder="Seu nome")
        with c2:
            cargo = st.text_input("Cargo (opcional)", placeholder="Ex.: Coordenação, Consultoria, Docência")

        usuario = st.text_input("Usuário (Email)", placeholder="seuemail@escola.com")
        senha = st.text_input("Senha", type="password", placeholder="")

        disabled = not (aceitou and nome.strip() and usuario.strip() and senha.strip())

        if st.button("Entrar", type="primary", use_container_width=True, disabled=disabled):
            ok, info = _supabase_login(usuario.strip(), senha)
            if not ok:
                # Se ainda não configurou supabase, você verá a msg clara aqui.
                st.error(info)
                st.stop()

            st.session_state.autenticado = True
            st.session_state.usuario_nome = nome.strip()
            st.session_state.usuario_cargo = cargo.strip()
            st.session_state.usuario_email = usuario.strip()
            st.rerun()

    st.markdown("</div>", unsafe_allow_html=True)
    st.stop()

# =========================================================
# HOME (PORTAL)
# =========================================================
first_name = (st.session_state.usuario_nome.split()[0] if st.session_state.usuario_nome else "Olá")
banner = "Unindo ciência, dados e empatia para transformar a educação."

st.markdown(f"""
<div class="hero">
  <div>
    <div class="hero-title">Olá, {first_name}!</div>
    <div class="hero-subtitle">“{banner}”</div>
  </div>
  <div class="hero-bg"><i class="fi fi-ss-chip-brain"></i></div>
</div>
""", unsafe_allow_html=True)

st.markdown("<div class='section-title'><i class='fi fi-ss-users-alt'></i> Acesso Rápido</div>", unsafe_allow_html=True)

def render_tool_card(
    *,
    title: str,
    desc: str,
    icon_class: str,
    color_css: str,
    button_key: str,
    page_path: str
):
    st.markdown(f"""
<div class="tool-card">
  <div class="tool-topbar" style="background:{color_css};"></div>
  <div class="tool-body">
    <div class="tool-ico" style="background:{color_css};">
      <i class="{icon_class}"></i>
    </div>
    <div class="tool-meta">
      <div class="tool-title">{title}</div>
      <div class="tool-desc">{desc}</div>
      <div class="tool-brand">OMNISFERA</div>
    </div>
  </div>
</div>
""", unsafe_allow_html=True)

    st.markdown("<div class='tool-cta'>", unsafe_allow_html=True)
    if st.button("Acessar", key=button_key, use_container_width=True):
        goto(page_path)
    st.markdown("</div>", unsafe_allow_html=True)

# GRID 6 cards (3 + 3)
c1, c2, c3 = st.columns(3)
with c1:
    render_tool_card(
        title="Estudantes",
        desc="Cadastro, histórico, evidências e rede de apoio.",
        icon_class="fi fi-ss-users-alt",
        color_css="var(--c-est)",
        button_key="go_estudantes",
        page_path=PAGES["estudantes"],
    )
with c2:
    render_tool_card(
        title="Estratégias & PEI",
        desc="Barreiras, suportes, estratégias e rubricas (PEI).",
        icon_class="fi fi-sr-puzzle-alt",
        color_css="var(--c-pei)",
        button_key="go_pei",
        page_path=PAGES["pei"],
    )
with c3:
    render_tool_card(
        title="Plano de Ação (PAEE)",
        desc="Metas SMART, ações, responsáveis e cronograma.",
        icon_class="fi fi-rr-track",
        color_css="var(--c-paee)",
        button_key="go_paee",
        page_path=PAGES["paee"],
    )

c4, c5, c6 = st.columns(3)
with c4:
    render_tool_card(
        title="Hub de Recursos",
        desc="Adaptações, TA, atividades, modelos e trilhas.",
        icon_class="fi fi-sr-lightbulb-on",
        color_css="var(--c-hub)",
        button_key="go_hub",
        page_path=PAGES["hub"],
    )
with c5:
    render_tool_card(
        title="Diário de Bordo",
        desc="Registros de contexto, hipóteses e decisões (em construção).",
        icon_class="fi fi-br-compass-alt",
        color_css="var(--c-di)",
        button_key="go_diario",
        page_path=PAGES["diario"],
    )
with c6:
    render_tool_card(
        title="Evolução & Dados",
        desc="Indicadores, evidências e acompanhamento longitudinal.",
        icon_class="fi fi-br-analyse",
        color_css="var(--c-mon)",
        button_key="go_mon",
        page_path=PAGES["mon"],
    )

# Conteúdo de inclusão (compacto e útil)
st.markdown("<div class='section-title'><i class='fi fi-sr-house-chimney-crack'></i> Inclusão em 60 segundos</div>", unsafe_allow_html=True)
st.markdown("""
- **Incluir** não é “adaptar o aluno”: é **reduzir barreiras** para participação e aprendizagem.  
- **DUA**: múltiplos caminhos de **engajamento**, **representação** e **ação/expressão**.  
- **PEI** organiza necessidades, objetivos, estratégias, apoios e evidências.  
- **PAEE** transforma estratégia em **rotina de ações** (responsáveis + cronograma).  
- **Monitoramento**: rubricas + evidências + revisão periódica = progresso real.  
""")

# Rodapé (logado + sair)
st.markdown("<div class='footer'>", unsafe_allow_html=True)
left = st.container()
right = st.container()
st.markdown("</div>", unsafe_allow_html=True)

cL, cR = st.columns([4, 1])
with cL:
    who = st.session_state.usuario_nome or "Usuário"
    cargo = st.session_state.usuario_cargo.strip()
    email = st.session_state.usuario_email.strip()
    extra = f" • {cargo}" if cargo else ""
    extra2 = f" • {email}" if email else ""
    st.markdown(f"<div class='who'>Logado como: {who}{extra}{extra2}</div>", unsafe_allow_html=True)

with cR:
    if st.button("Sair", use_container_width=True):
        logout()
