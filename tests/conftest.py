"""
Fixtures e mocks compartilhados para testes Omnisfera.
Evita chamadas reais ao Supabase e ao Streamlit.
"""
from __future__ import annotations

import os
import sys

import pytest

# Garante que o root do projeto está no path
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)


@pytest.fixture(autouse=True)
def mock_env(monkeypatch):
    """Garante variáveis de ambiente mínimas para testes."""
    monkeypatch.setenv("SUPABASE_URL", "https://test.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_KEY", "test-service-key-12345")


@pytest.fixture
def mock_streamlit_secrets(monkeypatch):
    """Simula st.secrets para ambiente sem Streamlit."""
    class FakeSecrets:
        _data = {
            "SUPABASE_URL": "https://test.supabase.co",
            "SUPABASE_SERVICE_KEY": "test-service-key",
        }

        def get(self, key, default=None):
            return self._data.get(key, default)

        def __getattr__(self, name):
            return self._data.get(name)

    import streamlit as st
    monkeypatch.setattr(st, "secrets", FakeSecrets(), raising=False)


@pytest.fixture
def mock_requests_get(monkeypatch):
    """Mock de requests.get para evitar chamadas HTTP reais."""

    def fake_get(url, headers=None, params=None, timeout=None, **kwargs):
        class FakeResponse:
            status_code = 200
            _json = []

            def json(self):
                return self._json

        r = FakeResponse()
        # Endpoints que retornam listas vazias por padrão
        if "workspace_members" in url:
            r._json = []
        elif "workspace_masters" in url:
            r._json = []
        elif "platform_admins" in url:
            r._json = []
        elif "workspaces" in url:
            r._json = [{"name": "Escola Teste"}]
        return r

    import requests
    monkeypatch.setattr(requests, "get", fake_get)


@pytest.fixture
def mock_requests_post(monkeypatch):
    """Mock de requests.post para simular sucesso."""

    def fake_post(url, headers=None, json=None, timeout=None, **kwargs):
        class FakeResponse:
            status_code = 201
            text = ""

            def json(self):
                return json or {}

        return FakeResponse()

    import requests
    monkeypatch.setattr(requests, "post", fake_post)


@pytest.fixture
def mock_requests_patch(monkeypatch):
    """Mock de requests.patch."""

    def fake_patch(url, headers=None, json=None, timeout=None, **kwargs):
        class FakeResponse:
            status_code = 200
            text = ""

        return FakeResponse()

    import requests
    monkeypatch.setattr(requests, "patch", fake_patch)
