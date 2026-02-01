# supabase_client.py
import streamlit as st

# 🔒 Nome da função RPC
RPC_NAME = "workspace_from_pin"


@st.cache_resource(show_spinner=False)
def _create_supabase_client(url: str, key: str):
    """
    Cria UM cliente Supabase (cacheado por url+key).
    URL e chave são lidos fora do cache (em get_sb) para garantir que
    st.secrets esteja disponível (importante no Streamlit Cloud).
    """
    try:
        from supabase import create_client  # type: ignore
    except Exception as e:
        raise RuntimeError(
            "Pacote 'supabase' não encontrado.\n"
            "➡️ requirements.txt precisa ter: supabase==2.*\n"
            f"Detalhe: {e}"
        )
    if not url or not key:
        raise RuntimeError(
            "SUPABASE_URL e chave são obrigatórios. Configure em Secrets (raiz: SUPABASE_URL, SUPABASE_SERVICE_KEY/ANON_KEY ou seção [supabase])."
        )
    return create_client(url, key)


def get_sb():
    """
    ✅ Função padrão do projeto: garante sb na session_state.
    Lê secrets no contexto principal (não dentro do cache) para evitar
    erro no Streamlit Cloud ao logar.
    """
    if "sb" in st.session_state and st.session_state["sb"] is not None:
        return st.session_state["sb"]

    try:
        import omni_utils as ou
        url = ou._sb_url()
        key = ou._sb_key()
    except Exception as e:
        raise RuntimeError(
            "Configuração Supabase não encontrada. Em Streamlit Cloud: Manage app → Settings → Secrets. "
            "Use SUPABASE_URL e SUPABASE_SERVICE_KEY (ou SUPABASE_ANON_KEY) no nível raiz, ou seção [supabase] com url e service_key/anon_key.\n"
            f"Detalhe: {e}"
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
