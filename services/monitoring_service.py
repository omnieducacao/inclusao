"""
Serviços de monitoramento: eventos de uso (usage_events) e registro de bugs (platform_issues).
"""
from __future__ import annotations

import os
import sys
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

import requests

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import omni_utils as ou

UTC = timezone.utc


def _base() -> str:
    return ou.get_setting("SUPABASE_URL", "").rstrip("/")


def _headers() -> Dict[str, str]:
    return ou._headers()


# =============================================================================
# Usage Events
# =============================================================================
def log_usage_event(
    event_type: str,
    workspace_id: Optional[str] = None,
    actor_type: Optional[str] = None,
    actor_id: Optional[str] = None,
    source: Optional[str] = None,
    ai_engine: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
) -> bool:
    """
    Registra um evento em usage_events. Retorna True se sucesso.
    """
    if not event_type:
        return False
    url = f"{_base()}/rest/v1/usage_events"
    payload: Dict[str, Any] = {
        "event_type": event_type,
    }
    if workspace_id:
        payload["workspace_id"] = workspace_id
    if actor_type:
        payload["actor_type"] = actor_type
    if actor_id:
        payload["actor_id"] = actor_id
    if source:
        payload["source"] = source
    if ai_engine:
        payload["ai_engine"] = ai_engine
    if metadata:
        payload["metadata"] = metadata
    if ip_address:
        payload["ip_address"] = ip_address
    if user_agent:
        payload["user_agent"] = user_agent
    try:
        h = {**_headers(), "Prefer": "return=minimal"}
        r = requests.post(url, headers=h, json=payload, timeout=10)
        return r.status_code < 400
    except Exception:
        return False


def _parse_iso(ts: str) -> datetime:
    if not ts:
        return datetime.now(UTC)
    if ts.endswith("Z"):
        ts = ts[:-1] + "+00:00"
    try:
        return datetime.fromisoformat(ts)
    except Exception:
        return datetime.now(UTC)


