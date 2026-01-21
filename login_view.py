# login_view.py
import os
import base64
from datetime import datetime
import streamlit as st

from supabase_client import rpc_workspace_from_pin, RPC_NAME


# ------------------------------------------------------------------------------
# Helpers de ambiente
# ------------------------------------------------------------------------------
def _get_env_flag() -> str:
    try:
        v = st.secrets.get("ENV", None)
        if v:
            return str(v).strip().upper()
    except Exception:
        pass
    return str(os.getenv("ENV", "")).strip().upper()


def maybe_hide_streamlit_chrome():
    if _get_env_flag() == "TESTE":
        return
    st.markdown(
        """
        <style>
          #MainMenu {visibility: hidden;}
          header {visibility: hidden;}
          footer {visibility: hidden;}
          [data-testid="stToolbar"] {visibility: hidden;}
          [data-testid="stDecoration"] {visibility: hidden;}
          [data-testid="stStatusWidget"] {visibility: hidden;}
          [data-testid="stAppDeployButton"] {display:none;}
          .block-container { padding-top: 1.2rem; }
        </style>
        """,
        unsafe_allow_html=True,
    )


def _b64_logo_from_file() -> str | None:
    for f in ["omni_icone.png", "logo.png", "iconeaba.png", "omni.png", "omnisfera.png"]:
        if os.path.exists(f):
            with open(f, "rb") as img:
                return base64.b64encode(img.read()).decode("utf-8")
    return None


# ------------------------------------------------------------------------------
# UI / CSS
# ------------------------------------------------------------------------------
def inject_css():
    st.markdown(
        """
        <style>
          :root{
            --muted:#6b7280;
            --text:#111827;
            --border:rgba(17,24,39,.08);
            --shadow: 0 10px 30px rgba(17,24,39,.06);
            --blue:#0F52BA;
            --deep:#062B61;
          }
          .omni-wrap{ max-width: 1040px; margin: 0 auto; padding: 22px 18px 64px; }
          .top-chip{
            display:inline-flex; align-items:center; gap:8px;
            border:1px solid var(--border);
            padding: 6px 10px; border-radius: 999px;
            font-size: 13px; color: var(--muted);
            background: rgba(17,24,39,.02);
          }
          .brand{ display:flex; align-items:center; gap:14px; margin-top: 16px; }
          .logoSpin{
            width:56px;height:56px; border-radius:16px;
            display:inline-flex; align-items:center; justify-content:center;
            background: rgba(15,82,186,.10);
            border:1px solid rgba(15,82,186,.18);
            box-shadow: 0 10px 26px rgba(17,24,39,.08);
            overflow:hidden;
          }
          .logoSpin img{
            width:34px;height:34px;
            animation: spin 9.5s linear infinite;
            transform-origin:center;
          }
          @keyframes spin{ 0%{transform: rotate(0deg);} 100%{transform: rotate(360deg);} }

          .title{ font-size: 56px; line-height: 1.02; letter-spacing: -0.04em; margin: 0; color: var(--text); font-weight: 900; }
          .subtitle{ margin-top: 10px; color: var(--muted); font-size: 16px; font-weight: 700; }

          .grid{ display:grid; grid-template-columns: 1.2fr .8fr; gap: 14px; margin-top: 14px; }
          @media (max-width: 980px){ .grid{ grid-template-columns: 1fr; } }

          .card{
            background:#fff;
            border:1px solid var(--border);
            box-shadow: var(--shadow);
            border-radius: 18px;
            padding: 16px;
          }
          .card-h{ font-weight: 900; font-size: 15px; margin-bottom: 6px; }
          .hint{ color: var(--muted); font-size: 13px; font-weight: 700; }
          .mono{
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          }
          .err{
            margin-top: 12px;
            background: rgba(239,68,68,.10);
            border:1px solid rgba(239,68,68,.22);
            color: #b91c1c;
            border-radius: 14px;
            padding: 12px 14px;
            font-weight: 800;
          }
          .ok{
            margin-top: 12px;
            background: rgba(34,197,94,.10);
            border:1px solid rgba(34,197,94,.22);
            color: #166534;
            border-radius: 14px;
            padding: 12px 14px;
            font-weight: 900;
          }

          /* manifesto */
          .manifesto{
            background: radial-gradient(900px 240px at 15% 10%, rgba(15,82,186,0.14), transparent 65%),
                        radial-gradient(900px 240px at 85% 0%, rgba(56,178,172,0.10), transparent 60%),
                        linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85));
            border:1px solid rgba(15,82,186,.12);
            border-radius: 18px;
            padding: 16px;
            box-shadow: 0 14px 34px rgba(15,82,186,.08);
          }
          .manifesto-title{
            font-weight: 900;
            font-size: 14px;
            letter-spacing: .4px;
            color: var(--deep);
            display:flex;
            align-items:center;
            gap:8px;
            margin-bottom: 8px;
          }
          .manifesto p{
            margin: 0 0 10px 0;
            color: #334155;
            font-weight: 750;
            line-height: 1.35rem;
            font-size: 13.5px;
          }
          .pill{
            display:inline-flex;
            align-items:center;
            gap:8px;
            padding: 6px 10px;
            border-radius: 999px;
            border: 1px solid rgba(226,232,240,.9);
            background: rgba(226,232,240,.45);
            font-weight: 900;
            font-size: 12px;
            color: #1f2937;
            margin-right: 6px;
            margin-top: 8px;
          }
        </style>
        """,
        unsafe_allow_html=True,
    )


