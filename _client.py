# _client.py
import streamlit as st
from supabase import create_client, Client


def _get_supabase_url_key():
    """
    Lê SUPABASE_URL e SUPABASE_ANON_KEY de:
    - st.secrets (Streamlit Cloud)
    - ou variáveis de ambiente (local)
    """
    url = None
    key = None

    try:
        url = st.secrets.get("SUPABASE_URL")
        key = st.secrets.get("SUPABASE_ANON_KEY")
    except Exception:
        pass

    if not url:
        import os
        url = os.getenv("SUPABASE_URL")
    if not key:
        import os
        key = os.getenv("SUPABASE_ANON_KEY")

    if not url or not key:
        raise RuntimeError("SUPABASE_URL / SUPABASE_ANON_KEY não encontrados em secrets ou env.")

    return url, key


@st.cache_resource
def get_supabase_client() -> Client:
    url, key = _get_supabase_url_key()
    return create_client(url, key)


def get_supabase_user(jwt: str) -> Client:
    """
    Retorna um client com o JWT do usuário (RLS / auth).
    """
    sb = get_supabase_client()
    sb.postgrest.auth(jwt)
    sb.auth.set_auth(jwt)
    return sb


def supabase_sign_in(email: str, password: str):
    """
    Login email/senha no Supabase Auth.
    """
    sb = get_supabase_client()
    return sb.auth.sign_in_with_password({"email": email, "password": password})


def supabase_sign_up(email: str, password: str):
    """
    Cria usuário no Supabase Auth (email/senha).
    """
    sb = get_supabase_client()
    return sb.auth.sign_up({"email": email, "password": password})
