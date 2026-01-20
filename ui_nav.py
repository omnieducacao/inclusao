# ui_nav.py
import streamlit as st
import os, base64

# -------------------------
# CONFIG (cores + ícones)
# -------------------------
FLATICON_CSS = """
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800;900&display=swap" rel="stylesheet">
<link rel='stylesheet' href='https://cdn-uicons.flaticon.com/3.0.0/uicons-bold-rounded/css/uicons-bold-rounded.css'>
<link rel='stylesheet' href='https://cdn-uicons.flaticon.com/3.0.0/uicons-solid-rounded/css/uicons-solid-rounded.css'>
<link rel='stylesheet' href='https://cdn-uicons.flaticon.com/3.0.0/uicons-solid-straight/css/uicons-solid-straight.css'>
"""

COLORS = {
    "home": "#0F172A",
    "alunos": "#2B6CEB",
    "pei": "#2F7DF6",
    "paee": "#22A765",
    "hub": "#D98A0A",
    "diario": "#E05A1C",
    "dados": "#8B5CF6",
    "logout": "#64748B",
}

# Ícones seguros (Flaticon)
ICONS = {
    "home": "fi fi-br-house-chimney",     # bold-rounded
    "alunos": "fi fi-sr-users-alt",       # solid-rounded
    "pei": "fi fi-sr-puzzle-alt",         # solid-rounded
    "paee": "fi fi-ss-route",             # solid-straight
    "hub": "fi fi-sr-lightbulb-on",       # solid-rounded
    "diario": "fi fi-br-compass-alt",     # bold-rounded
    "dados": "fi fi-br-chart-line-up",    # bold-rounded
    "logout": "fi fi-sr-sign-out-alt",    # solid-rounded
}

# Links para MULTIPAGE (o seu caso)
NAV_LINKS = [
    ("home",   "Home",                  "Home.py"),
    ("alunos", "Alunos",                "pages/0_Alunos.py"),
    ("pei",    "Estratégias & PEI",     "pages/1_PEI.py"),
    ("paee",   "Plano de Ação",         "pages/2_PAE.py"),
    ("hub",    "Hub",                   "pages/3_Hub_Inclusao.py"),
    ("diario", "Diário",                "pages/4_Diario_de_Bordo.py"),
    ("dados",  "Dados",                 "pages/5_Monitoramento_Avaliacao.py"),
]

def _b64(path: str) -> str:
    if not os.path.exists(path):
        return ""
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()

def _goto(target_path: str):
    """Navega no multipage do Streamlit."""
    try:
        st.switch_page(target_path)
    except Exception:
        # fallback: não quebra o app
        st.error(f"Não consegui abrir: {target_path}")

