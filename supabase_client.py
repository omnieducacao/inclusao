import streamlit as st
from supabase import create_client, Client
from datetime import datetime

# Conexão Única com Supabase
@st.cache_resource(show_spinner=False)
def get_supabase() -> Client:
    try:
        url = st.secrets["SUPABASE_URL"]
        key = st.secrets["SUPABASE_ANON_KEY"]
        return create_client(url, key)
    except Exception as e:
        st.error(f"Erro de configuração do Supabase: {e}")
        return None

def validar_acesso_pin(pin_code, nome_usuario, funcao_usuario):
    """
    1. Verifica se o PIN existe na tabela 'app_pins'.
    2. Se existir, registra o acesso na tabela 'access_logs'.
    3. Retorna os dados do workspace (owner_id) para filtrar os dados.
    """
    sb = get_supabase()
    if not sb: return False, None, "Erro de conexão."

    # 1. Busca o PIN e o Workspace atrelado
    try:
        # Busca na tabela de PINs
        res = sb.table("app_pins").select("*").eq("pin_code", pin_code).execute()
        
        if res.data and len(res.data) > 0:
            workspace_data = res.data[0]
            owner_id = workspace_data.get("owner_id")
            workspace_name = workspace_data.get("descricao", "Workspace Padrão")

            # 2. Registra quem entrou (Log de Auditoria)
            # Isso é crucial para o seu controle
            try:
                log_data = {
                    "pin_used": pin_code,
                    "user_name": nome_usuario,
                    "user_role": funcao_usuario,
                    "created_at": datetime.now().isoformat()
                }
                sb.table("access_logs").insert(log_data).execute()
            except Exception as e:
                print(f"Alerta: Não foi possível salvar log de acesso: {e}")

            return True, {"owner_id": owner_id, "workspace_name": workspace_name}, None
        else:
            return False, None, "PIN não encontrado."

    except Exception as e:
        return False, None, f"Erro ao validar PIN: {str(e)}"
