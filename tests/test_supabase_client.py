"""
Testes para supabase_client.py (com mocks)
"""
from __future__ import annotations

import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)


def test_get_supabase_url_and_key():
    """_get_supabase_url_and_key retorna tuple (url, key)."""
    from supabase_client import _get_supabase_url_and_key

    url, key = _get_supabase_url_and_key()
    # Em testes, pode vir de env ou secrets; verifica que retorna tupla
    assert isinstance(url, (str, type(None)))
    assert isinstance(key, (str, type(None)))


def test_rpc_workspace_from_pin_returns_none_when_empty(monkeypatch):
    """rpc_workspace_from_pin retorna None quando RPC retorna vazio."""
    from supabase_client import rpc_workspace_from_pin, get_sb

    class FakeSb:
        def rpc(self, name, params):
            class R:
                def execute(self):
                    class E:
                        data = None
                    return E()
            return R()

    import streamlit as st
    st.session_state["sb"] = FakeSb()

    result = rpc_workspace_from_pin("0000-0000")
    assert result is None
