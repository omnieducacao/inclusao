"""
Serviço de feedback de IA: captura validações e refazimentos para treinamento.
Omnisfera MVP: não perder nenhum dado de evolução.
"""
import os
import requests

import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import omni_utils as ou

try:
    import streamlit as st
except ImportError:
    st = None


def _base():
    return ou.get_setting("SUPABASE_URL", "").rstrip("/")


def _headers():
    return ou._headers()


def save_ai_feedback(
    source: str,
    action: str,
    content_type: str = None,
    feedback_text: str = None,
    metadata: dict = None,
) -> bool:
    """
    Salva feedback de IA (validação ou refazer).
    source: pei, paee, hub
    action: validated, refazer
    content_type: relatorio_pei, jornada_gamificada, atividade_adaptada, roteiro, etc.
    feedback_text: o que o usuário disse que ficou errado (para refazer)
    metadata: contexto adicional (student_id, prompt_hash, etc.)
    """
    try:
        ws_id = st.session_state.get("workspace_id") if st else None
        member = st.session_state.get("member") if st else None
        member_id = member.get("id") if isinstance(member, dict) and member else None

        row = {
            "workspace_id": ws_id,
            "member_id": member_id,
            "source": str(source).strip()[:64],
            "action": str(action).strip()[:32],
            "feedback_text": (feedback_text or "").strip()[:2000] or None,
            "metadata": metadata or {},
        }
        if content_type:
            row["content_type"] = str(content_type).strip()[:64]

        url = f"{_base()}/rest/v1/ai_feedback"
        h = {**_headers(), "Prefer": "return=minimal"}
        r = requests.post(url, headers=h, json=row, timeout=10)
        return r.status_code in (200, 201)
    except Exception:
        return False
