"""
Serviço de IA para o Hub de Inclusão.
Funções de chat completion, visão e geração de imagens.
"""
from io import BytesIO

import requests
from PIL import Image
from openai import OpenAI

import omni_utils as ou


def buscar_imagem_unsplash(query: str, access_key: str):
    """Busca imagem no Unsplash. Retorna URL ou None."""
    if not access_key:
        return None
    url = f"https://api.unsplash.com/search/photos?query={query}&per_page=1&client_id={access_key}&lang=pt"
    try:
        resp = requests.get(url, timeout=5)
        data = resp.json()
        if data.get("results"):
            return data["results"][0]["urls"]["regular"]
    except Exception:
        pass
    return None


def gerar_imagem_inteligente(
    api_key, prompt, unsplash_key=None, feedback_anterior="", prioridade="IA", gemini_key=None
):
    """
    Gera imagem: prioridade Gemini, depois DALL-E, depois Unsplash.
    Retorna bytes (PNG) ou URL (str); st.image() aceita ambos.
    """
    key_gemini = gemini_key or ou.get_gemini_api_key()
    if key_gemini and prioridade == "IA":
        img_bytes, _ = ou.gerar_imagem_ilustracao_gemini(
            prompt, feedback_anterior=feedback_anterior, api_key=key_gemini
        )
        if img_bytes:
            return img_bytes
    if prioridade == "BANCO" and unsplash_key:
        termo = prompt.split(".")[0] if "." in prompt else prompt
        url_banco = buscar_imagem_unsplash(termo, unsplash_key)
        if url_banco:
            return url_banco
    if not api_key or not str(api_key).strip():
        if unsplash_key and prioridade == "IA":
            termo = prompt.split(".")[0] if "." in prompt else prompt
            return buscar_imagem_unsplash(termo, unsplash_key)
        return None
    try:
        client = OpenAI(api_key=api_key)
        prompt_final = f"{prompt}. Adjustment requested: {feedback_anterior}" if feedback_anterior else prompt
        didactic_prompt = (
            f"Educational textbook illustration, clean flat vector style, white background. "
            f"CRITICAL RULE: STRICTLY NO TEXT, NO TYPOGRAPHY, NO ALPHABET, NO NUMBERS, NO LABELS inside the image. "
            f"Just the visual representation of: {prompt_final}"
        )
        resp = client.images.generate(
            model="dall-e-3", prompt=didactic_prompt, size="1024x1024", quality="standard", n=1
        )
        return resp.data[0].url
    except Exception:
        if prioridade == "IA" and unsplash_key:
            termo = prompt.split(".")[0] if "." in prompt else prompt
            return buscar_imagem_unsplash(termo, unsplash_key)
        return None


def gerar_pictograma_caa(api_key, conceito, feedback_anterior="", gemini_key=None):
    """
    Gera símbolo CAA: prioridade Gemini, depois DALL-E.
    Retorna bytes (PNG) ou URL (str).
    """
    key_gemini = gemini_key or ou.get_gemini_api_key()
    if key_gemini:
        img_bytes, _ = ou.gerar_imagem_pictograma_caa_gemini(
            conceito, feedback_anterior=feedback_anterior, api_key=key_gemini
        )
        if img_bytes:
            return img_bytes
    if not api_key or not str(api_key).strip():
        return None
    try:
        client = OpenAI(api_key=api_key)
        ajuste = f" CORREÇÃO PEDIDA: {feedback_anterior}" if feedback_anterior else ""
        prompt_caa = f"""
    Create a COMMUNICATION SYMBOL (AAC/PECS) for the concept: '{conceito}'. {ajuste}
    STYLE GUIDE:
    - Flat vector icon (ARASAAC/Noun Project style).
    - Solid WHITE background.
    - Thick BLACK outlines.
    - High contrast primary colors.
    - No background details, no shadows.
    - CRITICAL MANDATORY RULE: MUTE IMAGE. NO TEXT. NO WORDS. NO LETTERS. NO NUMBERS.
    - The image must be a purely visual symbol.
    """
        resp = client.images.generate(
            model="dall-e-3", prompt=prompt_caa, size="1024x1024", quality="standard", n=1
        )
        return resp.data[0].url
    except Exception:
        return None


def _comprimir_imagem_para_vision(img_bytes: bytes, max_bytes: int = 3_000_000) -> bytes:
    """Reduz tamanho da imagem se necessário para evitar falhas na API de visão."""
    if len(img_bytes) <= max_bytes:
        return img_bytes
    try:
        img = Image.open(BytesIO(img_bytes)).convert("RGB")
        w, h = img.size
        scale = (max_bytes / len(img_bytes)) ** 0.5
        new_w = max(256, min(w, int(w * scale)))
        new_h = max(256, min(h, int(h * scale)))
        img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        buf = BytesIO()
        img.save(buf, format="JPEG", quality=85)
        return buf.getvalue()
    except Exception:
        return img_bytes


def _hub_chat_completion(engine: str, messages: list, temperature: float = 0.7, api_key: str = None) -> str:
    """Chat completion unificado para Hub. engine: red, blue, green, yellow."""
    engine = (engine or "red").strip().lower()
    if engine not in ("red", "blue", "green", "yellow"):
        engine = "red"
    return ou.chat_completion_multi_engine(engine, messages, temperature=temperature, api_key=api_key)