def render_topbar_nav(active_key: str, hide_on_home: bool = True):
    """
    Topbar fina full-width.
    - active_key: qual item está ativo (ex: 'paee' dentro do 2_PAE.py)
    - hide_on_home: se True, não mostra na Home (Home fica limpa)
    """

    # Se quiser esconder na Home, basta não chamar na Home.
    # Aqui só garantimos não explodir.

    # Logo
    logo_b64 = _b64("omni_icone.png")
    if logo_b64:
        logo_html = f'<img class="omni-spin" src="data:image/png;base64,{logo_b64}" alt="Omnisfera" />'
    else:
        logo_html = '<div class="omni-mark-fallback" aria-label="Omnisfera"></div>'

    # Links HTML (visual)
    links_html = ""
    for k, label, _path in NAV_LINKS:
        ic = ICONS.get(k, "fi fi-br-circle")
        color = COLORS.get(k, "#0F172A")
        cls = "omni-link active" if (k == active_key) else "omni-link"
        links_html += f"""
<div class="{cls}">
  <i class="{ic} omni-ic" style="color:{color};"></i>
  <span class="omni-lbl">{label}</span>
</div>
"""

    st.markdown(
        f"""
{FLATICON_CSS}
<style>
header[data-testid="stHeader"]{{display:none !important;}}
[data-testid="stSidebarNav"]{{display:none !important;}}

/* respiro para não cobrir conteúdo */
.block-container{{
  padding-top: 76px !important;
  padding-left: 2rem !important;
  padding-right: 2rem !important;
}}

@keyframes spin{{from{{transform:rotate(0deg);}}to{{transform:rotate(360deg);}}}}

.omni-topbar{{
  position:fixed; top:0; left:0; right:0;
  height:54px;
  z-index:2147483647;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding: 0 18px;
  background: rgba(248,250,252,0.86);
  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(226,232,240,0.85);
  box-shadow: 0 8px 20px rgba(15,23,42,0.06);
  font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial;
}}

.omni-left{{display:flex; align-items:center; gap:10px; min-width: 260px;}}
.omni-spin{{width:30px; height:30px; border-radius:999px; animation: spin 40s linear infinite;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.10));}}
.omni-mark-fallback{{width:30px; height:30px; border-radius:999px;
  background: conic-gradient(from 0deg,#3B82F6,#22C55E,#F59E0B,#F97316,#A855F7,#3B82F6);
  animation: spin 40s linear infinite;}}
.omni-brand{{display:flex; flex-direction:column; line-height:1;}}
.omni-title{{font-weight: 900; letter-spacing: .14em; text-transform: uppercase;
  font-size: 0.78rem; color:#0F172A;}}
.omni-sub{{margin-top:2px; font-size:0.68rem; color: rgba(15,23,42,0.55); letter-spacing:.04em;}}

.omni-right{{display:flex; align-items:flex-end; gap: 14px;}}
.omni-link{{
  display:flex; flex-direction:column; align-items:center;
  gap: 4px;
  padding: 6px 6px 4px 6px;
  border-radius: 12px;
  transition: transform .14s ease, background .14s ease, box-shadow .14s ease, opacity .14s ease;
  opacity: 0.86;
}}
.omni-link:hover{{
  transform: translateY(-1px);
  background: rgba(255,255,255,0.55);
  box-shadow: 0 10px 22px rgba(15,23,42,0.08);
  opacity: 1;
}}
.omni-ic{{font-size: 20px; line-height: 1;}}
.omni-lbl{{font-size: 0.62rem; color: rgba(15,23,42,0.55); letter-spacing: .03em; white-space: nowrap;}}
.omni-link.active{{opacity: 1;}}
.omni-link.active .omni-lbl{{color: rgba(15,23,42,0.82); font-weight: 700;}}
.omni-link.active::after{{
  content:"";
  width: 18px; height: 2px;
  border-radius: 99px;
  background: rgba(15,23,42,0.18);
  margin-top: 2px;
}}

@media (max-width: 980px){{
  .omni-sub{{display:none;}}
  .omni-lbl{{display:none;}}
  .omni-right{{gap:10px;}}
}}
</style>

<div class="omni-topbar">
  <div class="omni-left">
    {logo_html}
    <div class="omni-brand">
      <div class="omni-title">OMNISFERA</div>
      <div class="omni-sub">Inclusão • PEI • PAEE • Dados</div>
    </div>
  </div>

  <div class="omni-right">
    {links_html}
  </div>
</div>
        """,
        unsafe_allow_html=True,
    )

    # -------------------------
    # BOTÕES CLICÁVEIS (reais) — multipage
    # -------------------------
    # Renderiza botões invisíveis para capturar clique, sem “caixas fora”
    # (fica logo abaixo, mas invisível e fixado por CSS)
    st.markdown('<div id="omni-click-anchor"></div>', unsafe_allow_html=True)

    cols = st.columns([1]*len(NAV_LINKS), gap="small")
    for i, (k, label, path) in enumerate(NAV_LINKS):
        with cols[i]:
            if st.button(" ", key=f"nav_{k}", help=label):
                _goto(path)

    st.markdown("""
<style>
/* fixa o bloco de botões logo depois da âncora (sem depender de DOM frágil) */
#omni-click-anchor + div,
#omni-click-anchor + div + div{
  position: fixed !important;
  top: 8px !important;
  right: 18px !important;
  z-index: 2147483647 !important;
  opacity: 0 !important; /* invisível */
  pointer-events: auto !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}
/* tamanho do clique = tamanho do ícone */
#omni-click-anchor + div [data-testid="stButton"] button,
#omni-click-anchor + div + div [data-testid="stButton"] button{
  width: 36px !important;
  height: 46px !important;   /* inclui label embaixo */
  padding: 0 !important;
  border: none !important;
  background: transparent !important;
}
#omni-click-anchor + div [data-testid="stButton"] button p,
#omni-click-anchor + div + div [data-testid="stButton"] button p{
  display:none !important;
}
</style>
""", unsafe_allow_html=True)
