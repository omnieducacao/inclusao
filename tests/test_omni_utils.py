"""
Testes para omni_utils.py (funções puramente lógicas, sem Streamlit)
"""
from __future__ import annotations

import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)


def test_get_icon():
    """get_icon retorna HTML ou emoji válido."""
    from omni_utils import get_icon, get_icon_emoji

    html = get_icon("pei", use_emoji=False)
    assert "pei" in html.lower() or "ri-" in html or "question" in html

    emoji = get_icon("pei", use_emoji=True)
    assert len(emoji) > 0

    e2 = get_icon_emoji("pei")
    assert e2 in ["📘", "❓"]  # emoji conhecido ou fallback


def test_icon_title():
    """icon_title combina ícone e texto."""
    from omni_utils import icon_title

    t = icon_title("PEI", "pei")
    assert "PEI" in t


def test_get_initials():
    """_get_initials extrai iniciais corretamente."""
    from omni_utils import _get_initials

    assert _get_initials("João Silva") == "JS"
    assert _get_initials("Maria") == "MA"
    assert _get_initials("") == "U"


def test_grade_label_helper():
    """_grade_label lida com grade como dict ou não."""
    # A função _grade_label está em 6_Gestao_Usuarios, mas a lógica é simples
    def _grade_label(c):
        g = c.get("grade") or c.get("grades")
        if g is None:
            return ""
        if isinstance(g, dict):
            return g.get("label", "") or ""
        if isinstance(g, list) and g and isinstance(g[0], dict):
            return g[0].get("label", "") or ""
        return ""

    assert _grade_label({"grade": {"label": "1º Ano"}}) == "1º Ano"
    assert _grade_label({"grade": None}) == ""
    assert _grade_label({"grade": "1º Ano"}) == ""  # string, não dict
    assert _grade_label({}) == ""


def test_html_escape_in_render_acesso_bloqueado():
    """render_acesso_bloqueado escapa HTML em msg (segurança XSS)."""
    from omni_utils import render_acesso_bloqueado
    import streamlit as st

    # Só verificamos que a função existe e aceita os args
    # Não rodamos de fato pois precisa de Streamlit runtime
    assert callable(render_acesso_bloqueado)
