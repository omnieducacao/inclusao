import streamlit as st
import os, base64

def get_logo_base64():
    caminhos = ["omni_icone.png", "logo.png", "iconeaba.png", "omni.png", "ominisfera.png"]
    for c in caminhos:
        if os.path.exists(c):
            with open(c, "rb") as f:
                return f"data:image/png;base64,{base64.b64encode(f.read()).decode()}"
    return "https://cdn-icons-png.flaticon.com/512/1183/1183672.png"

src_logo = get_logo_base64()

# Mapeamento de páginas (arquivos reais)
NAV = [
    {"key":"home",  "label":"Home",                     "icon":"ri-home-5-fill",          "color":"#111827", "target":"Home.py"},
    {"key":"pei",   "label":"Estratégias & PEI",        "icon":"ri-puzzle-2-fill",        "color":"#3B82F6", "target":"pages/1_PEI.py"},
    {"key":"paee",  "label":"Plano de Ação (PAEE)",     "icon":"ri-map-pin-2-fill",       "color":"#22C55E", "target":"pages/2_PAE.py"},
    {"key":"hub",   "label":"Hub de Recursos",          "icon":"ri-lightbulb-flash-fill", "color":"#F59E0B", "target":"pages/3_Hub_Inclusao.py"},
    {"key":"diario","label":"Diário de Bordo",          "icon":"ri-compass-3-fill",       "color":"#F97316", "target":"pages/4_Diario_de_Bordo.py"},
    {"key":"mon",   "label":"Evolução & Acompanhamento","icon":"ri-line-chart-fill",      "color":"#A855F7", "target":"pages/5_Monitoramento_Avaliacao.py"},
]

# CSS + estrutura visual do topo
st.markdown(f"""
<link href="https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css" rel="stylesheet">
<style>
/* Pílula */
.omni-pill {{
  position: fixed;
  top: 14px;
  right: 14px;
  z-index: 999999;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.82);
  border: 1px solid rgba(255,255,255,0.55);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.12);
}}

/* Logo */
@keyframes spin-slow {{ from {{ transform: rotate(0deg); }} to {{ transform: rotate(360deg); }} }}
.omni-logo {{
  width: 28px; height: 28px;
  animation: spin-slow 10s linear infinite;
}}

/* Separador */
.omni-sep {{
  width: 1px; height: 22px;
  background: rgba(148,163,184,0.55);
  margin: 0 2px;
}}

/* Botões (estilo de ícone) */
.omni-nav {{
  display: flex;
  align-items: center;
  gap: 8px;
}}

.omni-icon-btn {{
  width: 34px;
  height: 34px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(226,232,240,0.9);
  background: rgba(255,255,255,0.92);
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  transition: transform .12s ease, box-shadow .12s ease, filter .12s ease;
  cursor: pointer;
}}
.omni-icon-btn:hover {{
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(0,0,0,0.12);
  filter: brightness(1.02);
}}
.omni-ic {{
  font-size: 18px;
  line-height: 1;
}}

/* Tooltip minimal */
.omni-tip {{ position: relative; }}
.omni-tip:hover::after {{
  content: attr(data-tip);
  position: absolute;
  right: 0;
  top: 44px;
  white-space: nowrap;
  font-family: ui-sans-serif, system-ui, -apple-system, "Nunito", sans-serif;
  font-size: 12px;
  font-weight: 800;
  color: #0f172a;
  background: rgba(255,255,255,0.92);
  border: 1px solid rgba(226,232,240,0.9);
  border-radius: 999px;
  padding: 6px 10px;
  box-shadow: 0 12px 24px rgba(0,0,0,0.12);
}}

/* --- Hack: estilizar os st.button que ficam "em cima" dos ícones --- */
.omni-btn-row [data-testid="stButton"] button {{
  width: 34px !important;
  height: 34px !important;
  border-radius: 999px !important;
  padding: 0 !important;
  border: 1px solid rgba(226,232,240,0.9) !important;
  background: rgba(255,255,255,0.92) !important;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06) !important;
}}
.omni-btn-row [data-testid="stButton"] button:hover {{
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(0,0,0,0.12) !important;
}}
/* remove texto do botão */
.omni-btn-row [data-testid="stButton"] button p {{
  display:none !important;
}}
</style>
""", unsafe_allow_html=True)

# Container fixo (HTML)
st.markdown(f"""
<div class="omni-pill">
  <img src="{src_logo}" class="omni-logo" />
  <div class="omni-sep"></div>
  <div class="omni-nav" id="omni-nav-slot"></div>
</div>
""", unsafe_allow_html=True)

# Agora colocamos os botões reais do Streamlit "no topo direito" com o mesmo layout
# (Eles ficam no fluxo normal da página, mas o CSS acima deixa visual idêntico e pequeno.)
with st.container():
    st.markdown('<div class="omni-btn-row">', unsafe_allow_html=True)
    cols = st.columns([1,1,1,1,1,1], gap="small")
    for i, item in enumerate(NAV):
        with cols[i]:
            if st.button(" ", key=f"nav_{item['key']}", help=item["label"]):
                st.switch_page(item["target"])
            # desenha o ícone em cima do botão (visual)
            st.markdown(
                f"<div class='omni-tip omni-icon-btn' data-tip='{item['label']}' style='margin-top:-34px;'>"
                f"<i class='ri {item['icon']} omni-ic' style='color:{item['color']}'></i>"
                f"</div>",
                unsafe_allow_html=True
            )
    st.markdown('</div>', unsafe_allow_html=True)
