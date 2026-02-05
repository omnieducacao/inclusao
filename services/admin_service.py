"""
Admin da plataforma: criar escolas (workspaces + PIN), gerenciar masters.
"""
import os
import random
import time
from typing import Optional, Tuple
import requests

# Cache do plano por workspace (evita chamadas repetidas ao Supabase)
_workspace_plan_cache: dict = {}
_WORKSPACE_PLAN_TTL_SEC = 300  # 5 minutos

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


def _hash_password(plain: str) -> Optional[str]:
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


def get_platform_admin_by_email(email: str) -> Optional[dict]:
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
        "segments": row.get("segments") or [],
        "ai_engines": row.get("ai_engines") or [],
        "enabled_modules": row.get("enabled_modules"),  # None = todos habilitados (retrocompat)
        "active": row.get("active", True) if row.get("active") is not False else False,
        "created_at": row.get("created_at"),
        "plan": (row.get("plan") or "basic").strip() or "basic",
        "credits_limit": row.get("credits_limit"),
        "credits_period_start": row.get("credits_period_start"),
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


def get_workspace(workspace_id: str) -> Optional[dict]:
    """Retorna um workspace por id (normalizado)."""
    if not workspace_id:
        return None
    url = f"{_base()}/rest/v1/workspaces"
    params = {"id": f"eq.{workspace_id}", "select": "*"}
    try:
        r = requests.get(url, headers={**_headers(), "Accept": "application/json"}, params=params, timeout=10)
        if r.status_code != 200:
            return None
        data = r.json()
        if not isinstance(data, list) or not data:
            return None
        return _normalize_workspace(data[0])
    except Exception:
        return None


def get_workspace_plan(workspace_id: str) -> str:
    """Retorna o plano da escola (basic ou robusto). Cache de 5 min para evitar lentidão."""
    if not workspace_id:
        return "basic"
    now = time.time()
    entry = _workspace_plan_cache.get(workspace_id)
    if entry and (now - entry[0]) < _WORKSPACE_PLAN_TTL_SEC:
        return entry[1]
    ws = get_workspace(workspace_id)
    plan = (ws.get("plan") or "basic").strip() or "basic" if ws else "basic"
    _workspace_plan_cache[workspace_id] = (now, plan)
    return plan


# Cache de ai_engines por workspace (evita chamadas repetidas)
_workspace_engines_cache: dict = {}
_WORKSPACE_ENGINES_TTL_SEC = 300  # 5 minutos


def workspace_has_engine(workspace_id: str, engine: str) -> bool:
    """
    Verifica se o motor de IA está habilitado para a escola.
    A associação é feita manualmente no cadastro da escola (ai_engines).
    - Se ai_engines vazio/None: permite todos (retrocompatibilidade).
    - Se ai_engines preenchido: só permite os listados (red, blue, green, yellow, orange).
    """
    if not workspace_id or not engine:
        return True  # sem contexto, não bloqueia
    engine = str(engine).strip().lower()
    now = time.time()
    cache_key = f"{workspace_id}:engines"
    entry = _workspace_engines_cache.get(cache_key)
    if entry and (now - entry[0]) < _WORKSPACE_ENGINES_TTL_SEC:
        engines = entry[1]
    else:
        ws = get_workspace(workspace_id)
        engines = ws.get("ai_engines") if ws else []
        _workspace_engines_cache[cache_key] = (now, engines)
    if not engines:  # vazio = todos permitidos (retrocompat)
        return True
    engines_lower = [str(e).strip().lower() for e in engines if e]
    return engine in engines_lower


