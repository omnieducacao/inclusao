# Home.py
import streamlit as st
from datetime import date
import base64, os

# ==============================================================================
# 0) PAGE CONFIG
# ==============================================================================
st.set_page_config(
    page_title="Omnisfera | Ecossistema",
    page_icon="🧩",
    layout="wide",
    initial_sidebar_state="collapsed",
)

APP_VERSION = "v116.0"

# ==============================================================================
# 1) ROUTES (multipage)
# ==============================================================================
ROUTES = {
    "estudantes": "pages/0_Alunos.py",              # <- raiz: 0_Alunos
    "pei":        "pages/1_PEI.py",
    "paee":       "pages/2_PAE.py",
    "hub":        "pages/3_Hub_Inclusao.py",
    "diario":     "pages/4_Diario_de_Bordo.py",
    "mon":        "pages/5_Monitoramento_Avaliacao.py",
}

# ==============================================================================
# 2) SESSION INIT
# ==============================================================================
if "autenticado" not in st.session_state:
    st.session_state.autenticado = False
if "usuario_nome" not in st.session_state:
    st.session_state.usuario_nome = ""
if "usuario_cargo" not in st.session_state:
    st.session_state.usuario_cargo = ""
if "usuario_email" not in st.session_state:
    st.session_state.usuario_email = ""

# ==============================================================================
# 3) HELPERS
# ==============================================================================
def get_base64_image(path: str) -> str:
    if not os.path.exists(path):
        return ""
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()

def safe_switch_page(path: str):
    """Evita quebrar se o arquivo não existir."""
    if not path or not os.path.exists(path):
        st.error(f"Página não encontrada: {path}")
        st.stop()
    st.switch_page(path)

def logout():
    st.session_state.autenticado = False
    st.session_state.usuario_nome = ""
    st.session_state.usuario_cargo = ""
    st.session_state.usuario_email = ""
    st.rerun()

# ==============================================================================
# 4) LOGIN VALIDATION (stub)
#    -> você vai plugar o Supabase aqui depois.
# ==============================================================================
def validate_login(email: str, password: str) -> bool:
    """
    Placeholder:
    - Troque por autenticação no Supabase quando quiser.
    - Por enquanto, aceita qualquer email/senha NÃO vazios.
    """
    return bool(email.strip()) and bool(password.strip())

