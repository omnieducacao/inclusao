import streamlit as st
from openai import OpenAI
from io import BytesIO
from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from pypdf import PdfReader
import base64
import os
import re
import requests
import zipfile

# --- 1. CONFIGURAÇÃO ---
st.set_page_config(page_title="Adaptador 360º V4.8", page_icon="🧩", layout="wide")

if 'banco_estudantes' not in st.session_state:
    st.session_state.banco_estudantes = []

# --- 2. ESTILO VISUAL ---
st.markdown("""
    <style>
    html, body, [class*="css"] { font-family: 'Nunito', sans-serif; color: #2D3748; }
    
    .header-clean {
        background-color: white; padding: 25px 40px; border-radius: 16px;
        border: 1px solid #EDF2F7; box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        margin-bottom: 25px; display: flex; align-items: center; gap: 20px;
    }
    
    .preview-card {
        background: white; border: 1px solid #E2E8F0; padding: 20px; 
        border-radius: 12px; margin-top: 20px;
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
    texto_completo = ""
    imagens = []
    
    try:
        # 1. Extração de Texto
        doc = Document(uploaded_file)
        texto_completo = "\n".join([p.text for p in doc.paragraphs if p.text.strip() != ""])
        
        # 2. Extração de Imagens (Ordenação Refinada)
        uploaded_file.seek(0)
        with zipfile.ZipFile(uploaded_file) as z:
            all_files = z.namelist()
            # Pega arquivos da pasta media
            media_files = [f for f in all_files if f.startswith('word/media/') and f.endswith(('.png', '.jpg', '.jpeg'))]
            
            # ORDENAÇÃO CRÍTICA:
            # O Word numera sequencialmente: image1.png, image2.png...
            # Isso garante que a lista 'imagens' esteja na ordem exata de aparição no documento.
            media_files.sort(key=lambda f: int(re.search(r'image(\d+)', f).group(1)) if re.search(r'image(\d+)', f) else 0)
            
            for media in media_files:
                imagens.append(z.read(media))
                
    except Exception as e:
        return f"Erro: {e}", []
        
    return texto_completo, imagens

def ler_arquivo(uploaded_file):
    if uploaded_file is None: return None, None, []
    texto, imgs, tipo = "", [], "indefinido"
    
    try:
        if uploaded_file.type == "application/pdf":
            reader = PdfReader(uploaded_file)
            for page in reader.pages: texto += page.extract_text() + "\n"
            tipo = "pdf"
            
        elif "word" in uploaded_file.type:
            texto, imgs = extrair_dados_docx(uploaded_file)
            tipo = "docx"
            
        elif "image" in uploaded_file.type:
            # Se for foto, tratamos como uma lista de 1 imagem
            imgs = [uploaded_file.getvalue()]
            texto = "Conteúdo visual (foto da atividade)"
            tipo = "imagem"
    except: pass
    
    return texto, tipo, imgs

def baixar_imagem_url(url):
    try:
        resp = requests.get(url)
        if resp.status_code == 200: return BytesIO(resp.content)
    except: pass
    return None

# --- 4. CONSTRUTOR DE DOCX ---
def construir_docx_final(texto_ia, aluno, materia, lista_imgs, img_dalle_url):
    doc = Document()
    style = doc.styles['Normal']; style.font.name = 'Arial'; style.font.size = Pt(12)
    
    # Cabeçalho
    head = doc.add_heading(f'ATIVIDADE ADAPTADA - {materia.upper()}', 0)
    head.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p = doc.add_paragraph(f"Estudante: {aluno}")
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    doc.add_paragraph("_"*50)

    # 1. Apoio Visual (DALL-E)
    if img_dalle_url:
        img_io = baixar_imagem_url(img_dalle_url)
        if img_io:
            try:
                doc.add_heading('Contexto Visual', level=3)
                doc.add_picture(img_io, width=Inches(4.5))
                doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
                doc.add_paragraph("")
            except: pass

    # 2. Atividade com Imagens Inseridas
    doc.add_heading('Atividade', level=2)
    
    # Divide pelas tags [[IMG_X]]
    partes = re.split(r'(\[\[IMG_\d+\]\])', texto_ia)
    
    imagens_usadas = set()

    for parte in partes:
        tag_match = re.match(r'\[\[IMG_(\d+)\]\]', parte)
        
        if tag_match:
            try:
                # O índice que a IA retornou (Ex: 1 para a primeira imagem)
                idx_ia = int(tag_match.group(1)) - 1
                
                # Proteção: Verifica se essa imagem existe na lista extraída
                if 0 <= idx_ia < len(lista_imgs):
                    doc.add_picture(BytesIO(lista_imgs[idx_ia]), width=Inches(5.0))
                    doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
                    doc.add_paragraph("") 
                    imagens_usadas.add(idx_ia)
                else:
                    doc.add_paragraph(f"[Imagem {idx_ia+1} solicitada, mas não encontrada no arquivo]")
            except: pass
        else:
            if parte.strip():
                # Limpeza de quebras extras
                texto_limpo = re.sub(r'\n{3,}', '\n\n', parte.strip())
                doc.add_paragraph(texto_limpo)

    # 3. Anexos (Sobras)
    sobras = [i for i in range(len(lista_imgs)) if i not in imagens_usadas]
    if sobras:
        doc.add_page_break()
        doc.add_heading("Anexos (Imagens Extras)", level=2)
        for idx in sobras:
            try:
                doc.add_paragraph(f"Figura {idx+1}:")
                doc.add_picture(BytesIO(lista_imgs[idx]), width=Inches(4.0))
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

def adaptar_atividade_v48(api_key, aluno, conteudo, tipo, materia, tema, total_imagens):
    if not api_key: return None, "Sem chave."
    client = OpenAI(api_key=api_key)
    
    # Instrução EXPLÍCITA sobre posicionamento
    instrucao_imgs = ""
    if total_imagens > 0:
        instrucao_imgs = f"""
        O ARQUIVO ORIGINAL CONTÉM {total_imagens} IMAGENS EM SEQUÊNCIA.
        
        REGRA DE OURO PARA POSICIONAMENTO:
        A 'Imagem 1' (do arquivo original) pertence à primeira questão que tem figura.
        A 'Imagem 2' pertence à segunda, e assim por diante.
        
        SUA TAREFA:
        Ao reescrever a questão, insira a tag [[IMG_1]] no lugar exato da primeira imagem, [[IMG_2]] na segunda, etc.
        NÃO MISTURE A ORDEM. A primeira imagem que aparece no texto original é a [[IMG_1]].
        """
    elif tipo == "imagem":
        instrucao_imgs = "O conteúdo é uma foto. Use [[IMG_1]] para inseri-la no início."

    prompt_sys = "Você é um Especialista em Adaptação de Provas. Gere apenas o texto da atividade final."
    
    prompt_user = f"""
    ALUNO: {aluno['nome']} | DIAG: {aluno.get('diagnostico')}
    MATÉRIA: {materia} | TEMA: {tema}
    
    {instrucao_imgs}
    
    Adapte o conteúdo abaixo para ser acessível, mantendo as questões e inserindo as tags de imagem CORRETAS:
    
    {conteudo}
    """
    
    msgs = [{"role": "system", "content": prompt_sys}, {"role": "user", "content": []}]
    
    if tipo == "imagem":
        # Se for upload de imagem única, manda pro GPT ver
        # Nota: Se for DOCX, o GPT vê o texto extraído e confiamos na ordem das tags
        msgs[1]["content"].append({"type": "text", "text": prompt_user})
        msgs[1]["content"].append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64.b64encode(conteudo[0]).decode('utf-8')}"}})
    else:
        msgs[1]["content"].append({"type": "text", "text": prompt_user})

    try:
        resp = client.chat.completions.create(model="gpt-4o-mini", messages=msgs, temperature=0.3) # Temp baixa para ser preciso
        return resp.choices[0].message.content, None
    except Exception as e: return None, str(e)

# --- 6. INTERFACE ---
with st.sidebar:
    st.markdown("### Configuração")
    api_key = st.secrets.get('OPENAI_API_KEY', st.text_input("Chave OpenAI:", type="password"))
    if api_key: st.success("✅ Conectado")
    st.markdown("---")
    usar_dalle = st.toggle("🎨 Gerar Imagem Capa (IA)", value=True)
    if st.button("🗑️ Limpar"): st.session_state.pop('res_texto', None); st.rerun()

st.markdown("""
    <div class="header-clean">
        <div style="font-size: 2.5rem;">🧩</div>
        <div>
            <p style="margin: 0; color: #004E92; font-size: 1.4rem; font-weight: 800;">Adaptador V4.8: Correção de Ordem</p>
            <p style="margin: 0; color: #718096;">Foco total na sincronia entre Texto e Imagem.</p>
        </div>
    </div>
""", unsafe_allow_html=True)

if not st.session_state.banco_estudantes:
    st.warning("⚠️ Crie um aluno no PEI 360º primeiro.")
    st.stop()

lista = [a['nome'] for a in st.session_state.banco_estudantes]
aluno = next(a for a in st.session_state.banco_estudantes if a['nome'] == st.selectbox("📂 Estudante:", lista, index=len(lista)-1))

c1, c2 = st.columns(2)
with c1:
    materia = st.selectbox("Matéria:", ["Matemática", "Português", "Ciências", "História", "Geografia"])
    tema = st.text_input("Tema:", placeholder="Ex: Frações")
with c2:
    arquivo = st.file_uploader("Arquivo (DOCX é ideal)", type=["docx","pdf","png","jpg"])
    texto_orig, tipo_arq, lista_imgs = ler_arquivo(arquivo)
    
    if tipo_arq == "docx":
        st.success(f"DOCX: {len(lista_imgs)} imagens extraídas na ordem.")
        # Pequeno preview das imagens para conferência
        if lista_imgs:
            st.caption("Conferência de Ordem (1, 2, 3...):")
            cols = st.columns(min(len(lista_imgs), 6))
            for i, img in enumerate(lista_imgs[:6]):
                cols[i].image(img, caption=f"Img {i+1}", width=60)
                
    elif tipo_arq: st.success("Arquivo carregado.")

if st.button("✨ GERAR ATIVIDADE", type="primary"):
    if not materia or not tema or not texto_orig: st.warning("Preencha tudo.")
    else:
        with st.spinner("Processando..."):
            qtd = len(lista_imgs)
            texto_adaptado, err = adaptar_atividade_v48(api_key, aluno, texto_orig if tipo_arq!="imagem" else lista_imgs, tipo_arq, materia, tema, qtd)
            
            img_dalle = None
            if usar_dalle: img_dalle, _ = gerar_dalle(api_key, tema, aluno)
            
            if not err:
                st.session_state['res_texto'] = texto_adaptado
                st.session_state['res_imgs'] = lista_imgs
                st.session_state['res_dalle'] = img_dalle
                st.rerun()

# --- ÁREA DE RESULTADO (PREVIEW) ---
if 'res_texto' in st.session_state:
    st.markdown("---")
    
    # Monta a prévia visual na tela (Simulando o Word)
    st.subheader("👁️ Prévia do Documento")
    with st.container(border=True):
        # 1. Capa
        if st.session_state.get('res_dalle'):
            st.image(st.session_state['res_dalle'], width=300, caption="Contexto Visual")
        
        # 2. Texto + Imagens
        texto_final = st.session_state['res_texto']
        partes = re.split(r'(\[\[IMG_\d+\]\])', texto_final)
        
        for parte in partes:
            tag_match = re.match(r'\[\[IMG_(\d+)\]\]', parte)
            if tag_match:
                idx = int(tag_match.group(1)) - 1
                imgs = st.session_state['res_imgs']
                if 0 <= idx < len(imgs):
                    st.image(imgs[idx], width=400, caption=f"Imagem da Questão (Img {idx+1})")
                else:
                    st.warning(f"[Imagem {idx+1} não encontrada]")
            else:
                if parte.strip(): st.markdown(parte)

    # DOWNLOAD
    st.markdown("---")
    docx = construir_docx_final(
        st.session_state['res_texto'], 
        aluno['nome'], 
        materia, 
        st.session_state['res_imgs'], 
        st.session_state.get('res_dalle')
    )
    st.download_button("📥 BAIXAR WORD PRONTO", docx, "atividade.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", type="primary", use_container_width=True)
