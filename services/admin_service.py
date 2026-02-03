"""
Admin da plataforma: criar escolas (workspaces + PIN), gerenciar masters.
"""
import os
import random
import requests

import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import omni_utils as ou

try:
    import bcrypt
except ImportError:
    bcrypt = None


def _base():
    return ou.get_setting("SUPABASE_URL", "").rstrip("/")


def _headers():
    return ou._headers()


def _hash_password(plain: str) -> str | None:
    if not plain or not bcrypt:
        return None
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


# --- Platform Admins ---

def list_platform_admins() -> list:
    """Lista admins da plataforma."""
    url = f"{_base()}/rest/v1/platform_admins"
    params = {"active": "eq.true", "select": "id,email,nome,created_at"}
    r = requests.get(url, headers={**_headers(), "Accept": "application/json"}, params=params, timeout=10)
    if r.status_code != 200:
        return []
    data = r.json()
    return data if isinstance(data, list) else []


def get_platform_admin_by_email(email: str) -> dict | None:
    """Retorna admin por email (com password_hash para verificação)."""
    url = f"{_base()}/rest/v1/platform_admins"
    params = {"email": f"eq.{email.strip().lower()}", "select": "id,email,nome,password_hash,active"}
    r = requests.get(url, headers={**_headers(), "Accept": "application/json"}, params=params, timeout=10)
    if r.status_code != 200:
        return None
    data = r.json()
    if not isinstance(data, list) or not data:
        return None
    return data[0]


def verify_platform_admin(email: str, password: str) -> bool:
    """Verifica email+senha do admin."""
    admin = get_platform_admin_by_email(email)
    if not admin or not admin.get("active", True):
        return False
    ph = admin.get("password_hash")
    if not ph or not password or not bcrypt:
        return False
    try:
        return bcrypt.checkpw(password.encode("utf-8"), ph.encode("utf-8"))
    except Exception:
        return False


def create_platform_admin(email: str, password: str, nome: str) -> tuple:
    """Cria admin da plataforma."""
    ph = _hash_password(password)
    if not ph or len(password) < 4:
        return None, "Senha deve ter no mínimo 4 caracteres."
    url = f"{_base()}/rest/v1/platform_admins"
    h = {**_headers(), "Prefer": "return=representation"}
    r = requests.post(url, headers=h, json={
        "email": email.strip().lower(),
        "password_hash": ph,
        "nome": nome.strip(),
    }, timeout=15)
    if r.status_code >= 400:
        return None, r.text
    data = r.json()
    return (data[0] if isinstance(data, list) else data), None


# --- Workspaces (escolas) ---

def _normalize_workspace(row: dict) -> dict:
    """Normaliza registro de workspace (aceita id/workspace_id, name/workspace_name, pin/pin_code/code, etc)."""
    pin_val = row.get("pin") or row.get("pin_code") or row.get("code") or row.get("pincode", "")
    return {
        "id": row.get("id") or row.get("workspace_id"),
        "name": row.get("name") or row.get("workspace_name") or row.get("nome", ""),
        "pin": str(pin_val) if pin_val else "",
        "created_at": row.get("created_at"),
    }


def list_workspaces() -> list:
    """Lista todas as escolas (workspaces). Tenta 'workspaces' e 'workspace'."""
    tables_to_try = ["workspaces", "workspace"]
    for table in tables_to_try:
        url = f"{_base()}/rest/v1/{table}"
        params = {"select": "*", "order": "created_at.desc"}
        try:
            r = requests.get(url, headers={**_headers(), "Accept": "application/json"}, params=params, timeout=15)
            if r.status_code == 200:
                data = r.json()
                rows = data if isinstance(data, list) else []
                return [_normalize_workspace(x) for x in rows if x.get("id") or x.get("workspace_id")]
        except Exception:
            continue
    return []


def _generate_pin() -> str:
    """Gera PIN no formato XXXX-XXXX."""
    chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    p1 = "".join(random.choice(chars) for _ in range(4))
    p2 = "".join(random.choice(chars) for _ in range(4))
    return f"{p1}-{p2}"


def create_workspace(name: str) -> tuple:
    """Cria escola (workspace) com PIN gerado. Retorna (workspace, pin) ou (None, erro)."""
    url = f"{_base()}/rest/v1/workspaces"
    for _ in range(20):
        pin = _generate_pin()
        h = {**_headers(), "Prefer": "return=representation"}
        r = requests.post(url, headers=h, json={"name": name.strip(), "pin": pin}, timeout=15)
        if r.status_code == 201:
            data = r.json()
            ws = data[0] if isinstance(data, list) else data
            return ws, pin
        if r.status_code == 409:  # duplicate pin, try again
            continue
        return None, r.text
    return None, "Não foi possível gerar PIN único."


# --- Gerenciar Masters ---

def update_workspace_master_password(workspace_id: str, new_password: str) -> tuple:
    """Atualiza senha do master do workspace."""
    ph = _hash_password(new_password)
    if not ph or len(new_password) < 4:
        return False, "Senha deve ter no mínimo 4 caracteres."
    url = f"{_base()}/rest/v1/workspace_masters"
    params = {"workspace_id": f"eq.{workspace_id}"}
    r = requests.get(url, headers={**_headers(), "Accept": "application/json"}, params=params, timeout=10)
    if r.status_code != 200:
        return False, "Tabela workspace_masters não encontrada."
    data = r.json()
    if not isinstance(data, list) or not data:
        return False, "Este workspace não tem master configurado."
    # PATCH para atualizar password_hash
    patch_url = f"{_base()}/rest/v1/workspace_masters?workspace_id=eq.{workspace_id}"
    r2 = requests.patch(patch_url, headers=_headers(), json={"password_hash": ph}, timeout=10)
    if r2.status_code >= 400:
        return False, r2.text
    return True, None


def delete_workspace_member(member_id: str) -> bool:
    """Remove usuário do workspace (hard delete)."""
    url = f"{_base()}/rest/v1/workspace_members?id=eq.{member_id}"
    r = requests.delete(url, headers=_headers(), timeout=10)
    return r.status_code in (200, 204)


def create_workspace_master_for_workspace(workspace_id: str, email: str, password: str, nome: str) -> tuple:
    """Admin cria o master de um workspace."""
    from services.members_service import create_workspace_master, create_member
    master, err = create_workspace_master(workspace_id, email, password, nome)
    if err:
        return None, err
    create_member(workspace_id, nome, email, password, can_gestao=True, can_estudantes=True, can_pei=True, can_paee=True, can_hub=True, can_diario=True, can_avaliacao=True, link_type="todos")
    return master, None
