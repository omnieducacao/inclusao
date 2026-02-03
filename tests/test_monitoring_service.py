"""
Testes para services/monitoring_service.py (recursos Dashboard e Bugs)
"""
from __future__ import annotations

import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

os.environ.setdefault("SUPABASE_URL", "https://test.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_KEY", "test-key")


def test_log_usage_event_empty_type():
    """log_usage_event retorna False para event_type vazio."""
    from services.monitoring_service import log_usage_event

    assert log_usage_event("") is False
    assert log_usage_event(None) is False


def test_get_usage_snapshot_with_empty_events(monkeypatch):
    """get_usage_snapshot retorna estrutura correta com lista vazia."""
    from services import monitoring_service

    def fake_fetch(days=7, limit=500, workspace_id=None):
        return []

    monkeypatch.setattr(monitoring_service, "fetch_usage_events", fake_fetch)

    snap = monitoring_service.get_usage_snapshot(days=7)

    assert snap["total"] == 0
    assert snap["by_type"] == []
    assert snap["by_engine"] == []
    assert snap["timeline"] == []
    assert snap["recent"] == []


def test_get_usage_snapshot_with_events(monkeypatch):
    """get_usage_snapshot agrega eventos corretamente."""
    from services import monitoring_service

    def fake_fetch(days=7, limit=500, workspace_id=None):
        return [
            {"event_type": "page_view", "ai_engine": None, "created_at": "2026-02-01T10:00:00Z"},
            {"event_type": "page_view", "ai_engine": None, "created_at": "2026-02-01T11:00:00Z"},
            {"event_type": "pei_generated", "ai_engine": "openai", "created_at": "2026-02-01T12:00:00Z"},
        ]

    monkeypatch.setattr(monitoring_service, "fetch_usage_events", fake_fetch)

    snap = monitoring_service.get_usage_snapshot(days=7)

    assert snap["total"] == 3
    assert any(x["event_type"] == "page_view" and x["count"] == 2 for x in snap["by_type"])
    assert any(x["event_type"] == "pei_generated" and x["count"] == 1 for x in snap["by_type"])
    assert len(snap["recent"]) == 3


def test_create_platform_issue_empty_title():
    """create_platform_issue retorna False para título vazio."""
    from services.monitoring_service import create_platform_issue

    assert create_platform_issue("") is False
    assert create_platform_issue(None) is False


def test_update_platform_issue_empty_id():
    """update_platform_issue_status retorna False para id vazio."""
    from services.monitoring_service import update_platform_issue_status

    assert update_platform_issue_status("") is False


def test_parse_iso():
    """_parse_iso converte timestamp ISO corretamente."""
    from services.monitoring_service import _parse_iso
    from datetime import datetime

    dt = _parse_iso("2026-02-01T12:00:00Z")
    assert dt.year == 2026 and dt.month == 2 and dt.day == 1
