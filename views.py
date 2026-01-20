import streamlit as st

def render_home():
    user = st.session_state.user or {}
    email = user.get("email", "—")

    st.markdown("""
    <style>
    .home-header{ margin: 10px 0 10px 0; }
    .home-header .t{ font-size: 20px; font-weight: 900; color: rgba(0,0,0,0.78); }
    .home-header .s{ margin-top: 4px; color: rgba(0,0,0,0.50); font-size: 13px; }
    .kpi-row{ display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap:12px; margin: 12px 0 14px 0; }
    .kpi{ border-radius: 18px; padding: 14px; border: 1px solid rgba(0,0,0,0.08);
          background: rgba(255,255,255,0.70); backdrop-filter: blur(10px);}
    .kpi .label{ font-size: 12px; color: rgba(0,0,0,0.50); }
    .kpi .value{ font-size: 22px; font-weight: 900; margin-top: 6px; color: rgba(0,0,0,0.78); }
    .cards{ display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap:12px; margin-top: 10px; }
    .card{ border-radius: 22px; padding: 16px; border: 1px solid rgba(0,0,0,0.08);
           background: rgba(255,255,255,0.72); backdrop-filter: blur(10px);
           transition: transform .12s ease, box-shadow .12s ease; }
    .card:hover{ transform: translateY(-2px); box-shadow: 0 12px 34px rgba(0,0,0,0.10); }
    .card .top{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom: 10px; }
    .badge{ width: 40px; height: 40px; border-radius: 14px; display:flex; align-items:center; justify-content:center;
            border: 1px solid rgba(0,0,0,0.10); background: rgba(0,0,0,0.03); font-size: 18px; }
    .card h3{ margin: 0; font-size: 16px; font-weight: 900; color: rgba(0,0,0,0.78); }
    .card p{ margin: 8px 0 12px 0; font-size: 13px; color: rgba(0,0,0,0.56); line-height: 1.35; }
    .small{ margin-top: 8px; color: rgba(0,0,0,0.42); font-size: 12px; }
    @media (max-width: 1000px){ .kpi-row{ grid-template-columns: repeat(2, minmax(0,1fr)); } .cards{ grid-template-columns: 1fr; } }
    </style>
    """, unsafe_allow_html=True)

    st.markdown(f"""
    <div class="home-header">
      <div class="t">Central</div>
      <div class="s">Logado como <b>{email}</b> · Acesso rápido aos módulos.</div>
    </div>
    """, unsafe_allow_html=True)

    if st.button("Sair"):
        st.session_state.autenticado = False
        st.session_state.user = None
        st.session_state.go = "home"
        st.rerun()

    st.markdown("""
    <div class="kpi-row">
      <div class="kpi"><div class="label">Alunos na nuvem</div><div class="value">—</div></div>
      <div class="kpi"><div class="label">PEIs ativos</div><div class="value">—</div></div>
      <div class="kpi"><div class="label">Evidências</div><div class="value">—</div></div>
      <div class="kpi"><div class="label">Atualizações hoje</div><div class="value">—</div></div>
    </div>
    """, unsafe_allow_html=True)

    # Cards SPA: mudam st.session_state.go (não navegam)
    def card(title, desc, emoji, go):
        return f"""
        <div class="card">
          <div class="top">
            <div class="badge">{emoji}</div>
          </div>
          <h3>{title}</h3>
          <p>{desc}</p>
          <div class="small">Clique no botão abaixo</div>
        </div>
        """

    st.markdown('<div class="cards">', unsafe_allow_html=True)
    c1, c2, c3 = st.columns(3)
    with c1:
        st.markdown(card("Alunos", "Gerencie alunos e sincronização.", "👥", "alunos"), unsafe_allow_html=True)
        if st.button("Abrir Alunos →"):
            st.session_state.go = "alunos"
            st.rerun()
    with c2:
        st.markdown(card("PEI 360°", "Plano Educacional Individual.", "🧠", "pei"), unsafe_allow_html=True)
        if st.button("Abrir PEI →"):
            st.session_state.go = "pei"
            st.rerun()
    with c3:
        st.markdown(card("PAE", "Plano de Apoio Educacional.", "🎯", "pae"), unsafe_allow_html=True)
        if st.button("Abrir PAE →"):
            st.session_state.go = "pae"
            st.rerun()
    st.markdown("</div>", unsafe_allow_html=True)


def render_stub(title: str, subtitle: str = ""):
    st.markdown(f"## {title}")
    if subtitle:
        st.caption(subtitle)
    st.info("Conteúdo será plugado aqui, mantendo tudo no mesmo app e sessão.")


def render_alunos():
    render_stub("Alunos", "Aqui entra a gestão: carregar JSON, listar Supabase, excluir, etc.")


def render_pei():
    render_stub("PEI 360°", "Aqui entra o PEI completo, sem perder estado ao navegar.")


def render_pae():
    render_stub("PAE", "Aqui entra o PAE completo.")


def render_hub():
    render_stub("Hub de Inclusão", "Aqui entra o Hub.")
