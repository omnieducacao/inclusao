"""
Permissões e filtro de alunos por membro do workspace.
- Sem member_id ou sem tabela workspace_members: acesso total (comportamento atual).
- Com member_id: filtra por link_type (todos, turma, tutor).
"""
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
        def _norm_grade(v):
            v = str(v or "").strip().upper().replace("º", "").replace("ª", "").replace("ANO", "").replace("SÉRIE", "").replace(" ", "").strip()
            return v or ""
        def _norm_class(c):
            return str(c or "").strip().upper() or "A"
        pairs = {(_norm_grade(a.get("grade")), _norm_class(a.get("class_group"))) for a in class_assignments}
        def _match(s):
            g = _norm_grade(s.get("grade") or s.get("serie"))
            c = _norm_class(s.get("class_group"))
            return (g, c) in pairs
        return [s for s in students if _match(s)]
    if link_type == "tutor":
        if not student_ids:
            return []
        ids_set = set(str(x) for x in student_ids)
        return [s for s in students if str(s.get("id", "") or "") in ids_set]
    return students
