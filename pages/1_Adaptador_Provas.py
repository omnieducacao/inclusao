import streamlit as st
from openai import OpenAI
from io import BytesIO
from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from pypdf import PdfReader
from fpdf import FPDF
import base64
import os
import re
import requests

# --- 1. CONFIGURAÇÃO ---
st.set_page_config(page_title="Adaptador 360º V4.1", page_icon="🧩", layout="wide")

if 'banco_estudantes' not in st.session_state:
    st.session_state.banco_estudantes = []

# --- 2. ESTILO VISUAL ---
st.markdown("""
    <style>
    html, body, [class*="css"] { font-family: 'Nunito', sans-serif; color: #2D3748; }
    :root { --brand-blue: #004E92; --card-radius: 16px; }
    .header-clean {
        background-color: white; padding: 30px 40px; border-radius: var(--card-radius);
        border: 1px solid #EDF2F7; box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        margin-bottom: 30px; display: flex; align-items: center; gap: 20px;
    }
    .unified-card {
        background-color: white; padding: 25px; border-radius: var(--card-radius);
        border: 1px solid #EDF2F7; box-shadow: 0 4px 6px rgba(0,0,0,0.03); margin-bottom: 20px;
    }
    .rationale-box {
        background-color: #F0F4FF; border-left: 4px solid #004E92; padding: 15px;
        border-radius: 8px; font-size: 0.9rem; color: #1A365D; margin-bottom: 20px;
    }
    div[data-testid="column"] .stButton button {
        border-radius: 12px !important; font-weight: 800 !important; height: 50px !important;
    }
    </style>
""", unsafe_allow_html=True)

# --- 3. FUNÇÕES AUXILIARES ---
def ler_arquivo(uploaded_file):
    if uploaded_file is None: return None, None, None
    
    # Retorna: texto_extraido, tipo, bytes_originais
    file_bytes = uploaded_file.getvalue()
    
    if uploaded_file.type == "application/pdf":
        try:
            reader = PdfReader(uploaded_file)
            texto = ""
            for page in reader.pages: texto += page.extract_text() + "\n"
            return texto, "pdf", file_bytes
        except: return "", "erro", None
        
    elif uploaded_file.type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        try:
            doc = Document(uploaded_file)
            texto = "\n".join([p.text for p in doc.paragraphs])
            return texto, "docx", file_bytes
        except: return "", "erro", None
        
    elif uploaded_file.type in ["image/png", "image/jpeg", "image/jpg"]:
        # Para imagem, o "texto" é base64 para o GPT ler
        base64_img = base64.b64encode(file_bytes).decode('utf-8')
        return base64_img, "imagem", file_bytes
        
    return None, None, None

def baixar_imagem_url(url):
    try:
        resp = requests.get(url)
        if resp.status_code == 200:
            return BytesIO(resp.content)
    except: pass
    return None

# --- GERADOR DE DOCX (COM IMAGENS) ---
def gerar_docx_completo(conteudo_texto, aluno, materia, img_original_bytes, img_dalle_url, tipo_orig):
    doc = Document()
    style = doc.styles['Normal']; style.font.name = 'Arial'; style.font.size = Pt(12)
    
    # Cabeçalho
    head = doc.add_heading(f'ATIVIDADE ADAPTADA - {materia.upper()}', 0)
    head.alignment = WD_ALIGN_PARAGRAPH.CENTER
    doc.add_paragraph(f"Estudante: {aluno}")
    doc.add_paragraph("_"*50)

    # 1. Apoio Visual (DALL-E) - Scaffolding
    if img_dalle_url:
        doc.add_heading('1. Apoio Visual (Contexto)', level=2)
        img_io = baixar_imagem_url(img_dalle_url)
        if img_io:
            doc.add_picture(img_io, width=Inches(4.0))
            doc.add_paragraph("Figura 1: Apoio visual para o tema.")
            doc.add_paragraph("")

    # 2. Imagem Original (Se houver) - A "Prova"
    if tipo_orig == "imagem" and img_original_bytes:
        doc.add_heading('2. Material de Referência', level=2)
        doc.add_picture(BytesIO(img_original_bytes), width=Inches(5.0))
        doc.add_paragraph("Figura 2: Material original da questão.")
        doc.add_paragraph("")

    # 3. Texto Adaptado
    doc.add_heading('3. Atividade', level=2)
    doc.add_paragraph(conteudo_texto)
    
    buffer = BytesIO(); doc.save(buffer); buffer.seek(0)
    return buffer

