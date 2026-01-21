import streamlit as st
from supabase import create_client

# -----------------------------------------------------------------------------
# Supabase Client Factory (Singleton com cache)
# -----------------------------------------------------------------------------

@st.cache_resource(show_spinner=False)
def get_supabase():
    """
    Retorna um client Supabase único e reutilizável.
    Prioridade de chave:
    1. SERVICE_KEY / SERVICE_ROLE_KEY (backend seguro, RPC, inserts)
    2. ANON_KEY (fallback)
    """

    # URL obrigatória
    if "SUPABASE_URL" not in st.secrets:
        raise RuntimeError("SUPABASE_URL não encontrado em st.secrets")

    url = st.secrets["SUPABASE_URL"]

    # Prioridade de chaves
    key = (
        st.secrets.get("SUPABASE_SERVICE_KEY")
        or st.secrets.get("SUPABASE_SERVICE_ROLE_KEY")
        or st.secrets.get("SUPABASE_ANON_KEY")
    )

    if not key:
        raise RuntimeError(
            "Nenhuma chave Supabase encontrada. "
            "Defina SUPABASE_SERVICE_KEY ou SUPABASE_ANON_KEY em secrets."
        )

    return create_client(url, key)