# ==============================================================================
# 5) CSS / ICONS (GLOBAL)
# ==============================================================================
st.markdown("""
<!-- Flaticon UI Icons -->
<link rel="stylesheet" href="https://cdn-uicons.flaticon.com/uicons-solid-rounded/css/uicons-solid-rounded.css">
<link rel="stylesheet" href="https://cdn-uicons.flaticon.com/uicons-solid-straight/css/uicons-solid-straight.css">
<link rel="stylesheet" href="https://cdn-uicons.flaticon.com/uicons-regular-rounded/css/uicons-regular-rounded.css">
<link rel="stylesheet" href="https://cdn-uicons.flaticon.com/uicons-brands/css/uicons-brands.css">

<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">

<style>
:root{
  --bg: #F7FAFC;
  --text: #0F172A;
  --muted: #64748B;
  --line: #E2E8F0;

  /* paleta mais chique (menos saturada) */
  --c-home:      #0F172A;
  --c-stud:      #2B6CB0; /* azul profundo */
  --c-pei:       #2F5DCC; /* azul real */
  --c-paee:      #2F855A; /* verde elegante */
  --c-hub:       #B7791F; /* âmbar sofisticado */
  --c-diario:    #C05621; /* laranja queimado */
  --c-mon:       #6B46C1; /* roxo profundo */
  --c-ia:        #0F52BA;

  --radius-lg: 18px;
  --radius-md: 14px;
  --shadow: 0 10px 24px rgba(15,23,42,.08);
  --shadow-soft: 0 4px 12px rgba(15,23,42,.06);
}

html, body, [class*="css"]{
  font-family: "Nunito", system-ui, -apple-system, Segoe UI, Roboto, Arial;
  background: var(--bg);
  color: var(--text);
}

/* some header/toolbar/sidebar padrão do streamlit */
header[data-testid="stHeader"]{display:none !important;}
[data-testid="stToolbar"]{display:none !important;}
[data-testid="stSidebar"]{display:none !important;}
[data-testid="stSidebarNav"]{display:none !important;}

/* spacing */
.block-container{
  padding-top: 118px !important;
  padding-left: 2rem !important;
  padding-right: 2rem !important;
  padding-bottom: 2rem !important;
}

/* animações */
@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
@keyframes fadeInUp{from{opacity:0; transform:translateY(10px);}to{opacity:1; transform:translateY(0);}}

/* HEADER FIXO */
.portal-header{
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 86px;
  z-index: 99999;
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 26px;

  background: rgba(247,250,252,0.86);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(226,232,240,0.85);
  box-shadow: 0 6px 18px rgba(15,23,42,0.04);
}

.brand-left{
  display:flex;
  align-items:center;
  gap: 14px;
  min-width: 280px;
}

.brand-spin{
  height: 54px;
  width: auto;
  animation: spin 45s linear infinite;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.10));
}

.brand-text{
  height: 26px;
  width: auto;
}

.brand-fallback{
  font-family:"Inter", sans-serif;
  font-weight: 900;
  letter-spacing: .6px;
  font-size: 15px;
}

.brand-sub{
  font-family:"Nunito", sans-serif;
  font-weight: 700;
  font-size: 0.98rem;
  color: var(--muted);
  border-left: 2px solid rgba(226,232,240,0.95);
  padding-left: 14px;
  height: 40px;
  display:flex;
  align-items:center;
  letter-spacing: -0.2px;
}

/* HERO */
.hero{
  background: radial-gradient(circle at top right, #0F52BA, #062B61);
  border-radius: var(--radius-lg);
  box-shadow: 0 12px 28px rgba(15, 82, 186, 0.22);
  color: white;
  position: relative;
  overflow: hidden;
  padding: 22px 28px;
  display:flex;
  align-items:center;
  justify-content: space-between;
  border: 1px solid rgba(255,255,255,0.12);
  min-height: 100px;
  animation: fadeInUp .55s ease;
}
.hero h2{
  font-family:"Inter", sans-serif;
  font-weight: 900;
  font-size: 1.55rem;
  margin:0;
  line-height: 1.05;
}
.hero p{
  font-family:"Inter", sans-serif;
  font-size: .92rem;
  opacity: .92;
  margin: 8px 0 0 0;
}
.hero-ico{
  position:absolute;
  right: 18px;
  top: 2px;
  font-size: 6.2rem;
  opacity: .08;
  transform: rotate(-10deg);
}

/* SECTION TITLE */
.section-title{
  font-family:"Inter", sans-serif;
  font-weight: 900;
  font-size: 1.03rem;
  margin: 18px 0 10px 0;
  display:flex;
  align-items:center;
  gap: 8px;
}

/* GRID */
.tools-grid{
  display:grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 14px;
}

/* CARD PREMIUM (branco + acento superior) */
.tool-card{
  grid-column: span 4;
  background: rgba(255,255,255,0.96);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(226,232,240,0.95);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
  position: relative;
  animation: fadeInUp .55s ease;
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
}
.tool-card:hover{
  transform: translateY(-3px);
  box-shadow: var(--shadow);
  border-color: rgba(203,213,225,0.95);
}

/* linha de acento */
.tool-accent{
  height: 4px;
  width: 100%;
  background: var(--line);
}

/* corpo */
.tool-body{
  padding: 16px 16px 12px 16px;
  display:flex;
  gap: 12px;
  align-items:flex-start;
}
.tool-ico-pill{
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display:flex;
  align-items:center;
  justify-content:center;
  flex: 0 0 auto;
  box-shadow: 0 8px 18px rgba(15,23,42,.10);
}
.tool-ico-pill i{
  color: #fff;
  font-size: 18px;
  line-height: 1;
  display:flex;
}

/* texto */
.tool-title{
  font-weight: 900;
  font-size: 0.95rem;
  color: #0F172A;
  margin: 0;
  line-height: 1.2;
}
.tool-desc{
  margin-top: 6px;
  color: #64748B;
  font-weight: 700;
  font-size: 0.80rem;
  line-height: 1.25;
}
.tool-brand{
  margin-top: 10px;
  font-family:"Inter", sans-serif;
  font-weight: 900;
  font-size: 0.62rem;
  letter-spacing: 1.3px;
  color: rgba(15,23,42,0.35);
  text-transform: uppercase;
}

/* CTA integrado (área inferior) */
.tool-cta{
  border-top: 1px solid rgba(226,232,240,0.9);
  padding: 10px 12px;
  background: rgba(248,250,252,0.75);
}

/* estiliza o botão do streamlit dentro do CTA */
.tool-cta .stButton button{
  width: 100%;
  height: 42px;
  border-radius: 14px !important;
  font-weight: 900 !important;
  border: 1px solid rgba(226,232,240,0.9) !important;
  background: white !important;
  transition: transform .14s ease, box-shadow .14s ease, border-color .14s ease;
}
.tool-cta .stButton button:hover{
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(15,23,42,0.10);
  border-color: rgba(203,213,225,0.95) !important;
}

/* LOGIN */
.login-wrap{
  max-width: 520px;
  margin: 0 auto;
  margin-top: 26px;
  background: rgba(255,255,255,0.96);
  border-radius: 20px;
  border: 1px solid rgba(226,232,240,0.95);
  box-shadow: 0 14px 32px rgba(15,23,42,0.10);
  padding: 22px 22px;
}
.login-title{
  font-family:"Inter", sans-serif;
  font-weight: 900;
  font-size: 1.05rem;
  margin: 0 0 8px 0;
}
.login-sub{
  color: #64748B;
  font-weight: 700;
  font-size: 0.88rem;
  margin-bottom: 14px;
}
.termo-box{
  background: rgba(248,250,252,1);
  border: 1px solid rgba(226,232,240,0.95);
  border-radius: 14px;
  padding: 12px;
  height: 120px;
  overflow-y: auto;
  font-size: 0.78rem;
  color: rgba(15,23,42,0.72);
  line-height: 1.35;
}
.login-footer{
  margin-top: 14px;
  color: rgba(15,23,42,0.40);
  font-size: .75rem;
  text-align:center;
}

/* FOOTER ACTIONS */
.footer-actions{
  margin-top: 18px;
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid rgba(226,232,240,0.95);
  background: rgba(255,255,255,0.92);
}
.footer-user{
  color: rgba(15,23,42,0.70);
  font-weight: 800;
  font-size: 0.86rem;
}

/* responsive */
@media (max-width: 980px){
  .tool-card{ grid-column: span 12; }
  .block-container{ padding-top: 110px !important; }
  .brand-sub{ display:none; }
}
</style>
""", unsafe_allow_html=True)

