# _client.py
from __future__ import annotations

import streamlit as st
from supabase import create_client
from supabase.client import ClientOptions


def _get_env(name: str) -> str:
    v = st.secrets.get(name)
    if not v:
        raise RuntimeError(f"Secret ausente: {name}")
    return v


def supabase_login(email: str, password: str) -> dict:
    """
    Faz login no Supabase Auth e retorna:
      {
        "access_token": "...",
        "user_id": "...",
        "email": "..."
      }
    """
    url = _get_env("SUPABASE_URL")
    anon_key = _get_env("SUPABASE_ANON_KEY")

    sb = create_client(url, anon_key)
    res = sb.auth.sign_in_with_password({"email": email, "password": password})

    if not res or not res.session or not res.user:
        raise RuntimeError("Falha no login do Supabase (resposta vazia).")

    return {
        "access_token": res.session.access_token,
        "user_id": res.user.id,
        "email": res.user.email,
    }


def get_supabase_user(jwt: str):
    """
    Cria um client Supabase autenticado como usuário (JWT).
    Use isso no PEI para .table(...).select/insert/update.
    """
    url = _get_env("SUPABASE_URL")
    anon_key = _get_env("SUPABASE_ANON_KEY")

    opts = ClientOptions(headers={"Authorization": f"Bearer {jwt}"})
    sb = create_client(url, anon_key, options=opts)
    return sb
