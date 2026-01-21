import json
from datetime import date
import streamlit as st

# ------------------------------------------------------------
# Supabase client (usa seu _client.py)
# ------------------------------------------------------------
try:
    from _client import get_supabase  # preferível
    supabase = get_supabase()
except Exception:
    try:
        from _client import supabase  # fallback
    except Exception as e:
        supabase = None

st.set_page_config(page_title="Omnisfera • Alunos", layout="wide")


# ------------------------------------------------------------
# Guard: precisa ter workspace_id (login por PIN)
# ------------------------------------------------------------
ws_id = st.session_state.get("workspace_id")
ws_name = st.session_state.get("workspace_name", "—")

if not ws_id:
    st.error("Workspace não carregado. Volte ao Início e valide o PIN.")
    st.stop()

if supabase is None:
    st.error("Supabase client não inicializado. Verifique o _client.py e st.secrets.")
    st.stop()


# ------------------------------------------------------------
# Helpers Supabase
# ------------------------------------------------------------
def sb_list_students(workspace_id: str):
    res = (
        supabase.table("students")
        .select("id, nome, nasc, turma, observacoes, dados, created_at, updated_at")
        .eq("workspace_id", workspace_id)
        .order("nome", desc=False)
        .execute()
    )
    return res.data or []


def sb_create_student(workspace_id: str, payload: dict):
    payload = dict(payload)
    payload["workspace_id"] = workspace_id
    res = supabase.table("students").insert(payload).execute()
    return (res.data or [None])[0]


def sb_update_student(student_id: str, payload: dict):
    res = supabase.table("students").update(payload).eq("id", student_id).execute()
    return (res.data or [None])[0]


def sb_delete_student(student_id: str):
    supabase.table("students").delete().eq("id", student_id).execute()
    return True


# ------------------------------------------------------------
# UI
# ------------------------------------------------------------
st.markdown(
    f"""
    <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:16px;">
      <div>
        <div style="font-size:12px;color:#6b7280;">Ambiente</div>
        <div style="font-size:26px;font-weight:800;line-height:1.1;">{ws_name}</div>
        <div style="font-size:12px;color:#6b7280;">Workspace ID: <code>{ws_id}</code></div>
      </div>
    </div>
    """,
    unsafe_allow_html=True,
)

st.divider()

colL, colR = st.columns([1.2, 1], gap="large")

with colL:
    st.subheader("Banco de alunos (nuvem)")

    # Busca
    q = st.text_input("Buscar por nome", placeholder="Digite para filtrar…")

    # Lista
    try:
        students = sb_list_students(ws_id)
    except Exception as e:
        st.error("Falha ao listar alunos do Supabase.")
        st.exception(e)
        st.stop()

    # Filtro local
    if q:
        students = [s for s in students if (s.get("nome") or "").lower().find(q.lower()) >= 0]

    if not students:
        st.info("Nenhum aluno cadastrado neste workspace ainda.")
    else:
        # Selector
        options = {f"{s.get('nome','(sem nome)')} • {s['id'][:8]}": s["id"] for s in students}
        selected_label = st.selectbox("Selecionar aluno", list(options.keys()), index=0)
        selected_id = options[selected_label]
        selected = next(s for s in students if s["id"] == selected_id)

        # “Tabela” simples
        st.markdown("#### Detalhes")
        c1, c2, c3 = st.columns([1.2, 1, 1])
        with c1:
            st.write("**Nome:**", selected.get("nome", "—"))
            st.write("**Turma:**", selected.get("turma", "—"))
        with c2:
            st.write("**Nascimento:**", selected.get("nasc", "—"))
            st.write("**Criado em:**", selected.get("created_at", "—"))
        with c3:
            st.write("**Atualizado em:**", selected.get("updated_at", "—"))
            st.write("**ID:**", selected.get("id", "—"))

        st.write("**Observações:**")
        st.write(selected.get("observacoes") or "—")

        st.divider()

        # Ações
        a1, a2, a3 = st.columns([1, 1, 1])
        with a1:
            if st.button("✏️ Editar", use_container_width=True):
                st.session_state["_edit_student_id"] = selected_id
        with a2:
            # Export JSON do aluno selecionado
            export_obj = {
                "workspace_id": ws_id,
                "student": {
                    "id": selected.get("id"),
                    "nome": selected.get("nome"),
                    "nasc": selected.get("nasc"),
                    "turma": selected.get("turma"),
                    "observacoes": selected.get("observacoes"),
                    "dados": selected.get("dados") or {},
                },
            }
            st.download_button(
                "⬇️ Exportar JSON",
                data=json.dumps(export_obj, ensure_ascii=False, indent=2).encode("utf-8"),
                file_name=f"aluno_{selected.get('nome','aluno').replace(' ','_')}.json",
                mime="application/json",
                use_container_width=True,
            )
        with a3:
            if st.button("🗑️ Excluir", use_container_width=True):
                st.session_state["_delete_student_id"] = selected_id


