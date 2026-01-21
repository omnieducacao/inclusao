import streamlit as st
from ui_nav import boot_ui, ensure_auth_state, nav_href

# -----------------------------------------------------------------------------
# PAGE CONFIG
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="Omnisfera",
    page_icon="🌿",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# -----------------------------------------------------------------------------
# BOOT UI
# -----------------------------------------------------------------------------
ensure_auth_state()
boot_ui()


# -----------------------------------------------------------------------------
# STYLES (HOME)
# -----------------------------------------------------------------------------
def _home_css():
    st.markdown(
        """
<style>
.omni-wrap{ max-width: 1180px; margin: 0 auto; }

.omni-hero{
  display:flex; align-items:center; justify-content:space-between;
  padding: 22px 18px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(17,24,39,0.96), rgba(17,24,39,0.84));
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 20px 40px rgba(0,0,0,0.12);
  color: white;
  margin-bottom: 18px;
}

.omni-title{ font-size: 22px; font-weight: 800; margin:0; }
.omni-sub{ opacity: 0.9; margin-top: 6px; }

.omni-grid{
  display:grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
@media (max-width: 1100px){
  .omni-grid{ grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px){
  .omni-grid{ grid-template-columns: 1fr; }
}

.omni-card{
  padding: 16px;
  border-radius: 18px;
  background: rgba(255,255,255,0.9);
  border: 1px solid rgba(0,0,0,0.06);
  box-shadow: 0 14px 30px rgba(0,0,0,0.08);
  transition: transform .15s ease, box-shadow .15s ease;
}
.omni-card:hover{
  transform: translateY(-2px);
  box-shadow: 0 22px 45px rgba(0,0,0,0.12);
}

.omni-badge{
  width: 40px; height: 40px;
  border-radius: 14px;
  display:flex; align-items:center; justify-content:center;
  border: 1px solid rgba(0,0,0,0.06);
  background: rgba(0,0,0,0.02);
  margin-bottom: 10px;
}
.omni-badge i{ font-size: 18px; }

.omni-card-title{ font-weight: 800; font-size: 16px; margin: 0; color:#111827; }
.omni-card-desc{ font-size: 13px; color: rgba(17,24,39,0.68); margin-top: 6px; min-height: 40px; }

.omni-cta{
  display:inline-flex;
  align-items:center;
  gap: 8px;
  margin-top: 14px;
  text-decoration: none !important;
  font-weight: 700;
  color: #111827;
}
.omni-cta span{ opacity: .6; }

.omni-login{
  max-width: 520px;
  margin: 0 auto;
  padding: 22px;
  border-radius: 18px;
  background: rgba(255,255,255,0.92);
  border: 1px solid rgba(0,0,0,0.06);
  box-shadow: 0 18px 36px rgba(0,0,0,0.10);
}
</style>
        """,
        unsafe_allow_html=True,
    )


# -----------------------------------------------------------------------------
# LOGIN
# -----------------------------------------------------------------------------
def render_login():
    _home_css()
    st.markdown("<div class='omni-wrap'>", unsafe_allow_html=True)

    st.markdown(
        """
        <div class="omni-hero">
          <div>
            <div class="omni-title">Acesse o Omnisfera</div>
            <div class="omni-sub">Entre para continuar.</div>
          </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.markdown("<div class='omni-login'>", unsafe_allow_html=True)

    with st.form("login", clear_on_submit=False):
        email = st.text_input("E-mail", placeholder="demo@omnisfera.net")
        senha = st.text_input("Senha", type="password", placeholder="••••••••")
        ok = st.form_submit_button("Entrar")

    if ok:
        if email.strip() and senha.strip():
            nome = email.strip().split("@")[0]
            st.session_state.autenticado = True
            st.session_state.user = {
                "email": email.strip(),
                "nome": nome,
                "cargo": "Usuário",
            }
            # compatibilidade legado
            st.session_state["usuario_nome"] = st.session_state.user["nome"]
            st.session_state["usuario_cargo"] = st.session_state.user["cargo"]
            st.rerun()
        else:
            st.error("Preencha e-mail e senha.")

    st.markdown("</div>", unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)


# -----------------------------------------------------------------------------
# HOME
# -----------------------------------------------------------------------------
def _card(title: str, desc: str, go_key: str, ico_class: str, color: str, cta: str):
    return f"""
<div class="omni-card">
  <div class="omni-badge"><i class="{ico_class}" style="color:{color}"></i></div>
  <div class="omni-card-title">{title}</div>
  <div class="omni-card-desc">{desc}</div>
  <a class="omni-cta" href="{nav_href(go_key)}">
    {cta} <span>→</span>
  </a>
</div>
"""


def render_home():
    _home_css()
    user = st.session_state.get("user") or {}
    email = user.get("email") or "—"
    nome = user.get("nome") or "Usuário"

    st.markdown("<div class='omni-wrap'>", unsafe_allow_html=True)

    st.markdown(
        f"""
        <div class="omni-hero">
          <div>
            <div class="omni-title">Bem-vindo, {nome}</div>
            <div class="omni-sub">Sessão ativa: <b>{email}</b></div>
          </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.markdown("<div class='omni-grid'>", unsafe_allow_html=True)

    st.markdown(
        _card(
            "Alunos",
            "Gestão central de estudantes e vínculo com PEIs.",
            "alunos",
            "fi fi-br-users",
            "#2563EB",
            "Abrir lista",
        ),
        unsafe_allow_html=True,
    )

    st.markdown(
        _card(
            "PEI 360º",
            "Planejamento Educacional Individualizado com evidências e rubricas.",
            "pei",
            "fi fi-br-brain",
            "#7C3AED",
            "Abrir PEI",
        ),
        unsafe_allow_html=True,
    )

    st.markdown(
        _card(
            "PAE / Plano de Ação",
            "Plano estruturado e acompanhamento por etapas.",
            "pae",
            "fi fi-br-bullseye",
            "#F97316",
            "Abrir PAE",
        ),
        unsafe_allow_html=True,
    )

    st.markdown(
        _card(
            "Hub Inclusão",
            "Recursos, adaptações e estratégias inclusivas.",
            "hub",
            "fi fi-br-book-open-cover",
            "#16A34A",
            "Abrir Hub",
        ),
        unsafe_allow_html=True,
    )

    st.markdown(
        _card(
            "Diário de Bordo",
            "Registro de rotinas, eventos e intervenções.",
            "diario",
            "fi fi-br-notebook",
            "#0EA5E9",
            "Abrir Diário",
        ),
        unsafe_allow_html=True,
    )

    st.markdown(
        _card(
            "Evolução & Dados",
            "Monitoramento, métricas e indicadores pedagógicos.",
            "dados",
            "fi fi-br-chart-histogram",
            "#111827",
            "Abrir Dados",
        ),
        unsafe_allow_html=True,
    )

    st.markdown("</div>", unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)
    if st.button("🔒 Sair", use_container_width=False):
        st.session_state.autenticado = False
        st.session_state.user = {"email": None, "nome": None, "cargo": None}
        st.session_state["usuario_nome"] = None
        st.session_state["usuario_cargo"] = None
        st.rerun()

    st.markdown("</div>", unsafe_allow_html=True)


# -----------------------------------------------------------------------------
# MAIN
# -----------------------------------------------------------------------------
if not st.session_state.get("autenticado"):
    render_login()
else:
    render_home()