# --- 4. INTELIGÊNCIA ---
def gerar_apoio_visual_dalle(api_key, tema, aluno_dados):
    client = OpenAI(api_key=api_key)
    hiperfoco = aluno_dados.get('hiperfoco', '')
    contexto = f"Include elements of '{hiperfoco}' subtly to engage." if hiperfoco else ""
    
    prompt = f"""
    Create a clear, educational illustration about "{tema}".
    Target: Special education student.
    Style: Clear lines, white background, easy to identify objects.
    Subject: A visual explanation of "{tema}".
    {contexto}
    IMPORTANT: NO TEXT, NO LETTERS inside the image.
    """
    try:
        response = client.images.generate(model="dall-e-3", prompt=prompt, size="1024x1024", quality="standard", n=1)
        return response.data[0].url, None
    except Exception as e: return None, f"Erro DALL-E: {e}"

def adaptar_atividade_v4(api_key, aluno_dados, conteudo_orig, tipo_arquivo, materia, tema, tipo_atv):
    if not api_key: return None, None, "⚠️ Chave API faltando."
    client = OpenAI(api_key=api_key)
    
    diretrizes = "Foco na redução de barreiras."
    if 'ia_sugestao' in aluno_dados:
        try: match = re.search(r"DIRETRIZES.*?(?=\n\n|$)", aluno_dados['ia_sugestao'], re.DOTALL); diretrizes = match.group(0) if match else diretrizes
        except: pass

    prompt_sistema = """
    Você é um Especialista em DUA.
    SAÍDA OBRIGATÓRIA:
    [RACIONAL PROFESSOR]
    (Explique o que mudou e por que)
    ---DIVISOR---
    [ATIVIDADE ALUNO]
    (A atividade adaptada. SE a atividade original tinha uma imagem que não posso ver agora, escreva: '[VER IMAGEM ORIGINAL ACIMA]' no lugar dela).
    """
    
    texto_user = f"""
    ALUNO: {aluno_dados['nome']} | DIAG: {aluno_dados.get('diagnostico')}
    DIRETRIZES PEI: {diretrizes}
    MATÉRIA: {materia} | TEMA: {tema}
    
    Adapte o conteúdo abaixo. Se houver referência a uma imagem (ex: "veja o mapa"), mantenha a referência no texto adaptado pois a imagem original será anexada no documento final.
    """

    msgs = [{"role": "system", "content": prompt_sistema}, {"role": "user", "content": []}]
    msgs[1]["content"].append({"type": "text", "text": texto_user})

    if tipo_arquivo == "imagem":
        msgs[1]["content"].append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{conteudo_orig}"}})
    else:
        msgs[1]["content"].append({"type": "text", "text": f"\nORIGINAL:\n{conteudo_orig}"})

    try:
        resp = client.chat.completions.create(model="gpt-4o-mini", messages=msgs, temperature=0.5)
        txt = resp.choices[0].message.content
        parts = txt.split("---DIVISOR---")
        if len(parts) == 2: return parts[0].replace("[RACIONAL PROFESSOR]", "").strip(), parts[1].replace("[ATIVIDADE ALUNO]", "").strip(), None
        return None, txt, "Erro formato."
    except Exception as e: return None, None, str(e)

# --- 5. INTERFACE ---
with st.sidebar:
    st.markdown("### ⚙️ Configuração")
    api_key = st.secrets.get('OPENAI_API_KEY', st.text_input("Chave OpenAI:", type="password"))
    if api_key: st.success("✅ Conectado")
    st.markdown("---")
    usar_dalle = st.toggle("🎨 Gerar Apoio Visual (DALL-E)", value=True, help="Cria uma imagem nova para explicar o conceito.")
    st.markdown("---")
    if st.button("🗑️ Limpar"): st.session_state.pop('resultado_atividade', None); st.rerun()

st.markdown("""
    <div class="header-clean">
        <div style="font-size: 3rem;">🧩</div>
        <div>
            <p style="margin: 0; color: #004E92; font-size: 1.5rem; font-weight: 800;">Adaptador V4.1: Integração Visual Completa</p>
            <p style="margin: 0; color: #718096;">Preserva a imagem original e cria novas imagens de apoio pedagógico.</p>
        </div>
    </div>
""", unsafe_allow_html=True)

