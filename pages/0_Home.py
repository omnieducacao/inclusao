import streamlit as st
from datetime import date, datetime
import base64
import os

# ==============================================================================
# 1. CONFIGURAÇÃO INICIAL
# ==============================================================================
APP_VERSION = "v3.3 - UI Colorida"

try:
    IS_TEST_ENV = st.secrets.get("ENV", "PRODUCAO") == "TESTE"
except Exception:
    IS_TEST_ENV = False

st.set_page_config(
    page_title="Omnisfera - PEI 360°",
    page_icon="📘",
    layout="wide",
    initial_sidebar_state="collapsed",
)

if "aba_ativa" not in st.session_state:
    st.session_state.aba_ativa = "INÍCIO"

# ==============================================================================
# 2. CSS & DESIGN SYSTEM (CORES VARIÁVEIS)
# ==============================================================================
st.markdown(
    """
<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
@import url("https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css");

html, body, [class*="css"] {
    font-family: 'Plus Jakarta Sans', sans-serif !important;
    color: #1E293B !important;
    background-color: #F8FAFC !important;
}

[data-testid="stSidebarNav"], [data-testid="stHeader"], [data-testid="stToolbar"], footer {
    display: none !important;
}

.block-container {
    padding-top: 100px !important;
    padding-bottom: 4rem !important;
    max-width: 98% !important;
    padding-left: 1rem !important;
    padding-right: 1rem !important;
}

/* --- TOPBAR FIXA --- */
.topbar {
    position: fixed; top: 0; left: 0; right: 0; height: 80px;
    background: rgba(255, 255, 255, 0.95) !important;
    backdrop-filter: blur(12px); border-bottom: 1px solid #E2E8F0; z-index: 9999;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 2.5rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.brand-box { display: flex; align-items: center; gap: 12px; }
.brand-logo { height: 45px; width: auto; }
.user-badge { background: #F1F5F9; border: 1px solid #E2E8F0; padding: 6px 14px; border-radius: 99px; font-size: 0.8rem; font-weight: 700; color: #64748B; }

/* --- HERO CARD --- */
.hero-wrapper {
    background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
    border-radius: 20px; padding: 2rem; color: white; margin-bottom: 30px; margin-top: 5px;
    position: relative; overflow: hidden;
    box-shadow: 0 10px 25px -5px rgba(124, 58, 237, 0.3);
    display: flex; align-items: center; justify-content: space-between;
    min-height: 140px;
}
.hero-wrapper::before {
    content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
    opacity: 0.3;
}
.hero-content { z-index: 2; position: relative; }
.hero-greet { font-size: 1.8rem; font-weight: 800; margin-bottom: 0.2rem; letter-spacing: -0.5px; line-height: 1.2; }
.hero-text { font-size: 0.95rem; opacity: 0.95; max-width: 800px; font-weight: 500; }
.hero-icon { opacity: 0.8; font-size: 3rem; z-index: 1; position: relative; }

/* --- MENU COLORIDO (SPLIT) --- */
.nav-split-container {
    position: relative;
    height: 55px; 
    margin-bottom: 12px;
}

.nav-split-card {
    background: white;
    border-radius: 10px;
    border: 1px solid #E2E8F0;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 4px; 
    gap: 8px;
    width: 100%; height: 100%;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    cursor: pointer;
}

.nav-split-card:hover { transform: translateY(-2px); }

/* Ícone Base */
.nav-icon-box {
    width: 45px; height: 45px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.2rem;
    transition: all 0.2s;
    background: #F1F5F9; color: #64748B; /* Padrão neutro */
}

.nav-split-title {
    font-size: 0.65rem; font-weight: 800; color: #64748B; 
    text-transform: uppercase; letter-spacing: 0.5px; 
    line-height: 1; flex-grow: 1; text-align: center;
    padding-right: 4px;
}

/* --- TEMAS DE CORES (CLASSES ESPECÍFICAS) --- */

/* Purple (Início) */
.t-purple .nav-icon-box { background: #F5F3FF; color: #7C3AED; }
.t-purple.nav-active { border-color: #7C3AED !important; box-shadow: 0 4px 10px rgba(124, 58, 237, 0.2) !important; }
.t-purple.nav-active .nav-icon-box { background: #7C3AED; color: white; }
.t-purple.nav-active .nav-split-title { color: #7C3AED; }

/* Indigo (Estudante) */
.t-indigo .nav-icon-box { background: #EEF2FF; color: #4F46E5; }
.t-indigo.nav-active { border-color: #4F46E5 !important; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2) !important; }
.t-indigo.nav-active .nav-icon-box { background: #4F46E5; color: white; }
.t-indigo.nav-active .nav-split-title { color: #4F46E5; }

/* Cyan (Evidências) */
.t-cyan .nav-icon-box { background: #E0F2FE; color: #0284C7; }
.t-cyan.nav-active { border-color: #0284C7 !important; box-shadow: 0 4px 10px rgba(2, 132, 199, 0.2) !important; }
.t-cyan.nav-active .nav-icon-box { background: #0284C7; color: white; }
.t-cyan.nav-active .nav-split-title { color: #0284C7; }

/* Blue (Rede) */
.t-blue .nav-icon-box { background: #EFF6FF; color: #2563EB; }
.t-blue.nav-active { border-color: #2563EB !important; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2) !important; }
.t-blue.nav-active .nav-icon-box { background: #2563EB; color: white; }
.t-blue.nav-active .nav-split-title { color: #2563EB; }

/* Teal (Mapa) */
.t-teal .nav-icon-box { background: #F0FDFA; color: #0D9488; }
.t-teal.nav-active { border-color: #0D9488 !important; box-shadow: 0 4px 10px rgba(13, 148, 136, 0.2) !important; }
.t-teal.nav-active .nav-icon-box { background: #0D9488; color: white; }
.t-teal.nav-active .nav-split-title { color: #0D9488; }

/* Orange (Ação) */
.t-orange .nav-icon-box { background: #FFF7ED; color: #EA580C; }
.t-orange.nav-active { border-color: #EA580C !important; box-shadow: 0 4px 10px rgba(234, 88, 12, 0.2) !important; }
.t-orange.nav-active .nav-icon-box { background: #EA580C; color: white; }
.t-orange.nav-active .nav-split-title { color: #EA580C; }

/* Rose (Monitor) */
.t-rose .nav-icon-box { background: #FFF1F2; color: #E11D48; }
.t-rose.nav-active { border-color: #E11D48 !important; box-shadow: 0 4px 10px rgba(225, 29, 72, 0.2) !important; }
.t-rose.nav-active .nav-icon-box { background: #E11D48; color: white; }
.t-rose.nav-active .nav-split-title { color: #E11D48; }

/* Violet (IA) */
.t-violet .nav-icon-box { background: #F5F3FF; color: #8B5CF6; }
.t-violet.nav-active { border-color: #8B5CF6 !important; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.2) !important; }
.t-violet.nav-active .nav-icon-box { background: #8B5CF6; color: white; }
.t-violet.nav-active .nav-split-title { color: #8B5CF6; }

/* Slate (Dash) */
.t-slate .nav-icon-box { background: #F1F5F9; color: #475569; }
.t-slate.nav-active { border-color: #475569 !important; box-shadow: 0 4px 10px rgba(71, 85, 105, 0.2) !important; }
.t-slate.nav-active .nav-icon-box { background: #475569; color: white; }
.t-slate.nav-active .nav-split-title { color: #475569; }

/* Fuchsia (Game) */
.t-fuchsia .nav-icon-box { background: #FDF4FF; color: #C026D3; }
.t-fuchsia.nav-active { border-color: #C026D3 !important; box-shadow: 0 4px 10px rgba(192, 38, 211, 0.2) !important; }
.t-fuchsia.nav-active .nav-icon-box { background: #C026D3; color: white; }
.t-fuchsia.nav-active .nav-split-title { color: #C026D3; }

/* Botão invisível */
div[data-testid="column"] button {
    position: absolute !important; top: 0 !important; left: 0 !important;
    width: 100% !important; height: 55px !important;
    margin-top: -62px !important;
    opacity: 0 !important; z-index: 5 !important;
    border: none !important;
}
</style>
    """,
    unsafe_allow_html=True,
)

