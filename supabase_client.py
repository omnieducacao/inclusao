# supabase_client.py
import os
import streamlit as st
from supabase import create_client

# 🔒 Nome da função RPC (controle central)
RPC_NAME = "workspace_from_pin"


@st.cache_resource(show_spinner=False)
def get_supabase():
    """
    Cria e mantém UM cliente Supabase para o app inteiro.
    Não faz login, não navega, não valida UI.
    """
    url = None
    key = None

    try:
        url = st.secrets.get("SUPABASE_URL")
        key = st.secrets.get("SUPABASE_ANON_KEY")
    except Exception:
        pass

    url = url or os.getenv("SUPABASE_URL")
    key = key or os.getenv("SUPABASE_ANON_KEY")

    if not url or not key:
        raise RuntimeError(
            "SUPABASE_URL ou SUPABASE_ANON_KEY não encontrados nos Secrets."
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
