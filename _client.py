import streamlit as st
from supabase import create_client

@st.cache_resource
def get_supabase():
    """
    Cria cliente Supabase.
    Prioriza SERVICE key se existir (bom para rotinas sem login),
    senão usa ANON key.
    """
    url = st.secrets.get("SUPABASE_URL")
    if not url:
        raise RuntimeError("Faltou SUPABASE_URL no secrets.")

    key = (
        st.secrets.get("SUPABASE_SERVICE_KEY")
        or st.secrets.get("SUPABASE_SERVICE_ROLE_KEY")
        or st.secrets.get("SUPABASE_ANON_KEY")
    )
    if not key:
        raise RuntimeError(
            "Faltou SUPABASE_SERVICE_KEY (ou SUPABASE_ANON_KEY) no secrets."
        )

    return create_client(url, key)
