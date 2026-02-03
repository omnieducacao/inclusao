"""
Gestão de usuários do workspace: CRUD de membros, vínculos e permissões.
Tudo gira em torno do estudante; professores vinculados por turma ou alunos.
"""
import os
import requests
from typing import Optional

try:
    import bcrypt
except ImportError:
    bcrypt = None

# Usa omni_utils para headers e URL
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import omni_utils as ou


def _base():
    return ou.get_setting("SUPABASE_URL", "").rstrip("/")


def _headers():
    return ou._headers()


def list_members(workspace_id: str):
    """Lista membros do workspace (sem password_hash)."""
    url = f"{_base()}/rest/v1/workspace_members"
    params = {"workspace_id": f"eq.{workspace_id}", "order": "nome.asc", "select": "id,workspace_id,nome,email,telefone,can_estudantes,can_pei,can_paee,can_hub,can_diario,can_avaliacao,can_gestao,link_type,active,created_at,updated_at"}
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


def _hash_password(plain: str) -> str | None:
    """Retorna hash bcrypt da senha."""
    if not plain or not bcrypt:
        return None
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_member_password(workspace_id: str, email: str, password: str) -> bool:
    """Verifica se o email+senha correspondem a um membro ativo."""
    url = f"{_base()}/rest/v1/workspace_members"
    params = {"workspace_id": f"eq.{workspace_id}", "email": f"eq.{email.strip().lower()}", "select": "id,password_hash,active"}
    r = requests.get(url, headers={**_headers(), "Accept": "application/json"}, params=params, timeout=10)
    if r.status_code != 200:
        return False
    data = r.json()
    if not isinstance(data, list) or not data:
        return False
    m = data[0]
    if not m.get("active", True):
        return False
    ph = m.get("password_hash")
    if not ph:
        return True
    if not password or not bcrypt:
        return False
    try:
        return bcrypt.checkpw(password.encode("utf-8"), ph.encode("utf-8"))
    except Exception:
        return False


def create_member(
    workspace_id: str,
    nome: str,
    email: str,
    password: str = "",
    telefone: str = "",
    can_estudantes: bool = False,
    can_pei: bool = False,
    can_paee: bool = False,
    can_hub: bool = False,
    can_diario: bool = False,
    can_avaliacao: bool = False,
    can_gestao: bool = False,
    link_type: str = "todos",
    teacher_assignments: list = None,  # [{class_id, component_id}, ...]
    student_ids: list = None,
):
    """Cria membro e seus vínculos (turma+componente ou alunos). Senha é obrigatória."""
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
    ph = _hash_password(password)
    if ph:
        row["password_hash"] = ph
    url = f"{_base()}/rest/v1/workspace_members"
    h = {**_headers(), "Prefer": "return=representation"}
    r = requests.post(url, headers=h, json=row, timeout=15)
    if r.status_code >= 400:
        return None, str(r.text)
    data = r.json()
    member = data[0] if isinstance(data, list) and data else data
    member_id = member.get("id")

    if member_id and link_type == "turma" and teacher_assignments:
        for a in teacher_assignments:
            _add_teacher_assignment(member_id, a.get("class_id"), a.get("component_id"))
    if member_id and link_type == "tutor" and student_ids:
        for sid in student_ids:
            _add_student_link(member_id, sid)
    return member, None


def update_member(
    member_id: str,
    nome: str = None,
    email: str = None,
    password: str = None,
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
    """Atualiza membro. Passar None = não alterar. password vazio = não alterar."""
    updates = {}
    if nome is not None:
        updates["nome"] = nome.strip()
    if email is not None:
        updates["email"] = email.strip().lower()
    if telefone is not None:
        updates["telefone"] = (telefone or "").strip()
    ph = _hash_password(password) if password and len(password) >= 4 else None
    if ph is not None:
        updates["password_hash"] = ph
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
    if updates:
        url = f"{_base()}/rest/v1/workspace_members?id=eq.{member_id}"
        r = requests.patch(url, headers=_headers(), json=updates, timeout=15)
        if r.status_code >= 400:
            return False, str(r.text)

    if class_assignments is not None:
        _replace_teacher_assignments(member_id, class_assignments)
    if student_ids is not None:
        _replace_student_links(member_id, student_ids)
    return True, None


def deactivate_member(member_id: str):
    """Desativa membro (soft delete)."""
    url = f"{_base()}/rest/v1/workspace_members?id=eq.{member_id}"
    return requests.patch(url, headers=_headers(), json={"active": False}, timeout=15).status_code < 400


def reactivate_member(member_id: str):
    """Reativa membro desativado."""
    url = f"{_base()}/rest/v1/workspace_members?id=eq.{member_id}"
    return requests.patch(url, headers=_headers(), json={"active": True}, timeout=15).status_code < 400


def delete_member_permanently(member_id: str):
    """Remove membro do banco (libera o email para novo cadastro)."""
    url = f"{_base()}/rest/v1/workspace_members?id=eq.{member_id}"
    return requests.delete(url, headers=_headers(), timeout=15).status_code in (200, 204)


def _add_teacher_assignment(member_id: str, class_id: str, component_id: str):
    if not class_id or not component_id:
        return
    url = f"{_base()}/rest/v1/teacher_assignments"
    requests.post(url, headers=_headers(), json={
        "workspace_member_id": member_id,
        "class_id": class_id,
        "component_id": component_id,
    }, timeout=10)


def _replace_teacher_assignments(member_id: str, assignments: list):
    url = f"{_base()}/rest/v1/teacher_assignments?workspace_member_id=eq.{member_id}"
    requests.delete(url, headers=_headers(), timeout=10)
    for a in (assignments or []):
        _add_teacher_assignment(member_id, a.get("class_id"), a.get("component_id"))


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
    """Retorna lista de {grade_code, class_group} para filtro de alunos. Usa teacher_assignments + classes + grades."""
    url = f"{_base()}/rest/v1/teacher_assignments"
    params = {
        "workspace_member_id": f"eq.{member_id}",
        "select": "classes(class_group,grades(code))"
    }
    r = requests.get(url, headers={**_headers(), "Accept": "application/json"}, params=params, timeout=10)
    if r.status_code != 200:
        return []
    data = r.json()
    if not isinstance(data, list):
        return []
    pairs = []
    seen = set()
    for row in data:
        cls = row.get("classes") or row.get("class") or {}
        gr = cls.get("grades") or cls.get("grade") or {}
        code = str(gr.get("code", "") or "").strip()
        cg = str(cls.get("class_group", "") or "").strip()
        key = (code, cg)
        if key not in seen and (code or cg):
            seen.add(key)
            pairs.append({"grade": code, "class_group": cg})
    return pairs


def get_student_links(member_id: str) -> list:
    url = f"{_base()}/rest/v1/teacher_student_links"
    params = {"workspace_member_id": f"eq.{member_id}", "select": "student_id"}
    r = requests.get(url, headers={**_headers(), "Accept": "application/json"}, params=params, timeout=10)
    if r.status_code != 200:
        return []
    data = r.json()
    return [x.get("student_id") for x in (data if isinstance(data, list) else []) if x.get("student_id")]
