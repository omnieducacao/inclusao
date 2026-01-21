import streamlit as st

def render_home():
    # Garante que o CSS básico esteja carregado
    st.markdown("""
    <style>
        .home-header {
            background: linear-gradient(135deg, #2563EB 0%, #1E40AF 100%);
            color: white;
            padding: 30px;
            border-radius: 16px;
            margin-bottom: 30px;
            box-shadow: 0 4px 15px rgba(37, 99, 235, 0.2);
        }
        .welcome-text { font-size: 1.8rem; font-weight: 800; }
        .workspace-tag { 
            background: rgba(255,255,255,0.2); 
            padding: 4px 12px; 
            border-radius: 20px; 
            font-size: 0.8rem; 
            font-weight: 600;
            display: inline-block;
            margin-top: 8px;
        }
        .module-card {
            background: white; border: 1px solid #E5E7EB;
            border-radius: 12px; padding: 20px;
            text-align: center;
            transition: all 0.2s;
            height: 100%;
            cursor: pointer;
        }
        .module-card:hover { transform: translateY(-3px); border-color: #2563EB; box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
        .card-icon { font-size: 2rem; margin-bottom: 10px; display: block; }
        .card-title { font-weight: 800; color: #1F2937; font-size: 1.1rem; margin-bottom: 5px; }
        .card-desc { color: #6B7280; font-size: 0.85rem; line-height: 1.4; }
    </style>
    """, unsafe_allow_html=True)

    # Dados da Sessão
    usuario = st.session_state.get("user", {"nome": "Visitante"})
    ws_name = st.session_state.get("workspace_name", "Ambiente Geral")

    # Header de Boas Vindas
    st.markdown(f"""
    <div class="home-header">
        <div class="welcome-text">Olá, {usuario['nome']}!</div>
        <div>Você está conectado como <b>{usuario.get('cargo', 'Educador')}</b>.</div>
        <div class="workspace-tag">🏢 {ws_name}</div>
    </div>
    """, unsafe_allow_html=True)

    # Grid de Navegação
    st.markdown("### 🚀 Módulos Disponíveis")
    
    c1, c2, c3 = st.columns(3)
    
    # Função auxiliar para desenhar cards
    def draw_card(col, icon, title, desc, page_path):
        with col:
            st.markdown(f"""
            <div class="module-card">
                <span class="card-icon">{icon}</span>
                <div class="card-title">{title}</div>
                <div class="card-desc">{desc}</div>
            </div>
            """, unsafe_allow_html=True)
            if st.button(f"Acessar {title}", key=f"btn_{title}", use_container_width=True):
                st.switch_page(page_path)

    draw_card(c1, "👥", "Alunos", "Gestão de cadastro e lista de estudantes.", "pages/0_Alunos.py")
    draw_card(c2, "🧠", "PEI 360º", "Criação de Planos Educacionais Individualizados.", "pages/1_PEI.py")
    draw_card(c3, "🧩", "PAEE", "Planejamento e Execução do Atendimento.", "pages/2_PAE.py")

    st.markdown("<div style='height:20px'></div>", unsafe_allow_html=True)
    
    c4, c5, c6 = st.columns(3)
    draw_card(c4, "📚", "Hub de Inclusão", "Recursos, adaptações e materiais.", "pages/3_Hub_Inclusao.py")
    draw_card(c5, "📝", "Diário de Bordo", "Registros diários e observações.", "pages/4_Diario_de_Bordo.py")
    draw_card(c6, "📊", "Monitoramento", "Análise de dados e evolução.", "pages/5_Monitoramento_Avaliacao.py")

    st.divider()
    
    if st.button("🔒 Sair do Workspace"):
        # Limpa sessão
        st.session_state.clear()
        st.rerun()