# ------------------------------------------------------------------------------
# Estado / sessão
# ------------------------------------------------------------------------------
def ensure_auth_state():
    if "autenticado" not in st.session_state:
        st.session_state.autenticado = False
    if "workspace_id" not in st.session_state:
        st.session_state.workspace_id = None
    if "workspace_name" not in st.session_state:
        st.session_state.workspace_name = None

    if "usuario_nome" not in st.session_state:
        st.session_state.usuario_nome = ""
    if "usuario_cargo" not in st.session_state:
        st.session_state.usuario_cargo = ""

    if "connected" not in st.session_state:
        st.session_state.connected = False
    if "last_auth_ts" not in st.session_state:
        st.session_state.last_auth_ts = None
    if "rpc_used" not in st.session_state:
        st.session_state.rpc_used = RPC_NAME


def clear_session():
    st.session_state.autenticado = False
    st.session_state.workspace_id = None
    st.session_state.workspace_name = None
    st.session_state.connected = False
    st.session_state.last_auth_ts = None
    st.session_state.rpc_used = RPC_NAME
    # mantém nome/cargo preenchidos para facilitar re-login (você pode limpar se quiser)


# ------------------------------------------------------------------------------
# Manifesto (edite aqui)
# ------------------------------------------------------------------------------
def manifesto_html() -> str:
    return """
    <div class="manifesto">
      <div class="manifesto-title">🌐 Manifesto Omnisfera</div>

      <p><b>1)</b> Inclusão não é exceção — é o padrão.</p>
      <p><b>2)</b> Decisão pedagógica precisa de evidência, contexto e humanidade.</p>
      <p><b>3)</b> IA é copiloto: amplifica o professor, não substitui o vínculo.</p>
      <p><b>4)</b> PEI/PAEE não é papel — é jornada viva, contínua e mensurável.</p>
      <p><b>5)</b> Tudo que fazemos é para reduzir barreiras e aumentar autonomia.</p>

      <div style="margin-top:10px;">
        <span class="pill">BNCC</span>
        <span class="pill">DUA</span>
        <span class="pill">LBI</span>
        <span class="pill">PAEE</span>
        <span class="pill">PEI 360°</span>
      </div>

      <p style="margin-top:12px; opacity:.85;">
        Ao acessar, você concorda em usar o Omnisfera com responsabilidade, ética e sigilo.
      </p>
    </div>
    """


