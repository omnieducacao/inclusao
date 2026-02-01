# supabase_client.py
import os
import streamlit as st

# 🔒 Nome da função RPC
RPC_NAME = "workspace_from_pin"


def _get_secret(name: str) -> str | None:
    """Lê env var (Render) e fallback para secrets (Streamlit Cloud)."""
    v = os.environ.get(name)
    if v and str(v).strip():
        return str(v).strip()
    try:
        v = st.secrets.get(name)
        if v is not None and str(v).strip():
            return str(v).strip()
    except Exception:
        pass
    return None


def _get_supabase_url_and_key() -> tuple[str | None, str | None]:
    """
    Tenta obter URL e chave do Supabase de várias fontes (Streamlit Cloud
    pode usar chaves no nível raiz ou dentro de [supabase]).
    Retorna (url, key) ou (None, None).
    """
    url = _get_secret("SUPABASE_URL")
    key = _get_secret("SUPABASE_SERVICE_KEY") or _get_secret("SUPABASE_ANON_KEY")

    if url and key:
        return url, key

    try:
        sec = st.secrets.get("supabase") or st.secrets.get("SUPABASE")
        if isinstance(sec, dict):
            u = sec.get("url") or sec.get("SUPABASE_URL")
            k = sec.get("service_key") or sec.get("key") or sec.get("SUPABASE_SERVICE_KEY") or sec.get("anon_key") or sec.get("SUPABASE_ANON_KEY")
            if u:
                url = str(u).strip() if u else url
            if k:
                key = str(k).strip() if k else key
        elif hasattr(sec, "url"):
            url = url or (str(sec.url).strip() if getattr(sec, "url", None) else None)
            k = getattr(sec, "service_key", None) or getattr(sec, "key", None) or getattr(sec, "anon_key", None)
            key = key or (str(k).strip() if k else None)
    except Exception:
        pass

    return url or None, key or None


@st.cache_resource(show_spinner=False)
def _create_supabase_client(url: str, key: str):
    """
    Cria UM cliente Supabase (cacheado por url+key).
    URL e key vêm de get_sb() — assim st.secrets é lido fora do cache,
    onde está disponível no Streamlit Cloud.
    """
    try:
        from supabase import create_client  # type: ignore
    except Exception as e:
        raise RuntimeError(
            "Pacote 'supabase' não encontrado. requirements.txt: supabase==2.*\n" + str(e)
        )
    if not url or not key:
        raise RuntimeError("SUPABASE_URL e chave são obrigatórios.")
    return create_client(url, key)


def get_sb():
    """Garante sb na session_state. Lê secrets aqui (fora do cache) para funcionar no Streamlit Cloud."""
    if "sb" in st.session_state and st.session_state["sb"] is not None:
        return st.session_state["sb"]

    url, key = _get_supabase_url_and_key()
    if not url or not key:
        raise RuntimeError(
            "Supabase: URL e chave não encontrados. Em Streamlit Cloud: Manage app → Settings → Secrets. "
            "Use no nível raiz: SUPABASE_URL, SUPABASE_SERVICE_KEY (ou SUPABASE_ANON_KEY). "
            "Ou seção [supabase] com: url, service_key ou anon_key."
        )

    sb = _create_supabase_client(url, key)
    st.session_state["sb"] = sb
    return sb


# Compatibilidade com seu código antigo
def get_supabase():
    """Alias para manter compatibilidade com versões anteriores."""
    return get_sb()


def rpc_workspace_from_pin(pin: str) -> dict | None:
    """
    Chama a função:
    public.workspace_from_pin(p_pin text)
    Retorna: { id, name } ou None
    """
    sb = get_sb()

    res = sb.rpc(RPC_NAME, {"p_pin": pin}).execute()
    data = res.data

    if not data:
        return None
    if isinstance(data, list):
        return data[0] if data else None
    if isinstance(data, dict):
        return data
    return None
