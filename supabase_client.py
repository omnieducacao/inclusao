# supabase_client.py
import streamlit as st

# 🔒 Nome da função RPC
RPC_NAME = "workspace_from_pin"


@st.cache_resource(show_spinner=False)
def _create_supabase_client():
    """
    Cria UM cliente Supabase (cacheado para o app inteiro).
    Usa a mesma leitura de secrets do omni_utils (flat ou [supabase]).
    """
    try:
        from supabase import create_client  # type: ignore
    except Exception as e:
        raise RuntimeError(
            "Pacote 'supabase' não encontrado.\n"
            "➡️ requirements.txt precisa ter: supabase==2.*\n"
            f"Detalhe: {e}"
        )

    try:
        import omni_utils as ou
        url = ou._sb_url()
        key = ou._sb_key()
    except Exception as e:
        raise RuntimeError(
            "SUPABASE_URL / chave não encontrados. Configure em secrets (raiz ou [supabase]) ou variáveis de ambiente.\n"
            f"Detalhe: {e}"
        )

    return create_client(url, key)


def get_sb():
    """
    ✅ Função padrão do projeto: garante sb na session_state.
    Retorna o client.
    """
    if "sb" in st.session_state and st.session_state["sb"] is not None:
        return st.session_state["sb"]

    sb = _create_supabase_client()
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
