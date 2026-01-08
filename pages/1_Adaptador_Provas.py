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
import zipfile

# --- 1. CONFIGURAÇÃO ---
st.set_page_config(page_title="Adaptador 360º V4.5", page_icon="🧩", layout="wide")

if 'banco_estudantes' not in st.session_state:
    st.session_state.banco_estudantes = []

# --- 2. ESTILO VISUAL ---
st.markdown("""
    <style>
    html, body, [class*="css"] { font-family: 'Nunito', sans-serif; color: #2D3748; }
    :root { --brand-blue: #004E92; --card-radius: 16px; }
    
    .header-clean {
        background-color: white; padding: 25px 40px; border-radius: var(--card-radius);
        border: 1px solid #EDF2F7; box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        margin-bottom: 20px; display: flex; align-items: center; gap: 20px;
    }
    
    /* Área do Editor */
    .editor-area textarea {
        font-family: 'Courier New', monospace !important;
        font-size: 14px !important;
        line-height: 1.5 !important;
        background-color: #FAFAFA !important;
        border: 2px solid #E2E8F0 !important;
    }
    
    /* Galeria de Imagens Lateral */
    .img-gallery-card {
        border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px; 
        margin-bottom: 10px; text-align: center; background: white;
    }
    .img-tag {
        background: #2D3748; color: white; padding: 2px 8px; border-radius: 4px;
        font-size: 0.8rem; font-weight: bold; margin-bottom: 5px; display: inline-block;
    }
    
    div[data-testid="column"] .stButton button {
        border-radius: 12px !important; font-weight: 800 !important; height: 50px !important;
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
            # Filtra imagens
            media_files = [f for f in all_files if f.startswith('word/media/') and f.endswith(('.png', '.jpg', '.jpeg'))]
            
            # Tenta ordenar pelo número no nome do arquivo (image1.png, image2.png)
            # O Word geralmente nomeia na ordem que aparecem
            media_files.sort(key=lambda f: int(re.search(r'\d+', f).group()) if re.search(r'\d+', f) else 0)
            
            for media in media_files:
                imagens.append(z.read(media))
                
    except Exception as e:
        return f"Erro leitura DOCX: {e}", []
        
    return texto, imagens

def ler_arquivo_generico(uploaded_file):
    if uploaded_file is None: return None, None, [], None
    
    texto = ""
    imgs = []
    img_unica = None
    tipo = "indefinido"
    
    try:
        if uploaded_file.type == "application/pdf":
            try:
                reader = PdfReader(uploaded_file)
                for page in reader.pages: texto += page.extract_text() + "\n"
                tipo = "pdf"
            except: pass
            
        elif uploaded_file.type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            texto, imgs = extrair_dados_docx(uploaded_file)
            tipo = "docx"
            
        elif uploaded_file.type in ["image/png", "image/jpeg", "image/jpg"]:
            img_bytes = uploaded_file.getvalue()
            texto = base64.b64encode(img_bytes).decode('utf-8') 
            img_unica = img_bytes
            tipo = "imagem"
    except:
        return "", "erro", [], None
        
    return texto, tipo, imgs, img_unica

def baixar_imagem_url(url):
    try:
        resp = requests.get(url)
        if resp.status_code == 200: return BytesIO(resp.content)
    except: pass
    return None

# --- 4. CONSTRUTOR DE DOCX ---
def construir_docx_final(texto_editado, aluno, materia, lista_imgs, img_dalle_url, img_unica):
    doc = Document()
    style = doc.styles['Normal']; style.font.name = 'Arial'; style.font.size = Pt(12)
    
    # Cabeçalho
    head = doc.add_heading(f'ATIVIDADE ADAPTADA - {materia.upper()}', 0)
    head.alignment = WD_ALIGN_PARAGRAPH.CENTER
    doc.add_paragraph(f"Estudante: {aluno}")
    doc.add_paragraph("_"*50)

    # 1. Apoio Visual (DALL-E)
    if img_dalle_url:
        img_io = baixar_imagem_url(img_dalle_url)
        if img_io:
            try:
                doc.add_heading('Apoio Visual (Contexto)', level=2)
                doc.add_picture(img_io, width=Inches(4.0))
                doc.add_paragraph("")
            except: pass

    # 2. Montagem do Texto + Imagens (Baseado no Editor do Usuário)
    # Divide o texto onde tiver [[IMG_X]] ou [[IMG_ORIGINAL]]
    partes = re.split(r'(\[\[IMG_\d+\]\]|\[\[IMG_ORIGINAL\]\])', texto_editado)
    
    for parte in partes:
        tag_match = re.match(r'\[\[IMG_(\d+)\]\]', parte)
        
        # Caso 1: Tag de Imagem do Word [[IMG_1]]
        if tag_match:
            try:
                idx = int(tag_match.group(1)) - 1
                if 0 <= idx < len(lista_imgs):
                    doc.add_picture(BytesIO(lista_imgs[idx]), width=Inches(4.5))
                    doc.add_paragraph("")
            except: pass
            
        # Caso 2: Tag da Imagem Única (Upload de Foto)
        elif parte == "[[IMG_ORIGINAL]]" and img_unica:
            try:
                doc.add_picture(BytesIO(img_unica), width=Inches(5.0))
                doc.add_paragraph("")
            except: pass
            
        # Caso 3: Texto
        else:
            if parte.strip():
                doc.add_paragraph(parte.strip())

    buffer = BytesIO(); doc.save(buffer); buffer.seek(0)
    return buffer

# --- 5. INTELIGÊNCIA ---
def gerar_dalle(api_key, tema, aluno_dados):
    client = OpenAI(api_key=api_key)
    hiperfoco = aluno_dados.get('hiperfoco', '')
    contexto = f"Include elements of '{hiperfoco}' subtly." if hiperfoco else ""
    prompt = f"Educational illustration about '{tema}'. Simple, clear, white background. {contexto} No text."
    try:
        resp = client.images.generate(model="dall-e-3", prompt=prompt, size="1024x1024", quality="standard", n=1)
        return resp.data[0].url, None
    except Exception as e: return None, str(e)

def adaptar_v4_5(api_key, aluno, conteudo, tipo, materia, tema, qtd_imagens):
    if not api_key: return None, None, "Sem chave."
    client = OpenAI(api_key=api_key)
    
    instrucao_imagens = ""
    if qtd_imagens > 0:
        instrucao_imagens = f"""
        O documento original tem {qtd_imagens} imagens.
        Ao escrever a atividade, insira a tag [[IMG_1]] onde a primeira imagem deve aparecer, [[IMG_2]] para a segunda, etc.
        Tente deduzir a posição correta pelo contexto.
        """
    elif tipo == "imagem":
        instrucao_imagens = "O conteúdo original é uma foto. Insira a tag [[IMG_ORIGINAL]] antes das questões para que o aluno veja a referência."

    prompt_sys = """
    Você é um Especialista em Adaptação Curricular.
    Gere o resultado em DOIS BLOCOS separados por '---DIVISOR---'.
    Bloco 1: Racional para o professor.
    Bloco 2: A atividade pronta para o aluno (diagramada com tags de imagem).
    """
    
    prompt_user = f"""
    ALUNO: {aluno['nome']} | DIAG: {aluno.get('diagnostico')}
    MATÉRIA: {materia} | TEMA: {tema}
    
    {instrucao_imagens}
    
    CONTEÚDO ORIGINAL:
    """
    
    msgs = [{"role": "system", "content": prompt_sys}, {"role": "user", "content": []}]
    
    if tipo == "imagem":
        msgs[1]["content"].append({"type": "text", "text": prompt_user})
        msgs[1]["content"].append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{conteudo}"}})
    else:
        msgs[1]["content"].append({"type": "text", "text": f"{prompt_user}\n{conteudo}"})

    try:
        resp = client.chat.completions.create(model="gpt-4o-mini", messages=msgs, temperature=0.5)
        txt = resp.choices[0].message.content
        parts = txt.split("---DIVISOR---")
        if len(parts) == 2: return parts[0], parts[1], None
        return None, txt, "Erro formato IA."
    except Exception as e: return None, None, str(e)

# --- 6. INTERFACE ---
with st.sidebar:
    st.markdown("### ⚙️ Configuração")
    api_key = st.secrets.get('OPENAI_API_KEY', st.text_input("Chave OpenAI:", type="password"))
    if api_key: st.success("✅ Conectado")
    st.markdown("---")
    usar_dalle = st.toggle("🎨 Gerar Capa/Apoio (DALL-E)", value=True)
    
    # GALERIA DE IMAGENS NA BARRA LATERAL (PARA CONSULTA)
    if 'res_imgs_orig' in st.session_state and st.session_state['res_imgs_orig']:
        st.markdown("### 🖼️ Galeria do Arquivo")
        st.info("Use estas tags no editor para posicionar as imagens:")
        for i, img_bytes in enumerate(st.session_state['res_imgs_orig']):
            st.markdown(f"**[[IMG_{i+1}]]**")
            st.image(img_bytes, width=150)
            st.markdown("---")

    if st.button("🗑️ Limpar"): 
        for k in list(st.session_state.keys()):
            if k.startswith('res_'): del st.session_state[k]
        st.rerun()

st.markdown("""
    <div class="header-clean">
        <div style="font-size: 3rem;">🧩</div>
        <div>
            <p style="margin: 0; color: #004E92; font-size: 1.5rem; font-weight: 800;">Adaptador V4.5: Editor Visual</p>
            <p style="margin: 0; color: #718096;">Edite o texto e posicione as imagens antes de gerar o arquivo final.</p>
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
    materia = st.selectbox("Matéria:", ["Matemática", "Português", "Ciências", "História", "Geografia", "Inglês"])
    tema = st.text_input("Tema:", placeholder="Ex: Frações")
    tipo_atv = st.selectbox("Tipo:", ["Prova", "Tarefa", "Trabalho"])
with c2:
    arquivo = st.file_uploader("Original (Word/PDF/Foto)", type=["docx","pdf","png","jpg"])
    texto_orig, tipo_arq, lista_imgs, img_unica = ler_arquivo_generico(arquivo)
    
    if tipo_arq == "docx": st.success(f"DOCX lido. {len(lista_imgs)} imagens extraídas (Veja na barra lateral).")
    elif tipo_arq: st.success(f"{tipo_arq} carregado.")

if st.button("✨ 1. GERAR RASCUNHO (IA)", type="primary"):
    if not materia or not tema or not texto_orig: st.warning("Preencha tudo.")
    else:
        qtd_imgs = len(lista_imgs) if tipo_arq == "docx" else 0
        
        with st.spinner("IA criando rascunho da atividade..."):
            racional, atividade, err = adaptar_v4_5(api_key, aluno, texto_orig, tipo_arq, materia, tema, qtd_imgs)
        
        img_dalle = None
        if usar_dalle and not err:
            with st.spinner("Gerando apoio visual..."):
                img_dalle, _ = gerar_dalle(api_key, tema, aluno)
        
        if not err:
            st.session_state['res_racional'] = racional
            st.session_state['res_atv_editavel'] = atividade # Texto editável
            st.session_state['res_dalle'] = img_dalle
            st.session_state['res_imgs_orig'] = lista_imgs
            st.session_state['res_img_unica'] = img_unica
            st.success("Rascunho gerado! Edite abaixo.")

# --- ÁREA DE EDIÇÃO E PREVIEW ---
if 'res_atv_editavel' in st.session_state:
    st.markdown("---")
    
    col_editor, col_preview = st.columns([1, 1])
    
    # LADO ESQUERDO: EDITOR
    with col_editor:
        st.subheader("✏️ Editor de Texto")
        st.caption("Ajuste o texto e mova as tags [[IMG_X]] para onde quiser.")
        
        texto_final = st.text_area(
            "Conteúdo da Atividade:", 
            value=st.session_state['res_atv_editavel'], 
            height=600,
            key="editor_texto"
        )
        # Atualiza estado a cada mudança
        st.session_state['res_atv_editavel'] = texto_final

    # LADO DIREITO: PREVIEW (Renderização Simulada)
    with col_preview:
        st.subheader("👁️ Visualização Prévia")
        st.caption("Como vai ficar no arquivo final (aproximado).")
        
        with st.container(border=True):
            # 1. Capa
            if st.session_state.get('res_dalle'):
                st.image(st.session_state['res_dalle'], caption="Apoio Visual (IA)", use_column_width=True)
            
            # 2. Renderização do Texto + Tags
            # Divide o texto pelas tags para mostrar imagens no meio
            partes = re.split(r'(\[\[IMG_\d+\]\]|\[\[IMG_ORIGINAL\]\])', st.session_state['res_atv_editavel'])
            
            for parte in partes:
                tag_match = re.match(r'\[\[IMG_(\d+)\]\]', parte)
                
                if tag_match:
                    idx = int(tag_match.group(1)) - 1
                    imgs_orig = st.session_state.get('res_imgs_orig', [])
                    if 0 <= idx < len(imgs_orig):
                        st.image(imgs_orig[idx], caption=f"Imagem {idx+1}", use_column_width=True)
                    else:
                        st.error(f"[Imagem {idx+1} não encontrada]")
                        
                elif parte == "[[IMG_ORIGINAL]]" and st.session_state.get('res_img_unica'):
                    st.image(st.session_state['res_img_unica'], use_column_width=True)
                    
                else:
                    if parte.strip():
                        st.markdown(parte)

    # BOTÃO DE DOWNLOAD FINAL
    st.markdown("---")
    try:
        docx = construir_docx_final(
            st.session_state['res_atv_editavel'], # Usa o texto EDITADO
            aluno['nome'], 
            materia, 
            st.session_state.get('res_imgs_orig', []), 
            st.session_state.get('res_dalle'),
            st.session_state.get('res_img_unica')
        )
        st.download_button("📥 2. BAIXAR DOCUMENTO FINAL (WORD)", docx, "atividade_adaptada.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", type="primary", use_container_width=True)
    except Exception as e:
        st.error(f"Erro ao gerar download: {e}")