if not st.session_state.banco_estudantes:
    st.warning("⚠️ Crie um aluno no PEI 360º primeiro.")
    st.stop()

# Seleção de Aluno
lista = [a['nome'] for a in st.session_state.banco_estudantes]
aluno = next(a for a in st.session_state.banco_estudantes if a['nome'] == st.selectbox("📂 Estudante:", lista, index=len(lista)-1))

with st.expander(f"👤 Perfil: {aluno['nome']}", expanded=False):
    st.write(f"Diag: {aluno.get('diagnostico')}")

c1, c2 = st.columns(2)
with c1:
    materia = st.selectbox("Matéria:", ["Matemática", "Português", "Ciências", "História", "Geografia", "Inglês"])
    tema = st.text_input("Tema:", placeholder="Ex: Frações")
    tipo_atv = st.selectbox("Tipo:", ["Prova", "Tarefa", "Trabalho"])
with c2:
    arquivo = st.file_uploader("Original (Foto/PDF/Word)", type=["png","jpg","jpeg","pdf","docx"])
    conteudo_orig, tipo_arq, bytes_orig = ler_arquivo(arquivo)
    if tipo_arq == "imagem": st.image(arquivo, width=150, caption="Original")
    elif tipo_arq: st.success(f"{tipo_arq} lido.")
    elif not arquivo: 
        conteudo_orig = st.text_area("Ou cole texto:"); tipo_arq="texto"; bytes_orig=None

if st.button("✨ ADAPTAR ATIVIDADE", type="primary"):
    if not materia or not tema or not conteudo_orig: st.warning("Preencha tudo.")
    else:
        with st.spinner("1/2: Adaptando texto e questões..."):
            racional, atividade, err = adaptar_atividade_v4(api_key, aluno, conteudo_orig, tipo_arq, materia, tema, tipo_atv)
        
        img_dalle = None
        if usar_dalle and not err:
            with st.spinner("2/2: Criando apoio visual (DALL-E)..."):
                img_dalle, _ = gerar_apoio_visual_dalle(api_key, tema, aluno)
        
        if not err:
            st.session_state['resultado_racional'] = racional
            st.session_state['resultado_atividade'] = atividade
            st.session_state['resultado_img_dalle'] = img_dalle
            st.session_state['bytes_originais'] = bytes_orig
            st.session_state['tipo_original'] = tipo_arq
            st.success("Pronto!")

# RESULTADOS
if 'resultado_atividade' in st.session_state:
    st.markdown("---")
    
    # 1. Racional
    with st.expander("🧠 Explicação para o Professor (O que mudou?)", expanded=False):
        st.markdown(f"<div class='rationale-box'>{st.session_state['resultado_racional']}</div>", unsafe_allow_html=True)
    
    # 2. Visual
    c_vis1, c_vis2 = st.columns(2)
    with c_vis1:
        if st.session_state.get('resultado_img_dalle'):
            st.markdown("###### 1. Apoio Visual (IA - Scaffolding)")
            st.image(st.session_state['resultado_img_dalle'], use_column_width=True)
            st.caption("Objetivo: Contextualizar o tema antes da leitura.")
    with c_vis2:
        if st.session_state['tipo_original'] == "imagem" and st.session_state['bytes_originais']:
            st.markdown("###### 2. Material Original (Referência)")
            st.image(st.session_state['bytes_originais'], use_column_width=True)
            st.caption("A imagem da questão original foi mantida.")

    # 3. Texto
    st.markdown("###### 3. Atividade Adaptada")
    st.markdown(f"<div class='unified-card'>{st.session_state['resultado_atividade']}</div>", unsafe_allow_html=True)

    # 4. Download Completo
    docx = gerar_docx_completo(
        st.session_state['resultado_atividade'], 
        aluno['nome'], 
        materia, 
        st.session_state.get('bytes_originais'), 
        st.session_state.get('resultado_img_dalle'),
        st.session_state['tipo_original']
    )
    st.download_button("📥 Baixar Documento Completo (Word)", docx, "atividade_adaptada.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", type="primary")
