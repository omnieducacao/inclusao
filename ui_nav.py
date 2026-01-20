import streamlit as st

# -----------------------------------------------------------------------------
# UI NAV — Topbar fina, ícones Flaticon UIcons (solid-rounded), cores por módulo
# -----------------------------------------------------------------------------

def _safe_get_query_view():
    try:
        qp = st.query_params
        if "view" in qp:
            return qp["view"]
    except Exception:
        pass
    return None

def _ensure_state():
    if "autenticado" not in st.session_state:
        st.session_state.autenticado = False
    if "view" not in st.session_state:
        st.session_state.view = "login" if not st.session_state.autenticado else "home"

def render_topbar_nav(active=None, hide_on_views=("login",)):
    """
    Topbar fina (fixed) + SPA view control.
    - Usa Flaticon UIcons (CDN)
    - Ícones sólidos com cor por módulo
    - Sem sidebar
    - Compatível com Python 3.9+ (sem typing 3.10)
    """

    _ensure_state()

    allowed = ("login","home","estudantes","pei","paee","hub","diario","mon","logout")

    # lê view do query param (se existir)
    v = _safe_get_query_view()
    if v in allowed:
        st.session_state.view = v

    # logout
    if st.session_state.view == "logout":
        st.session_state.autenticado = False
        st.session_state.view = "login"
        st.rerun()

    authed = bool(st.session_state.get("autenticado", False))
    view = st.session_state.get("view", "login")

    # esconde a barra em views específicas (ex.: login)
    if view in hide_on_views:
        return

    # se caller passar "active", força o estado visual (bom em multipage)
    view_active = active if (active in allowed) else view

    # cores por módulo (menos saturado, mais premium)
    COLORS = {
        "home":       "#111827",
        "estudantes": "#2563EB",
        "pei":        "#3B82F6",
        "paee":       "#22A765",
        "hub":        "#B45309",
        "diario":     "#C2410C",
        "mon":        "#7C3AED",
    }

    def icon_color(key):
        if key == view_active:
            return COLORS.get(key, "#111827")
        return "rgba(15,23,42,0.38)"

    # --- ÍCONES (garantir nomes válidos; fallback se algum sumir) ---
    ICON = {
        "home": '<i class="fi fi-sr-house-chimney-crack"></i>',
        "estudantes": '<i class="fi fi-sr-users-alt"></i>',
        "pei": '<i class="fi fi-sr-puzzle-alt"></i>',
        "paee": '<i class="fi fi-sr-track"></i>',
        "hub": '<i class="fi fi-sr-lightbulb-on"></i>',
        "diario": '<i class="fi fi-sr-compass-alt"></i>',
        "mon": '<i class="fi fi-sr-analyse"></i>',
        # logout: esse às vezes varia por pack, então deixo 2 opções com fallback
        "logout": '<i class="fi fi-sr-sign-out-alt"></i>',
    }
    # fallback simples se algum ícone não renderizar
    FALLBACK = {
        "home": "⌂",
        "estudantes": "👥",
        "pei": "🧩",
        "paee": "📍",
        "hub": "💡",
        "diario": "🧭",
        "mon": "📈",
        "logout": "⎋",
    }

    def icon_html(key):
        # retorna HTML do icon + fallback inline (o fallback só aparece se o font falhar)
        # técnica: coloca um <span class="fallback"> oculto, e ativa via CSS se a fonte falhar
        return f"""
<span class="fiwrap">{ICON.get(key, "")}</span>
<span class="fallback">{FALLBACK.get(key, "")}</span>
"""

    # CSS + pack
    st.markdown("""
<link rel="stylesheet" href="https://cdn-uicons.flaticon.com/uicons-solid-rounded/css/uicons-solid-rounded.css">
<style>
header[data-testid="stHeader"]{display:none !important;}
[data-testid="stSidebar"]{display:none !important;}
[data-testid="stSidebarNav"]{display:none !important;}
[data-testid="stToolbar"]{display:none !important;}

/* espaço para a topbar */
.block-container{
  padding-top:64px !important;
  padding-left:2rem !important;
  padding-right:2rem !important;
  padding-bottom:2rem !important;
}

.omni-topbar{
  position:fixed; top:0; left:0; right:0; height:52px;
  z-index:2147483647;
  display:flex; align-items:center; justify-content:space-between;
  padding:0 14px;
  background: rgba(248,250,252,0.86);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(226,232,240,0.9);
  box-shadow: 0 10px 28px rgba(15,23,42,0.06);
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
}

.omni-left{
  display:flex; align-items:center; gap:10px;
  min-width: 210px;
}
.omni-logo{
  width:26px; height:26px; border-radius:999px;
  background: conic-gradient(from 0deg, #3B82F6, #22A765, #B45309, #C2410C, #7C3AED, #3B82F6);
  animation: omniSpin 18s linear infinite;
  box-shadow: 0 10px 20px rgba(15,23,42,0.10);
}
@keyframes omniSpin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}

.omni-brand{
  font-weight: 950;
  letter-spacing: .10em;
  text-transform: uppercase;
  font-size: 12px;
  color:#0F172A;
}

.omni-right{
  display:flex; align-items:center; gap:10px;
}

/* botões ícone */
.omni-link{
  width:34px; height:34px;
  display:inline-flex; align-items:center; justify-content:center;
  border-radius: 12px;
  text-decoration:none !important;
  transition: transform .12s ease, background .12s ease, box-shadow .12s ease;
  background: rgba(255,255,255,0.65);
  border: 1px solid rgba(226,232,240,0.85);
}
.omni-link:hover{
  transform: translateY(-1px);
  background: rgba(255,255,255,0.92);
  box-shadow: 0 10px 18px rgba(15,23,42,0.08);
}

.omni-ic{
  font-size: 18px;
  line-height: 1;
  display:flex; align-items:center; justify-content:center;
}

/* fallback: fica escondido por padrão */
.fallback{display:none; font-size:18px; line-height:1;}

/* se o font não carregar, o <i> fica “sem largura”/invisível em alguns browsers.
   então mostramos o fallback sempre como segurança via :empty */
.fiwrap:empty + .fallback{display:inline-block;}
/* também se o <i> existir mas der bug, mantém fallback escondido */
.fiwrap{display:inline-flex; align-items:center; justify-content:center;}
.fiwrap i{display:inline-flex; align-items:center; justify-content:center;}

.omni-sep{
  width:1px; height:20px;
  background: rgba(226,232,240,0.9);
  margin: 0 2px;
}
</style>
""", unsafe_allow_html=True)

    if authed:
        st.markdown(
            f"""
<div class="omni-topbar">
  <div class="omni-left">
    <div class="omni-logo"></div>
    <div class="omni-brand">OMNISFERA</div>
  </div>

  <div class="omni-right">
    <a class="omni-link" href="?view=home" target="_self" title="Home">
      <span class="omni-ic" style="color:{icon_color('home')}">{icon_html('home')}</span>
    </a>

    <a class="omni-link" href="?view=estudantes" target="_self" title="Estudantes">
      <span class="omni-ic" style="color:{icon_color('estudantes')}">{icon_html('estudantes')}</span>
    </a>

    <a class="omni-link" href="?view=pei" target="_self" title="Estratégias & PEI">
      <span class="omni-ic" style="color:{icon_color('pei')}">{icon_html('pei')}</span>
    </a>

    <a class="omni-link" href="?view=paee" target="_self" title="Plano de Ação (PAEE)">
      <span class="omni-ic" style="color:{icon_color('paee')}">{icon_html('paee')}</span>
    </a>

    <a class="omni-link" href="?view=hub" target="_self" title="Hub de Recursos">
      <span class="omni-ic" style="color:{icon_color('hub')}">{icon_html('hub')}</span>
    </a>

    <a class="omni-link" href="?view=diario" target="_self" title="Diário de Bordo">
      <span class="omni-ic" style="color:{icon_color('diario')}">{icon_html('diario')}</span>
    </a>

    <a class="omni-link" href="?view=mon" target="_self" title="Evolução & Dados">
      <span class="omni-ic" style="color:{icon_color('mon')}">{icon_html('mon')}</span>
    </a>

    <span class="omni-sep"></span>

    <a class="omni-link" href="?view=logout" target="_self" title="Sair">
      <span class="omni-ic" style="color:rgba(15,23,42,0.55)">{icon_html('logout')}</span>
    </a>
  </div>
</div>
""",
            unsafe_allow_html=True,
        )
    else:
        st.markdown(
            """
<div class="omni-topbar">
  <div class="omni-left">
    <div class="omni-logo"></div>
    <div class="omni-brand">OMNISFERA</div>
  </div>
  <div class="omni-right"></div>
</div>
""",
            unsafe_allow_html=True,
        )
