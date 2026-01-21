# supabase_client.py
import os
import streamlit as st

# 🔒 Nome da função RPC
RPC_NAME = "workspace_from_pin"


def _get_secret(name: str) -> str | None:
    try:
        v = st.secrets.get(name)
        if v:
            return str(v).strip()
    except Exception:
        pass
    v = os.getenv(name)
    return str(v).strip() if v else None


@st.cache_resource(show_spinner=False)
def get_supabase():
    """
    Cria e mantém UM cliente Supabase para o app inteiro.
    BLINDADO contra import error e secrets faltando.
    """
    try:
        from supabase import create_client  # type: ignore
    except Exception as e:
        # Erro comum: pacote não instalado no Streamlit Cloud
        raise RuntimeError(
            "Pacote 'supabase' não encontrado.\n"
            "➡️ Adicione no requirements.txt: supabase==2.* (ou supabase-py compatível)\n"
            f"Detalhe: {e}"
        )

    url = _get_secret("SUPABASE_URL")
    key = _get_secret("SUPABASE_ANON_KEY")

    if not url or not key:
        raise RuntimeError(
            "SUPABASE_URL / SUPABASE_ANON_KEY não encontrados.\n"
            "➡️ Configure em Settings → Secrets do Streamlit Cloud."
        )

    return create_client(url, key)


def rpc_workspace_from_pin(pin: str) -> dict | None:
    """
    Chama a função:
    public.workspace_from_pin(p_pin text)
    Retorna: { id, name } ou None
    """
    sb = get_supabase()
    res = sb.rpc(RPC_NAME, {"p_pin": pin}).execute()

    data = res.data
    if not data:
        return None

    if isinstance(data, list):
        return data[0] if data else None

    if isinstance(data, dict):
        return data

    return None
