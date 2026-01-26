# omni_utils.py
import os
import base64
import requests
import streamlit as st
import streamlit.components.v1 as components
from streamlit_option_menu import option_menu

APP_VERSION = "omni_utils v3.1 (BLINDADO: CSS via components.html)"

# =========================
# TUNING (1 lugar só)
# =========================
TOPBAR_H = 52          # altura real da topbar
TOPBAR_PAD = 10        # respiro abaixo da topbar (empurra o app)
NAV_GAP_BEFORE = 6     # espaço entre topbar e navbar
NAV_GAP_AFTER = 2      # espaço entre navbar e conteúdo (DIMINUA para subir o conteúdo)

def ensure_state():
    st.session_state.setdefault("autenticado", False)
    st.session_state.setdefault("user", None)
    st.session_state.setdefault("workspace_id", None)
    st.session_state.setdefault("workspace_name", "Workspace")
    st.session_state.setdefault("usuario_nome", "Visitante")
    st.session_state.setdefault("usuario_cargo", "")
    st.session_state.setdefault("view", "login")

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
    return (ws[:max_len] + "...") if len(ws) > max_len else ws

def _inject_css_blindado(css: str):
    """
    Injeta CSS de forma BLINDADA (nunca vira texto na tela).
    """
    components.html(f"<style>{css}</style>", height=0, scrolling=False)

def _inject_global_layout_css():
    css = f"""
      /* Empurra tudo para baixo da TOPBAR fixa */
      div[data-testid="stAppViewContainer"] > div:first-child {{
        padding-top: {TOPBAR_H + TOPBAR_PAD}px !important;
      }}

      /* Esconde chrome */
      .stApp > header {{ display: none !important; }}
      #MainMenu {{ visibility: hidden; }}
      footer {{ visibility: hidden; }}
      section[data-testid="stSidebar"] {{ display: none !important; }}
      [data-testid="stSidebarNav"] {{ display: none !important; }}
      button[data-testid="collapsedControl"] {{ display: none !important; }}

      /* Container principal */
      .block-container {{
        padding-top: 0px !important;
        padding-bottom: 16px !important;
        max-width: 100% !important;
      }}
      .main .block-container {{
        padding-left: 1rem !important;
        padding-right: 1rem !important;
      }}

      /* Topbar */
      .omni-topbar {{
        position: fixed !important;
        top: 0; left: 0; right: 0;
        height: {TOPBAR_H}px;
        background: #FFFFFF;
        border-bottom: 1px solid #E2E8F0;
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 18px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }}
      .omni-brand {{
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }}
      .omni-logo {{
        height: 28px; width: 28px;
      }}
      .omni-user-info {{
        display: flex;
        align-items: center;
        gap: 10px;
      }}
      .omni-workspace {{
        background: #F1F5F9;
        border: 1px solid #E2E8F0;
        padding: 4px 12px;
        border-radius: 10px;
        font-size: 12px;
        font-weight: 700;
        color: #64748B;
        max-width: 220px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }}
      .omni-avatar {{
        width: 28px; height: 28px;
        border-radius: 50%;
        background: linear-gradient(135deg, #4F46E5, #7C3AED);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 11px;
      }}

      /* Espaçadores controlados */
      .omni-gap-before-nav {{ height: {NAV_GAP_BEFORE}px; }}
      .omni-gap-after-nav {{ height: {NAV_GAP_AFTER}px; }}
    """
    _inject_css_blindado(css)

def render_omnisfera_header():
    ensure_state()
    _inject_global_layout_css()

    # Remixicon (link fora do CSS)
    st.markdown(
        '<link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">',
        unsafe_allow_html=True
    )

    icone = get_base64_image("omni_icone.png")
    texto = get_base64_image("omni_texto.png")
    ws_name = _get_ws_short()
    user_name = st.session_state.get("usuario_nome", "Visitante")

    img_logo = f'<img src="data:image/png;base64,{icone}" class="omni-logo">' if icone else '<div class="omni-logo">🌐</div>'
    img_text = (
        f'<img src="data:image/png;base64,{texto}" style="height:16px;margin-left:4px;">'
        if texto else
        '<span style="font-weight:900;color:#2B3674;font-size:14px;letter-spacing:.02em;">OMNISFERA</span>'
    )

    st.markdown(f"""
      <div class="omni-topbar">
        <div class="omni-brand">
          {img_logo}
          {img_text}
        </div>
        <div class="omni-user-info">
          <div class="omni-workspace" title="{ws_name}">{ws_name}</div>
          <div class="omni-avatar">{_get_initials(user_name)}</div>
        </div>
      </div>
    """, unsafe_allow_html=True)

