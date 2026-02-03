"""
Testes para services/members_service.py
"""
from __future__ import annotations

import pytest

# Mock requests antes de importar o serviço
import sys
import os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)


def test_hash_password():
    """_hash_password retorna hash bcrypt válido."""
    from services.members_service import _hash_password

    h = _hash_password("senha123")
    assert h is not None
    assert isinstance(h, str)
    assert h.startswith("$2")
    assert h != "senha123"


def test_hash_password_empty():
    """_hash_password retorna None para string vazia."""
    from services.members_service import _hash_password

    assert _hash_password("") is None
    assert _hash_password(None) is None


def test_verify_workspace_master_no_master(monkeypatch):
    """verify_workspace_master retorna False quando não há master."""
    from services import members_service

    def fake_get_workspace_master(ws_id):
        return None

    monkeypatch.setattr(members_service, "get_workspace_master", fake_get_workspace_master)

    ok = members_service.verify_workspace_master("ws-1", "a@b.com", "senha")
    assert ok is False


def test_verify_workspace_master_wrong_email(monkeypatch):
    """verify_workspace_master retorna False quando email não confere."""
    from services import members_service

    def fake_get_workspace_master(ws_id):
        return {"email": "master@escola.com", "password_hash": members_service._hash_password("senha123")}

    monkeypatch.setattr(members_service, "get_workspace_master", fake_get_workspace_master)

    ok = members_service.verify_workspace_master("ws-1", "outro@escola.com", "senha123")
    assert ok is False


def test_verify_workspace_master_correct(monkeypatch):
    """verify_workspace_master retorna True para email+senha corretos."""
    from services import members_service

    ph = members_service._hash_password("senha123")

    def fake_get_workspace_master(ws_id):
        return {"email": "master@escola.com", "password_hash": ph}

    monkeypatch.setattr(members_service, "get_workspace_master", fake_get_workspace_master)

    ok = members_service.verify_workspace_master("ws-1", "master@escola.com", "senha123")
    assert ok is True


def test_verify_member_password_empty_hash(monkeypatch):
    """verify_member_password retorna True quando membro não tem senha (legado)."""
    from services import members_service

    def fake_get(url, headers=None, params=None, timeout=None, **kwargs):
        class R:
            status_code = 200

            def json(self):
                return [{"id": "m1", "password_hash": None, "active": True}]

        return R()

    import requests
    monkeypatch.setattr(requests, "get", fake_get)

    ok = members_service.verify_member_password("ws-1", "membro@escola.com", "")
    assert ok is True


def test_find_user_by_email_empty():
    """find_user_by_email retorna None para email vazio."""
    from services.members_service import find_user_by_email

    assert find_user_by_email("") is None
    assert find_user_by_email(None) is None
    assert find_user_by_email("   ") is None


def test_list_members_empty(monkeypatch):
    """list_members retorna lista vazia quando API retorna vazio."""
    from services import members_service

    def fake_get(url, headers=None, params=None, timeout=None, **kwargs):
        class R:
            status_code = 200

            def json(self):
                return []

        return R()

    import requests
    monkeypatch.setattr(requests, "get", fake_get)

    members = members_service.list_members("ws-123")
    assert members == []
