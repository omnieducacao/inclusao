import streamlit as st
from _client import get_supabase
from datetime import date

st.set_page_config(page_title="Alunos • Omnisfera", layout="wide")

sb = get_supabase()

# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------
def _require_workspace():
    ws_id = st.session_state.get("workspace_id")
    ws_name = st.session_state.get("workspace_name") or st.session_state.get("workspace") or "—"
    if not ws_id:
        st.error("Workspace não definido. Volte ao Início e valide o PIN novamente.")
        st.stop()
    return ws_id, ws_name

def _fetch_students(workspace_id: str):
    # RPC (bypassa RLS) — mais estável pro seu login por PIN
    res = sb.rpc("students_by_workspace", {"p_workspace_id": workspace_id}).execute()
    return res.data or []

def _insert_student(workspace_id: str, payload: dict):
    payload["workspace_id"] = workspace_id
    sb.table("students").insert(payload).execute()

def _update_student(student_id: str, workspace_id: str, payload: dict):
    # garante que só altera dentro do workspace atual
    sb.table("students").update(payload).eq("id", student_id).eq("workspace_id", workspace_id).execute()

def _delete_student(student_id: str, workspace_id: str):
    # via RPC (bypassa RLS e protege por workspace)
    sb.rpc("student_delete", {"p_id": student_id, "p_workspace_id": workspace_id}).execute()

def _fmt_date(d):
    if not d:
        return "—"
    return str(d)

# -----------------------------------------------------------------------------
# Sidebar (com botão Sair)
# -----------------------------------------------------------------------------
with st.sidebar:
    st.markdown("### Omnisfera")
    st.caption("Ambiente por PIN")

    ws_id, ws_name = _require_workspace()
    st.markdown("**Escola**")
    st.write(ws_name)
    st.markdown("**Workspace ID**")
    st.code(ws_id, language="")

    st.divider()

    # Navegação simples (mantém o que você já tem no projeto)
    # Se você já usa st.switch_page noutro lugar, pode manter igual.
    if st.button("Início", use_container_width=True):
        st.switch_page("pages/home.py")
    if st.button("Alunos", use_container_width=True, disabled=True):
        pass
    if st.button("PEI", use_container_width=True):
        st.switch_page("pages/1_PEI.py")
    if st.button("PAE", use_container_width=True):
        st.switch_page("pages/2_PAE.py")
    if st.button("Hub Inclusão", use_container_width=True):
        st.switch_page("pages/3_Hub_Inclusao.py")
    if st.button("Diário de Bordo", use_container_width=True):
        st.switch_page("pages/4_Diario_de_Bordo.py")
    if st.button("Monitoramento & Avaliação", use_container_width=True):
        st.switch_page("pages/5_Monitoramento_Avaliacao.py")

    st.divider()

    # ✅ Botão Sair (zera sessão)
    if st.button("Sair", use_container_width=True):
        for k in ["workspace_id", "workspace_name", "workspace", "view", "autenticado"]:
            if k in st.session_state:
                del st.session_state[k]
        st.switch_page("pages/home.py")

# -----------------------------------------------------------------------------
# Topo
# -----------------------------------------------------------------------------
st.title("Alunos")

ws_id, ws_name = _require_workspace()

c1, c2, c3, c4 = st.columns([2.2, 2.2, 2.2, 2.0])
with c1:
    st.caption("Workspace")
    st.write(ws_name)

with c2:
    st.caption("Workspace ID")
    st.code(ws_id, language="")

with c3:
    st.caption("Supabase")
    st.success("Conectado")

with c4:
    if st.button("🔄 Atualizar lista", use_container_width=True):
        st.session_state["_refresh_students"] = str(date.today())
        st.rerun()

st.divider()

# -----------------------------------------------------------------------------
# Carrega lista
# -----------------------------------------------------------------------------
try:
    students = _fetch_students(ws_id)
except Exception as e:
    st.error("Falha ao carregar alunos. (Provável RLS/Policy ou RPC não criada.)")
    st.code(str(e))
    st.stop()

# -----------------------------------------------------------------------------
# Cadastro rápido
# -----------------------------------------------------------------------------
st.subheader("Cadastrar aluno")

