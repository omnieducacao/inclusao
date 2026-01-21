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
    """Client sem JWT (anon)."""
    return create_client(_get_supabase_url(), _get_supabase_anon_key())


def get_supabase_user(access_token: str | None) -> Client:
    """
    Client 'logado' com JWT (access_token).
    - Se access_token vier None, cai para anon.
    """
    sb = create_client(_get_supabase_url(), _get_supabase_anon_key())
    if access_token:
        sb.auth.set_session(access_token, "")
    return sb
