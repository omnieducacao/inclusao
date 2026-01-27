import os
import base64
import requests
import streamlit as st
from streamlit_option_menu import option_menu

# =============================================================================
# 1) ESTADO E CONFIGURAÇÃO
# =============================================================================
APP_VERSION = "omni_utils v3.0 (Hero Colorido + Botões Neutros)"

# Mapeamento Central de Cores por Módulo
OMNI_PAGE_COLORS = {
    "home":     {"name": "Home",                "accent": "#2563EB"}, # Azul Real
    "alunos":   {"name": "Estudantes",          "accent": "#0EA5E9"}, # Azul Claro
    "pei":      {"name": "PEI",                 "accent": "#7C3AED"}, # Roxo
    "pae":      {"name": "Plano de Ação / PAE", "accent": "#10B981"}, # Verde Esmeralda
    "hub":      {"name": "Hub de Inclusão",     "accent": "#F59E0B"}, # Âmbar/Laranja
    "diario":   {"name": "Diário de Bordo",     "accent": "#EF4444"}, # Vermelho
    "monitor":  {"name": "Monitoramento",       "accent": "#06B6D4"}, # Ciano
}

def ensure_state():
    """Garante que as variáveis de sessão essenciais existam."""
    defaults = {
        "autenticado": False,
        "user": None,
        "workspace_id": None,
        "workspace_name": "Workspace",
        "usuario_nome": "Visitante",
        "usuario_cargo": "",
        "view": "login"
    }
    for key, val in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = val

# =============================================================================
# 2) UTILITÁRIOS VISUAIS (IMG, INICIAIS, FORMATADORES)
# =============================================================================
def get_base64_image(path: str) -> str | None:
    if not os.path.exists(path):
        return None
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

def _get_initials(nome: str) -> str:
    if not nome:
        return "U"
    parts = nome.strip().split()
    return f"{parts[0][0]}{parts[-1][0]}".upper() if len(parts) >= 2 else parts[0][:2].upper()

def _get_ws_short(max_len: int = 22) -> str:
    ws = st.session_state.get("workspace_name", "") or "Workspace"
    ws = str(ws).strip()
    return (ws[:max_len] + "...") if len(ws) > max_len else ws

# =============================================================================
# 3) CSS GLOBAL & LAYOUT (SAAS DESIGN)
# =============================================================================
def inject_layout_css(topbar_h: int = 56, navbar_h: int = 52, content_gap: int = 14):
    """
    CSS Core:
    1. Esconde menu Streamlit e rodapé.
    2. Define padding superior para compensar Topbar+Navbar fixas.
    3. Importa fontes e ícones.
    """
    st.markdown(
        f"""
        <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

        <style>
          :root {{
            --topbar-h: {topbar_h}px;
            --navbar-h: {navbar_h}px;
            --content-gap: {content_gap}px;
          }}

          /* Reset Global de Fontes */
          html, body, [class*="css"] {{
            font-family: 'Plus Jakarta Sans', sans-serif !important;
          }}

          /* Ocultar Chrome do Streamlit */
          #MainMenu {{ visibility: hidden; }}
          footer {{ visibility: hidden; }}
          header[data-testid="stHeader"] {{ display:none !important; }}
          [data-testid="stToolbar"] {{ display:none !important; }}
          
          /* Ajuste do Bloco Principal (Padding para Topbar Fixa) */
          .main .block-container {{
            padding-top: calc(var(--topbar-h) + var(--navbar-h) + var(--content-gap)) !important;
            padding-bottom: 3rem !important;
            max-width: 100% !important;
          }}

          /* TOPBAR FIXA */
          .omni-topbar {{
            position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important;
            height: var(--topbar-h) !important;
            background: #ffffff !important;
            border-bottom: 1px solid #E2E8F0 !important;
            z-index: 999999 !important;
            display: flex !important; align-items: center !important; justify-content: space-between !important;
            padding: 0 24px !important;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02) !important;
          }}
          
          /* BRAND & USER INFO */
          .omni-brand {{ display:flex; align-items:center; gap:12px; }}
          .omni-logo {{ height: 28px; width: auto; object-fit: contain; }}
          .omni-user-info {{ display:flex; align-items:center; gap:12px; }}
          
          .omni-workspace {{
            background: #F8FAFC; border: 1px solid #E2E8F0;
            padding: 4px 10px; border-radius: 8px;
            font-size: 11px; font-weight: 700; color: #64748B;
            text-transform: uppercase; letter-spacing: 0.5px;
          }}
          
          .omni-avatar {{
            width: 32px; height: 32px; border-radius: 50%;
            background: linear-gradient(135deg, #3B82F6, #2563EB);
            color: white; font-weight: 700; font-size: 12px;
            display: flex; align-items: center; justify-content: center;
          }}

          /* NAVBAR FIXA (Abaixo da Topbar) */
          .omni-navbar {{
            position: fixed !important;
            top: var(--topbar-h) !important; left: 0 !important; right: 0 !important;
            height: var(--navbar-h) !important;
            background: rgba(255,255,255,0.8) !important;
            backdrop-filter: blur(8px);
            z-index: 999998 !important;
            display:flex !important; align-items:center !important; justify-content:center !important;
            pointer-events: none; /* Deixa clicar no fundo se vazar, mas pointer-events auto no inner */
          }}
          .omni-navbar-inner {
            pointer-events: auto;
          }
          
          /* REMOVE GAPS DO OPTION MENU */
          .omni-navbar-inner .element-container { margin: 0 !important; padding: 0 !important; }
        </style>
        """,
        unsafe_allow_html=True,
    )