def fetch_usage_events(days: int = 7, limit: int = 500, workspace_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Retorna eventos recentes (limit) para alimentar o dashboard.
    """
    url = f"{_base()}/rest/v1/usage_events"
    params = {
        "order": "created_at.desc",
        "limit": str(max(1, limit)),
        "select": "id,workspace_id,event_type,source,ai_engine,actor_type,actor_id,metadata,created_at",
    }
    if days:
        since = (datetime.now(UTC) - timedelta(days=days)).isoformat()
        params["created_at"] = f"gte.{since}"
    if workspace_id:
        params["workspace_id"] = f"eq.{workspace_id}"
    try:
        r = requests.get(url, headers={**_headers(), "Accept": "application/json"}, params=params, timeout=10)
        data = r.json() if r.status_code == 200 else []
        return data if isinstance(data, list) else []
    except Exception:
        return []


def get_usage_snapshot(days: int = 7, limit: int = 500, workspace_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Consolida métricas para o dashboard.
    """
    events = fetch_usage_events(days=days, limit=limit, workspace_id=workspace_id)
    total = len(events)
    by_type: Dict[str, int] = {}
    by_engine: Dict[str, int] = {}
    timeline: Dict[str, int] = {}
    for ev in events:
        etype = ev.get("event_type") or "desconhecido"
        by_type[etype] = by_type.get(etype, 0) + 1
        eng = ev.get("ai_engine") or "—"
        by_engine[eng] = by_engine.get(eng, 0) + 1
        ts = _parse_iso(ev.get("created_at", ""))
        day_key = ts.date().isoformat()
        timeline[day_key] = timeline.get(day_key, 0) + 1
    by_type_list = [{"event_type": k, "count": v} for k, v in sorted(by_type.items(), key=lambda x: x[0])]
    by_engine_list = [{"ai_engine": k, "count": v} for k, v in sorted(by_engine.items(), key=lambda x: x[0])]
    timeline_list = [{"day": k, "count": timeline[k]} for k in sorted(timeline.keys())]
    recent = events[:25]
    return {
        "total": total,
        "by_type": by_type_list,
        "by_engine": by_engine_list,
        "timeline": timeline_list,
        "recent": recent,
    }


# =============================================================================
# Platform Issues
# =============================================================================
def list_platform_issues(status: Optional[str] = None, limit: int = 200) -> List[Dict[str, Any]]:
    url = f"{_base()}/rest/v1/platform_issues"
    params = {
        "order": "created_at.desc",
        "limit": str(max(1, limit)),
        "select": "id,workspace_id,title,description,severity,status,source,created_by,ai_insight,resolution_notes,resolved_at,created_at",
    }
    if status:
        params["status"] = f"eq.{status}"
    try:
        r = requests.get(url, headers={**_headers(), "Accept": "application/json"}, params=params, timeout=10)
        data = r.json() if r.status_code == 200 else []
        return data if isinstance(data, list) else []
    except Exception:
        return []


def create_platform_issue(
    title: str,
    description: str = "",
    severity: str = "média",
    workspace_id: Optional[str] = None,
    source: str = "",
    created_by: str = "",
    ai_insight: str = "",
) -> bool:
    if not title:
        return False
    url = f"{_base()}/rest/v1/platform_issues"
    payload: Dict[str, Any] = {
        "title": title.strip(),
        "description": description.strip(),
        "severity": severity,
        "source": source,
        "created_by": created_by,
    }
    if workspace_id:
        payload["workspace_id"] = workspace_id
    if ai_insight:
        payload["ai_insight"] = ai_insight
    try:
        h = {**_headers(), "Prefer": "return=minimal"}
        r = requests.post(url, headers=h, json=payload, timeout=10)
        return r.status_code < 400
    except Exception:
        return False


# =============================================================================
# IA Usage (uso por escola + créditos)
# =============================================================================
def log_ia_usage(
    workspace_id: str,
    engine: str,
    source: Optional[str] = None,
    credits_consumed: float = 1.0,
) -> bool:
    """Registra uma chamada de IA na tabela ia_usage. Retorna True se sucesso."""
    if not workspace_id or not engine:
        return False
    url = f"{_base()}/rest/v1/ia_usage"
    payload: Dict[str, Any] = {
        "workspace_id": workspace_id,
        "engine": engine.strip().lower(),
        "credits_consumed": credits_consumed,
    }
    if source:
        payload["source"] = source
    try:
        h = {**_headers(), "Prefer": "return=minimal"}
        r = requests.post(url, headers=h, json=payload, timeout=3)
        return r.status_code < 400
    except Exception:
        return False


def get_ia_usage_summary(
    days: int = 30,
    workspace_id: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Retorna resumo de uso de IA por escola (e opcionalmente por workspace).
    Agrupa por workspace_id com contagem por engine e total de créditos.
    """
    since = (datetime.now(UTC) - timedelta(days=max(1, days))).isoformat()
    url = f"{_base()}/rest/v1/ia_usage"
    params = {
        "select": "workspace_id,engine,credits_consumed,created_at",
        "created_at": f"gte.{since}",
        "order": "created_at.desc",
        "limit": "10000",
    }
    if workspace_id:
        params["workspace_id"] = f"eq.{workspace_id}"
    try:
        r = requests.get(
            url,
            headers={**_headers(), "Accept": "application/json"},
            params=params,
            timeout=15,
        )
        if r.status_code != 200:
            return []
        rows = r.json() if isinstance(r.json(), list) else []
    except Exception:
        return []

    # Agregar por workspace
    by_ws: Dict[str, Dict[str, Any]] = {}
    for row in rows:
        wid = row.get("workspace_id")
        if not wid:
            continue
        wid_str = str(wid)
        if wid_str not in by_ws:
            by_ws[wid_str] = {
                "workspace_id": wid_str,
                "red": 0,
                "blue": 0,
                "green": 0,
                "yellow": 0,
                "orange": 0,
                "total_calls": 0,
                "credits_used": 0.0,
            }
        eng = (row.get("engine") or "").strip().lower()
        cred = float(row.get("credits_consumed") or 1)
        by_ws[wid_str]["total_calls"] += 1
        by_ws[wid_str]["credits_used"] += cred
        if eng in ("red", "blue", "green", "yellow", "orange"):
            by_ws[wid_str][eng] = by_ws[wid_str].get(eng, 0) + 1

    # Buscar nomes das escolas
    try:
        from services.admin_service import list_workspaces
        workspaces = {str(w.get("id")): w.get("name", "—") for w in list_workspaces() if w.get("id")}
    except Exception:
        workspaces = {}
    result = []
    for wid_str, data in by_ws.items():
        data["workspace_name"] = workspaces.get(wid_str, "—")
        result.append(data)
    result.sort(key=lambda x: (x["credits_used"], x["total_calls"]), reverse=True)
    return result


def update_platform_issue_status(
    issue_id: str,
    status: Optional[str] = None,
    resolution_notes: Optional[str] = None,
) -> bool:
    if not issue_id:
        return False
    url = f"{_base()}/rest/v1/platform_issues?id=eq.{issue_id}"
    payload: Dict[str, Any] = {}
    if status:
        payload["status"] = status
        if status in ("resolvido", "arquivado"):
            payload["resolved_at"] = datetime.now(UTC).isoformat()
    if resolution_notes is not None:
        payload["resolution_notes"] = resolution_notes
    try:
        r = requests.patch(url, headers={**_headers(), "Prefer": "return=minimal"}, json=payload, timeout=10)
        return r.status_code < 400
    except Exception:
        return False