with colR:
    st.subheader("Cadastrar / Importar")

    # Cadastro
    with st.expander("➕ Novo aluno", expanded=True):
        with st.form("form_new_student", clear_on_submit=True):
            nome = st.text_input("Nome do aluno *")
            nasc = st.date_input("Data de nascimento", value=None)
            turma = st.text_input("Turma")
            observ = st.text_area("Observações", height=100)

            # Campo “dados” livre (JSON)
            dados_raw = st.text_area("Dados adicionais (JSON opcional)", value="{}", height=120)

            submitted = st.form_submit_button("Salvar aluno", use_container_width=True)
            if submitted:
                if not nome.strip():
                    st.error("Nome é obrigatório.")
                else:
                    try:
                        dados = json.loads(dados_raw) if dados_raw.strip() else {}
                    except Exception:
                        st.error("JSON inválido em 'Dados adicionais'.")
                        st.stop()

                    payload = {
                        "nome": nome.strip(),
                        "nasc": str(nasc) if isinstance(nasc, date) else None,
                        "turma": turma.strip() or None,
                        "observacoes": observ.strip() or None,
                        "dados": dados if isinstance(dados, dict) else {},
                    }

                    try:
                        sb_create_student(ws_id, payload)
                        st.success("Aluno criado na nuvem.")
                        st.rerun()
                    except Exception as e:
                        st.error("Falha ao criar aluno.")
                        st.exception(e)

    # Importar JSON
    with st.expander("📥 Importar aluno via JSON", expanded=False):
        up = st.file_uploader("Envie um JSON exportado do Omnisfera", type=["json"])
        if up is not None:
            try:
                obj = json.loads(up.read().decode("utf-8"))
                student = obj.get("student") or obj  # aceita arquivo com ou sem wrapper
                payload = {
                    "nome": (student.get("nome") or "").strip(),
                    "nasc": student.get("nasc"),
                    "turma": student.get("turma"),
                    "observacoes": student.get("observacoes"),
                    "dados": student.get("dados") or {},
                }
                if not payload["nome"]:
                    st.error("JSON não tem 'nome'.")
                else:
                    if st.button("Importar para este workspace", use_container_width=True):
                        sb_create_student(ws_id, payload)
                        st.success("Importado com sucesso.")
                        st.rerun()
            except Exception as e:
                st.error("Não consegui ler esse JSON.")
                st.exception(e)


# ------------------------------------------------------------
# Modais / confirmações (edit/delete)
# ------------------------------------------------------------
edit_id = st.session_state.get("_edit_student_id")
if edit_id:
    # busca aluno atual
    all_students = sb_list_students(ws_id)
    cur = next((s for s in all_students if s["id"] == edit_id), None)

    if cur is None:
        st.session_state["_edit_student_id"] = None
        st.warning("Aluno não encontrado (talvez tenha sido removido).")
        st.rerun()

    st.divider()
    st.subheader("Editar aluno")

    with st.form("form_edit_student"):
        nome = st.text_input("Nome *", value=cur.get("nome") or "")
        nasc_str = cur.get("nasc")
        turma = st.text_input("Turma", value=cur.get("turma") or "")
        observ = st.text_area("Observações", value=cur.get("observacoes") or "", height=100)

        dados = cur.get("dados") or {}
        dados_raw = st.text_area("Dados adicionais (JSON)", value=json.dumps(dados, ensure_ascii=False, indent=2), height=160)

        cA, cB = st.columns([1, 1])
        save = cA.form_submit_button("Salvar alterações", use_container_width=True)
        cancel = cB.form_submit_button("Cancelar", use_container_width=True)

        if cancel:
            st.session_state["_edit_student_id"] = None
            st.rerun()

        if save:
            if not nome.strip():
                st.error("Nome é obrigatório.")
            else:
                try:
                    dados_obj = json.loads(dados_raw) if dados_raw.strip() else {}
                except Exception:
                    st.error("JSON inválido em 'Dados adicionais'.")
                    st.stop()

                payload = {
                    "nome": nome.strip(),
                    "turma": turma.strip() or None,
                    "observacoes": observ.strip() or None,
                    "dados": dados_obj if isinstance(dados_obj, dict) else {},
                }
                # nasc pode vir como string
                payload["nasc"] = nasc_str

                try:
                    sb_update_student(edit_id, payload)
                    st.success("Atualizado.")
                    st.session_state["_edit_student_id"] = None
                    st.rerun()
                except Exception as e:
                    st.error("Falha ao atualizar.")
                    st.exception(e)


del_id = st.session_state.get("_delete_student_id")
if del_id:
    st.warning("Confirme a exclusão do aluno. Essa ação não pode ser desfeita.")
    c1, c2 = st.columns([1, 1])
    if c1.button("✅ Sim, excluir", use_container_width=True):
        try:
            sb_delete_student(del_id)
            st.success("Aluno excluído.")
        except Exception as e:
            st.error("Falha ao excluir.")
            st.exception(e)
        finally:
            st.session_state["_delete_student_id"] = None
            st.session_state["_edit_student_id"] = None
            st.rerun()

    if c2.button("↩️ Cancelar", use_container_width=True):
        st.session_state["_delete_student_id"] = None
        st.rerun()