def inject_hero_css():
    """
    CSS Específico para o Card Hero Unificado.
    Define a estrutura (Flexbox), sombras e transições.
    """
    st.markdown("""
    <style>
      .mod-card-wrapper {
          display:flex; flex-direction:column;
          margin-bottom:24px;
          border-radius:16px;
          overflow:hidden;
          box-shadow:0 2px 4px rgba(0,0,0,0.02);
          border: 1px solid #E2E8F0;
      }
      .mod-card-rect {
          background:white;
          border-radius:16px;
          padding:0;
          display:flex;
          flex-direction:row;
          align-items:center;
          height:120px;
          width:100%;
          position:relative;
          overflow:hidden;
      }
      .mod-bar {
          width:6px; height:100%; flex-shrink:0;
      }
      .mod-icon-area {
          width:80px; height:100%;
          display:flex; align-items:center; justify-content:center;
          font-size:1.8rem;
          flex-shrink:0;
          background:transparent !important;
          border-right:1px solid #F1F5F9;
          opacity: 0.9;
      }
      .mod-content {
          flex-grow:1;
          padding:0 24px;
          display:flex; flex-direction:column; justify-content:center;
      }
      .mod-title {
          font-weight:800; font-size:1.15rem; color:#0F172A;
          margin-bottom:4px; letter-spacing:-0.02em;
      }
      .mod-desc {
          font-size:.9rem; color:#64748B; line-height:1.5;
      }
      
      /* Responsividade Mobile */
      @media (max-width: 768px) {
          .mod-card-rect { height:auto; flex-direction:column; padding:16px; align-items:flex-start; }
          .mod-bar { width: 100%; height: 4px; margin-bottom: 12px; }
          .mod-icon-area { 
              width:40px; height:40px; border:none; 
              justify-content:flex-start; margin-bottom:8px; font-size: 1.5rem; 
          }
          .mod-content { padding:0; }
      }
    </style>
    """, unsafe_allow_html=True)

def apply_neutral_buttons():
    """
    Força todos os botões a serem NEUTROS (Cinza/Slate),
    independentemente da página, para reduzir ruído visual.
    """
    st.markdown("""
    <style>
      /* Base Button Style */
      .stButton > button {
          border-radius: 8px !important;
          font-weight: 600 !important;
          font-size: 0.9rem !important;
          padding: 0.4rem 1rem !important;
          min-height: 40px !important;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }

      /* Secondary Button (Ghost/Outline) - Padrão */
      .stButton > button[kind="secondary"] {
          background-color: #FFFFFF !important;
          color: #475569 !important; /* Slate 600 */
          border: 1px solid #CBD5E1 !important; /* Slate 300 */
      }
      .stButton > button[kind="secondary"]:hover {
          background-color: #F8FAFC !important;
          color: #0F172A !important;
          border-color: #94A3B8 !important;
          transform: translateY(-1px);
      }

      /* Primary Button (Solid Neutral) - Destaque sem cor gritante */
      .stButton > button[kind="primary"] {
          background-color: #334155 !important; /* Slate 700 */
          color: #FFFFFF !important;
          border: 1px solid #334155 !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
      }
      .stButton > button[kind="primary"]:hover {
          background-color: #1E293B !important; /* Slate 800 */
          border-color: #1E293B !important;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1) !important;
          transform: translateY(-1px);
      }
      
      /* Tabs Neutras e Limpas */
      .stTabs [data-baseweb="tab-list"] {
        gap: 2px !important;
        border-bottom: 2px solid #E2E8F0 !important;
        margin-top: 20px !important;
      }
      .stTabs [data-baseweb="tab"] {
        height: 38px !important;
        border-radius: 8px 8px 0 0 !important;
        font-weight: 600 !important;
        color: #64748B !important;
        border: none !important;
        background: transparent !important;
      }
      .stTabs [aria-selected="true"] {
        color: #0F172A !important; /* Slate 900 */
        background: transparent !important;
      }
      .stTabs [aria-selected="true"]::after {
        background: #0F172A !important; /* Linha preta/cinza escura */
        height: 3px !important;
      }
    </style>
    """, unsafe_allow_html=True)

