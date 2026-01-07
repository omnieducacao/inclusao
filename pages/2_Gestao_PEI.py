import streamlit as st
import os
import base64
from datetime import date
from io import BytesIO
from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Pt
from openai import OpenAI
from pypdf import PdfReader
from fpdf import FPDF
import re

# --- 1. CONFIGURAÇÃO ---
st.set_page_config(page_title="Gestão de PEI", page_icon="📄", layout="wide")

# --- 2. BANCO DE DADOS TEMPORÁRIO (SESSION STATE) ---
if 'banco_estudantes' not in st.session_state:
    st.session_state.banco_estudantes = []

# --- 3. FUNÇÕES (Mesmas de antes) ---
def get_base64_image(image_path):
    if not os.path.exists(image_path): return ""
    with open(image_path, "rb") as img_file:
        return base64.b64encode(img_file.read()).decode()

def ler_pdf(arquivo):
    if arquivo is None: return ""
    try:
        reader = PdfReader(arquivo)
        texto = ""
        for page in reader.pages: texto += page.extract_text() + "\n"
        return texto
    except Exception as e: return f"Erro: {e}"

def limpar_markdown(texto): # Limpeza para Word
    if not texto: return ""
    texto = texto.replace('**', '').replace('__', '')
    texto = texto.replace('### ', '').replace('## ', '').replace('# ', '')
    return texto

def limpar_para_pdf(texto): # Limpeza para PDF
    if not texto: return ""
    texto = texto.replace('**', '').replace('__', '')
    texto = texto.replace('### ', '').replace('## ', '').replace('# ', '')
    texto = texto.replace('* ', '• ')
    texto = re.sub(r'[^\x00-\x7F\xA0-\xFF]', '', texto) 
    return texto

def consultar_ia(api_key, dados, contexto_pdf=""):
    if not api_key: return None, "⚠️ Insira a Chave API no menu lateral."
    try:
        client = OpenAI(api_key=api_key, base_url="https://api.deepseek.com")
        serie = dados['serie'] if dados['serie'] else ""
        prompt_sistema = "Você é Especialista em Inclusão. Gere apenas o conteúdo técnico."
        prompt_usuario = f"""
        Estudante: {dados['nome']} | Diag: {dados['diagnostico']}
        Barreiras: {', '.join(dados['b_sensorial'] + dados['b_cognitiva'] + dados['b_social'])}
        Estratégias: {', '.join(dados['estrategias_acesso'] + dados['estrategias_ensino'])}
        
        GERE: 1. ANÁLISE NEUROFUNCIONAL, 2. ESTRATÉGIA BNCC, 3. ROTINA.
        """
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "system", "content": prompt_sistema}, {"role": "user", "content": prompt_usuario}],
            temperature=0.7
        )
        return response.choices[0].message.content, None
    except Exception as e: return None, f"Erro DeepSeek: {str(e)}"

# Funções de DOCX e PDF (Mantidas simplificadas para economizar espaço aqui)
class PDF(FPDF):
    def header(self):
        if os.path.exists("360.png"): self.image("360.png", x=10, y=8, w=25)
        self.set_font('Arial', 'B', 16); self.set_text_color(0, 78, 146)
        self.cell(40); self.cell(0, 10, 'PLANO DE ENSINO INDIVIDUALIZADO', 0, 1, 'C'); self.ln(5)
def gerar_pdf_nativo(dados):
    pdf = PDF(); pdf.add_page(); pdf.set_font("Arial", size=11)
    def txt(t): return str(t).encode('latin-1', 'replace').decode('latin-1')
    pdf.multi_cell(0, 7, txt(f"Nome: {dados['nome']} | Diagnóstico: {dados['diagnostico']}"))
    pdf.ln(5); pdf.multi_cell(0, 7, txt(limpar_para_pdf(dados['ia_sugestao'])))
    return pdf.output(dest='S').encode('latin-1')
