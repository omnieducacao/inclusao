"""
Utilitários BNCC para o Hub de Inclusão.
Helpers de ano/série e ordenação reutilizáveis.
"""
from __future__ import annotations

import re


def ano_celula_contem(ano_celula: str, ano_busca: str) -> bool:
    """
    Verifica se ano_busca está na célula Ano da BNCC.
    A célula pode ter múltiplos anos: "1º, 2º, 3º, 4º, 5º" (ex: Arte, Língua Portuguesa).
    Retorna True se ano_busca (ex: "3º") está na lista.
    """
    if not ano_busca or not ano_celula:
        return False
    cell = str(ano_celula).strip()
    busca = str(ano_busca).strip()
    partes = [p.strip() for p in cell.split(",")]
    return busca in partes


def extrair_ano_bncc_do_aluno(aluno: dict | None) -> str | None:
    """
    Extrai o ano/série no formato BNCC a partir do estudante (grade/serie do PEI).
    Retorna ex: "3º", "7º", "1EM" ou None.
    """
    if not aluno or not isinstance(aluno, dict):
        return None
    serie = aluno.get("serie") or aluno.get("grade") or ""
    if not serie or not isinstance(serie, str):
        return None
    s = str(serie).strip()
    m_em = re.search(r"(\d)\s*ª?\s*série", s, re.IGNORECASE)
    if m_em or "em" in s.lower() or "médio" in s.lower():
        n = m_em.group(1) if m_em else re.search(r"(\d)", s)
        if n:
            return f"{int(n.group(1))}EM"
    m = re.search(r"(\d\s*º)", s)
    return m.group(1).replace(" ", "") if m else None


def padronizar_ano(ano_str: str) -> str:
    """Converte diferentes formatos de ano para um padrão ordenável."""
    if not isinstance(ano_str, str):
        ano_str = str(ano_str)
    ano_str = ano_str.strip()
    padroes = [
        (r"(\d+)\s*º?\s*ano", "ano"),
        (r"(\d+)\s*ª?\s*série", "ano"),
        (r"(\d+)\s*em", "em"),
        (r"ef\s*(\d+)", "ano"),
        (r"(\d+)\s*período", "ano"),
        (r"(\d+)\s*semestre", "ano"),
    ]
    for padrao, tipo in padroes:
        match = re.search(padrao, ano_str.lower())
        if match:
            num = match.group(1)
            if tipo == "em":
                return f"{int(num):02d}EM"
            return f"{int(num):02d}"
    return ano_str


def ordenar_anos(anos_lista: list) -> list:
    """Ordena anos de forma inteligente (1º, 2º, ..., 9º, 1EM, 2EM, 3EM)."""
    anos_padronizados = [(padronizar_ano(str(ano)), ano) for ano in anos_lista]
    anos_padronizados.sort(key=lambda x: x[0])
    return [ano_original for _, ano_original in anos_padronizados]
