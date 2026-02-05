"""
Serviço para carregar BNCC Educação Infantil e Ensino Médio.
BNCC EF está em pages/bncc.csv e é usada diretamente pelo PEI/Hub.
"""
import os
import csv
import re
from typing import Optional

# Caminhos dos CSVs (raiz do projeto)
_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_PATH_BNCC_EI = os.path.join(_BASE_DIR, "bncc_ei.csv")
_PATH_BNCC_EM = os.path.join(_BASE_DIR, "bncc_em.csv")

# Cache em memória
_bncc_ei_cache: Optional[list] = None


def carregar_bncc_ei() -> list[dict]:
    """
    Carrega bncc_ei.csv.
    Retorna lista de dicts: {idade, campo_experiencia, objetivo}.
    Colunas esperadas: Idade;Campo de Experiência;Objetivo de Aprendizagem
    """
    global _bncc_ei_cache
    if _bncc_ei_cache is not None:
        return _bncc_ei_cache
    if not os.path.exists(_PATH_BNCC_EI):
        return []
    rows = []
    try:
        with open(_PATH_BNCC_EI, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f, delimiter=";")
            for row in reader:
                idade = (row.get("Idade") or "").strip()
                campo = (row.get("Campo de Experiência") or row.get("Campo de Experiencia") or "").strip()
                obj = (row.get("Objetivo de Aprendizagem") or row.get("Objetivo") or "").strip()
                if campo and obj:
                    rows.append({
                        "idade": idade,
                        "campo_experiencia": campo,
                        "objetivo": obj,
                    })
        _bncc_ei_cache = rows
    except Exception:
        rows = []
    return rows


def faixas_idade_ei() -> list[str]:
    """Retorna TODAS as faixas de idade presentes no bncc_ei.csv, na ordem do arquivo."""
    rows = carregar_bncc_ei()
    idades = list(dict.fromkeys(r["idade"] for r in rows if r.get("idade")))
    # Ordenar por primeiro número encontrado (ex: 0, 1, 2, 3, 4, 5) para manter ordem lógica
    def _key(s):
        nums = re.findall(r"\d+", s or "")
        return (int(nums[0]) if nums else 99, s)
    return sorted(idades, key=_key)


def campos_experiencia_ei() -> list[str]:
    """Retorna lista de Campos de Experiência (ordenados, únicos)."""
    rows = carregar_bncc_ei()
    campos = list(dict.fromkeys(r["campo_experiencia"] for r in rows if r.get("campo_experiencia")))
    return campos


def objetivos_ei_por_idade_campo(idade: str, campo: str) -> list[str]:
    """
    Retorna lista de objetivos de aprendizagem filtrados por idade e campo.
    Para o Hub EI e PEI aba BNCC.
    """
    rows = carregar_bncc_ei()
    filtrados = [
        r["objetivo"]
        for r in rows
        if (r.get("idade") or "").strip() == (idade or "").strip()
        and (r.get("campo_experiencia") or "").strip() == (campo or "").strip()
    ]
    return filtrados


def obter_objetivos_ei_para_prompt(idade: str, campo: str, objetivos_selecionados: list[str] = None) -> str:
    """
    Retorna texto formatado para injetar no prompt da IA.
    Se objetivos_selecionados for passado, usa apenas esses; senão usa todos do filtro.
    """
    if objetivos_selecionados:
        lista = objetivos_selecionados
    else:
        lista = objetivos_ei_por_idade_campo(idade, campo)
    if not lista:
        return ""
    return "\n".join(f"- {o}" for o in lista)


# =============================================================================
# BNCC ENSINO MÉDIO (bncc_em.csv)
# Estrutura: Área;Componente;Série;Unidade Temática;Habilidade
# Áreas: Linguagens, Matemática, Ciências da Natureza, Ciências Humanas
# =============================================================================
_bncc_em_cache: Optional[list] = None

COMPONENTE_PARA_AREA_EM = {
    "História": "Ciências Humanas e Sociais Aplicadas",
    "Geografia": "Ciências Humanas e Sociais Aplicadas",
    "Filosofia": "Ciências Humanas e Sociais Aplicadas",
    "Sociologia": "Ciências Humanas e Sociais Aplicadas",
    "Biologia": "Ciências da Natureza e suas Tecnologias",
    "Física": "Ciências da Natureza e suas Tecnologias",
    "Química": "Ciências da Natureza e suas Tecnologias",
    "Língua Portuguesa": "Linguagens e suas Tecnologias",
    "Arte": "Linguagens e suas Tecnologias",
    "Educação Física": "Linguagens e suas Tecnologias",
    "Língua Inglesa": "Linguagens e suas Tecnologias",
    "Matemática": "Matemática e suas Tecnologias",
}