# ==============================================================================
# 6) HEADER (LOGIN + HOME)
# ==============================================================================
icon_b64 = get_base64_image("omni_icone.png")
text_b64 = get_base64_image("omni_texto.png")

st.markdown('<div class="portal-header">', unsafe_allow_html=True)
st.markdown('<div class="brand-left">', unsafe_allow_html=True)

if icon_b64:
    st.markdown(f'<img src="data:image/png;base64,{icon_b64}" class="brand-spin" alt="Omnisfera" />', unsafe_allow_html=True)
else:
    st.markdown('<div class="brand-fallback">OMNISFERA</div>', unsafe_allow_html=True)

if text_b64:
    st.markdown(f'<img src="data:image/png;base64,{text_b64}" class="brand-text" alt="Omnisfera" />', unsafe_allow_html=True)
else:
    st.markdown('<div class="brand-fallback">OMNISFERA</div>', unsafe_allow_html=True)

st.markdown('<div class="brand-sub">Ecossistema de Inteligência Pedagógica e Inclusiva</div>', unsafe_allow_html=True)
st.markdown('</div>', unsafe_allow_html=True)

# lado direito do header (vazio por enquanto — fica clean)
st.markdown('<div></div>', unsafe_allow_html=True)
st.markdown('</div>', unsafe_allow_html=True)

