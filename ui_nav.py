import streamlit as st
import streamlit.components.v1 as components
import os, base64

# =========================
# ROTAS DAS PÁGINAS
# =========================
PAGES = {
    "home":   "home_portal.py",
    "alunos": "pages/0_Alunos.py",
    "pei":    "pages/1_PEI.py",
    "paee":   "pages/2_PAE.py",
    "hub":    "pages/3_Hub_Inclusao.py",
}

# =========================
# CORES POR MÓDULO
# =========================
COLORS = {
    "home":   "#111827",
    "alunos": "#2563EB",
    "pei":    "#3B82F6",
    "paee":   "#10B981",
    "hub":    "#F59E0B",
    "diario": "#F97316",
    "dados":  "#8B5CF6",
}

# =========================
# FLATICON
# =========================
FLATICON_CSS = """
<link rel="stylesheet" href="https://cdn-uicons.flaticon.com/3.0.0/uicons-solid-rounded/css/uicons-solid-rounded.css">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@600;800;900&display=swap" rel="stylesheet">
"""

ICONS = {
    "home":   "fi fi-sr-home",
    "alunos": "fi fi-sr-users",
    "pei":    "fi fi-sr-puzzle-alt",
    "paee":   "fi fi-sr-route",
    "hub":    "fi fi-sr-lightbulb-on",
    "diario": "fi fi-sr-book-alt",
    "dados":  "fi fi-sr-chart-line-up",
    "sair":   "fi fi-sr-exit",
}

# =========================
# UTIL
# =========================
def _b64(path: str) -> str:
    if not os.path.exists(path): return ""
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()

def _get_qp(name: str):
    try:
        return st.query_params.get(name)
    except:
        return None

def _clear_qp():
    try:
        st.query_params.clear()
    except:
        pass

def _nav_if_requested():
    go = _get_qp("go")
    if go and go in PAGES:
        _clear_qp()
        st.switch_page(PAGES[go])

def _js_fix_top():
    components.html(
        """
<script>
(function(){
  function run(){
    try{
      document.documentElement.style.margin='0';
      document.documentElement.style.padding='0';
      const vc = document.querySelector('div[data-testid="stAppViewContainer"]');
      if(vc){ vc.style.paddingTop='0'; }
      const main = document.querySelector('div[data-testid="stAppViewContainer"] > section.main');
      if(main){ main.style.paddingTop='0'; }
    }catch(e){}
  }
  run(); setTimeout(run, 200); setTimeout(run, 600);
})();
</script>
""",
        height=0,
    )

# =========================
# RENDER TOPBAR
# =========================
def render_topbar_nav(active: str):
    _nav_if_requested()

    logo_b64 = _b64("omni_icone.png")
    logo_html = f"<img class='omni-logo' src='data:image/png;base64,{logo_b64}'/>" if logo_b64 else "<div class='omni-logo omni-logo-fallback'></div>"

    items = [
        ("home", "Home"),
        ("alunos", "Alunos"),
        ("pei", "Estratégias & PEI"),
        ("paee", "Plano de Ação"),
        ("hub", "Hub"),
        ("diario", "Diário"),
        ("dados", "Dados"),
    ]

    links = ""
    for key, label in items:
        icon = ICONS.get(key, "fi fi-sr-circle")
        color = COLORS.get(key, "#111827")
        exists = key in PAGES
        
        if exists:
            cls = "omni-ico-link active" if key == active else "omni-ico-link"
            links += f"""
            <a class="{cls}" href="?go={key}">
                <i class="{icon}" style="color:{color};"></i>
                <span class="omni-tip">{label}</span>
            </a>"""
        else:
            links += f"""
            <span class="omni-ico-link omni-disabled">
                <i class="{icon}" style="color:rgba(15,23,42,0.2);"></i>
                <span class="omni-tip">{label} • Em breve</span>
            </span>"""

    st.markdown(
        f"""
{FLATICON_CSS}
<style>
header[data-testid="stHeader"], [data-testid="stToolbar"], [data-testid="stSidebar"] {{display:none!important;}}
.block-container {{padding-top:60px!important;}}

.omni-topbar {{
    position:fixed; top:0; left:0; right:0; height:52px;
    display:flex; align-items:center; justify-content:space-between;
    padding:0 20px; background:#fff; border-bottom:1px solid #e2e8f0;
    z-index:999999; font-family:Inter, sans-serif;
}}
.omni-left, .omni-right {{display:flex; align-items:center; gap:8px;}}
.omni-logo {{width:28px; height:28px; border-radius:50%;}}
.omni-title {{font-weight:900; font-size:11px; letter-spacing:1.5px; color:#0f172a; margin-left:8px;}}

.omni-ico-link {{
    width:38px; height:38px; display:flex; align-items:center; justify-content:center;
    border-radius:10px; text-decoration:none; position:relative; transition: 0.2s;
}}
.omni-ico-link:hover {{background: #f1f5f9;}}
.omni-ico-link i {{font-size:18px;}}
.omni-ico-link.active {{background: #f1f5f9; border: 1px solid #e2e8f0;}}

.omni-tip {{
    position:absolute; top:48px; left:50%; transform:translateX(-50%) translateY(-5px);
    background:#0f172a; color:#fff; padding:5px 10px; border-radius:6px;
    font-size:11px; white-space:nowrap; opacity:0; pointer-events:none; transition:0.2s;
}}
.omni-ico-link:hover .omni-tip {{opacity:1; transform:translateX(-50%) translateY(0);}}
.omni-divider {{width:1px; height:20px; background:#e2e8f0; margin:0 5px;}}
</style>

<div class="omni-topbar">
  <div class="omni-left">
    {logo_html}
    <div class="omni-title">OMNISFERA</div>
  </div>
  <div class="omni-right">
    {links}
    <div class="omni-divider"></div>
    <a class="omni-ico-link" href="?go=home">
      <i class="fi fi-sr-exit" style="color:#ef4444;"></i>
      <span class="omni-tip">Sair</span>
    </a>
  </div>
</div>
""",
        unsafe_allow_html=True,
    )
    _js_fix_top()
