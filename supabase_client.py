# supabase_client.py
import os
import streamlit as st

# 🔒 Nome da função RPC
RPC_NAME = "workspace_from_pin"


def _get_secret(name: str) -> str | None:
    """Lê env var (Render) e fallback para secrets (Streamlit Cloud). Igual ao que funcionava antes."""
    v = os.environ.get(name)
    if v and str(v).strip():
        return str(v).strip()
    try:
        v = st.secrets.get(name)
        if v is not None and str(v).strip():
            return str(v).strip()
    except Exception:
        pass
    return None


@st.cache_resource(show_spinner=False)
def _create_supabase_client(url: str, key: str):
    """
    Cria UM cliente Supabase (cacheado por url+key).
    URL e key vêm de get_sb() — assim st.secrets é lido fora do cache,
    onde está disponível no Streamlit Cloud.
    """
    try:
        from supabase import create_client  # type: ignore
    except Exception as e:
        raise RuntimeError(
            "Pacote 'supabase' não encontrado. requirements.txt: supabase==2.*\n" + str(e)
        )
    if not url or not key:
        raise RuntimeError("SUPABASE_URL e chave são obrigatórios.")
    return create_client(url, key)


def get_sb():
    """Garante sb na session_state. Lê secrets aqui (fora do cache) para funcionar no Streamlit Cloud."""
    if "sb" in st.session_state and st.session_state["sb"] is not None:
        return st.session_state["sb"]

    url = _get_secret("SUPABASE_URL")
    key = _get_secret("SUPABASE_SERVICE_KEY") or _get_secret("SUPABASE_ANON_KEY")
    if not url or not key:
        raise RuntimeError(
            "SUPABASE_URL e SUPABASE_SERVICE_KEY (ou SUPABASE_ANON_KEY) não encontrados. "
            "Em Streamlit Cloud: Manage app → Settings → Secrets. Use chaves no nível raiz."
        )

    sb = _create_supabase_client(url, key)
    st.session_state["sb"] = sb
    return sb


# Compatibilidade com seu código antigo
def get_supabase():
    """Alias para manter compatibilidade com versões anteriores."""
    return get_sb()


def rpc_workspace_from_pin(pin: str) -> dict | None:
    """
    Chama a função:
    public.workspace_from_pin(p_pin text)
    Retorna: { id, name } ou None
    """
    sb = get_sb()

    res = sb.rpc(RPC_NAME, {"p_pin": pin}).execute()
    data = res.data

    if not data:
        return None
    if isinstance(data, list):
        return data[0] if data else None
    if isinstance(data, dict):
        return data
    return None
