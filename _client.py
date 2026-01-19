# _client.py
from __future__ import annotations

import streamlit as st
from supabase import create_client, Client


def _get_supabase_url() -> str:
    url = st.secrets.get("SUPABASE_URL", "")
    if not url:
        raise ValueError("SUPABASE_URL não está definido em st.secrets.")
    return url


def _get_supabase_anon_key() -> str:
    key = st.secrets.get("SUPABASE_ANON_KEY", "")
    if not key:
        raise ValueError("SUPABASE_ANON_KEY não está definido em st.secrets.")
    return key


def get_supabase_admin() -> Client:
    """
    Client SEM JWT (apenas anon). Útil para operações públicas (se houver) ou checagens.
    """
    return create_client(_get_supabase_url(), _get_supabase_anon_key())


def get_supabase_user(jwt: str) -> Client:
    """
    Client COM JWT do usuário.
    Em vez de sb.auth.set_auth(jwt) (que quebra dependendo da versão),
    criamos um client e injetamos o header Authorization: Bearer <jwt>.
    Isso faz o PostgREST respeitar RLS com o usuário autenticado.
    """
    if not jwt:
        raise ValueError("JWT vazio em get_supabase_user(jwt).")

    sb = create_client(_get_supabase_url(), _get_supabase_anon_key())

    # Injeta Authorization header no cliente (compatível com versões diferentes do supabase-py)
    try:
        # versões que expõem postgrest diretamente
        sb.postgrest.auth(jwt)
        return sb
    except Exception:
        pass

    # Fallback: setar headers manualmente (depende da estrutura interna)
    try:
        sb.postgrest.session.headers.update({"Authorization": f"Bearer {jwt}"})
        return sb
    except Exception:
        pass

    # Último fallback: tentar options/headers globais se existirem
    try:
        sb.options.headers.update({"Authorization": f"Bearer {jwt}"})
        return sb
    except Exception:
        pass

    # Se chegou aqui, a lib mudou muito
    raise RuntimeError(
        "Não consegui aplicar o JWT no supabase client. "
        "Verifique a versão do pacote supabase instalada no Streamlit Cloud."
    )
