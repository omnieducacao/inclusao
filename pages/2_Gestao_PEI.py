import streamlit as st
import requests
import json
from datetime import date
from io import BytesIO
from docx import Document
from docx.shared import Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
from pypdf import PdfReader
from fpdf import FPDF
import base64
import os
import re

# --- CONFIGURAÇÃO ---
st.set_page_config(page_title="PEI 360º", page_icon="📘", layout="wide")

if 'banco_estudantes' not in st.session_state: st.session_state.banco_estudantes = []

# --- DIAGNÓSTICO DE CHAVE (NOVO) ---
def testar_chave(api_key):
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            modelos = response.json().get('models', [])
            nomes = [m['name'] for m in modelos]
            return True, nomes
        else:
            return False, f"Erro {response.status_code}: {response.text}"
    except Exception as e:
        return False, str(e)

# --- INTEGRAÇÃO IA ---
def consultar_ia(api_key, dados, contexto_pdf=""):
    # Tenta usar o modelo PRO que é o mais estável
    modelo_escolhido = "gemini-pro"
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{modelo_escolhido}:generateContent?key={api_key}"
    headers = {'Content-Type': 'application/json'}
    
    prompt = f"""
    ATUE COMO: Especialista em Inclusão.
    ALUNO: {dados['nome']} | DIAGNÓSTICO: {dados['diagnostico']}
    HISTÓRICO: {dados['historico']}
    GERE UM PARECER TÉCNICO PARA O PEI (Síntese, Neurofuncional, BNCC, Rotina, Adaptação de Provas).
    """
    
    try:
        response = requests.post(url, headers=headers, data=json.dumps({"contents": [{"parts": [{"text": prompt}]}]}))
        if response.status_code == 200:
            return response.json()['candidates'][0]['content']['parts'][0]['text'], None
        return None, f"Erro Google ({response.status_code}): {response.text}"
    except Exception as e: return None, f"Erro: {e}"

# --- INTERFACE ---
st.title("📘 Gestão de PEI (Diagnóstico)")

# Pega a chave do Secrets
api_key = st.secrets.get('GOOGLE_API_KEY', '')

# --- ÁREA DE TESTE DE CHAVE ---
with st.expander("🔑 DIAGNÓSTICO DA CHAVE (Clique se der erro)", expanded=True):
    if not api_key:
        st.error("Chave não encontrada no Secrets!")
    else:
        c1, c2 = st.columns([1, 3])
        if c1.button("🔍 Testar Conexão com Google"):
            sucesso, resultado = testar_chave(api_key)
            if sucesso:
                st.success("✅ CONEXÃO BEM SUCEDIDA!")
                st.write("Modelos disponíveis para sua chave:")
                st.code(resultado)
            else:
                st.error("❌ A CHAVE ESTÁ BLOQUEADA OU INVÁLIDA")
                st.error(resultado)
                st.info("Solução: Crie uma nova chave em um NOVO PROJETO no Google AI Studio.")

st.markdown("---")

# --- FORMULÁRIO SIMPLIFICADO ---
st.session_state.dados = st.session_state.get('dados', {'nome': '', 'diagnostico': '', 'historico': '', 'ia_sugestao': ''})

c1, c2 = st.columns(2)
st.session_state.dados['nome'] = c1.text_input("Nome", st.session_state.dados['nome'])
st.session_state.dados['diagnostico'] = c2.text_input("Diagnóstico", st.session_state.dados['diagnostico'])
st.session_state.dados['historico'] = st.text_area("Histórico", st.session_state.dados['historico'])

if st.button("✨ Gerar Parecer (Usando Gemini Pro)"):
    if not api_key: st.error("Configure a chave primeiro.")
    else:
        res, err = consultar_ia(api_key, st.session_state.dados)
        if err: st.error(err)
        else: 
            st.session_state.dados['ia_sugestao'] = res
            st.success("Sucesso!")
            st.write(res)

if st.button("💾 Salvar Aluno"):
    if st.session_state.dados['nome']:
        st.session_state.banco_estudantes.append(st.session_state.dados.copy())
        st.success("Salvo!")