# ==============================================================================
# 3. HELPER FUNCTIONS
# ==============================================================================
def get_base64_image(image_path: str) -> str:
    if not os.path.exists(image_path): return ""
    with open(image_path, "rb") as f: return base64.b64encode(f.read()).decode()

def escola_vinculada():
    wn = st.session_state.get("workspace_name", "")
    wi = st.session_state.get("workspace_id", "")
    if wn: return wn[:20] + "..." if len(wn) > 20 else wn
    elif wi: return f"ID: {wi[:8]}..."
    return "Sem Escola"

def get_user_initials(nome: str):
    if not nome: return "U"
    parts = nome.split()
    if len(parts) >= 2: return f"{parts[0][0]}{parts[-1][0]}".upper()
    return nome[:2].upper() if len(nome) >= 2 else nome[0].upper()

# ==============================================================================
# 4. COMPONENTE: HEADER & MENU UNIFICADO
# ==============================================================================
def render_header_unified():
    # --- 1. TOPBAR ---
    icone_b64 = get_base64_image("omni_icone.png")
    texto_b64 = get_base64_image("omni_texto.png")
    workspace = escola_vinculada()
    nome_user = st.session_state.get("usuario_nome", "Visitante").split()[0]
    user_initials = get_user_initials(nome_user)
    
    img_logo = f'<img src="data:image/png;base64,{icone_b64}" class="brand-logo">' if icone_b64 else "🌐"
    img_text = f'<img src="data:image/png;base64,{texto_b64}" class="brand-img-text">' if texto_b64 else "<span style='font-weight:800; font-size:1.2rem; color:#4F46E5;'>OMNISFERA</span>"
    
    st.markdown(
        f"""
        <div class="topbar">
            <div class="brand-box">{img_logo}{img_text}</div>
            <div class="brand-box" style="gap: 16px;">
                <div class="user-badge">{workspace}</div>
                <div style="display: flex; align-items: center; gap: 10px; font-weight: 700; color: #334155;">
                    <div style="width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem;">{user_initials}</div>
                    <div>{nome_user}</div>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )
    
    st.markdown("<div style='height:20px'></div>", unsafe_allow_html=True)

    # --- 2. MENU COLORIDO ---
    menu_items = [
        {"id": "INÍCIO", "icon": "ri-home-smile-2-fill", "label": "Início", "theme": "t-purple"},
        {"id": "ESTUDANTE", "icon": "ri-user-smile-fill", "label": "Aluno", "theme": "t-indigo"},
        {"id": "EVIDÊNCIAS", "icon": "ri-search-eye-line", "label": "Evid.", "theme": "t-cyan"},
        {"id": "REDE", "icon": "ri-team-fill", "label": "Rede", "theme": "t-blue"},
        {"id": "MAPEAMENTO", "icon": "ri-radar-line", "label": "Mapa", "theme": "t-teal"},
        {"id": "AÇÃO", "icon": "ri-tools-fill", "label": "Ação", "theme": "t-orange"},
        {"id": "MONITOR", "icon": "ri-line-chart-fill", "label": "Monit.", "theme": "t-rose"},
        {"id": "IA", "icon": "ri-robot-2-fill", "label": "IA", "theme": "t-violet"},
        {"id": "DASH", "icon": "ri-file-chart-fill", "label": "Docs", "theme": "t-slate"},
        {"id": "GAME", "icon": "ri-gamepad-fill", "label": "Game", "theme": "t-fuchsia"},
    ]
    
    cols = st.columns(10, gap="small")
    
    for i, item in enumerate(menu_items):
        with cols[i]:
            is_active = (st.session_state.aba_ativa == item["id"])
            active_class = "nav-active" if is_active else ""
            theme_class = item["theme"]
            
            # HTML Visual (Card com Tema)
            st.markdown(
                f"""
                <div class="nav-split-container">
                    <div class="nav-split-card {theme_class} {active_class}">
                        <div class="nav-icon-box"><i class="{item['icon']}"></i></div>
                        <div class="nav-split-title">{item['label']}</div>
                    </div>
                </div>
                """,
                unsafe_allow_html=True
            )
            
            # Botão Overlay
            if st.button(" ", key=f"nav_{item['id']}", use_container_width=True):
                st.session_state.aba_ativa = item["id"]
                st.rerun()

    # --- 3. HERO CARD ---
    hero_data = {
        "INÍCIO": ("Bem-vindo ao PEI 360°", "Central de gestão e fundamentos do planejamento inclusivo."),
        "ESTUDANTE": ("Dossiê do Estudante", "Identificação, histórico escolar e contexto familiar."),
        "EVIDÊNCIAS": ("Coleta de Evidências", "Registre observações comportamentais e pedagógicas."),
        "REDE": ("Rede de Apoio", "Conecte profissionais e centralize orientações clínicas."),
        "MAPEAMENTO": ("Mapeamento de Barreiras", "Identifique barreiras, níveis de suporte e potencialidades."),
        "AÇÃO": ("Plano de Ação", "Defina estratégias de acesso, ensino e avaliação."),
        "MONITOR": ("Monitoramento", "Acompanhe metas e revise o plano periodicamente."),
        "IA": ("Consultoria IA", "Gere o documento técnico do PEI com inteligência artificial."),
        "DASH": ("Dashboard & Docs", "Visualize métricas, exporte PDF/Word e sincronize."),
        "GAME": ("Jornada Gamificada", "Crie uma missão visual para engajar o estudante."),
    }
    
    title, desc = hero_data.get(st.session_state.aba_ativa, ("PEI 360°", "Planejamento Inclusivo"))
    
    st.markdown(
        f"""
        <div class="hero-wrapper">
            <div class="hero-content">
                <div class="hero-greet">{title}</div>
                <div class="hero-text">{desc}</div>
            </div>
            <div class="hero-icon"><i class="ri-book-open-fill"></i></div>
        </div>
        """,
        unsafe_allow_html=True
    )

# ==============================================================================
# 5. EXECUÇÃO
# ==============================================================================

render_header_unified()

aba = st.session_state.aba_ativa

with st.container():
    if aba == "INÍCIO":
        st.info("Conteúdo da aba Início.")
        
    elif aba == "ESTUDANTE":
        st.write("### 👤 Identificação")
        c1, c2 = st.columns(2)
        c1.text_input("Nome do Aluno")
        c2.selectbox("Série", ["1º Ano", "2º Ano"])

    elif aba == "EVIDÊNCIAS":
        st.write("### 🔎 Evidências")

    elif aba == "REDE":
        st.write("### 🤝 Rede de Apoio")
        
    elif aba == "MAPEAMENTO":
        st.write("### 🧭 Mapeamento de Barreiras")

    elif aba == "AÇÃO":
        st.write("### 🛠️ Plano de Ação")

    elif aba == "MONITOR":
        st.write("### 📈 Monitoramento")

    elif aba == "IA":
        st.write("### 🤖 Consultoria IA")
        st.button("Gerar PEI com IA", type="primary")

    elif aba == "DASH":
        st.write("### 📊 Dashboard e Exportação")

    elif aba == "GAME":
        st.write("### 🎮 Jornada Gamificada")

st.markdown("---")
st.markdown(
    f"""
    <div style='text-align: center; color: #94A3B8; font-size: 0.75rem; padding: 20px;'>
        <strong>Omnisfera {APP_VERSION}</strong> • Desenvolvido por RODRIGO A. QUEIROZ
    </div>
    """,
    unsafe_allow_html=True,
)
