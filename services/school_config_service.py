"""
Configuração da escola: ano letivo, séries, turmas.
Fluxo: 1) Ano letivo  2) Turmas (série + turma)  3) Usuários
"""
import os
import requests
from typing import Optional

import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import omni_utils as ou


def _base():
    return ou.get_setting("SUPABASE_URL", "").rstrip("/")


def _headers():
    return ou._headers()


# Segmentos e componentes (fixos)
SEGMENTS = [
    ("EI", "Educação Infantil"),
    ("EFAI", "EF - Anos Iniciais (1º ao 5º)"),
    ("EFAF", "EF - Anos Finais (6º ao 9º)"),
    ("EM", "Ensino Médio"),
]

COMPONENTS = [
    ("educacao_infantil", "Educação Infantil"),
    ("arte", "Arte"),
    ("ciencias", "Ciências"),
    ("educacao_fisica", "Educação Física"),
    ("geografia", "Geografia"),
    ("historia", "História"),
    ("lingua_inglesa", "Língua Inglesa"),
    ("lingua_portuguesa", "Língua Portuguesa"),
    ("matematica", "Matemática"),
    ("biologia", "Biologia"),
    ("fisica", "Física"),
    ("quimica", "Química"),
    ("filosofia", "Filosofia"),
    ("sociologia", "Sociologia"),
]


def list_school_years(workspace_id: str) -> list:
    url = f"{_base()}/rest/v1/school_years"
    params = {"workspace_id": f"eq.{workspace_id}", "order": "year.desc", "select": "*"}
    r = requests.get(url, headers={**_headers(), "Accept": "application/json"}, params=params, timeout=15)
    return r.json() if r.status_code == 200 and isinstance(r.json(), list) else []


def create_school_year(workspace_id: str, year: int, name: str = None, active: bool = True) -> tuple:
    name = name or str(year)
    url = f"{_base()}/rest/v1/school_years"
    h = {**_headers(), "Prefer": "return=representation"}
    r = requests.post(url, headers=h, json={
        "workspace_id": workspace_id,
        "year": year,
        "name": name,
        "active": active,
    }, timeout=15)
    if r.status_code >= 400:
        return None, str(r.text)
    data = r.json()
    return (data[0] if isinstance(data, list) else data), None


def list_workspace_grades(workspace_id: str) -> list:
    """Séries que a escola oferece (ids)."""
    url = f"{_base()}/rest/v1/workspace_grades"
    params = {"workspace_id": f"eq.{workspace_id}", "select": "grade_id"}
    r = requests.get(url, headers={**_headers(), "Accept": "application/json"}, params=params, timeout=15)
    data = r.json() if r.status_code == 200 else []
    return [x.get("grade_id") for x in (data if isinstance(data, list) else []) if x.get("grade_id")]


def set_workspace_grades(workspace_id: str, grade_ids: list) -> bool:
    """Define quais séries a escola oferece."""
    url_del = f"{_base()}/rest/v1/workspace_grades?workspace_id=eq.{workspace_id}"
    requests.delete(url_del, headers=_headers(), timeout=10)
    if not grade_ids:
        return True
    url = f"{_base()}/rest/v1/workspace_grades"
    for gid in grade_ids:
        requests.post(url, headers=_headers(), json={"workspace_id": workspace_id, "grade_id": gid}, timeout=10)
    return True


def list_grades(segment_id: str = None) -> list:
    url = f"{_base()}/rest/v1/grades"
    params = {"order": "sort_order.asc", "select": "*"}
    if segment_id:
        params["segment_id"] = f"eq.{segment_id}"
    r = requests.get(url, headers={**_headers(), "Accept": "application/json"}, params=params, timeout=15)
    return r.json() if r.status_code == 200 and isinstance(r.json(), list) else []


def list_grades_for_workspace(workspace_id: str, segment_id: str = None) -> list:
    """Lista séries (filtradas pelas que a escola oferece, ou todas do segmento se vazio)."""
    all_grades = list_grades(segment_id)
    ws_grade_ids = set(list_workspace_grades(workspace_id))
    if not ws_grade_ids:
        return all_grades
    return [g for g in all_grades if g.get("id") in ws_grade_ids]


def list_classes(workspace_id: str, school_year_id: str = None, grade_id: str = None) -> list:
    url = f"{_base()}/rest/v1/classes"
    params = {"workspace_id": f"eq.{workspace_id}", "select": "id,class_group,grade_id,school_year_id,grades(id,code,label)", "order": "class_group.asc"}
    if school_year_id:
        params["school_year_id"] = f"eq.{school_year_id}"
    if grade_id:
        params["grade_id"] = f"eq.{grade_id}"
    r = requests.get(url, headers={**_headers(), "Accept": "application/json"}, params=params, timeout=15)
    data = r.json() if r.status_code == 200 else []
    if not isinstance(data, list):
        return []
    for c in data:
        if "grades" in c and "grade" not in c:
            c["grade"] = c.pop("grades", {})
    return data


def create_class(workspace_id: str, school_year_id: str, grade_id: str, class_group: str) -> tuple:
    url = f"{_base()}/rest/v1/classes"
    h = {**_headers(), "Prefer": "return=representation"}
    r = requests.post(url, headers=h, json={
        "workspace_id": workspace_id,
        "school_year_id": school_year_id,
        "grade_id": grade_id,
        "class_group": str(class_group).strip().upper() or "A",
    }, timeout=15)
    if r.status_code >= 400:
        return None, str(r.text)
    data = r.json()
    return (data[0] if isinstance(data, list) else data), None


def delete_class(class_id: str) -> bool:
    """Remove uma turma."""
    url = f"{_base()}/rest/v1/classes?id=eq.{class_id}"
    r = requests.delete(url, headers=_headers(), timeout=10)
    return r.status_code in (200, 204)


def list_components() -> list:
    url = f"{_base()}/rest/v1/components"
    params = {"order": "sort_order.asc", "select": "id,label"}
    r = requests.get(url, headers={**_headers(), "Accept": "application/json"}, params=params, timeout=15)
    return r.json() if r.status_code == 200 and isinstance(r.json(), list) else []