# ==============================================================================
# 7) LOGIN VIEW
# ==============================================================================
if not st.session_state.autenticado:
    st.markdown("""
    <div class="login-wrap">
      <div class="login-title">Acesso — Omnisfera</div>
      <div class="login-sub">Informe seus dados e aceite o termo para continuar.</div>

      <div style="font-weight:900; margin: 6px 0 8px 0;">Termo de Confidencialidade</div>
      <div class="termo-box">
        <strong>ACORDO DE CONFIDENCIALIDADE E USO DE DADOS (Versão Beta)</strong><br><br>
        1. <strong>Natureza do Software:</strong> o Omnisfera encontra-se em fase BETA e pode conter instabilidades.<br>
        2. <strong>Proteção de Dados (LGPD):</strong> evite inserir dados sensíveis reais que permitam identificação direta, salvo ambiente autorizado.<br>
        3. <strong>Propriedade Intelectual:</strong> código, design e inteligência gerada são de propriedade dos desenvolvedores.<br>
        4. <strong>Responsabilidade:</strong> sugestões pedagógicas devem passar por crivo humano antes do uso.<br><br>
        Ao prosseguir, você declara estar ciente e de acordo com estes termos.
      </div>
    </div>
    """, unsafe_allow_html=True)

    aceitou = st.checkbox("Li, compreendi e concordo com os termos.", value=False)

    c1, c2 = st.columns(2)
    with c1:
        nome = st.text_input("Nome", placeholder="Seu nome")
    with c2:
        # Cargo é opcional (não trava o botão)
        cargo = st.text_input("Cargo (opcional)", placeholder="Ex.: Coordenação, AEE, Direção")

    usuario = st.text_input("Usuário (email)", placeholder="seu@email.com")
    senha = st.text_input("Senha", type="password", placeholder="Senha")

    # botão habilita sem exigir cargo
    disabled = not (aceitou and nome.strip() and usuario.strip() and senha.strip())

    if st.button("Entrar", type="primary", use_container_width=True, disabled=disabled):
        ok = validate_login(usuario, senha)
        if not ok:
            st.error("Usuário ou senha inválidos.")
        else:
            st.session_state.autenticado = True
            st.session_state.usuario_nome = nome.strip()
            st.session_state.usuario_cargo = cargo.strip()
            st.session_state.usuario_email = usuario.strip()
            st.rerun()

    st.markdown('<div class="login-footer">Omnisfera — ' + APP_VERSION + '</div>', unsafe_allow_html=True)
    st.stop()

# ==============================================================================
# 8) HOME VIEW (PORTAL)
# ==============================================================================
nome_display = (st.session_state.usuario_nome or "Educador").split()[0]
mensagem_banner = "Unindo ciência, dados e empatia para transformar a educação."

st.markdown(f"""
<div class="hero">
  <div>
    <h2>Olá, {nome_display}!</h2>
    <p>"{mensagem_banner}"</p>
  </div>
  <div class="hero-ico"><i class="fi fi-ss-chip-brain"></i></div>
</div>
""", unsafe_allow_html=True)

# ==============================================================================
# 9) ACESSO RÁPIDO (6 cards)
# ==============================================================================
st.markdown('<div class="section-title"><i class="fi fi-ss-users-alt"></i> Acesso Rápido</div>', unsafe_allow_html=True)