with st.form("form_add_student", clear_on_submit=True):
    colA, colB, colC = st.columns([2.5, 1.5, 1.5])

    with colA:
        name = st.text_input("Nome do aluno*", placeholder="Ex.: Maria Silva")
    with colB:
        birth_date = st.date_input("Nascimento", value=None)
    with colC:
        grade = st.text_input("Série/Ano", placeholder="Ex.: 5º ano")

    colD, colE = st.columns([2, 2])
    with colD:
        class_group = st.text_input("Turma", placeholder="Ex.: A")
    with colE:
        diagnosis = st.text_input("Diagnóstico (opcional)", placeholder="Ex.: TEA")

    notes = st.text_area("Observações", placeholder="Notas gerais (opcional)")

    submitted = st.form_submit_button("Salvar aluno")
    if submitted:
        if not name.strip():
            st.warning("Preencha o nome do aluno.")
            st.stop()

        payload = {
            "name": name.strip(),
            "birth_date": birth_date.isoformat() if birth_date else None,
            "grade": grade.strip() if grade else None,
            "class_group": class_group.strip() if class_group else None,
            "diagnosis": diagnosis.strip() if diagnosis else None,
            # se sua tabela tiver coluna para isso (ajuste se necessário)
            # caso não tenha, remova esta linha:
            # "observacoes": notes.strip() if notes else None,
        }

        # Se a sua tabela NÃO tem coluna "observacoes", comente/remova no payload acima.
        # Vou inserir notes em JSON caso você tenha coluna jsonb "dados" (se existir):
        payload["dados"] = {"observacoes": notes.strip()} if notes else {}

        try:
            _insert_student(ws_id, payload)
            st.success("Aluno cadastrado!")
            st.rerun()
        except Exception as e:
            st.error("Erro ao salvar aluno.")
            st.code(str(e))
            st.stop()

st.divider()

# -----------------------------------------------------------------------------
# Lista + edição rápida
# -----------------------------------------------------------------------------
st.subheader("Lista de alunos")

if not students:
    st.info("Nenhum aluno cadastrado para este workspace ainda.")
    st.stop()

for s in students:
    sid = s.get("id")
    nm = s.get("name") or "—"
    bd = s.get("birth_date")
    gr = s.get("grade")
    cg = s.get("class_group")
    dx = s.get("diagnosis")

    with st.expander(f"{nm}", expanded=False):
        a, b, c = st.columns([2, 2, 1.2])

        with a:
            new_name = st.text_input("Nome", value=nm, key=f"nm_{sid}")
            new_grade = st.text_input("Série/Ano", value=gr or "", key=f"gr_{sid}")
            new_class = st.text_input("Turma", value=cg or "", key=f"cg_{sid}")

        with b:
            # birth_date pode vir como 'YYYY-MM-DD'
            try:
                bd_val = date.fromisoformat(bd) if bd else None
            except Exception:
                bd_val = None

            new_birth = st.date_input("Nascimento", value=bd_val, key=f"bd_{sid}")
            new_dx = st.text_input("Diagnóstico", value=dx or "", key=f"dx_{sid}")

            # tenta ler observacoes do json "dados"
            dados = s.get("dados") or {}
            obs_val = (dados.get("observacoes") or "") if isinstance(dados, dict) else ""
            new_obs = st.text_area("Observações", value=obs_val, key=f"obs_{sid}")

        with c:
            st.caption("Ações")
            if st.button("💾 Salvar alterações", key=f"save_{sid}", use_container_width=True):
                payload = {
                    "name": (new_name or "").strip(),
                    "grade": (new_grade or "").strip() or None,
                    "class_group": (new_class or "").strip() or None,
                    "birth_date": new_birth.isoformat() if new_birth else None,
                    "diagnosis": (new_dx or "").strip() or None,
                    "dados": {"observacoes": (new_obs or "").strip()} if new_obs else {},
                }
                try:
                    _update_student(sid, ws_id, payload)
                    st.success("Atualizado!")
                    st.rerun()
                except Exception as e:
                    st.error("Erro ao atualizar.")
                    st.code(str(e))

            st.markdown("")

            if st.button("🗑️ Excluir aluno", key=f"del_{sid}", use_container_width=True):
                try:
                    _delete_student(sid, ws_id)
                    st.success("Excluído!")
                    st.rerun()
                except Exception as e:
                    st.error("Erro ao excluir.")
                    st.code(str(e))
