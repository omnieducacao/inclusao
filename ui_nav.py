# ui_nav.py
import streamlit as st
import os
import base64

# ==============================================================================
# 1. CONFIGURAÇÃO DOS ÍCONES E CORES
# ==============================================================================
# Definimos aqui os CDNs exatos que você pediu para garantir que os ícones carreguem
FLATICON_CSS = """
<link rel='stylesheet' href='https://cdn-uicons.flaticon.com/3.0.0/uicons-bold-rounded/css/uicons-bold-rounded.css'>
<link rel='stylesheet' href='https://cdn-uicons.flaticon.com/3.0.0/uicons-solid-rounded/css/uicons-solid-rounded.css'>
<link rel='stylesheet' href='https://cdn-uicons.flaticon.com/3.0.0/uicons-solid-straight/css/uicons-solid-straight.css'>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
"""

# Configuração de cada botão (Chave, Rótulo, Ícone, Cor, Biblioteca)
# Ajustei os nomes das classes (fi-br, fi-sr, fi-ss) para bater com as bibliotecas que você pediu.
NAV_ITEMS = [
    {
        "key": "home",
        "label": "Home",
        "icon": "fi fi-br-home",  # Bold Rounded
        "color": "#1F2937"        # Cinza Escuro
    },
    {
        "key": "pei",
        "label": "Estratégias & PEI",
        "icon": "fi fi-sr-chess-piece", # Solid Rounded (Estratégia)
        "color": "#3B82F6"              # Azul
    },
    {
        "key": "paee",
        "label": "Plano de Ação",
        "icon": "fi fi-ss-rocket-lunch", # Solid Straight (Ação/Foguete)
        "color": "#10B981"               # Verde
    },
    {
        "key": "hub",
        "label": "Hub de Recursos",
        "icon": "fi fi-sr-apps",      # Solid Rounded (Hub/Recursos)
        "color": "#F59E0B"            # Amarelo/Laranja
    },
    {
        "key": "diario",
        "label": "Diário de Bordo",
        "icon": "fi fi-br-book-alt",  # Bold Rounded
        "color": "#F97316"            # Laranja
    },
    {
        "key": "mon",
        "label": "Evolução & Dados",
        "icon": "fi fi-br-chart-histogram", # Bold Rounded
        "color": "#8B5CF6"                  # Roxo
    }
]

# ==============================================================================
# 2. FUNÇÕES AUXILIARES
# ==============================================================================
def _get_image_b64(path: str) -> str:
    """Carrega a logo e converte para Base64 para usar no HTML."""
    if not os.path.exists(path):
        return ""
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()

def _get_current_view():
    """Descobre qual aba está ativa lendo a URL (?view=...)"""
    try:
        qp = st.query_params
        return qp.get("view", "home")
    except:
        return "home"

# ==============================================================================
# 3. RENDERIZAÇÃO DA BARRA (TOPBAR)
# ==============================================================================
def render_topbar_nav():
    """
    Renderiza a barra de navegação superior fixa.
    """
    
    # 1. Esconde a Sidebar padrão e o Header padrão do Streamlit
    st.markdown("""
        <style>
            [data-testid="stSidebar"] {display: none !important;}
            [data-testid="stHeader"] {display: none !important;}
            .block-container {
                padding-top: 80px !important; /* Espaço para a barra não cobrir o conteúdo */
            }
        </style>
    """, unsafe_allow_html=True)

    # 2. Prepara os dados
    active_view = _get_current_view()
    logo_b64 = _get_image_b64("omni_icone.png") # Certifique-se que o arquivo existe
    
    # Logo HTML (Giratória)
    if logo_b64:
        logo_html = f'<img class="nav-logo-spin" src="data:image/png;base64,{logo_b64}">'
    else:
        logo_html = '<div class="nav-logo-fallback"></div>'

    # 3. Constrói os Links (Botões)
    links_html = ""
    for item in NAV_ITEMS:
        is_active = (item["key"] == active_view)
        active_class = "active" if is_active else ""
        
        # A lógica de clique é via URL parameter (?view=key) que recarrega a página
        links_html += f"""
        <a class="nav-item {active_class}" href="?view={item['key']}" target="_self">
            <i class="{item['icon']}" style="color: {item['color']};"></i>
            <span class="nav-label">{item['label']}</span>
        </a>
        """

    # 4. HTML & CSS Completo
    st.markdown(f"""
    {FLATICON_CSS}
    <style>
        /* Container Principal da Barra */
        .omni-navbar {{
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 60px;
            background-color: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid #E5E7EB;
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 24px;
            font-family: 'Inter', sans-serif;
            box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        }}

        /* Lado Esquerdo: Logo + Texto */
        .nav-left {{
            display: flex;
            align-items: center;
            gap: 12px;
        }}
        
        .nav-logo-spin {{
            height: 32px;
            width: 32px;
            animation: spin 30s linear infinite;
        }}
        
        .nav-brand-text {{
            font-size: 18px;
            font-weight: 800;
            color: #1F2937;
            letter-spacing: -0.5px;
            text-transform: uppercase;
        }}

        @keyframes spin {{ 100% {{ transform: rotate(360deg); }} }}

        /* Lado Direito: Itens de Menu */
        .nav-right {{
            display: flex;
            align-items: center;
            gap: 20px; /* Espaço entre os ícones */
        }}

        .nav-item {{
            text-decoration: none;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            padding: 4px 8px;
            transition: all 0.2s ease;
            opacity: 0.7; /* Leve transparência quando inativo */
        }}

        .nav-item:hover {{
            opacity: 1;
            transform: translateY(-2px);
        }}

        .nav-item i {{
            font-size: 20px; /* Tamanho do ícone */
            margin-bottom: 2px;
        }}

        .nav-label {{
            font-size: 10px;
            font-weight: 600;
            color: #6B7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}

        /* Estado Ativo (Página Atual) */
        .nav-item.active {{
            opacity: 1;
        }}
        
        .nav-item.active .nav-label {{
            color: #111827;
            font-weight: 800;
        }}
        
        /* Pequeno indicador abaixo do item ativo */
        .nav-item.active::after {{
            content: '';
            display: block;
            width: 4px;
            height: 4px;
            background-color: #111827;
            border-radius: 50%;
            margin-top: 2px;
        }}

        /* Responsividade para telas pequenas */
        @media (max-width: 768px) {{
            .nav-label {{ display: none; }} /* Esconde texto no mobile */
            .nav-right {{ gap: 15px; }}
            .nav-brand-text {{ display: none; }} /* Esconde nome Omnisfera se ficar apertado */
        }}

    </style>

    <div class="omni-navbar">
        <div class="nav-left">
            {logo_html}
            <div class="nav-brand-text">Omnisfera</div>
        </div>
        <div class="nav-right">
            {links_html}
        </div>
    </div>
    """, unsafe_allow_html=True)

    return active_view