CARDS = [
    {
        "title": "Estudantes",
        "desc": "Cadastro, histórico, evidências e rede de apoio.",
        "icon": "fi fi-ss-users-alt",
        "color": "var(--c-stud)",
        "route": ROUTES["estudantes"],
        "key": "go_estudantes",
    },
    {
        "title": "Estratégias & PEI",
        "desc": "Barreiras, suportes, estratégias e rubricas (PEI).",
        "icon": "fi fi-sr-puzzle-alt",
        "color": "var(--c-pei)",
        "route": ROUTES["pei"],
        "key": "go_pei",
    },
    {
        "title": "Plano de Ação (PAEE)",
        "desc": "Metas SMART, ações, responsáveis e cronograma.",
        "icon": "fi fi-rr-track",
        "color": "var(--c-paee)",
        "route": ROUTES["paee"],
        "key": "go_paee",
    },
    {
        "title": "Hub de Recursos",
        "desc": "Adaptações, TA, atividades, modelos e trilhas.",
        "icon": "fi fi-sr-lightbulb-on",
        "color": "var(--c-hub)",
        "route": ROUTES["hub"],
        "key": "go_hub",
    },
    {
        "title": "Diário de Bordo",
        "desc": "Registros de contexto, hipóteses e decisões (em construção).",
        "icon": "fi fi-br-compass-alt",
        "color": "var(--c-diario)",
        "route": ROUTES["diario"],
        "key": "go_diario",
    },
    {
        "title": "Evolução & Dados",
        "desc": "Indicadores, evidências e acompanhamento longitudinal.",
        "icon": "fi fi-br-analyse",
        "color": "var(--c-mon)",
        "route": ROUTES["mon"],
        "key": "go_mon",
    },
]

# render cards em 2 linhas (3 colunas)
cols1 = st.columns(3)
cols2 = st.columns(3)
cols = cols1 + cols2

for i, card in enumerate(CARDS):
    col = cols[i]
    with col:
        st.markdown(f"""
        <div class="tool-card">
          <div class="tool-accent" style="background:{card['color']};"></div>
          <div class="tool-body">
            <div class="tool-ico-pill" style="background:{card['color']};">
              <i class="{card['icon']}"></i>
            </div>
            <div style="flex:1;">
              <div class="tool-title">{card['title']}</div>
              <div class="tool-desc">{card['desc']}</div>
              <div class="tool-brand">OMNISFERA</div>
            </div>
          </div>
        </div>
        """, unsafe_allow_html=True)

        st.markdown('<div class="tool-cta">', unsafe_allow_html=True)
        if st.button("Acessar", key=card["key"], use_container_width=True):
            safe_switch_page(card["route"])
        st.markdown('</div>', unsafe_allow_html=True)

# ==============================================================================
# 10) CONTEÚDO (INCLUSÃO EM 60s) - mantém forte
# ==============================================================================
st.markdown('<div class="section-title"><i class="fi fi-ss-chip-brain"></i> Inclusão em 60 segundos</div>', unsafe_allow_html=True)
st.markdown("""
- **Incluir** não é “adaptar o aluno”: é **reduzir barreiras** para participação e aprendizagem.
- **Barreiras** (LBI): comunicacionais, metodológicas, atitudinais e tecnológicas/instrumentais.
- **DUA**: múltiplos caminhos de **engajamento**, **representação** e **ação/expressão**.
- **PEI**: organiza necessidades, objetivos, estratégias, apoios e evidências.
- **PAEE**: transforma estratégia em **rotina de ações** (responsáveis + cronograma + recursos).
- **Monitoramento**: rubricas + evidências + revisão periódica = progresso real.
""")

# ==============================================================================
# 11) FOOTER (Sair + logado)
# ==============================================================================
cargo_txt = st.session_state.usuario_cargo.strip()
user_line = f"{st.session_state.usuario_nome}"
if cargo_txt:
    user_line += f" • {cargo_txt}"
user_line += f" • {st.session_state.usuario_email}"

st.markdown(f"""
<div class="footer-actions">
  <div class="footer-user">Logado como: {user_line}</div>
</div>
""", unsafe_allow_html=True)

c1, c2, c3 = st.columns([1,1,1])
with c2:
    if st.button("Sair", use_container_width=True):
        logout()

st.markdown('<div class="footer-sign">Omnisfera — Criada por Rodrigo A. Queiroz • PEI360 • PAEE360 • HUB de Inclusão</div>', unsafe_allow_html=True)
