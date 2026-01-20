# ui_nav.py
import streamlit as st

def render_topbar_nav():
    st.markdown("""
    <style>
      header[data-testid="stHeader"]{display:none !important;}
      [data-testid="stSidebar"]{display:none !important;}
      [data-testid="stSidebarNav"]{display:none !important;}
      .block-container{padding-top:76px !important;padding-left:2rem !important;padding-right:2rem !important;}
      .omni-topbar{
        position:fixed;top:0;left:0;right:0;height:58px;z-index:999999;
        background:#fff;border-bottom:1px solid #eee;
        display:flex;align-items:center;justify-content:space-between;padding:0 16px;
        font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;
      }
      .omni-left{display:flex;align-items:center;gap:10px;font-weight:900;letter-spacing:.6px}
      .omni-right{display:flex;align-items:center;gap:14px}
      .omni-a{text-decoration:none;font-size:20px;color:rgba(17,24,39,.45)}
      .omni-a.active{color:#111827}
    </style>

    <div class="omni-topbar">
      <div class="omni-left">OMNISFERA</div>
      <div class="omni-right">
        <a class="omni-a" href="?view=home" target="_self" title="Home">🏠</a>
        <a class="omni-a" href="?view=pei" target="_self" title="PEI">🧩</a>
        <a class="omni-a" href="?view=paee" target="_self" title="PAEE">📍</a>
        <a class="omni-a" href="?view=hub" target="_self" title="Hub">💡</a>
      </div>
    </div>
    """, unsafe_allow_html=True)
