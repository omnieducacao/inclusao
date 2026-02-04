"""
Gestão de usuários do workspace: CRUD de membros, vínculos e permissões.
Tudo gira em torno do estudante; professores vinculados por turma ou alunos.
"""
from __future__ import annotations

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
    params = {"workspace_id": f"eq.{workspace_id}", "order": "nome.asc", "select": "id,workspace_id,nome,email,telefone,cargo,can_estudantes,can_pei,can_paee,can_hub,can_diario,can_avaliacao,can_gestao,link_type,active,created_at,updated_at"}
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


def get_workspace_master(workspace_id: str) -> Optional[dict]:
    """Retorna o master do workspace (se existir)."""
    url = f"{_base()}/rest/v1/workspace_masters"
    params = {"workspace_id": f"eq.{workspace_id}", "select": "workspace_id,email,password_hash,nome,telefone,cargo"}
    r = requests.get(url, headers={**_headers(), "Accept": "application/json"}, params=params, timeout=10)
    if r.status_code != 200:
        return None
    data = r.json()
    if not isinstance(data, list) or not data:
        return None
    return data[0]


def verify_workspace_master(workspace_id: str, email: str, password: str) -> bool:
    """Verifica se o email+senha correspondem ao master do workspace."""
    master = get_workspace_master(workspace_id)
    if not master:
        return False
    if (master.get("email") or "").strip().lower() != (email or "").strip().lower():
        return False
    ph = master.get("password_hash")
    if not ph or not password or not bcrypt:
        return False
    try:
        return bcrypt.checkpw(password.encode("utf-8"), ph.encode("utf-8"))
    except Exception:
        return False


def create_workspace_master(
    workspace_id: str,
    email: str,
    password: str,
    nome: str,
    telefone: str = "",
    cargo: str = "",
) -> tuple:
    """Cria o usuário master do workspace (primeiro acesso)."""
    ph = _hash_password(password)
    if not ph or len(password) < 4:
        return None, "Senha deve ter no mínimo 4 caracteres."
    url = f"{_base()}/rest/v1/workspace_masters"
    payload = {
        "workspace_id": workspace_id,
        "email": email.strip().lower(),
        "password_hash": ph,
        "nome": nome.strip(),
    }
    if telefone is not None:
        payload["telefone"] = (telefone or "").strip()
    if cargo is not None:
        payload["cargo"] = (cargo or "").strip()
    h = {**_headers(), "Prefer": "return=minimal"}
    r = requests.post(url, headers=h, json=payload, timeout=15)
    if r.status_code >= 400:
        return None, str(r.text)
    return {"workspace_id": workspace_id, "email": email, "nome": nome}, None


def find_user_by_email(email: str) -> Optional[dict]:
    """
    Busca usuário por email em workspace_masters e workspace_members.
    Retorna {workspace_id, workspace_name, role, user_data} ou None.
    Útil para login só com email+senha (sem PIN).
    """
    email_val = (email or "").strip().lower()
    if not email_val:
        return None
    # 1. Busca em workspace_masters
    url_m = f"{_base()}/rest/v1/workspace_masters"
    params_m = {"email": f"eq.{email_val}", "select": "workspace_id,email,password_hash,nome"}
    r_m = requests.get(url_m, headers={**_headers(), "Accept": "application/json"}, params=params_m, timeout=10)
    if r_m.status_code == 200 and r_m.json() and isinstance(r_m.json(), list) and r_m.json():
        m = r_m.json()[0]
        ws_id = m.get("workspace_id")
        ws_name = _get_workspace_name(ws_id)
        return {"workspace_id": ws_id, "workspace_name": ws_name, "role": "master", "user": m}
    # 2. Busca em workspace_members (ativos)
    url_w = f"{_base()}/rest/v1/workspace_members"
    params_w = {"email": f"eq.{email_val}", "active": "eq.true", "select": "id,workspace_id,nome,email,telefone,can_estudantes,can_pei,can_paee,can_hub,can_diario,can_avaliacao,can_gestao,link_type"}
    r_w = requests.get(url_w, headers={**_headers(), "Accept": "application/json"}, params=params_w, timeout=10)
    if r_w.status_code == 200 and r_w.json() and isinstance(r_w.json(), list) and r_w.json():
        m = r_w.json()[0]
        ws_id = m.get("workspace_id")
        ws_name = _get_workspace_name(ws_id)
        return {"workspace_id": ws_id, "workspace_name": ws_name, "role": "member", "user": m}
    return None


def _get_workspace_name(workspace_id: str) -> str:
    """Retorna o nome do workspace pelo id."""
    if not workspace_id:
        return ""
    try:
        url = f"{_base()}/rest/v1/workspaces"
        r = requests.get(url, headers={**_headers(), "Accept": "application/json"},
                        params={"id": f"eq.{workspace_id}", "select": "name"}, timeout=5)
        if r.status_code == 200 and r.json() and isinstance(r.json(), list) and r.json():
            return r.json()[0].get("name", "") or ""
    except Exception:
        pass
    try:
        url = f"{_base()}/rest/v1/workspace"
        r = requests.get(url, headers={**_headers(), "Accept": "application/json"},
                        params={"id": f"eq.{workspace_id}", "select": "name"}, timeout=5)
        if r.status_code == 200 and r.json() and isinstance(r.json(), list) and r.json():
            return r.json()[0].get("name", "") or r.json()[0].get("workspace_name", "")
    except Exception:
        pass
    return ""


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
    cargo: str = "",
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
        "cargo": (cargo or "").strip(),
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
    cargo: str = None,
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
    if cargo is not None:
        updates["cargo"] = (cargo or "").strip()
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
        "select": "classes(class_group,grades(code,label))"
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
        label = str(gr.get("label", "") or "").strip()
        cg = str(cls.get("class_group", "") or "").strip()
        if (code or label) and cg:
            key = (code, cg)
            if key not in seen:
                seen.add(key)
                pairs.append({"grade": code, "grade_label": label, "class_group": cg})
    return pairs


def get_student_links(member_id: str) -> list:
    url = f"{_base()}/rest/v1/teacher_student_links"
    params = {"workspace_member_id": f"eq.{member_id}", "select": "student_id"}
    r = requests.get(url, headers={**_headers(), "Accept": "application/json"}, params=params, timeout=10)
    if r.status_code != 200:
        return []
    data = r.json()
    return [x.get("student_id") for x in (data if isinstance(data, list) else []) if x.get("student_id")]


def get_member_components(member_id: str) -> list:
    """
    Retorna lista única de labels de componentes curriculares que o membro leciona.
    Baseado em teacher_assignments (turma + componente). Vazio se não tiver vínculo por turma.
    """
    if not member_id:
        return []
    url = f"{_base()}/rest/v1/teacher_assignments"
    params = {
        "workspace_member_id": f"eq.{member_id}",
        "select": "component_id,components(id,label)"
    }
    r = requests.get(url, headers={**_headers(), "Accept": "application/json"}, params=params, timeout=10)
    if r.status_code != 200:
        return []
    data = r.json()
    if not isinstance(data, list):
        return []
    labels = []
    seen = set()
    for row in data:
        comp = row.get("components") or {}
        if isinstance(comp, dict):
            lab = (comp.get("label") or comp.get("id") or "").strip()
        else:
            lab = str(comp).strip() if comp else ""
        if lab and lab not in seen:
            seen.add(lab)
            labels.append(lab)
    return sorted(labels)
