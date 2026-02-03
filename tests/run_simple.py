#!/usr/bin/env python3
"""
Runner de testes sem pytest - executa testes básicos em massa.
Uso: python tests/run_simple.py [--repeat N]
"""
from __future__ import annotations

import argparse
import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

# Simula env para testes
os.environ.setdefault("SUPABASE_URL", "https://test.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_KEY", "test-key")


def test_hash_password():
    from services.members_service import _hash_password
    h = _hash_password("senha123")
    assert h and h.startswith("$2"), f"Hash inválido: {h}"


def test_verify_master_false():
    from unittest.mock import patch
    from services.members_service import verify_workspace_master

    def fake_get(ws_id):
        return None  # sem master

    with patch("services.members_service.get_workspace_master", fake_get):
        ok = verify_workspace_master("ws-fake", "a@b.com", "x")
    assert ok is False


def test_find_user_empty():
    from services.members_service import find_user_by_email
    assert find_user_by_email("") is None
    assert find_user_by_email("   ") is None


def test_admin_hash():
    from services.admin_service import _hash_password
    h = _hash_password("admin1")
    assert h and len(h) > 10


def test_omni_get_icon():
    from omni_utils import get_icon, get_icon_emoji
    html = get_icon("pei", use_emoji=True)
    assert "span" in html.lower() or "📘" in html
    assert get_icon_emoji("pei") in ["📘", "❓"]


def test_get_initials():
    from omni_utils import _get_initials
    assert _get_initials("João Silva") == "JS"
    assert _get_initials("Maria") == "MA"
    assert _get_initials("") == "U"


def test_school_config_segments():
    from services.school_config_service import SEGMENTS, COMPONENTS
    assert len(SEGMENTS) >= 4 and "EI" in [s[0] for s in SEGMENTS]
    assert len(COMPONENTS) >= 8


def test_monitoring_snapshot():
    from unittest.mock import patch
    from services.monitoring_service import get_usage_snapshot
    with patch("services.monitoring_service.fetch_usage_events", return_value=[]):
        snap = get_usage_snapshot(days=7)
    assert snap["total"] == 0 and "by_type" in snap


def test_permissions_filter_todos():
    from ui.permissions import filter_students_by_member
    students = [{"id": "1"}, {"id": "2"}]
    member = {"link_type": "todos"}
    out = filter_students_by_member(students, member, [], [])
    assert len(out) == 2


def test_permissions_grade_keys():
    from ui.permissions import _student_grade_to_match_keys
    keys = _student_grade_to_match_keys("7º Ano (EFAF)")
    assert "7" in keys or len(keys) >= 1


def run_all():
    tests = [
        ("members._hash_password", test_hash_password),
        ("members.verify_master_false", test_verify_master_false),
        ("members.find_user_empty", test_find_user_empty),
        ("admin._hash_password", test_admin_hash),
        ("omni_utils.get_icon", test_omni_get_icon),
        ("omni_utils._get_initials", test_get_initials),
        ("school_config.SEGMENTS", test_school_config_segments),
        ("monitoring.get_usage_snapshot", test_monitoring_snapshot),
        ("permissions.filter_todos", test_permissions_filter_todos),
        ("permissions._student_grade_to_match_keys", test_permissions_grade_keys),
    ]
    ok = 0
    fail = 0
    for name, fn in tests:
        try:
            fn()
            ok += 1
            print(f"  OK  {name}")
        except Exception as e:
            fail += 1
            print(f"  FAIL {name}: {e}")
    return ok, fail


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--repeat", type=int, default=1)
    args = p.parse_args()

    print("Omnisfera - Testes (run_simple)")
    print("=" * 50)

    total_ok, total_fail = 0, 0
    for r in range(args.repeat):
        if args.repeat > 1:
            print(f"\n--- Rodada {r + 1}/{args.repeat} ---")
        o, f = run_all()
        total_ok += o
        total_fail += f

    print("\n" + "=" * 50)
    print(f"Total: {total_ok} OK, {total_fail} falhas")
    sys.exit(1 if total_fail else 0)


if __name__ == "__main__":
    main()
