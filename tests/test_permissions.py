"""
Testes para ui/permissions.py (recursos de permissão e filtro de alunos)
"""
from __future__ import annotations

import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)


def test_student_grade_to_match_keys():
    """_student_grade_to_match_keys converte grades corretamente."""
    from ui.permissions import _student_grade_to_match_keys

    # 7º Ano (EFAF) -> {"7"}
    keys = _student_grade_to_match_keys("7º Ano (EFAF)")
    assert "7" in keys

    # Educação Infantil
    keys = _student_grade_to_match_keys("Educação Infantil")
    assert "2anos" in keys and "3anos" in keys

    # 1ª Série EM
    keys = _student_grade_to_match_keys("1ª Série (EM)")
    assert "1" in keys or "1EM" in keys

    # vazio
    assert _student_grade_to_match_keys("") == set()
    assert _student_grade_to_match_keys(None) == set()


def test_assignment_grade_to_match_keys():
    """_assignment_grade_to_match_keys converte grade da turma."""
    from ui.permissions import _assignment_grade_to_match_keys

    keys = _assignment_grade_to_match_keys("7", "7º Ano")
    assert "7" in keys


def test_filter_students_by_member_todos():
    """link_type=todos retorna todos os estudantes."""
    from ui.permissions import filter_students_by_member

    students = [{"id": "1", "nome": "A"}, {"id": "2", "nome": "B"}]
    member = {"link_type": "todos"}
    out = filter_students_by_member(students, member, [], [])
    assert len(out) == 2


def test_filter_students_by_member_tutor():
    """link_type=tutor filtra por student_ids."""
    from ui.permissions import filter_students_by_member

    students = [{"id": "1", "nome": "A"}, {"id": "2", "nome": "B"}, {"id": "3", "nome": "C"}]
    member = {"link_type": "tutor"}
    out = filter_students_by_member(students, member, [], ["1", "3"])
    assert len(out) == 2
    ids = [s["id"] for s in out]
    assert "1" in ids and "3" in ids and "2" not in ids


def test_filter_students_by_member_turma():
    """link_type=turma filtra por grade+class_group."""
    from ui.permissions import filter_students_by_member

    students = [
        {"id": "1", "grade": "7º Ano (EFAF)", "class_group": "A"},
        {"id": "2", "grade": "8º Ano", "class_group": "B"},
    ]
    member = {"link_type": "turma"}
    # class_assignments com grade 7, turma A
    assignments = [{"grade": "7", "grade_label": "7º Ano", "class_group": "A"}]
    out = filter_students_by_member(students, member, assignments, [])
    assert len(out) >= 1
    assert any(s["id"] == "1" for s in out)


def test_can_access_sem_member(monkeypatch):
    """can_access retorna True quando não há member (acesso total)."""
    from ui import permissions
    import streamlit as st

    class FakeSession:
        def get(self, k, default=None):
            return None

    monkeypatch.setattr(st, "session_state", FakeSession())

    assert permissions.can_access("pei") is True
    assert permissions.can_access("gestao") is True


def test_can_access_com_member(monkeypatch):
    """can_access respeita can_pei, can_gestao etc."""
    from ui import permissions
    import streamlit as st

    class FakeSession:
        def get(self, k, default=None):
            if k == "member":
                return {
                    "can_estudantes": True,
                    "can_pei": True,
                    "can_paee": False,
                    "can_hub": True,
                    "can_diario": False,
                    "can_avaliacao": False,
                    "can_gestao": False,
                }
            return None

    monkeypatch.setattr(st, "session_state", FakeSession())

    assert permissions.can_access("pei") is True
    assert permissions.can_access("paee") is False
    assert permissions.can_access("gestao") is False
