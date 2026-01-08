import streamlit as st
from openai import OpenAI
from io import BytesIO
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from pypdf import PdfReader
from fpdf import FPDF
import base64
import os
import re
import requests
import zipfile

# --- 1. CONFIGURAÇÃO ---
st.set_page_config(page_title="Adaptador 360º V4.7", page_icon="🧩", layout="wide")

if 'banco_estudantes' not in st.session_state:
    st.session_state.banco_estudantes = []

# --- 2. ESTILO VISUAL (CLEAN & DIRECT) ---
st.markdown("""
    <style>
    html, body, [class*="css"] { font-family: 'Nunito', sans-serif; color: #2D3748; }
    
    .header-clean {
        background-color: white; padding: 25px 40px; border-radius: 16px;
        border: 1px solid #EDF2F7; box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        margin-bottom: 25px; display: flex; align-items: center; gap: 20px;
    }
    
    .unified-card {
        background-color: white; padding: 25px; border-radius: 16px;
        border: 1px solid #EDF2F7; box-shadow: 0 4px 6px rgba(0,0,0,0.03); margin-bottom: 20px;
    }
    
    .success-box {
        background-color: #F0FFF4; border: 1px solid #C6F6D5; color: #276749;
        padding: 15px; border-radius: 10px; margin-bottom: 20px; text-align: center;
    }

    div[data-testid="stFileUploader"] section { 
        background-color: #F7FAFC; border: 2px dashed #CBD5E0; border-radius: 16px; 
    }
    
    div[data-testid="column"] .stButton button {
        border-radius: 12px !important; font-weight: 800 !important; height: 50px !important; width: 100%;
    }
    </style>
""", unsafe_allow_html=True)

# --- 3. FUNÇÕES DE ARQUIVO ---
def extrair_dados_docx(uploaded_file):
    uploaded_file.seek(0)
    texto = ""
    imagens = []
    try:
        doc = Document(uploaded_file)
        texto = "\n".join([p.text for p in doc.paragraphs if p.text.strip() != ""])
        
        uploaded_file.seek(0)
        with zipfile.ZipFile(uploaded_file) as z:
            all_files = z.namelist()
            # Filtra imagens e ordena pelo número no nome (image1, image2, image10)
            media_files = [f for f in all_files if f.startswith('word/media/') and f.endswith(('.png', '.jpg', '.jpeg'))]
            media_files.sort(key=lambda f: int(re.search(r'\d+', f).group()) if re.search(r'\d+', f) else 0)
            
            for media in media_files:
                imagens.append(z.read(media))
    except: pass
    return texto, imagens

def ler_arquivo_generico(uploaded_file):
    if uploaded_file is None: return None, None, [], None
    texto, imgs, img_unica, tipo = "", [], None, "indefinido"
    
    try:
        if uploaded_file.type == "application/pdf":
            reader = PdfReader(uploaded_file)
            for page in reader.pages: texto += page.extract_text() + "\n"
            tipo = "pdf"
        elif "word" in uploaded_file.type:
            texto, imgs = extrair_dados_docx(uploaded_file)
            tipo = "docx"
        elif "image" in uploaded_file.type:
            img_unica = uploaded_file.getvalue()
            texto = base64.b64encode(img_unica).decode('utf-8')
            tipo = "imagem"
    except: pass
    return texto, tipo, imgs, img_unica

def baixar_imagem_url(url):
    try:
        resp = requests.get(url)
        if resp.status_code == 200: return BytesIO(resp.content)
    except: pass
    return None