def carregar_bncc_em() -> list[dict]:
    """
    Carrega bncc_em.csv.
    Retorna lista de dicts: {area, componente, serie, unidade, habilidade}.
    Colunas esperadas: Área;Componente;Série;Unidade Temática;Habilidade
    """
    global _bncc_em_cache
    if _bncc_em_cache is not None:
        return _bncc_em_cache
    if not os.path.exists(_PATH_BNCC_EM):
        return []
    rows = []
    try:
        with open(_PATH_BNCC_EM, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f, delimiter=";")
            for row in reader:
                area = (row.get("Área") or row.get("Area") or "").strip()
                componente = (row.get("Componente") or "").strip()
                serie = (row.get("Série") or row.get("Serie") or "").strip()
                unidade = (row.get("Unidade Temática") or row.get("Unidade Tematica") or "").strip()
                hab = (row.get("Habilidade") or "").strip()
                if hab:
                    rows.append({
                        "area": area,
                        "componente": componente,
                        "serie": serie,
                        "unidade": unidade,
                        "habilidade": hab,
                    })
        _bncc_em_cache = rows
    except Exception:
        rows = []
    return rows


def areas_em() -> list[str]:
    """Retorna lista de áreas de conhecimento presentes no bncc_em.csv."""
    rows = carregar_bncc_em()
    areas = sorted(set(r["area"] for r in rows if r.get("area")))
    return areas


def componentes_em_por_area(area: str) -> list[str]:
    """Retorna lista de componentes filtrados por área."""
    rows = carregar_bncc_em()
    comps = list(dict.fromkeys(
        r["componente"] for r in rows
        if (r.get("area") or "").strip() == (area or "").strip()
    ))
    return comps


def habilidades_em_por_serie_area_componente(serie: str, area: str, componente: str) -> list[dict]:
    """
    Retorna lista de habilidades EM no formato {codigo, descricao, habilidade_completa}.
    serie: "1", "2", "3" ou "1EM", "2EM", "3EM"
    """
    rows = carregar_bncc_em()
    # Normalizar série: 1EM, 2EM, 3EM ou 1, 2, 3
    serie_norm = (serie or "").replace("EM", "").strip()
    resultado = []
    for r in rows:
        if (r.get("area") or "").strip() != (area or "").strip():
            continue
        if (r.get("componente") or "").strip() != (componente or "").strip():
            continue
        celula_serie = (r.get("serie") or "").strip()
        if serie_norm and celula_serie and serie_norm not in celula_serie and f"{serie_norm}EM" not in celula_serie:
            continue
        hab = r.get("habilidade", "")
        codigo, descricao = _parse_hab_em(hab)
        resultado.append({
            "codigo": codigo,
            "descricao": descricao,
            "habilidade_completa": hab,
            "unidade": r.get("unidade", ""),
        })
    return resultado


def _parse_hab_em(hab: str) -> tuple:
    """Extrai código (EM13LP01) e descrição de uma habilidade BNCC EM."""
    m = re.search(r"\(?(EM\d+[A-Z0-9]+)\)?\s*(.*)", hab.strip())
    if m:
        return m.group(1).strip(), (m.group(2) or "").strip()
    return "", hab


def obter_area_por_componente_professor(componente: str) -> str | None:
    """Retorna a área BNCC EM para o componente que o professor leciona."""
    return COMPONENTE_PARA_AREA_EM.get(componente) if componente else None


def carregar_habilidades_em_por_area(serie: str, area: str = None) -> dict:
    """
    Retorna habilidades EM agrupadas por ÁREA DE CONHECIMENTO (não por componente).
    { "ano_atual": { "Linguagens e suas Tecnologias": [ {codigo, descricao, habilidade_completa}, ... ] }, "anos_anteriores": {} }
    No EM as habilidades são dadas por área; esta função lista por área.
    """
    ano_serie = (serie or "").replace("ª Série", "").replace("Série", "").strip()
    if "EM" not in (serie or "").upper() and "MÉDIO" not in (serie or "").upper():
        m = re.search(r"(\d)", serie or "")
        if m:
            ano_serie = f"{m.group(1)}EM"
    rows = carregar_bncc_em()
    ano_atual = {}
    for r in rows:
        a = (r.get("area") or "").strip()
        if not a:
            a = "Geral"
        if area and a != area:
            continue
        celula = (r.get("serie") or "").strip()
        num_serie = ano_serie.replace("EM", "").strip()
        # Se o CSV tem Série vazia: incluir (válido para todas as séries)
        if celula and ano_serie:
            if num_serie not in celula and ano_serie not in celula and celula not in ano_serie:
                continue
        cod, desc = _parse_hab_em(r.get("habilidade", ""))
        item = {"codigo": cod, "descricao": desc, "habilidade_completa": r.get("habilidade", ""), "disciplina": a}
        if a not in ano_atual:
            ano_atual[a] = []
        ano_atual[a].append(item)
    return {"ano_atual": ano_atual, "anos_anteriores": {}}
