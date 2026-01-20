# ui_nav.py
import streamlit as st
import os, base64

def render_omnisfera_nav():

    # -------------------------------
    # 1. Logo
    # -------------------------------
    def get_logo_base64():
        caminhos = ["omni_icone.png", "logo.png", "iconeaba.png", "omni.png", "ominisfera.png"]
        for c in caminhos:
            if os.path.exists(c):
                with open(c, "rb") as f:
                    return f"data:image/png;base64,{base64.b64encode(f.read()).decode()}"
        return "https://cdn-icons-png.flaticon.com/512/1183/1183672.png"

    src_logo = get_logo_base64()

    # -------------------------------
    # 2. Rotas (mapa real)
    # -------------------------------
    ROUTES = {
        "home":   "Home.py",
        "pei":    "pages/1_PEI.py",
        "paee":   "pages/2_PAE.py",
        "hub":    "pages/3_Hub_Inclusao.py",
        "diario": "pages/4_Diario_de_Bordo.py",
        "mon":    "pages/5_Monitoramento_Avaliacao.py",
    }

    # -------------------------------
    # 3. Escuta navegação (?go=)
    # -------------------------------
    params = st.query_params
    if "go" in params:
        destino = params["go"]
        if destino in ROUTES:
            st.query_params.clear()
            st.switch_page(ROUTES[destino])

    # -------------------------------
    # 4. UI (HTML REAL)
    # -------------------------------
    st.markdown(f"""
    <link href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css" rel="stylesheet">

    <style>
    .omni-pill {{
      position: fixed;
      top: 14px;
      right: 14px;
      z-index: 999999;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-radius: 999px;
      background: rgba(255,255,255,0.82);
      border: 1px solid rgba(255,255,255,0.55);
      backdrop-filter: blur(10px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.12);
    }}

    @keyframes spin-slow {{
      from {{ transform: rotate(0deg); }}
      to {{ transform: rotate(360deg); }}
    }}

    .omni-logo {{
      width: 28px;
      height: 28px;
      animation: spin-slow 10s linear infinite;
    }}

    .omni-sep {{
      width: 1px;
      height: 22px;
      background: rgba(148,163,184,0.55);
      margin: 0 4px;
    }}

    .omni-nav {{
      display: flex;
      align-items: center;
      gap: 8px;
    }}

    .omni-btn {{
      width: 34px;
      height: 34px;
      border-radius: 999px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      background: rgba(255,255,255,0.9);
      border: 1px solid rgba(226,232,240,0.9);
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
      transition: transform .12s ease, box-shadow .12s ease;
    }}

    .omni-btn:hover {{
      transform: translateY(-1px);
      box-shadow: 0 10px 22px rgba(0,0,0,0.12);
    }}

    .omni-ic {{
      font-size: 18px;
    }}
    </style>

    <div class="omni-pill">
        <img src="{src_logo}" class="omni-logo" />

        <div class="omni-sep"></div>

        <div class="omni-nav">
            <a class="omni-btn" href="?go=home"   title="Home">
                <i class="ri-home-5-fill omni-ic" style="color:#111827"></i>
            </a>
            <a class="omni-btn" href="?go=pei"    title="Estratégias & PEI">
                <i class="ri-puzzle-2-fill omni-ic" style="color:#3B82F6"></i>
            </a>
            <a class="omni-btn" href="?go=paee"   title="Plano de Ação (PAEE)">
                <i class="ri-map-pin-2-fill omni-ic" style="color:#22C55E"></i>
            </a>
            <a class="omni-btn" href="?go=hub"    title="Hub de Recursos">
                <i class="ri-lightbulb-flash-fill omni-ic" style="color:#F59E0B"></i>
            </a>
            <a class="omni-btn" href="?go=diario" title="Diário de Bordo">
                <i class="ri-compass-3-fill omni-ic" style="color:#F97316"></i>
            </a>
            <a class="omni-btn" href="?go=mon"    title="Evolução & Acompanhamento">
                <i class="ri-line-chart-fill omni-ic" style="color:#A855F7"></i>
            </a>
        </div>
    </div>
    """, unsafe_allow_html=True)