# ------------------------------------------------------------------------------
# Render principal
# ------------------------------------------------------------------------------
def render_login():
    maybe_hide_streamlit_chrome()
    inject_css()
    ensure_auth_state()

    logo_b64 = _b64_logo_from_file()
    logo_html = f"<img src='data:image/png;base64,{logo_b64}'/>" if logo_b64 else ""

    st.markdown(
        f"""
        <div class="omni-wrap">
          <div class="top-chip">Acesso por PIN • Supabase Workspace</div>
          <div class="brand">
            <div class="logoSpin">{logo_html}</div>
            <div>
              <h1 class="title">Omnisfera</h1>
              <div class="subtitle">Valide seu PIN e registre sua identificação para entrar.</div>
            </div>
          </div>

          <div class="grid">
            <div class="card">
              <div class="card-h">Identificação & Acesso</div>
              <div class="hint">
                Função (RPC): <span class="mono">{RPC_NAME}(p_pin text)</span>
              </div>
            </div>
            {manifesto_html()}
          </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.markdown('<div class="omni-wrap">', unsafe_allow_html=True)

    # ---------- Campos obrigatórios ----------
    c1, c2 = st.columns([1, 1], gap="large")
    with c1:
        nome = st.text_input(
            "Seu nome",
            value=st.session_state.get("usuario_nome", ""),
            placeholder="Ex.: Rodrigo Queiroz",
        )
    with c2:
        cargo = st.text_input(
            "Sua função",
            value=st.session_state.get("usuario_cargo", ""),
            placeholder="Ex.: Consultor Pedagógico / Coordenação / AEE",
        )

    c3, c4 = st.columns([2, 1], gap="large")
    with c3:
        pin = st.text_input(
            "PIN do Workspace",
            value="",
            placeholder="Ex.: 3D6C-9718",
            help="Pode colar com ou sem hífen; o app normaliza.",
        )
    with c4:
        st.write("")
        st.write("")
        aceitar = st.checkbox("Li e aceito o Termo de Confidencialidade", value=False)

    do = st.button("Validar e entrar", use_container_width=True)

    # Normalização do PIN
    pin_norm = (pin or "").strip().upper().replace(" ", "")
    if len(pin_norm) == 8 and "-" not in pin_norm:
        pin_norm = pin_norm[:4] + "-" + pin_norm[4:]

    if do:
        # Validações
        if not nome.strip():
            st.markdown("<div class='err'>Informe seu nome.</div>", unsafe_allow_html=True)
            st.stop()
        if not cargo.strip():
            st.markdown("<div class='err'>Informe sua função/cargo.</div>", unsafe_allow_html=True)
            st.stop()
        if not aceitar:
            st.markdown("<div class='err'>Você precisa aceitar o Termo de Confidencialidade.</div>", unsafe_allow_html=True)
            st.stop()
        if not pin_norm or len(pin_norm) < 6:
            st.markdown("<div class='err'>Digite um PIN válido.</div>", unsafe_allow_html=True)
            st.stop()

        # Persiste identificação
        st.session_state.usuario_nome = nome.strip()
        st.session_state.usuario_cargo = cargo.strip()

        try:
            with st.spinner("Validando PIN..."):
                ws = rpc_workspace_from_pin(pin_norm)
        except Exception as e:
            st.markdown(
                f"<div class='err'>Falha ao conectar no Supabase.<br><span class='mono'>{str(e)}</span></div>",
                unsafe_allow_html=True,
            )
            st.stop()

        if not ws:
            st.markdown("<div class='err'>PIN não encontrado ou inválido.</div>", unsafe_allow_html=True)
        else:
            st.session_state.autenticado = True
            st.session_state.workspace_id = ws.get("id")
            st.session_state.workspace_name = ws.get("name")
            st.session_state.connected = True
            st.session_state.last_auth_ts = datetime.now().strftime("%d/%m/%Y %H:%M")
            st.session_state.rpc_used = RPC_NAME
            st.markdown("<div class='ok'>Acesso liberado. Entrando…</div>", unsafe_allow_html=True)
            st.rerun()

    st.markdown("</div>", unsafe_allow_html=True)

    # Botão de sair/trocar PIN (se já autenticado)
    if st.session_state.autenticado and st.session_state.workspace_id:
        st.markdown('<div class="omni-wrap">', unsafe_allow_html=True)
        if st.button("Sair / Trocar PIN", use_container_width=True):
            clear_session()
            st.rerun()
        st.markdown("</div>", unsafe_allow_html=True)
