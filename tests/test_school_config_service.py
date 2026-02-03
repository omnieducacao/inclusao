"""
Testes para services/school_config_service.py (recursos Configuração Escola)
"""
from __future__ import annotations

import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

os.environ.setdefault("SUPABASE_URL", "https://test.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_KEY", "test-key")


def test_segments_constants():
    """SEGMENTS e COMPONENTS têm estrutura esperada."""
    from services.school_config_service import SEGMENTS, COMPONENTS

    assert len(SEGMENTS) >= 4
    for code, label in SEGMENTS:
        assert isinstance(code, str) and len(code) > 0
        assert isinstance(label, str) and len(label) > 0

    assert "EI" in [s[0] for s in SEGMENTS]
    assert "EFAI" in [s[0] for s in SEGMENTS]

    assert len(COMPONENTS) >= 8
    for code, label in COMPONENTS:
        assert isinstance(code, str) and isinstance(label, str)


def test_list_school_years_empty(monkeypatch):
    """list_school_years retorna [] quando API retorna vazio."""
    from services import school_config_service

    def fake_get(url, headers=None, params=None, timeout=None, **kwargs):
        class R:
            status_code = 200

            def json(self):
                return []

        return R()

    import requests
    monkeypatch.setattr(requests, "get", fake_get)

    out = school_config_service.list_school_years("ws-123")
    assert out == []


def test_list_grades_empty(monkeypatch):
    """list_grades retorna [] quando API retorna vazio."""
    from services import school_config_service

    def fake_get(url, headers=None, params=None, timeout=None, **kwargs):
        class R:
            status_code = 200

            def json(self):
                return []

        return R()

    import requests
    monkeypatch.setattr(requests, "get", fake_get)

    out = school_config_service.list_grades()
    assert out == []
