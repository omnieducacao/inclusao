# ui_nav.py
import streamlit as st
import os, base64


def render_omnisfera_nav():
    """
    Omnisfera — Pílula flutuante (topo direito) com logo girando + mini-menu por páginas.
    Navegação via query param (?go=...) + st.switch_page (robusto no Streamlit Cloud).
    """

    # -------------------------------
    # Rotas reais do seu projeto
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
    # Navegação: escuta ?go=
    # -------------------------------
    qp = st.query_params
    if "go" in qp:
        dest = qp["go"]
        if dest in ROUTES:
            st.query_params.clear()
            st.switch_page(ROUTES[dest])

    # -------------------------------
    # Logo (base64)
    # -------------------------------
    def logo_src():
        for f in ["omni_icone.png", "logo.png", "iconeaba.png", "omni.png", "ominisfera.png"]:
            if os.path.exists(f):
                with open(f, "rb") as img:
                    return f"data:image/png;base64,{base64.b64encode(img.read()).decode()}"
        return "https://cdn-icons-png.flaticon.com/512/1183/1183672.png"

    src = logo_src()

    # -------------------------------
    # UI (branco sólido)
    # -------------------------------
    st.markdown(f"""
    <style>
    /* PÍLULA FLOTUANTE */
    .omni-pill {{
      position: fixed;
      top: 14px;
      right: 14px;
      z-index: 99999;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-radius: 999px;

      /* ✅ fundo branco sólido */
      background: #FFFFFF;

      /* separação sutil */
      border: 1px solid #E5E7EB;

      /* sombra premium */
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }}

    /* Logo girando */
    .omni-logo {{
      width: 26px;
      height: 26px;
      animation: spin 10s linear infinite;
    }}
    @keyframes spin {{
      from {{ transform: rotate(0deg); }}
      to {{ transform: rotate(360deg); }}
    }}

    /* Botões */
    .omni-btn {{
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none !important;

      background: #FFFFFF;
      border: 1px solid #E5E7EB;

      font-size: 15px;
      font-weight: 800;
      line-height: 1;

      transition: transform .12s ease, box-shadow .12s ease, filter .12s ease;
    }}

    .omni-btn:hover {{
      transform: translateY(-1px);
      box-shadow: 0 10px 22px rgba(0,0,0,0.12);
      filter: brightness(1.01);
    }}
    </style>

    <div class="omni-pill" aria-label="Omnisfera navigation">
      <img src="{src}" class="omni-logo" alt="Omnisfera">
      <a class="omni-btn" href="?go=home"   title="Home">🏠</a>
      <a class="omni-btn" href="?go=pei"    title="Estratégias & PEI">🧩</a>
      <a class="omni-btn" href="?go=paee"   title="Plano de Ação (PAEE)">📍</a>
      <a class="omni-btn" href="?go=hub"    title="Hub de Recursos">💡</a>
      <a class="omni-btn" href="?go=diario" title="Diário de Bordo">🧭</a>
      <a class="omni-btn" href="?go=mon"    title="Evolução & Acompanhamento">📈</a>
    </div>
    """, unsafe_allow_html=True)
