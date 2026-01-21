import streamlit as st
from supabase import create_client

@st.cache_resource
def get_supabase():
    url = st.secrets["SUPABASE_URL"]

    # Prioriza SERVICE (seguro e ideal para PIN sem login)
    key = st.secrets.get("SUPABASE_SERVICE_KEY") or st.secrets.get("SUPABASE_SERVICE_ROLE_KEY")
    if not key:
        raise RuntimeError("Faltou SUPABASE_SERVICE_KEY no secrets.toml (Project Settings → API → service_role).")

    return create_client(url, key)

supabase = get_supabase()
