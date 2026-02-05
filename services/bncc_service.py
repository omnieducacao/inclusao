"""
Serviço unificado para carregar BNCC EI, EF e EM.
Arquivos na raiz: bncc_ei.csv, bncc_ef.csv, bncc_em.csv
"""
import os
import csv
import re

try:
    import streamlit as st

    def _cache_bncc(f):
        return st.cache_data(ttl=3600, show_spinner=False)(f)
except ImportError:
    def _cache_bncc(f):
        return f

# Caminhos dos CSVs (raiz do projeto)
_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _path_csv(nome: str) -> str:
    """Retorna caminho do CSV; tenta base_dir e cwd."""
    p = os.path.join(_BASE_DIR, nome)
    if os.path.exists(p):
        return p
    return os.path.join(os.getcwd(), nome)


def _get_cell(d: dict, *keys) -> str:
    """Obtém valor de célula aceitando chaves com espaços ou variações."""
    for k in keys:
        v = d.get(k) or (d.get((k or "").strip() + " ") if k else None)
        if v is not None and str(v).strip():
            return str(v).strip()
    for kk, v in d.items():
        if kk and str(kk).strip() in [str(q).strip() for q in keys if q] and v and str(v).strip():
            return str(v).strip()
    return ""


# =============================================================================
# BNCC ENSINO FUNDAMENTAL (bncc_ef.csv)
# Colunas: Disciplina;Ano;Unidade Temática;Objeto do Conhecimento;Habilidade
# =============================================================================


def _extrair_ano_serie_bncc(serie: str):
    """Extrai ano/série no formato BNCC (1º, 7º, 1EM) a partir da série do estudante."""
    if not serie or not isinstance(serie, str):
        return None
    s = serie.strip()
    m_em = re.search(r"(\d)\s*ª?\s*série", s, re.IGNORECASE)
    if m_em or "em" in s.lower() or "médio" in s.lower():
        num = m_em.group(1) if m_em else re.search(r"(\d)", s)
        if num:
            n = int(num.group(1)) if hasattr(num, "group") else int(num)
            return f"{n}EM"
    m = re.search(r"(\d\s*º)", s)
    return m.group(1).replace(" ", "") if m else None


@_cache_bncc
def carregar_bncc_ef() -> list[dict]:
    """
    Carrega bncc_ef.csv (Ensino Fundamental).
    Retorna lista de dicts: {ano, disciplina, unidade_tematica, objeto_conhecimento, habilidade}.
    """
    path = _path_csv("bncc_ef.csv")
    if not os.path.exists(path):
        path = _path_csv("bncc.csv")
    if not os.path.exists(path):
        return []
    rows = []
    try:
        with open(path, "r", encoding="utf-8-sig") as f:
            first = f.readline()
            reader = csv.DictReader(f, delimiter=";", skipinitialspace=True)
            for row in reader:
                ano = _get_cell(row, "Ano")
                disc = _get_cell(row, "Disciplina")
                unidade = _get_cell(row, "Unidade Temática", "Unidade Tematica")
                objeto = _get_cell(row, "Objeto do Conhecimento", "Objeto do Conhecimento")
                hab = _get_cell(row, "Habilidade")
                if ano and disc and hab:
                    rows.append({
                        "ano": ano,
                        "disciplina": disc,
                        "unidade_tematica": unidade,
                        "objeto_conhecimento": objeto,
                        "habilidade": hab,
                    })
    except Exception:
        rows = []
    return rows


@_cache_bncc
def carregar_habilidades_ef_ano_atual_e_anteriores(
    serie: str,
    max_ano_atual: int = 10000,
    max_anos_anteriores: int = 8000,
) -> dict:
    """
    Retorna {"ano_atual": str, "anos_anteriores": str} para injetar no prompt.
    Só considera EF (1º-9º); para EM retorna vazio.
    """
    ano_serie = _extrair_ano_serie_bncc(serie)
    if not ano_serie or "EM" in ano_serie:
        return {"ano_atual": "", "anos_anteriores": ""}
    try:
        ano_num = int(re.search(r"\d+", ano_serie).group())
    except (ValueError, AttributeError):
        return {"ano_atual": "", "anos_anteriores": ""}
    raw = carregar_bncc_ef()
    if not raw:
        return {"ano_atual": "", "anos_anteriores": ""}
    anteriores_str = [f"{n}º" for n in range(1, ano_num)]
    linhas_atual, linhas_anteriores = [], []
    for r in raw:
        ano_celula = (r.get("ano") or "").strip()
        disc = (r.get("disciplina") or "").strip()
        hab = (r.get("habilidade") or "").strip()
        if not hab:
            continue
        linha = f"- {disc}: {hab}"
        if ano_serie in ano_celula:
            linhas_atual.append(linha)
        elif anteriores_str and any(ant in ano_celula for ant in anteriores_str):
            linhas_anteriores.append(linha)
    def truncar(t, lim):
        return t if len(t) <= lim else t[: lim - 80] + "\n\n[... lista truncada ...]"
    return {
        "ano_atual": truncar("\n".join(linhas_atual), max_ano_atual),
        "anos_anteriores": truncar("\n".join(linhas_anteriores), max_anos_anteriores),
    }