def render_navbar(active_tab: str = "Início"):
    ensure_state()

    opcoes = [
        "Início", "Estudantes", "Estratégias & PEI",
        "Plano de Ação (AEE)", "Hub de Recursos",
        "Diário de Bordo", "Evolução & Dados"
    ]
    icones = ["house", "people", "book", "puzzle", "rocket", "journal", "bar-chart"]

    try:
        default_idx = opcoes.index(active_tab)
    except ValueError:
        default_idx = 0

    # Gap controlado antes
    st.markdown('<div class="omni-gap-before-nav"></div>', unsafe_allow_html=True)

    selected = option_menu(
        menu_title=None,
        options=opcoes,
        icons=icones,
        default_index=default_idx,
        orientation="horizontal",
        styles={
            "container": {
                "padding": "0!important",
                "background-color": "#ffffff",
                "border": "1px solid #E2E8F0",
                "border-radius": "10px",
                "margin": "0px",
                "box-shadow": "0 1px 3px rgba(0,0,0,0.05)",
            },
            "icon": {"color": "#64748B", "font-size": "14px"},
            "nav-link": {
                "font-size": "11px",
                "text-align": "center",
                "margin": "0px",
                "padding": "10px 12px",
                "--hover-color": "#F1F5F9",
                "color": "#475569",
                "white-space": "nowrap",
                "border-radius": "8px",
            },
            "nav-link-selected": {
                "background-color": "#0284C7",
                "color": "white",
                "font-weight": "700",
                "border": "none",
            },
        },
    )

    # Gap controlado depois ✅ (subir conteúdo = reduzir NAV_GAP_AFTER)
    st.markdown('<div class="omni-gap-after-nav"></div>', unsafe_allow_html=True)

    # Redirecionamento
    if selected != active_tab:
        if selected == "Início":
            target = "pages/0_Home.py" if os.path.exists("pages/0_Home.py") else "0_Home.py"
            if not os.path.exists(target):
                target = "Home.py"
            st.switch_page(target)
        elif selected == "Estudantes":
            st.switch_page("pages/Alunos.py")
        elif selected == "Estratégias & PEI":
            st.switch_page("pages/1_PEI.py")
        elif selected == "Plano de Ação (AEE)":
            st.switch_page("pages/2_PAE.py")
        elif selected == "Hub de Recursos":
            st.switch_page("pages/3_Hub_Inclusao.py")
        elif selected == "Diário de Bordo":
            st.switch_page("pages/4_Diario_de_Bordo.py")
        elif selected == "Evolução & Dados":
            st.switch_page("pages/5_Monitoramento_Avaliacao.py")

# =========================
# SUPABASE HELPERS
# =========================
def _sb_url() -> str:
    url = str(st.secrets.get("SUPABASE_URL", "")).strip()
    if not url:
        raise RuntimeError("SUPABASE_URL não encontrado nos secrets.")
    return url.rstrip("/")

def _sb_key() -> str:
    key = str(st.secrets.get("SUPABASE_SERVICE_KEY", "")).strip()
    if not key:
        key = str(st.secrets.get("SUPABASE_ANON_KEY", "")).strip()
    if not key:
        raise RuntimeError("SUPABASE_SERVICE_KEY/ANON_KEY não encontrado nos secrets.")
    return key

def _headers() -> dict:
    key = _sb_key()
    return {"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json"}

def supabase_rpc(fn_name: str, payload: dict):
    url = f"{_sb_url()}/rest/v1/rpc/{fn_name}"
    r = requests.post(url, headers=_headers(), json=payload, timeout=20)
    if r.status_code >= 400:
        raise RuntimeError(f"RPC {fn_name} falhou: {r.status_code} {r.text}")
    return r.json()

def supabase_insert(table: str, row: dict):
    url = f"{_sb_url()}/rest/v1/{table}"
    h = _headers()
    h["Prefer"] = "return=representation"
    r = requests.post(url, headers=h, json=row, timeout=20)
    if r.status_code >= 400:
        raise RuntimeError(f"Insert em {table} falhou: {r.status_code} {r.text}")
    return r.json()

def supabase_upsert(table: str, row: dict, on_conflict: str):
    url = f"{_sb_url()}/rest/v1/{table}?on_conflict={on_conflict}"
    h = _headers()
    h["Prefer"] = "resolution=merge-duplicates,return=representation"
    r = requests.post(url, headers=h, json=row, timeout=20)
    if r.status_code >= 400:
        raise RuntimeError(f"Upsert em {table} falhou: {r.status_code} {r.text}")
    data = r.json()
    if isinstance(data, list) and len(data) > 0:
        return data[0]
    return data if isinstance(data, dict) else None