def update_workspace(workspace_id: str, enabled_modules: Optional[list] = None, name: str = None, segments: list = None, ai_engines: list = None, active: bool = None, plan: Optional[str] = None, credits_limit: Optional[int] = None, credits_period_start=None, **kwargs) -> tuple:
    """Atualiza workspace. Retorna (True, None) ou (False, erro)."""
    if not workspace_id:
        return False, "workspace_id obrigatório"
    payload = {}
    if enabled_modules is not None:
        payload["enabled_modules"] = enabled_modules
    if name is not None:
        payload["name"] = str(name).strip()
    if segments is not None:
        payload["segments"] = segments
    if ai_engines is not None:
        payload["ai_engines"] = ai_engines
    if active is not None:
        payload["active"] = bool(active)
    if plan is not None:
        payload["plan"] = str(plan).strip() or "basic"
    if credits_limit is not None:
        payload["credits_limit"] = credits_limit if credits_limit >= 0 else None
    if credits_period_start is not None:
        payload["credits_period_start"] = credits_period_start
    payload.update(kwargs)
    if not payload:
        return True, None
    url = f"{_base()}/rest/v1/workspaces?id=eq.{workspace_id}"
    r = requests.patch(url, headers=_headers(), json=payload, timeout=10)
    return (r.status_code in (200, 204), None if r.status_code in (200, 204) else (r.text or str(r.status_code)))


def deactivate_workspace(workspace_id: str) -> bool:
    """Desativa escola (soft delete). Dados mantidos, login bloqueado."""
    ok, _ = update_workspace(workspace_id, active=False)
    return ok


def reactivate_workspace(workspace_id: str) -> bool:
    """Reativa escola desativada."""
    ok, _ = update_workspace(workspace_id, active=True)
    return ok


def delete_workspace(workspace_id: str) -> bool:
    """Remove escola do banco (hard delete). Atenção: remove dados relacionados."""
    url = f"{_base()}/rest/v1/workspaces?id=eq.{workspace_id}"
    r = requests.delete(url, headers=_headers(), timeout=15)
    return r.status_code in (200, 204)


def _generate_pin() -> str:
    """Gera PIN no formato XXXX-XXXX."""
    chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    p1 = "".join(random.choice(chars) for _ in range(4))
    p2 = "".join(random.choice(chars) for _ in range(4))
    return f"{p1}-{p2}"


def create_workspace(name: str, segments: Optional[list] = None, ai_engines: Optional[list] = None) -> Tuple[Optional[dict], str]:
    """Cria escola (workspace) com PIN gerado. Retorna (workspace, pin) ou (None, erro)."""
    url = f"{_base()}/rest/v1/workspaces"
    for _ in range(20):
        pin = _generate_pin()
        h = {**_headers(), "Prefer": "return=representation"}
        payload = {
            "name": name.strip(),
            "pin": pin,
        }
        if segments is not None:
            payload["segments"] = segments
        if ai_engines is not None:
            payload["ai_engines"] = ai_engines
        r = requests.post(url, headers=h, json=payload, timeout=15)
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


def create_workspace_master_for_workspace(
    workspace_id: str,
    email: str,
    password: str,
    nome: str,
    telefone: str = "",
    cargo: str = "",
) -> tuple:
    """Admin cria o master de um workspace."""
    from services.members_service import create_workspace_master, create_member
    master, err = create_workspace_master(workspace_id, email, password, nome, telefone=telefone, cargo=cargo)
    if err:
        return None, err
    create_member(
        workspace_id,
        nome,
        email,
        password,
        telefone=telefone,
        cargo=cargo,
        can_gestao=True,
        can_estudantes=True,
        can_pei=True,
        can_paee=True,
        can_hub=True,
        can_diario=True,
        can_avaliacao=True,
        link_type="todos",
    )
    return master, None


# --- Platform Config (termo de uso) ---

def get_platform_config(key: str) -> str:
    """Retorna valor de configuração (ex: terms_of_use)."""
    url = f"{_base()}/rest/v1/platform_config"
    params = {"key": f"eq.{key}", "select": "value"}
    try:
        r = requests.get(url, headers={**_headers(), "Accept": "application/json"}, params=params, timeout=10)
        if r.status_code == 200:
            data = r.json()
            if isinstance(data, list) and data:
                return data[0].get("value", "") or ""
    except Exception:
        pass
    return ""


def set_platform_config(key: str, value: str) -> tuple:
    """Atualiza configuração (upsert). Retorna (True, None) ou (False, erro)."""
    url = f"{_base()}/rest/v1/platform_config"
    val = (value or "").strip()
    h = {**_headers(), "Prefer": "resolution=merge-duplicates"}
    r = requests.post(url, headers=h, json={"key": key, "value": val}, timeout=10)
    return (r.status_code in (200, 201), None if r.status_code in (200, 201) else r.text)
