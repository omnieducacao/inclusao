"""
Gestão de usuários do workspace: CRUD de membros, vínculos e permissões.
Tudo gira em torno do estudante; professores vinculados por turma ou alunos.
"""
import os
import requests
from typing import Optional

# Usa omni_utils para headers e URL
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import omni_utils as ou


def _base():
    return ou.get_setting("SUPABASE_URL", "").rstrip("/")


def _headers():
    return ou._headers()


def list_members(workspace_id: str):
    """Lista membros do workspace."""
    url = f"{_base()}/rest/v1/workspace_members"
    params = {"workspace_id": f"eq.{workspace_id}", "order": "nome.asc", "select": "*"}
    r = requests.get(url, headers={**_headers(), "Accept": "application/json"}, params=params, timeout=15)
    if r.status_code >= 400:
        return []
    data = r.json()
    return data if isinstance(data, list) else []


def get_member_by_email(workspace_id: str, email: str) -> Optional[dict]:
    """Retorna membro por workspace + email."""
    url = f"{_base()}/rest/v1/workspace_members"
    params = {"workspace_id": f"eq.{workspace_id}", "email": f"eq.{email}", "select": "*"}
    r = requests.get(url, headers={**_headers(), "Accept": "application/json"}, params=params, timeout=15)
    if r.status_code != 200 or not r.json():
        return None
    data = r.json()
    return data[0] if isinstance(data, list) and data else None


def create_member(
    workspace_id: str,
    nome: str,
    email: str,
    telefone: str = "",
    can_estudantes: bool = False,
    can_pei: bool = False,
    can_paee: bool = False,
    can_hub: bool = False,
    can_diario: bool = False,
    can_avaliacao: bool = False,
    can_gestao: bool = False,
    link_type: str = "todos",
    class_assignments: list = None,
    student_ids: list = None,
):
    """Cria membro e seus vínculos (turma ou alunos)."""
    row = {
        "workspace_id": workspace_id,
        "nome": nome.strip(),
        "email": email.strip().lower(),
        "telefone": (telefone or "").strip(),
        "can_estudantes": can_estudantes,
        "can_pei": can_pei,
        "can_paee": can_paee,
        "can_hub": can_hub,
        "can_diario": can_diario,
        "can_avaliacao": can_avaliacao,
        "can_gestao": can_gestao,
        "link_type": link_type or "todos",
    }
    url = f"{_base()}/rest/v1/workspace_members"
    h = {**_headers(), "Prefer": "return=representation"}
    r = requests.post(url, headers=h, json=row, timeout=15)
    if r.status_code >= 400:
        return None, str(r.text)
    data = r.json()
    member = data[0] if isinstance(data, list) and data else data
    member_id = member.get("id")

    if member_id and link_type == "turma" and class_assignments:
        for a in class_assignments:
            _add_class_assignment(member_id, a.get("grade", ""), a.get("class_group", ""))
    if member_id and link_type == "tutor" and student_ids:
        for sid in student_ids:
            _add_student_link(member_id, sid)
    return member, None


def update_member(
    member_id: str,
    nome: str = None,
    telefone: str = None,
    can_estudantes: bool = None,
    can_pei: bool = None,
    can_paee: bool = None,
    can_hub: bool = None,
    can_diario: bool = None,
    can_avaliacao: bool = None,
    can_gestao: bool = None,
    link_type: str = None,
    class_assignments: list = None,
    student_ids: list = None,
):
    """Atualiza membro. Passar None = não alterar."""
    updates = {}
    if nome is not None:
        updates["nome"] = nome.strip()
    if telefone is not None:
        updates["telefone"] = (telefone or "").strip()
    if can_estudantes is not None:
        updates["can_estudantes"] = can_estudantes
    if can_pei is not None:
        updates["can_pei"] = can_pei
    if can_paee is not None:
        updates["can_paee"] = can_paee
    if can_hub is not None:
        updates["can_hub"] = can_hub
    if can_diario is not None:
        updates["can_diario"] = can_diario
    if can_avaliacao is not None:
        updates["can_avaliacao"] = can_avaliacao
    if can_gestao is not None:
        updates["can_gestao"] = can_gestao
    if link_type is not None:
        updates["link_type"] = link_type
    if not updates:
        return True, None
    url = f"{_base()}/rest/v1/workspace_members?id=eq.{member_id}"
    r = requests.patch(url, headers=_headers(), json=updates, timeout=15)
    if r.status_code >= 400:
        return False, str(r.text)

    if class_assignments is not None:
        _replace_class_assignments(member_id, class_assignments)
    if student_ids is not None:
        _replace_student_links(member_id, student_ids)
    return True, None


def deactivate_member(member_id: str):
    """Desativa membro (soft delete)."""
    url = f"{_base()}/rest/v1/workspace_members?id=eq.{member_id}"
    return requests.patch(url, headers=_headers(), json={"active": False}, timeout=15).status_code < 400


def _add_class_assignment(member_id: str, grade: str, class_group: str):
    if not grade or not class_group:
        return
    url = f"{_base()}/rest/v1/teacher_class_assignments"
    requests.post(url, headers=_headers(), json={"workspace_member_id": member_id, "grade": grade, "class_group": class_group}, timeout=10)


def _replace_class_assignments(member_id: str, assignments: list):
    url = f"{_base()}/rest/v1/teacher_class_assignments?workspace_member_id=eq.{member_id}"
    requests.delete(url, headers=_headers(), timeout=10)
    for a in (assignments or []):
        _add_class_assignment(member_id, a.get("grade", ""), a.get("class_group", ""))


def _add_student_link(member_id: str, student_id: str):
    if not student_id:
        return
    url = f"{_base()}/rest/v1/teacher_student_links"
    requests.post(url, headers=_headers(), json={"workspace_member_id": member_id, "student_id": student_id}, timeout=10)


def _replace_student_links(member_id: str, student_ids: list):
    url = f"{_base()}/rest/v1/teacher_student_links?workspace_member_id=eq.{member_id}"
    requests.delete(url, headers=_headers(), timeout=10)
    for sid in (student_ids or []):
        _add_student_link(member_id, sid)


def get_class_assignments(member_id: str) -> list:
    url = f"{_base()}/rest/v1/teacher_class_assignments"
    params = {"workspace_member_id": f"eq.{member_id}", "select": "grade,class_group"}
    r = requests.get(url, headers={**_headers(), "Accept": "application/json"}, params=params, timeout=10)
    if r.status_code != 200:
        return []
    data = r.json()
    return data if isinstance(data, list) else []


def get_student_links(member_id: str) -> list:
    url = f"{_base()}/rest/v1/teacher_student_links"
    params = {"workspace_member_id": f"eq.{member_id}", "select": "student_id"}
    r = requests.get(url, headers={**_headers(), "Accept": "application/json"}, params=params, timeout=10)
    if r.status_code != 200:
        return []
    data = r.json()
    return [x.get("student_id") for x in (data if isinstance(data, list) else []) if x.get("student_id")]
