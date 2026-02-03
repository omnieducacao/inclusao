"""
Permissões e filtro de alunos por membro do workspace.
- Sem member_id ou sem tabela workspace_members: acesso total (comportamento atual).
- Com member_id: filtra por link_type (todos, turma, tutor).
"""
import re
import streamlit as st


def apply_member_filter(students: list) -> list:
    """
    Aplica filtro de membro à lista de estudantes.
    Retorna a lista filtrada conforme vínculo do usuário atual.
    """
    member = get_member_from_session()
    if not member:
        return students
    try:
        from services.members_service import get_class_assignments, get_student_links
        ca = get_class_assignments(member.get("id", ""))
        sl = get_student_links(member.get("id", ""))
        return filter_students_by_member(students, member, ca, sl)
    except Exception:
        return students


def get_member_from_session():
    """Retorna dict do membro atual ou None (acesso total)."""
    return st.session_state.get("member") or None


def can_access(page: str) -> bool:
    """
    Verifica se o usuário atual pode acessar a página.
    page: 'estudantes'|'pei'|'paee'|'hub'|'diario'|'avaliacao'|'gestao'
    """
    member = get_member_from_session()
    if not member:
        return True  # Sem gestão de membros: acesso total
    m = {
        "estudantes": member.get("can_estudantes"),
        "pei": member.get("can_pei"),
        "paee": member.get("can_paee"),
        "hub": member.get("can_hub"),
        "diario": member.get("can_diario"),
        "avaliacao": member.get("can_avaliacao"),
        "gestao": member.get("can_gestao"),
    }
    return bool(m.get(page))


def _student_grade_to_match_keys(grade_raw: str) -> set:
    """
    Converte o grade do estudante (formato PEI: "7º Ano (EFAF)", "1ª Série (EM)")
    para um conjunto de chaves que podem bater com grades.code das turmas.
    """
    s = str(grade_raw or "").strip()
    if not s:
        return set()
    s_lower = s.lower()
    keys = set()

    # Remove parênteses e conteúdo (ex: "(EFAF)", "(EM)")
    s_clean = re.sub(r"\s*\([^)]*\)\s*", " ", s).strip()

    # Educação Infantil: aceita 2anos, 3anos, 4anos, 5anos
    if "infantil" in s_lower or "0-2" in s or "3-5" in s:
        keys.update(["2anos", "3anos", "4anos", "5anos"])
        return keys

    # Extrai número: "7º Ano" → "7", "1ª Série" → "1"
    num_match = re.search(r"(\d)", s_clean)
    if num_match:
        n = num_match.group(1)
        keys.add(n)
        if "série" in s_lower or "serie" in s_lower or "em" in s_lower or "médio" in s_lower:
            keys.add(n + "EM")
    return keys


def _assignment_grade_to_match_keys(code: str, label: str) -> set:
    """Converte grade da turma (code, label) para chaves de match."""
    keys = set()
    c = str(code or "").strip()
    l = str(label or "").strip()
    if c:
        keys.add(c)
        if c in ("1EM", "2EM", "3EM"):
            keys.add(c[0])
    if l:
        m = re.search(r"(\d)", l)
        if m:
            keys.add(m.group(1))
    return keys


def filter_students_by_member(students: list, member: dict, class_assignments: list, student_ids: list) -> list:
    """
    Filtra lista de estudantes conforme vínculo do membro.
    - link_type=todos: retorna todos
    - link_type=turma: estudantes cuja grade+class_group batem com class_assignments
    - link_type=tutor: estudantes cujos ids estão em student_ids
    Aceita alunos com grade ou serie (Hub usa serie).
    """
    if not member:
        return students
    link_type = (member.get("link_type") or "todos").lower()
    if link_type == "todos":
        return students
    if link_type == "turma":
        if not class_assignments:
            return []
        def _norm_class(c):
            return str(c or "").strip().upper() or "A"

        # Constrói set de (grade_key, class_group) aceitos
        accepted = set()
        for a in class_assignments:
            cg = _norm_class(a.get("class_group"))
            for k in _assignment_grade_to_match_keys(a.get("grade"), a.get("grade_label", "")):
                accepted.add((k, cg))

        def _match(s):
            g_raw = s.get("grade") or s.get("serie") or ""
            c = _norm_class(s.get("class_group"))
            student_keys = _student_grade_to_match_keys(g_raw)
            return any((k, c) in accepted for k in student_keys)

        return [s for s in students if _match(s)]
    if link_type == "tutor":
        if not student_ids:
            return []
        ids_set = set(str(x) for x in student_ids)
        return [s for s in students if str(s.get("id", "") or "") in ids_set]
    return students