# =============================================================================
# 4) RENDERIZADORES DE COMPONENTES
# =============================================================================

def render_omnisfera_header():
    """Renderiza a barra superior fixa (Logo + User)."""
    ensure_state()
    
    # Injeta os CSS fundamentais
    inject_layout_css(topbar_h=60, navbar_h=54, content_gap=20)
    
    # Prepara imagens/textos
    ws_name = _get_ws_short()
    user_name = st.session_state.get("usuario_nome", "Visitante")
    initials = _get_initials(user_name)

    # Tenta carregar imagem local, senão usa ícone texto
    icone_b64 = get_base64_image("omni_icone.png")
    texto_b64 = get_base64_image("omni_texto.png")
    
    img_logo = f'<img src="data:image/png;base64,{icone_b64}" class="omni-logo">' if icone_b64 else '<span style="font-size:20px;">🌐</span>'
    img_text = f'<img src="data:image/png;base64,{texto_b64}" style="height:20px;">' if texto_b64 else '<span style="font-weight:800;color:#0F172A;font-size:16px;">OMNISFERA</span>'

    st.markdown(
        f"""
        <div class="omni-topbar">
          <div class="omni-brand">
            {img_logo}
            {img_text}
          </div>
          <div class="omni-user-info">
            <div class="omni-workspace" title="{st.session_state.get('workspace_name','')}">{ws_name}</div>
            <div class="omni-avatar" title="{user_name}">{initials}</div>
          </div>
        </div>
        """,
        unsafe_allow_html=True
    )

def render_navbar(active_tab: str = "Início"):
    """
    Renderiza a barra de navegação flutuante abaixo do header.
    Faz o roteamento automático das páginas.
    """
    # Lista de páginas do sistema
    opcoes = [
        "Início",
        "Estudantes",
        "Estratégias & PEI",
        "Plano de Ação (AEE)",
        "Hub de Recursos",
        "Diário de Bordo",
        "Evolução & Dados",
    ]
    icones = ["house", "people", "book", "puzzle", "rocket", "journal", "bar-chart"]
    
    try:
        default_idx = opcoes.index(active_tab)
    except ValueError:
        default_idx = 0

    st.markdown('<div class="omni-navbar"><div class="omni-navbar-inner">', unsafe_allow_html=True)
    
    selected = option_menu(
        menu_title=None,
        options=opcoes,
        icons=icones,
        default_index=default_idx,
        orientation="horizontal",
        styles={
            "container": {
                "padding": "4px", "margin": "0px",
                "background-color": "#ffffff",
                "border": "1px solid #E2E8F0",
                "border-radius": "12px",
                "box-shadow": "0 2px 5px rgba(0,0,0,0.03)",
            },
            "icon": {"color": "#64748B", "font-size": "14px"},
            "nav-link": {
                "font-size": "13px", "text-align": "center", "margin": "0px", "padding": "8px 12px",
                "color": "#64748B", "font-weight": "500",
                "border-radius": "8px", "border": "1px solid transparent",
            },
            "nav-link-selected": {
                "background-color": "#F1F5F9", "color": "#0F172A",
                "font-weight": "700", "border": "1px solid #E2E8F0",
            },
        },
    )
    st.markdown('</div></div>', unsafe_allow_html=True)

    # Lógica de Roteamento
    if selected != active_tab:
        routes = {
            "Início": "pages/0_Home.py" if os.path.exists("pages/0_Home.py") else "Home.py",
            "Estudantes": "pages/Alunos.py",
            "Estratégias & PEI": "pages/1_PEI.py",
            "Plano de Ação (AEE)": "pages/2_PAE.py",
            "Hub de Recursos": "pages/3_Hub_Inclusao.py",
            "Diário de Bordo": "pages/4_Diario_de_Bordo.py",
            "Evolução & Dados": "pages/5_Monitoramento_Avaliacao.py",
        }
        target = routes.get(selected)
        if target:
            st.switch_page(target)

