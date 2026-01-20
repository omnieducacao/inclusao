import streamlit as st

TOPBAR_H = 56

def inject_icons():
    st.markdown("""
<link rel="stylesheet" href="https://cdn-uicons.flaticon.com/3.0.0/uicons-solid-rounded/css/uicons-solid-rounded.css">
<link rel="stylesheet" href="https://cdn-uicons.flaticon.com/3.0.0/uicons-bold-rounded/css/uicons-bold-rounded.css">
<link rel="stylesheet" href="https://cdn-uicons.flaticon.com/3.0.0/uicons-solid-straight/css/uicons-solid-straight.css">
""", unsafe_allow_html=True)


def inject_css():
    st.markdown(f"""
<style>
[data-testid="stHeader"], header {{ display: none !important; }}
#MainMenu {{ display: none !important; }}
footer {{ display: none !important; }}

.main .block-container {{
    padding-top: {TOPBAR_H + 12}px !important;
}}

.omni-topbar {{
    position: fixed;
    top: 0; left: 0; right: 0;
    height: {TOPBAR_H}px;
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 14px;
    background: rgba(12,12,14,.78);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255,255,255,.08);
}}

.omni-nav {{
    display: flex;
    gap: 10px;
}}

.nav-item {{
    width: 36px;
    height: 36px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.08);
    text-decoration: none;
}}

.nav-item i {{
    font-size: 18px;
    color: #fff;
}}
</style>
""", unsafe_allow_html=True)


def get_active():
    try:
        return st.query_params.get("go", "home")
    except Exception:
        return "home"


def render_topbar():
    active = get_active()

    def item(key, icon, label):
        active_cls = "active" if key == active else ""
        return f"""
<a class="nav-item {active_cls}" href="?go={key}" title="{label}">
  <i class="{icon}"></i>
</a>
"""

    st.markdown(f"""
<div class="omni-topbar">
  <div style="font-weight:700;color:white">Omnisfera</div>
  <div class="omni-nav">
    {item("home", "fi fi-br-home", "Home")}
    {item("alunos", "fi fi-sr-users", "Alunos")}
    {item("pei", "fi fi-sr-document-signed", "PEI")}
    {item("pae", "fi fi-ss-bullseye-arrow", "PAE")}
    {item("hub", "fi fi-sr-book-open-cover", "Hub")}
  </div>
</div>
""", unsafe_allow_html=True)


def load_ui():
    inject_icons()
    inject_css()
    render_topbar()