# --- 4. CONSTRUTOR DE DOCX (POSICIONAMENTO CORRIGIDO) ---
def construir_docx_final(texto_ia, aluno, materia, lista_imgs, img_dalle_url, img_unica):
    doc = Document()
    style = doc.styles['Normal']
    style.font.name = 'Arial'
    style.font.size = Pt(12)
    
    # Cabeçalho
    head = doc.add_heading(f'ATIVIDADE ADAPTADA - {materia.upper()}', 0)
    head.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p = doc.add_paragraph(f"Estudante: {aluno}")
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    doc.add_paragraph("_"*50)

    # 1. Apoio Visual (DALL-E) - Scaffolding (Início)
    if img_dalle_url:
        img_io = baixar_imagem_url(img_dalle_url)
        if img_io:
            try:
                doc.add_heading('Contexto Visual', level=3)
                # DALL-E entra com 4.5 polegadas (tamanho médio)
                pic = doc.add_picture(img_io, width=Inches(4.5))
                last_paragraph = doc.paragraphs[-1] 
                last_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
                doc.add_paragraph("")
            except: pass

    # 2. Corpo da Atividade (Texto + Imagens Originais)
    doc.add_heading('Questões', level=2)
    
    # Divide o texto pelas tags [[IMG_X]]
    partes = re.split(r'(\[\[IMG_\d+\]\]|\[\[IMG_ORIGINAL\]\])', texto_ia)
    
    imagens_usadas = set()

    for parte in partes:
        tag_match = re.match(r'\[\[IMG_(\d+)\]\]', parte)
        
        # Inserção da Imagem do Word (NO MEIO DO TEXTO)
        if tag_match:
            try:
                idx = int(tag_match.group(1)) - 1
                if 0 <= idx < len(lista_imgs):
                    # CORREÇÃO DE TAMANHO: Fixado em 5.5 polegadas (aprox 14cm) para caber na A4 sem estourar
                    # O python-docx ajusta a altura automaticamente para manter a proporção.
                    doc.add_picture(BytesIO(lista_imgs[idx]), width=Inches(5.5))
                    
                    # Centraliza a imagem
                    last_paragraph = doc.paragraphs[-1] 
                    last_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
                    doc.add_paragraph("") # Espaço pós imagem
                    
                    imagens_usadas.add(idx)
            except: pass
            
        # Inserção da Imagem Única (Upload de Foto)
        elif parte == "[[IMG_ORIGINAL]]" and img_unica:
            try:
                doc.add_picture(BytesIO(img_unica), width=Inches(5.5))
                last_paragraph = doc.paragraphs[-1] 
                last_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
                doc.add_paragraph("")
            except: pass
            
        # Texto Normal
        else:
            if parte.strip():
                # Processa quebra de linhas para não ficar blocão
                for linha in parte.strip().split('\n'):
                    if linha.strip():
                        doc.add_paragraph(linha.strip())

    # 3. Imagens não utilizadas (Backup de Segurança)
    # Se a IA esqueceu de citar alguma imagem, ela aparece no final para garantir.
    sobras = [i for i in range(len(lista_imgs)) if i not in imagens_usadas]
    if sobras:
        doc.add_page_break()
        doc.add_heading("Anexos Visuais", level=2)
        doc.add_paragraph("Imagens suplementares do arquivo original:")
        for idx in sobras:
            try:
                doc.add_paragraph(f"Figura {idx+1}:")
                doc.add_picture(BytesIO(lista_imgs[idx]), width=Inches(5.0))
                doc.add_paragraph("")
            except: pass

    buffer = BytesIO(); doc.save(buffer); buffer.seek(0)
    return buffer

# --- 5. INTELIGÊNCIA ---
def gerar_dalle(api_key, tema, aluno_dados):
    client = OpenAI(api_key=api_key)
    hiperfoco = aluno_dados.get('hiperfoco', '')
    prompt = f"Educational illustration about '{tema}'. Simple, clear, white background. {hiperfoco if hiperfoco else ''} No text."
    try:
        resp = client.images.generate(model="dall-e-3", prompt=prompt, size="1024x1024", quality="standard", n=1)
        return resp.data[0].url, None
    except Exception as e: return None, str(e)

