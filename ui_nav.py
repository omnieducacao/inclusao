def render_topbar_nav(
    active: str | None = None,
    show_on_login: bool = True,
    height_px: int = 54,
    hide_on_views: tuple[str, ...] = ("home",),  # 👈 HOME sem menu
):
    """
    Barra superior fina, full-width, discreta.
    Navegação: links (?view=...) + roteamento no Python.
    Retorna: view ativa (str)
    """

    authed = bool(st.session_state.get("autenticado", True))
    if (not authed) and (not show_on_login):
        return None

    if "view" not in st.session_state:
        st.session_state.view = "home"

    # query param manda
    qv = _get_view_from_query(st.session_state.view)
    st.session_state.view = qv
    active = active or qv

    # ✅ Se estiver em HOME, NÃO renderiza a topbar
    if active in hide_on_views:
        return active

    # logo
    logo_b64 = _b64("omni_icone.png")
    if logo_b64:
        logo_html = f'<img class="omni-spin" src="data:image/png;base64,{logo_b64}" alt="Omnisfera" />'
    else:
        logo_html = '<div class="omni-mark-fallback" aria-label="Omnisfera"></div>'

    # links
    links_html = ""
    for key, label in NAV_ITEMS:
        ic = ICONS.get(key, "fi fi-br-circle")
        color = COLORS.get(key, "#0F172A")
        cls = "omni-link active" if key == active else "omni-link"
        links_html += f"""
<a class="{cls}" href="?view={key}" target="_self">
  <i class="{ic} omni-ic" style="color:{color};"></i>
  <span class="omni-lbl">{label}</span>
</a>
"""

    logout_html = f"""
<a class="omni-link omni-logout" href="?logout=1" target="_self">
  <i class="{ICONS['logout']} omni-ic" style="color:rgba(15,23,42,0.55);"></i>
  <span class="omni-lbl">Sair</span>
</a>
"""

    st.markdown(
        f"""
{FLATICON_CSS}
<style>
header[data-testid="stHeader"]{{display:none !important;}}
[data-testid="stSidebar"]{{display:none !important;}}
[data-testid="stSidebarNav"]{{display:none !important;}}
[data-testid="stToolbar"]{{display:none !important;}}

.block-container{{
  padding-top: {height_px + 22}px !important;
  padding-left: 2rem !important;
  padding-right: 2rem !important;
}}

@keyframes spin{{from{{transform:rotate(0deg);}}to{{transform:rotate(360deg);}}}}

.omni-topbar{{
  position:fixed; top:0; left:0; right:0;
  height:{height_px}px;
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
  text-decoration:none !important;
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
.omni-divider{{width:1px; height: 26px; background: rgba(226,232,240,1); margin: 0 2px;}}
.omni-logout .omni-lbl{{color: rgba(15,23,42,0.40);}}

@media (max-width: 980px){{
  .omni-sub{{display:none;}}
  .omni-lbl{{display:none;}}
  .omni-right{{gap:10px;}}
  .block-container{{padding-top: {height_px + 18}px !important;}}
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
    <div class="omni-divider"></div>
    {logout_html}
  </div>
</div>
        """,
        unsafe_allow_html=True,
    )

    # logout via query param
    try:
        qp = st.query_params
        lg = qp.get("logout", None)
        if isinstance(lg, list):
            lg = lg[0] if lg else None
        if lg == "1":
            if "autenticado" in st.session_state:
                st.session_state.autenticado = False
            st.query_params.clear()
            st.query_params["view"] = "home"
            st.session_state.view = "home"
            st.rerun()
    except Exception:
        pass

    return active