def render_hero(page_key: str, icon: str, title: str, description: str):
    """
    Renderiza o Card Hero com a IDENTIDADE VISUAL da página (cor da borda e ícone).
    
    Args:
        page_key (str): Chave para buscar a cor em OMNI_PAGE_COLORS (ex: 'pei', 'pae', 'hub').
        icon (str): Classe do ícone Remix Icon (ex: 'ri-puzzle-fill').
        title (str): Título principal do card.
        description (str): Descrição (suporta placeholders {usuario} e {workspace}).
    """
    # 1. Injeta dependências CSS (Neutral Buttons + Hero Styles)
    inject_hero_css()
    apply_neutral_buttons()
    
    # 2. Define cor baseada na página
    cfg = OMNI_PAGE_COLORS.get(page_key, {"accent": "#64748B"})
    accent_color = cfg["accent"]
    
    # 3. Prepara textos dinâmicos
    user_first = st.session_state.get("usuario_nome", "Visitante").split()[0]
    ws_name = st.session_state.get("workspace_name", "Workspace")
    
    try:
        final_desc = description.format(usuario=user_first, workspace=ws_name)
    except:
        final_desc = description

    # 4. Renderiza HTML
    st.markdown(f"""
    <div class="mod-card-wrapper">
        <div class="mod-card-rect">
            <div class="mod-bar" style="background-color: {accent_color} !important;"></div>
            
            <div class="mod-icon-area" style="color: {accent_color} !important;">
                <i class="{icon}"></i>
            </div>
            
            <div class="mod-content">
                <div class="mod-title">{title}</div>
                <div class="mod-desc">{final_desc}</div>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

# =============================================================================
# 5) CONECTORES SUPABASE (BACKEND)
# =============================================================================
def _sb_url() -> str:
    url = str(st.secrets.get("SUPABASE_URL", "")).strip()
    if not url: raise RuntimeError("SUPABASE_URL não configurado.")
    return url.rstrip("/")

def _sb_key() -> str:
    key = str(st.secrets.get("SUPABASE_SERVICE_KEY", "") or st.secrets.get("SUPABASE_ANON_KEY", "")).strip()
    if not key: raise RuntimeError("SUPABASE_KEY não configurada.")
    return key

def _headers() -> dict:
    key = _sb_key()
    return {"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json"}

def supabase_rpc(fn_name: str, payload: dict):
    url = f"{_sb_url()}/rest/v1/rpc/{fn_name}"
    r = requests.post(url, headers=_headers(), json=payload, timeout=20)
    if r.status_code >= 400: raise RuntimeError(f"RPC {fn_name} erro: {r.text}")
    return r.json()

def supabase_insert(table: str, row: dict):
    url = f"{_sb_url()}/rest/v1/{table}"
    h = _headers()
    h["Prefer"] = "return=representation"
    r = requests.post(url, headers=h, json=row, timeout=20)
    if r.status_code >= 400: raise RuntimeError(f"Insert {table} erro: {r.text}")
    return r.json()

def supabase_upsert(table: str, row: dict, on_conflict: str):
    url = f"{_sb_url()}/rest/v1/{table}?on_conflict={on_conflict}"
    h = _headers()
    h["Prefer"] = "resolution=merge-duplicates,return=representation"
    r = requests.post(url, headers=h, json=row, timeout=20)
    if r.status_code >= 400: raise RuntimeError(f"Upsert {table} erro: {r.text}")
    data = r.json()
    return data[0] if isinstance(data, list) and data else data

# =============================================================================
# 6) CSS ESPECÍFICO PARA LOGIN (Não afeta app interno)
# =============================================================================
def inject_base_css():
    """Estilos usados apenas na tela de login/inicial."""
    st.markdown("""
    <style>
      .omni-login .login-box {
        background: white; border-radius: 24px; padding: 40px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        text-align: center; border: 1px solid #E2E8F0;
        max-width: 450px; margin: 40px auto;
      }
      .omni-login .stTextInput input { border-radius: 10px !important; height: 42px !important; }
      .omni-login .stButton > button { width: 100%; justify-content: center; }
    </style>
    """, unsafe_allow_html=True)
