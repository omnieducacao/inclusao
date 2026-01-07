import streamlit as st
from openai import OpenAI
import os

# --- CONFIGURAÇÃO ---
st.set_page_config(page_title="Adaptador de Avaliações", page_icon="📝", layout="wide")

# --- ESTILO VISUAL BLINDADO ---
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
    
    html, body, [class*="css"] { font-family: 'Nunito', sans-serif; color: #2D3748; }
    
    .stTextInput input, .stTextArea textarea, .stSelectbox div[data-baseweb="select"] {
        border-radius: 12px !important; border: 1px solid #CBD5E0 !important;
    }
    .stButton > button {
        background-color: #004E92 !important; color: white !important;
        border-radius: 12px !important; height: 3.5em !important; font-weight: 700 !important;
        width: 100%;
    }
    .stButton > button:hover { transform: scale(1.02); }
    
    .result-card {
        background: #FFFFFF; padding: 25px; border-radius: 16px;
        border: 1px solid #E2E8F0; border-left: 6px solid #FF6B6B;
        box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    }
    .instruction-box {
        background: #E3F2FD; padding: 15px; border-radius: 10px; color: #004E92; font-size: 0.9rem; margin-bottom: 20px;
    }
</style>
""", unsafe_allow_html=True)

# --- CABEÇALHO ---
st.markdown("""
### 📝 Adaptador de Avaliações
Transforme questões complexas em formatos acessíveis.
---
""")

# --- SIDEBAR ---
with st.sidebar:
    st.header("⚙️ Configuração IA")
    if 'DEEPSEEK_API_KEY' in st.secrets:
        api_key = st.secrets['DEEPSEEK_API_KEY']
        st.success("✅ Chave Segura Ativa")
    else:
        api_key = st.text_input("Chave API DeepSeek:", type="password")
    
    st.info("Defina o perfil, cole a questão e deixe a IA adaptar.")

# --- INTERFACE ---
c1, c2 = st.columns([1, 1])

with c1:
    st.markdown("#### 1. Dados de Entrada")
    
    perfil = st.text_area("Perfil do Aluno:", 
        placeholder="Ex: Aluno com TDAH, leitura lenta...", height=100)
    
    tipo_adaptacao = st.selectbox("Formato Desejado:", [
        "Múltipla Escolha (Simplificada)",
        "Ligue as Colunas",
        "Verdadeiro ou Falso",
        "Texto Lacunado (Preencher)",
        "Passo a Passo",
        "Apoio Visual"
    ])
    
    questao_original = st.text_area("Questão Original:", height=150)
    
    if st.button("✨ Adaptar Questão"):
        if not api_key:
            st.error("Insira a Chave API.")
        elif not perfil or not questao_original:
            st.warning("Preencha os dados.")
        else:
            with st.spinner("Adaptando..."):
                try:
                    client = OpenAI(api_key=api_key, base_url="https://api.deepseek.com")
                    prompt = f"Perfil: {perfil}. Formato: {tipo_adaptacao}. Questão: {questao_original}. Adapte para acessibilidade, sem dar a resposta."
                    response = client.chat.completions.create(
                        model="deepseek-chat",
                        messages=[{"role": "user", "content": prompt}], temperature=0.3
                    )
                    st.session_state['resultado'] = response.choices[0].message.content
                except Exception as e: st.error(f"Erro: {e}")

with c2:
    st.markdown("#### 2. Resultado")
    if 'resultado' in st.session_state:
        st.markdown(f'<div class="result-card">{st.session_state["resultado"]}</div>', unsafe_allow_html=True)
        st.download_button("📥 Baixar", st.session_state['resultado'], "adaptacao.txt")
    else:
        st.info("O resultado aparecerá aqui.")