def adaptar_ia_direta(api_key, aluno, conteudo, tipo, materia, tema, qtd_imagens):
    if not api_key: return None, "Sem chave."
    client = OpenAI(api_key=api_key)
    
    instrucao_imgs = ""
    if qtd_imagens > 0:
        instrucao_imgs = f"""
        O arquivo original tem {qtd_imagens} imagens.
        REGRA DE OURO PARA IMAGENS:
        Você DEVE inserir a tag [[IMG_1]], [[IMG_2]], etc., EXATAMENTE logo após o texto que pede para observar a imagem (ex: "Observe o gráfico:").
        NUNCA coloque as imagens no final. Elas devem estar no meio da questão, antes das alternativas.
        """
    elif tipo == "imagem":
        instrucao_imgs = "Insira a tag [[IMG_ORIGINAL]] logo no início, antes das questões."

    prompt_sys = "Você é um Especialista em Adaptação de Provas. Gere apenas a ATIVIDADE FINAL ADAPTADA. Não preciso de racional/explicação."
    
    prompt_user = f"""
    ESTUDANTE: {aluno['nome']} | DIAGNÓSTICO: {aluno.get('diagnostico')}
    MATÉRIA: {materia} | TEMA: {tema}
    
    {instrucao_imgs}
    
    CONTEÚDO PARA ADAPTAR:
    {conteudo}
    
    GERE A ATIVIDADE PRONTA (Título, Enunciados Simplificados, Tags de Imagem no lugar certo, Espaços para resposta):
    """
    
    if tipo == "imagem":
        msgs = [{"role": "user", "content": [{"type": "text", "text": prompt_user}, {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{conteudo}"}}]}]
    else:
        msgs = [{"role": "system", "content": prompt_sys}, {"role": "user", "content": prompt_user}]

    try:
        resp = client.chat.completions.create(model="gpt-4o-mini", messages=msgs, temperature=0.5)
        return resp.choices[0].message.content, None
    except Exception as e: return None, str(e)

# --- 6. INTERFACE ---
with st.sidebar:
    st.markdown("### Configuração")
    api_key = st.secrets.get('OPENAI_API_KEY', st.text_input("Chave OpenAI:", type="password"))
    if api_key: st.success("✅ Conectado")
    st.markdown("---")
    usar_dalle = st.toggle("🎨 Gerar Imagem de Apoio (IA)", value=True)
    if st.button("🗑️ Limpar"): 
        for k in list(st.session_state.keys()):
            if k.startswith('final_'): del st.session_state[k]
        st.rerun()

st.markdown("""
    <div class="header-clean">
        <div style="font-size: 2.5rem;">🧩</div>
        <div>
            <p style="margin: 0; color: #004E92; font-size: 1.4rem; font-weight: 800;">Adaptador V4.7: Fluxo Direto</p>
            <p style="margin: 0; color: #718096;">Gera o documento Word pronto com imagens posicionadas e dimensionadas.</p>
        </div>
    </div>
""", unsafe_allow_html=True)

if not st.session_state.banco_estudantes:
    st.warning("⚠️ Crie um aluno no PEI 360º primeiro.")
    st.stop()

# Seleção
lista = [a['nome'] for a in st.session_state.banco_estudantes]
aluno = next(a for a in st.session_state.banco_estudantes if a['nome'] == st.selectbox("📂 Estudante:", lista, index=len(lista)-1))

c1, c2 = st.columns(2)
with c1:
    materia = st.selectbox("Matéria:", ["Matemática", "Português", "Ciências", "História", "Geografia"])
    tema = st.text_input("Tema:", placeholder="Ex: Frações")
with c2:
    arquivo = st.file_uploader("Arquivo Original (Word/PDF/Foto)", type=["docx","pdf","png","jpg"])
    texto_orig, tipo_arq, lista_imgs, img_unica = ler_arquivo_generico(arquivo)
    if tipo_arq == "docx": st.success(f"DOCX: {len(lista_imgs)} imagens encontradas.")
    elif tipo_arq: st.success("Carregado.")

if st.button("✨ GERAR ATIVIDADE ADAPTADA", type="primary"):
    if not materia or not tema or not texto_orig: st.warning("Preencha tudo.")
    else:
        with st.spinner("Lendo imagens, adaptando texto e montando Word..."):
            qtd = len(lista_imgs) if tipo_arq == "docx" else 0
            
            # 1. Gera Texto
            atividade_texto, err = adaptar_ia_direta(api_key, aluno, texto_orig, tipo_arq, materia, tema, qtd)
            
            # 2. Gera Imagem DALL-E (Opcional)
            img_dalle = None
            if usar_dalle and not err:
                img_dalle, _ = gerar_dalle(api_key, tema, aluno)
            
            if not err:
                # 3. Constrói o Word na memória
                docx_file = construir_docx_final(
                    atividade_texto, 
                    aluno['nome'], 
                    materia, 
                    lista_imgs, 
                    img_dalle, 
                    img_unica
                )
                
                # Salva no estado para download
                st.session_state['final_docx'] = docx_file
                st.session_state['final_preview'] = atividade_texto
                st.rerun()

# --- TELA DE SUCESSO E DOWNLOAD ---
if 'final_docx' in st.session_state:
    st.markdown("---")
    st.markdown("""
        <div class="success-box">
            <h3>✅ Atividade Gerada com Sucesso!</h3>
            <p>As imagens foram inseridas nos locais corretos e redimensionadas para a folha.</p>
        </div>
    """, unsafe_allow_html=True)
    
    col_d, col_p = st.columns([1, 2])
    
    with col_d:
        st.download_button(
            label="📥 BAIXAR ARQUIVO WORD",
            data=st.session_state['final_docx'],
            file_name=f"Atividade_Adaptada_{aluno['nome']}.docx",
            mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            type="primary",
            use_container_width=True
        )
        st.caption("Abra no Word para imprimir ou fazer ajustes finais.")
        
    with col_p:
        with st.expander("Ver texto gerado (Sem imagens)"):
            st.markdown(st.session_state['final_preview'])