@_cache_bncc
def carregar_habilidades_ef_por_componente(serie: str) -> dict:
    """
    Retorna { "ano_atual": { "Disciplina": [{codigo, descricao, habilidade_completa}] },
              "anos_anteriores": {...} }.
    Só considera EF (1º-9º).
    """

    def _parse_hab(hab: str):
        m = re.match(r"\(([A-Za-z0-9]+)\)\s*(.*)", hab or "")
        if m:
            return m.group(1), (m.group(2) or "").strip()[:200] + ("..." if len((m.group(2) or "")) > 200 else "")
        return "(sem código)", (hab or "")[:200]

    ano_serie = _extrair_ano_serie_bncc(serie)
    if not ano_serie or "EM" in ano_serie:
        return {"ano_atual": {}, "anos_anteriores": {}}
    try:
        ano_num = int(re.search(r"\d+", ano_serie).group())
    except (ValueError, AttributeError):
        return {"ano_atual": {}, "anos_anteriores": {}}
    raw = carregar_bncc_ef()
    if not raw:
        return {"ano_atual": {}, "anos_anteriores": {}}
    anteriores_str = [f"{n}º" for n in range(1, ano_num)]
    ano_atual, anos_anteriores = {}, {}
    for r in raw:
        ano_celula = (r.get("ano") or "").strip()
        disc = (r.get("disciplina") or "").strip()
        hab = (r.get("habilidade") or "").strip()
        if not hab:
            continue
        codigo, descricao = _parse_hab(hab)
        item = {"codigo": codigo, "descricao": descricao, "habilidade_completa": hab}
        if ano_serie in ano_celula:
            ano_atual.setdefault(disc, []).append(item)
        elif anteriores_str and any(ant in ano_celula for ant in anteriores_str):
            anos_anteriores.setdefault(disc, []).append(item)
    return {"ano_atual": ano_atual, "anos_anteriores": anos_anteriores}


@_cache_bncc
def carregar_bncc_ef_completa():
    """Retorna DataFrame da BNCC EF para o Hub (Ano, Disciplina, Unidade Temática, Objeto do Conhecimento, Habilidade)."""
    try:
        import pandas as pd
    except ImportError:
        return None
    path = _path_csv("bncc_ef.csv")
    if not os.path.exists(path):
        path = _path_csv("bncc.csv")
    if not os.path.exists(path):
        return None
    try:
        df = pd.read_csv(path, delimiter=";", encoding="utf-8-sig", skiprows=1)
        cols = ["Ano", "Disciplina", "Unidade Temática", "Objeto do Conhecimento", "Habilidade"]
        missing = [c for c in cols if c not in df.columns]
        if missing:
            return None
        df = df.dropna(subset=["Ano", "Disciplina", "Objeto do Conhecimento"])
        df["Ano"] = df["Ano"].astype(str).str.strip()
        df["Disciplina"] = df["Disciplina"].str.replace("Ed. Física", "Educação Física", regex=False)
        return df
    except Exception:
        return None


@_cache_bncc
def carregar_bncc_ei() -> list[dict]:
    """
    Carrega bncc_ei.csv.
    Retorna lista de dicts: {idade, campo_experiencia, objetivo}.
    Colunas: Idade;Campo de Experiência;Objetivo de Aprendizagem ou OBJETIVOS DE APRENDIZAGEM E DESENVOLVIMENTO
    """
    path = _path_csv("bncc_ei.csv")
    if not os.path.exists(path):
        return []
    rows = []
    try:
        with open(path, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f, delimiter=";", skipinitialspace=True)
            for row in reader:
                idade = _get_cell(row, "Idade")
                campo = _get_cell(row, "Campo de Experiência", "Campo de Experiencia")
                obj = _get_cell(row, "OBJETIVOS DE APRENDIZAGEM E DESENVOLVIMENTO", "Objetivo de Aprendizagem", "Objetivo")
                if campo and obj:
                    rows.append({
                        "idade": idade,
                        "campo_experiencia": campo,
                        "objetivo": obj,
                    })
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


@_cache_bncc
def carregar_bncc_em() -> list[dict]:
    """
    Carrega bncc_em.csv.
    Retorna lista de dicts: {area, componente, serie, unidade, habilidade}.
    Aceita: Área de conhecimento;Série;Habilidade ou Área;Componente;Série;Unidade Temática;Habilidade
    """
    path = _path_csv("bncc_em.csv")
    if not os.path.exists(path):
        return []
    rows = []
    try:
        with open(path, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f, delimiter=";", skipinitialspace=True)
            for row in reader:
                area = _get_cell(row, "Área de conhecimento", "Área", "Area")
                componente = _get_cell(row, "Componente")
                serie = _get_cell(row, "Série", "Serie")
                unidade = _get_cell(row, "Unidade Temática", "Unidade Tematica")
                hab = _get_cell(row, "Habilidade")
                if hab:
                    rows.append({
                        "area": area,
                        "componente": componente,
                        "serie": serie,
                        "unidade": unidade,
                        "habilidade": hab,
                    })
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


def obter_area_por_componente_professor(componente: str):
    """Retorna a área BNCC EM para o componente que o professor leciona."""
    return COMPONENTE_PARA_AREA_EM.get(componente) if componente else None


def carregar_habilidades_em_por_area(serie: str, area: str = None) -> dict:
    """
    Retorna habilidades EM agrupadas por ÁREA DE CONHECIMENTO.
    Todas as habilidades do EM podem ser aplicadas nas três séries (1ª, 2ª, 3ª) — não filtra por série.
    """
    rows = carregar_bncc_em()
    ano_atual = {}
    for r in rows:
        a = (r.get("area") or "").strip()
        if not a:
            a = "Geral"
        if area and a != area:
            continue
        cod, desc = _parse_hab_em(r.get("habilidade", ""))
        item = {"codigo": cod, "descricao": desc, "habilidade_completa": r.get("habilidade", ""), "disciplina": a}
        if a not in ano_atual:
            ano_atual[a] = []
        ano_atual[a].append(item)
    return {"ano_atual": ano_atual, "anos_anteriores": {}}
