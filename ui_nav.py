# ui_nav.py
import streamlit as st
import os, base64

# -------------------------
# ROTAS (ajuste se necessário)
# -------------------------
PAGES = {
    "home":   "home_portal.py",
    "alunos": "pages/0_Alunos.py",
    "pei":    "pages/1_PEI.py",
    "paee":   "pages/2_PAE.py",
    "hub":    "pages/3_Hub_Inclusao.py",
    # se você ainda não tiver esses arquivos, deixe comentado:
    # "diario": "pages/4_Diario_de_Bordo.py",
    # "dados":  "pages/5_Monitoramento_Avaliacao.py",
}

# -------------------------
# CORES POR MÓDULO
# -------------------------
COLORS = {
    "home":   "#111827",
    "alunos": "#2563EB",
    "pei":    "#3B82F6",
    "paee":   "#10B981",
    "hub":    "#F59E0B",
    "diario": "#F97316",
    "dados":  "#8B5CF6",
}

# -------------------------
# ÍCONES (Flaticon UIcons v3.0.0)
# -------------------------
FLATICON_CSS = """
<link rel="stylesheet" href="https://cdn-uicons.flaticon.com/3.0.0/uicons-bold-rounded/css/uicons-bold-rounded.css">
<link rel="stylesheet" href="https://cdn-uicons.flaticon.com/3.0.0/uicons-solid-rounded/css/uicons-solid-rounded.css">
<link rel="stylesheet" href="https://cdn-uicons.flaticon.com/3.0.0/uicons-solid-straight/css/uicons-solid-straight.css">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;700;800;900&display=swap" rel="stylesheet">
"""

ICONS = {
    "home":   "fi fi-br-home",
    "alunos": "fi fi-br-users",
    "pei":    "fi fi-sr-puzzle-alt",
    "paee":   "fi fi-ss-route",
    "hub":    "fi fi-sr-lightbulb-on",
    "diario": "fi fi-br-book-alt",
    "dados":  "fi fi-br-chart-histogram",
    "sair":   "fi fi-br-sign-out-alt",
}

def _b64(path: str) -> str:
    if not os.path.exists(path):
        return ""
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()

def _get_qp(name: str):
    try:
        qp = st.query_params
        v = qp.get(name)
        if isinstance(v, list):
            return v[0] if v else None
        return v
    except Exception:
        return None

def _clear_qp():
    try:
        st.query_params.clear()
    except Exception:
        pass

def _nav_if_requested():
    """
    Se a URL tiver ?go=paee, navega via switch_page().
    """
    go = _get_qp("go")
    if go:
        target = PAGES.get(go)
        _clear_qp()
        if target:
            st.switch_page(target)

def render_topbar_nav(active: str):
    """
    Topbar fina + links clicáveis (sem botões invisíveis).
    """
    _nav_if_requested()

    # Logo
    logo_b64 = _b64("omni_icone.png")
    if logo_b64:
        logo_html = f"<img class='omni-mark' src='data:image/png;base64,{logo_b64}' alt='Omnisfera'/>"
    else:
        logo_html = "<div class='omni-mark omni-mark-fallback'></div>"

    # Itens (mostra só os que existem em PAGES)
    items = [
        ("home", "Home"),
        ("alunos", "Alunos"),
        ("pei", "Estratégias & PEI"),
        ("paee", "Plano de Ação"),
        ("hub", "Hub"),
        ("diario", "Diário"),
        ("dados", "Dados"),
    ]

    links_html = ""
    for key, label in items:
        if key not in PAGES:
            continue
        is_active = "active" if key == active else ""
        color = COLORS.get(key, "#111827")
        icon = ICONS.get(key, "fi fi-br-circle")

        links_html += f"""
<a class="omni-link {is_active}" href="?go={key}" target="_self" aria-label="{label}">
  <i class="{icon} omni-ic" style="color:{color};"></i>
  <div class="omni-label">{label}</div>
  <div class="omni-underline"></div>
</a>
"""

    # Render único (evita “HTML vazando”)
    st.markdown(
        f"""
{FLATICON_CSS}
<style>
/* limpa UI padrão */
header[data-testid="stHeader"]{{display:none !important;}}
[data-testid="stSidebar"]{{display:none !important;}}
[data-testid="stSidebarNav"]{{display:none !important;}}
[data-testid="stToolbar"]{{display:none !important;}}

.block-container{{
  padding-top: 86px !important;
  padding-left: 2rem !important;
  padding-right: 2rem !important;
  padding-bottom: 2rem !important;
}}

@keyframes spin{{from{{transform:rotate(0deg);}}to{{transform:rotate(360deg);}}}}

/* TOPBAR */
.omni-topbar{{
  position: fixed;
  top:0; left:0; right:0;
  height: 62px;
  z-index: 2147483647;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding: 0 22px;
  background: rgba(247,250,252,0.86);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(226,232,240,0.85);
  box-shadow: 0 8px 20px rgba(15,23,42,0.06);
  font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial;
}}

/* ESQUERDA */
.omni-left{{display:flex; align-items:center; gap:12px;}}
.omni-mark{{
  width: 32px; height: 32px;
  border-radius: 999px;
  animation: spin 45s linear infinite;
}}
.omni-mark-fallback{{
  background: conic-gradient(from 0deg,#3B82F6,#22C55E,#F59E0B,#F97316,#A855F7,#3B82F6);
}}
.omni-title{{
  font-weight: 900;
  letter-spacing: .12em;
  text-transform: uppercase;
  font-size: .82rem;
  color:#0F172A;
}}

/* DIREITA */
.omni-right{{
  display:flex;
  align-items:flex-end;
  gap: 18px;
}}

/* LINK = BOTÃO REAL (neutraliza estilo padrão de link) */
.omni-link{{
  text-decoration: none !important;
  color: inherit !important;
  outline: none !important;

  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;

  gap: 4px;
  padding: 2px 6px;
  border-radius: 10px;

  opacity: .74;
  transition: opacity .16s ease, transform .16s ease;
}}
.omni-link:hover{{
  opacity: 1;
  transform: translateY(-1px);
}}
.omni-ic{{
  font-size: 20px;
  line-height: 1;
}}
/* label discreto, SEM caixa alta forçada */
.omni-label{{
  font-size: 11px;
  font-weight: 700;
  color: rgba(15,23,42,0.55);
  letter-spacing: .02em;
  text-transform: none;
}}

/* underline pequeno só no ativo */
.omni-underline{{
  width: 18px;
  height: 2px;
  border-radius: 999px;
  background: transparent;
}}
.omni-link.active{{
  opacity: 1;
}}
.omni-link.active .omni-label{{
  color: rgba(15,23,42,0.82);
  font-weight: 800;
}}
.omni-link.active .omni-underline{{
  background: rgba(15,23,42,0.18);
}}

/* divisor + sair */
.omni-divider{{
  width: 1px;
  height: 22px;
  background: rgba(226,232,240,1);
  margin: 0 2px;
}}

@media (max-width: 980px){{
  .omni-label{{display:none;}}
}}
</style>

<div class="omni-topbar">
  <div class="omni-left">
    {logo_html}
    <div class="omni-title">OMNISFERA</div>
  </div>

  <div class="omni-right">
    {links_html}
    <div class="omni-divider"></div>

    <a class="omni-link" href="?go=home" target="_self" aria-label="Sair">
      <i class="{ICONS['sair']} omni-ic" style="color:rgba(15,23,42,0.55);"></i>
      <div class="omni-label">Sair</div>
      <div class="omni-underline"></div>
    </a>
  </div>
</div>
""",
        unsafe_allow_html=True,
    )
