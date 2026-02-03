"""
Testes para services/admin_service.py
"""
from __future__ import annotations

import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)


def test_hash_password():
    """_hash_password retorna hash bcrypt."""
    from services.admin_service import _hash_password

    h = _hash_password("admin123")
    assert h is not None
    assert isinstance(h, str)
    assert h.startswith("$2")


def test_verify_platform_admin_no_admin(monkeypatch):
    """verify_platform_admin retorna False quando admin não existe."""
    from services import admin_service

    def fake_get(email):
        return None

    monkeypatch.setattr(admin_service, "get_platform_admin_by_email", fake_get)
    ok = admin_service.verify_platform_admin("a@b.com", "senha")
    assert ok is False


def test_verify_platform_admin_correct(monkeypatch):
    """verify_platform_admin retorna True para credenciais corretas."""
    from services import admin_service

    ph = admin_service._hash_password("admin123")

    def fake_get(email):
        return {"email": "admin@omnisfera.com", "password_hash": ph, "active": True}

    monkeypatch.setattr(admin_service, "get_platform_admin_by_email", fake_get)
    ok = admin_service.verify_platform_admin("admin@omnisfera.com", "admin123")
    assert ok is True


def test_verify_platform_admin_wrong_password(monkeypatch):
    """verify_platform_admin retorna False para senha errada."""
    from services import admin_service

    ph = admin_service._hash_password("admin123")

    def fake_get(email):
        return {"email": "admin@omnisfera.com", "password_hash": ph, "active": True}

    monkeypatch.setattr(admin_service, "get_platform_admin_by_email", fake_get)
    ok = admin_service.verify_platform_admin("admin@omnisfera.com", "senha_errada")
    assert ok is False


def test_list_platform_admins_empty(monkeypatch):
    """list_platform_admins retorna [] quando API retorna vazio."""
    from services import admin_service

    def fake_get(url, headers=None, params=None, timeout=None, **kwargs):
        class R:
            status_code = 200

            def json(self):
                return []

        return R()

    import requests
    monkeypatch.setattr(requests, "get", fake_get)

    admins = admin_service.list_platform_admins()
    assert admins == []