def gerar_docx_final(dados):
    doc = Document(); doc.add_paragraph(f"Nome: {dados['nome']}"); doc.add_paragraph(limpar_markdown(dados['ia_sugestao']))
    buffer = BytesIO(); doc.save(buffer); buffer.seek(0)
    return buffer

# --- 4. ESTADO INICIAL ---
if 'dados' not in st.session_state:
    st.session_state.dados = {
        'nome': '', 'nasc': None, 'serie': None, 'diagnostico': '', 'historico': '', 'familia': '', 'hiperfoco': '',
        'b_sensorial': [], 'b_cognitiva': [], 'b_social': [],
        'estrategias_acesso': [], 'estrategias_ensino': [], 'rede_apoio': [], 'ia_sugestao': ''
    }
if 'pdf_text' not in st.session_state: st.session_state.pdf_text = ""

# --- 5. INTERFACE ---
with st.sidebar:
    if 'DEEPSEEK_API_KEY' in st.secrets: api_key = st.secrets['DEEPSEEK_API_KEY']
    else: api_key = st.text_input("Chave API:", type="password")

# Cabeçalho
st.markdown(f"""
<div style="padding: 20px; background: white; border-radius: 16px; border-left: 8px solid #004E92; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 20px;">
    <h2 style="color: #004E92; margin:0;">Gestão de PEI</h2>
    <p style="color: #718096; margin:0;">Crie o perfil para liberar a adaptação de provas.</p>
</div>
""", unsafe_allow_html=True)

tab1, tab2, tab3, tab4, tab5 = st.tabs(["Estudante", "Mapeamento", "Estratégias", "IA & Docs", "💾 SALVAR"])

with tab1:
    c1, c2 = st.columns([2, 1])
    st.session_state.dados['nome'] = c1.text_input("Nome", st.session_state.dados['nome'])
    st.session_state.dados['serie'] = c2.selectbox("Série", ["1º Ano", "2º Ano", "3º Ano", "4º Ano", "5º Ano", "Fund II", "Médio"])
    st.session_state.dados['diagnostico'] = st.text_input("Diagnóstico", st.session_state.dados['diagnostico'])
    st.session_state.dados['historico'] = st.text_area("Histórico", st.session_state.dados['historico'])

with tab2:
    st.session_state.dados['hiperfoco'] = st.text_input("Hiperfoco")
    st.session_state.dados['b_cognitiva'] = st.multiselect("Barreiras Cognitivas", ["Atenção", "Memória", "Rigidez", "Abstração"])
    st.session_state.dados['b_sensorial'] = st.multiselect("Barreiras Sensoriais", ["Hipersensibilidade Visual", "Ruído", "Tátil"])

with tab3:
    st.session_state.dados['estrategias_ensino'] = st.multiselect("Estratégias de Ensino", ["Pistas Visuais", "Mapa Mental", "Fragmentação", "Enunciados Curtos", "Apoio Visual"])
    st.session_state.dados['estrategias_acesso'] = st.multiselect("Acesso", ["Tempo Estendido", "Ledor", "Prova em Sala Separada"])

with tab4:
    if st.button("Gerar Parecer IA", type="primary"):
        res, err = consultar_ia(api_key, st.session_state.dados)
        if not err: st.session_state.dados['ia_sugestao'] = res
    if st.session_state.dados['ia_sugestao']:
        st.write(st.session_state.dados['ia_sugestao'])
        st.download_button("Baixar PDF", gerar_pdf_nativo(st.session_state.dados), "pei.pdf")

with tab5:
    st.info("Ao finalizar o PEI, clique abaixo para disponibilizar este aluno no módulo de Adaptação de Provas.")
    if st.button("💾 Salvar Aluno no Sistema", type="primary", use_container_width=True):
        if st.session_state.dados['nome']:
            # Salva uma cópia dos dados na lista global
            novo_aluno = st.session_state.dados.copy()
            st.session_state.banco_estudantes.append(novo_aluno)
            st.success(f"Sucesso! {novo_aluno['nome']} agora está disponível no Adaptador de Provas.")
        else:
            st.warning("Preencha pelo menos o nome do aluno.")
