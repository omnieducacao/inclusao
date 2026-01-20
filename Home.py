# Home.py — OMNISFERA (Portal + Login) | versão com ícones Flaticon (UIcons)
import streamlit as st
from datetime import date
import base64, os, time

# =========================================================
# 0) CONFIG
# =========================================================
APP_VERSION = "v116.0"

st.set_page_config(
    page_title="Omnisfera | Ecossistema",
    page_icon="🧩",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# Ajuste os caminhos das páginas aqui (se o seu arquivo de estudantes tiver outro nome, troque)
ROUTES = {
    "estudantes": "pages/0_Estudantes.py",            # <-- ajuste se necessário
    "pei":        "pages/1_PEI.py",
    "paee":       "pages/2_PAE.py",
    "hub":        "pages/3_Hub_Inclusao.py",
    "diario":     "pages/4_Diario_de_Bordo.py",
    "mon":        "pages/5_Monitoramento_Avaliacao.py",
}

# =========================================================
# 1) HELPERS
# =========================================================
def get_base64_image(path: str) -> str:
    if not os.path.exists(path):
        return ""
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

def _init_session():
    if "autenticado" not in st.session_state:
        st.session_state.autenticado = False
    if "usuario_nome" not in st.session_state:
        st.session_state.usuario_nome = ""
    if "usuario_cargo" not in st.session_state:
        st.session_state.usuario_cargo = ""
    if "usuario_email" not in st.session_state:
        st.session_state.usuario_email = ""

_init_session()

# =========================================================
# 2) CSS + ICON FONTS (Flaticon)
# =========================================================
st.markdown("""
<link rel="stylesheet" href="https://cdn-uicons.flaticon.com/uicons-solid-rounded/css/uicons-solid-rounded.css">
<link rel="stylesheet" href="https://cdn-uicons.flaticon.com/uicons-solid-straight/css/uicons-solid-straight.css">
<link rel="stylesheet" href="https://cdn-uicons.flaticon.com/uicons-regular-rounded/css/uicons-regular-rounded.css">
<link rel="stylesheet" href="https://cdn-uicons.flaticon.com/uicons-brands/css/uicons-brands.css">

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Nunito:wght@400;600;700;800;900&display=swap');

html, body, [class*="css"]{
  font-family:'Nunito', sans-serif;
  background:#F7FAFC;
  color:#2D3748;
}

header[data-testid="stHeader"]{display:none !important;}
[data-testid="stSidebar"], [data-testid="stSidebarNav"]{display:none !important;}

/* espaço para o header fixo da Home */
.block-container{
  padding-top: 118px !important;
  padding-left: 2rem !important;
  padding-right: 2rem !important;
  padding-bottom: 2rem !important;
}

@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
@keyframes fadeInUp{from{opacity:0; transform:translateY(10px);}to{opacity:1; transform:translateY(0);}}

/* HEADER FIXO (logo grande) */
.portal-header{
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 92px;
  z-index: 99999;
  display:flex;
  align-items:center;
  gap: 16px;
  padding: 10px 28px;
  background: rgba(247,250,252,0.88);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,0.55);
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
}
.portal-logo-spin{
  height: 72px;
  width:auto;
  animation: spin 45s linear infinite;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.10));
}
.portal-logo-text{
  height: 42px;
  width:auto;
}
.portal-subtitle{
  font-weight: 700;
  font-size: 0.98rem;
  color: #718096;
  border-left: 2px solid #CBD5E0;
  padding-left: 14px;
  height: 40px;
  display:flex;
  align-items:center;
  letter-spacing: -0.3px;
}

/* HERO */
.dash-hero{
  background: radial-gradient(circle at top right, #0F52BA, #062B61);
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(15, 82, 186, 0.30);
  color: white;
  position: relative;
  overflow: hidden;
  padding: 26px 34px;
  display:flex;
  align-items:center;
  justify-content: space-between;
  border: 1px solid rgba(255,255,255,0.12);
  min-height: 105px;
  animation: fadeInUp .55s ease;
}
.hero-title{
  font-family:'Inter', sans-serif;
  font-weight: 900;
  font-size: 1.55rem;
  margin:0;
  line-height:1.1;
}
.hero-subtitle{
  font-family:'Inter', sans-serif;
  font-size: 0.92rem;
  opacity: 0.92;
  font-weight: 400;
  margin-top: 6px;
}
.hero-bg-ic{
  position:absolute;
  right: 22px;
  font-size: 6rem;
  opacity: 0.07;
  top: 6px;
  transform: rotate(-10deg);
}

/* TITULOS */
.section-title{
  font-family:'Inter', sans-serif;
  font-weight: 900;
  font-size: 1.05rem;
  color:#111827;
  margin: 22px 0 12px 0;
  display:flex;
  align-items:center;
  gap: 10px;
}

/* CARDS */
.nav-grid{
  display:grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 12px;
}
.nav-card{
  grid-column: span 4;
  background:white;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
  animation: fadeInUp .55s ease;
  position: relative;
  overflow: hidden;
}
.nav-top{
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 10px;
}
.nav-ico-wrap{
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display:flex;
  align-items:center;
  justify-content:center;
  background: rgba(17,24,39,0.06);
}
.omni-ic{
  font-size: 1.35rem;
  line-height: 1;
}
.nav-title{
  font-weight: 900;
  color:#111827;
  margin: 0;
  font-size: 0.95rem;
}
.nav-desc{
  margin-top: 8px;
  color:#718096;
  font-size: 0.80rem;
  font-weight: 700;
  line-height: 1.25;
}
.nav-btn button{
  width: 100%;
  height: 44px;
  border-radius: 12px !important;
  font-weight: 900 !important;
}

/* Cores por módulo (borda inferior) */
.border-home{ border-bottom: 4px solid #111827; }
.border-students{ border-bottom: 4px solid #2563EB; }
.border-pei{ border-bottom: 4px solid #3B82F6; }
.border-paee{ border-bottom: 4px solid #22C55E; }
.border-hub{ border-bottom: 4px solid #F59E0B; }
.border-diario{ border-bottom: 4px solid #F97316; }
.border-mon{ border-bottom: 4px solid #A855F7; }

/* cores dos ícones */
.icon-home{ color:#111827; }
.icon-students{ color:#2563EB; }
.icon-pei{ color:#3B82F6; }
.icon-paee{ color:#22C55E; }
.icon-hub{ color:#F59E0B; }
.icon-diario{ color:#F97316; }
.icon-mon{ color:#A855F7; }
.icon-ia{ color:#0F52BA; }

/* LOGIN */
.login-shell{
  max-width: 520px;
  margin: 0 auto;
}
.login-card{
  background: white;
  border-radius: 18px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 10px 30px rgba(0,0,0,0.06);
  padding: 22px 22px 18px 22px;
}
.termo-box{
  background: #F8FAFC;
  border: 1px solid #CBD5E0;
  border-radius: 12px;
  padding: 12px;
  font-size: 0.78rem;
  color: #4A5568;
  line-height: 1.35;
  max-height: 120px;
  overflow-y: auto;
}
.small-muted{
  font-size: 0.82rem;
  color: #64748B;
}
.footer-sign{
  text-align:center;
  color:#CBD5E0;
  font-size: 0.72rem;
  margin-top: 34px;
}

/* RESPONSIVO */
@media (max-width: 950px){
  .nav-card{ grid-column: span 12; }
  .block-container{ padding-top: 110px !important; }
  .portal-subtitle{ display:none; }
}
</style>
""", unsafe_allow_html=True)

# =========================================================
# 3) HEADER FIXO (logo grande) — SEM MENU AQUI
# =========================================================
icone_b64 = get_base64_image("omni_icone.png")
texto_b64 = get_base64_image("omni_texto.png")

if icone_b64 and texto_b64:
    st.markdown(f"""
    <div class="portal-header">
      <img src="data:image/png;base64,{icone_b64}" class="portal-logo-spin" alt="Omnisfera"/>
      <img src="data:image/png;base64,{texto_b64}" class="portal-logo-text" alt="Omnisfera"/>
      <div class="portal-subtitle">Ecossistema de Inteligência Pedagógica e Inclusiva</div>
    </div>
    """, unsafe_allow_html=True)
else:
    st.markdown("""
    <div class="portal-header">
      <div style="font-size:2.1rem;">🌐</div>
      <div style="font-family:Inter,sans-serif;font-weight:900;color:#0F52BA;font-size:1.35rem;">OMNISFERA</div>
      <div class="portal-subtitle">Ecossistema de Inteligência Pedagógica e Inclusiva</div>
    </div>
    """, unsafe_allow_html=True)

# =========================================================
# 4) LOGIN (Supabase email/senha — fallback demo)
# =========================================================
def try_supabase_login(email: str, password: str) -> bool:
    """
    Se você tiver Supabase configurado e a lib disponível, tenta autenticar.
    Caso contrário, retorna False para cair no modo demo.
    """
    try:
        url = st.secrets.get("SUPABASE_URL", "")
        key = st.secrets.get("SUPABASE_ANON_KEY", "")
        if not url or not key:
            return False

        # supabase-py pode não estar instalado — por isso o try/except
        from supabase import create_client  # type: ignore
        supa = create_client(url, key)

        # auth via Supabase
        res = supa.auth.sign_in_with_password({"email": email, "password": password})
        return bool(res and getattr(res, "session", None))
    except Exception:
        return False

def demo_login(email: str, password: str) -> bool:
    # credencial demo que você definiu
    return (email.strip().lower() == "demo@omnisfera.net") and (password == "OmniDemo@2026!")

def render_login():
    st.markdown("## Acesso — Omnisfera")
    st.caption("Entre com seu usuário e senha. Use dados reais somente em ambiente autorizado e seguro.")

    st.markdown('<div class="login-shell">', unsafe_allow_html=True)
    st.markdown('<div class="login-card">', unsafe_allow_html=True)

    st.markdown("### Termo de confidencialidade")
    st.markdown("""
    <div class="termo-box">
      <b>ACORDO DE CONFIDENCIALIDADE E USO DE DADOS (Versão Beta)</b><br><br>
      1) O usuário reconhece que o Omnisfera está em fase de testes (BETA).<br>
      2) É proibida a inserção de dados sensíveis de estudantes sem autorização institucional e controle adequado (LGPD).<br>
      3) As sugestões pedagógicas devem passar por validação humana antes de aplicação.<br>
      4) Ao prosseguir, você declara estar ciente e de acordo com estes termos.
    </div>
    """, unsafe_allow_html=True)

    aceitou = st.checkbox("Li, compreendi e concordo com o termo.", value=False)

    c1, c2 = st.columns(2)
    with c1:
        nome = st.text_input("Nome", placeholder="Seu nome")
    with c2:
        cargo = st.text_input("Cargo", placeholder="Seu cargo/função")

    st.markdown("#### Credenciais")
    usuario = st.text_input("Usuário (Email)", placeholder="seu@email.com")
    senha = st.text_input("Senha", type="password", placeholder="••••••••")

    can = bool(aceitou and nome.strip() and cargo.strip() and usuario.strip() and senha.strip())
    if st.button("Entrar", type="primary", use_container_width=True, disabled=not can):
        ok = try_supabase_login(usuario.strip(), senha) or demo_login(usuario, senha)

        if not ok:
            st.error("Usuário ou senha inválidos.")
        else:
            st.session_state.autenticado = True
            st.session_state.usuario_nome = nome.strip()
            st.session_state.usuario_cargo = cargo.strip()
            st.session_state.usuario_email = usuario.strip()
            st.rerun()

    st.markdown('<div class="small-muted" style="margin-top:10px;">', unsafe_allow_html=True)
    st.markdown("Dica: no modo demo use `demo@omnisfera.net` / `OmniDemo@2026!`.")
    st.markdown("</div>", unsafe_allow_html=True)

    st.markdown("</div>", unsafe_allow_html=True)  # login-card
    st.markdown("</div>", unsafe_allow_html=True)  # login-shell

# Se não autenticado, mostra login e para
if not st.session_state.autenticado:
    render_login()
    st.stop()

# =========================================================
# 5) HOME (PORTAL) — CARDS + CONTEÚDO DE INCLUSÃO
# =========================================================
nome_display = (st.session_state.usuario_nome or "Educador").split()[0]
mensagem_banner = "Unindo ciência, dados e empatia para transformar a educação."

st.markdown(f"""
<div class="dash-hero">
  <div>
    <div class="hero-title">Olá, {nome_display}!</div>
    <div class="hero-subtitle">"{mensagem_banner}"</div>
  </div>
  <div class="hero-bg-ic"><i class="fi fi-ss-chip-brain"></i></div>
</div>
""", unsafe_allow_html=True)

# Manifesto
st.markdown(f"""
<div class="section-title">
  <i class="fi fi-ss-chip-brain omni-ic icon-ia"></i>
  Manifesto Omnisfera
</div>
""", unsafe_allow_html=True)

st.info(
    "“A Omnisfera foi desenvolvida com muito cuidado e carinho com o objetivo de auxiliar as escolas na tarefa de incluir. "
    "Ela tem o potencial para revolucionar o cenário da inclusão no Brasil.”"
)

# Acesso rápido (6 cards)
st.markdown(f"""
<div class="section-title">
  <i class="fi fi-sr-house-chimney-crack omni-ic icon-home"></i>
  Acesso Rápido
</div>
""", unsafe_allow_html=True)

def portal_card(col, title, desc, icon_html, border_class, btn_key, route_key):
    with col:
        st.markdown(f"""
        <div class="nav-card {border_class}">
          <div class="nav-top">
            <div class="nav-ico-wrap">{icon_html}</div>
            <div style="opacity:.6;font-weight:900;font-size:.75rem;">OMNISFERA</div>
          </div>
          <div style="margin-top:10px;">
            <div class="nav-title">{title}</div>
            <div class="nav-desc">{desc}</div>
          </div>
        </div>
        """, unsafe_allow_html=True)

        st.markdown('<div class="nav-btn">', unsafe_allow_html=True)
        if st.button("Acessar", key=btn_key, use_container_width=True):
            path = ROUTES.get(route_key)
            if not path:
                st.error("Rota não configurada. Ajuste o dicionário ROUTES no topo do arquivo.")
            else:
                st.switch_page(path)
        st.markdown("</div>", unsafe_allow_html=True)

c1, c2, c3 = st.columns(3)
portal_card(
    c1,
    "Estudantes",
    "Cadastro, histórico, evidências e rede de apoio.",
    '<i class="fi fi-ss-users-alt omni-ic icon-students"></i>',
    "border-students",
    "go_estudantes",
    "estudantes",
)
portal_card(
    c2,
    "Estratégias & PEI",
    "Barreiras, suportes, estratégias e rubricas (PEI).",
    '<i class="fi fi-sr-puzzle-alt omni-ic icon-pei"></i>',
    "border-pei",
    "go_pei",
    "pei",
)
portal_card(
    c3,
    "Plano de Ação (PAEE)",
    "Metas SMART, ações, responsáveis e cronograma.",
    '<i class="fi fi-rr-track omni-ic icon-paee"></i>',
    "border-paee",
    "go_paee",
    "paee",
)

c4, c5, c6 = st.columns(3)
portal_card(
    c4,
    "Hub de Recursos",
    "Adaptações, TA, atividades e modelos.",
    '<i class="fi fi-sr-lightbulb-on omni-ic icon-hub"></i>',
    "border-hub",
    "go_hub",
    "hub",
)
portal_card(
    c5,
    "Diário de Bordo",
    "Registros de contexto, hipóteses e decisões (em construção).",
    '<i class="fi fi-br-compass-alt omni-ic icon-diario"></i>',
    "border-diario",
    "go_diario",
    "diario",
)
portal_card(
    c6,
    "Evolução & Dados",
    "Indicadores, evidências e acompanhamento longitudinal.",
    '<i class="fi fi-br-analyse omni-ic icon-mon"></i>',
    "border-mon",
    "go_mon",
    "mon",
)

# Conteúdo forte de inclusão
st.markdown(f"""
<div class="section-title">
  <i class="fi fi-ss-chip-brain omni-ic icon-ia"></i>
  Inclusão em 60 segundos
</div>
""", unsafe_allow_html=True)

st.markdown("""
- **Incluir** não é “adaptar o aluno”: é **reduzir barreiras** para participação e aprendizagem.
- **Barreiras** (LBI): comunicacionais, metodológicas, atitudinais e tecnológicas/instrumentais.
- **DUA**: múltiplos caminhos de **engajamento**, **representação** e **ação/expressão**.
- **PEI**: organiza necessidades, objetivos, estratégias, apoios e evidências.
- **PAEE**: transforma estratégia em **rotina de ações** (responsáveis + cronograma + recursos).
- **Monitoramento**: rubricas + evidências + revisão periódica = progresso real.
""")

st.markdown(f"""
<div class="section-title">
  <i class="fi fi-sr-lightbulb-on omni-ic icon-hub"></i>
  DUA na prática
</div>
""", unsafe_allow_html=True)

st.markdown("""
| Princípio | O que garantir | Exemplos rápidos |
|---|---|---|
| **Engajamento** | motivação e vínculo | escolhas, metas curtas, hiperfoco, gamificação |
| **Representação** | diferentes formas de apresentar | áudio, visual, concreto, exemplo guiado |
| **Ação/Expressão** | diferentes formas de responder | oral, desenho, teclado, CAA, checklist |
""")

st.markdown(f"""
<div class="section-title">
  <i class="fi fi-ss-chip-brain omni-ic icon-ia"></i>
  Barreiras (LBI) — exemplos e ações
</div>
""", unsafe_allow_html=True)

with st.expander("🗣️ Comunicacionais"):
    st.write("**Sinais:** não compreende instruções / dificuldade de expressar / ruído na interação.")
    st.write("**Ações:** instrução em passos + apoios visuais + checagem de compreensão + CAA quando necessário.")

with st.expander("📚 Metodológicas"):
    st.write("**Sinais:** caminho único / tempo rígido / avaliação única.")
    st.write("**Ações:** flexibilizar produto + scaffolding + rubricas + tempo extra + modelos.")

with st.expander("🤝 Atitudinais"):
    st.write("**Sinais:** rótulos, isolamento, baixas expectativas.")
    st.write("**Ações:** linguagem inclusiva + altas expectativas realistas + pares tutores + pertencimento.")

with st.expander("🛠️ Tecnológicas/Instrumentais"):
    st.write("**Sinais:** falta de recursos / inacessibilidade digital.")
    st.write("**Ações:** TA baixa/média/alta + alternativas offline + acessibilidade em materiais.")

# Sair (sem sidebar)
st.markdown("---")
cL, cR = st.columns([1, 1])
with cL:
    st.caption(f"Logado como: **{st.session_state.usuario_email}**")
with cR:
    if st.button("Sair", use_container_width=True):
        st.session_state.autenticado = False
        st.session_state.usuario_nome = ""
        st.session_state.usuario_cargo = ""
        st.session_state.usuario_email = ""
        st.rerun()

st.markdown(
    "<div class='footer-sign'>Omnisfera — Criada por Rodrigo A. Queiroz • PEI360 • PAEE360 • HUB de Inclusão</div>",
    unsafe_allow_html=True,
)
